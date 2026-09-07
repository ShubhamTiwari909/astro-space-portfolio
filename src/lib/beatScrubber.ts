/**
 * The beat scrubber — a seek bar for the flight (§4.1, §7.2).
 *
 * The declination rail already showed where you were. This makes it a
 * control: grab the playhead and fly, or tab to it and step beat by beat.
 *
 * ── Why it moves the SCROLL and not the camera ───────────────────────────
 * The obvious build is to drive `CameraRig` directly. That would be a second
 * source of truth for the camera and would immediately disagree with the
 * page: the DOM would sit still while the scene flew.
 *
 * Instead this only ever sets `window.scrollTo`. Everything else — the
 * camera curve, the band tint, `aria-current` on the rail, the mobile nav,
 * the art plates — already derives from scroll through the one loop in
 * `scrollProgress` (§19.2b), so all of it follows for free and nothing can
 * fall out of step. It also means the scrubber works with the scene absent
 * entirely: with no WebGL it is simply a fast way to move through the page.
 *
 * ── Layout reads ─────────────────────────────────────────────────────────
 * The track rect and the document height are measured once per gesture, on
 * pointerdown, never per `pointermove`. §22's rule about not reading layout
 * in a loop applies to a drag as much as to a frame callback.
 *
 * The playhead's POSITION is not set here at all: it rides `--scroll`, which
 * the scroll loop already publishes to `<body>`, so the visual costs no
 * JavaScript per frame. This module handles input and announcement only.
 */

import { BANDS } from './bands';
import { scrollState, subscribe } from './scrollProgress';

/** Beats to move for PageUp / PageDown. */
const PAGE_STEP = 3;

export function initBeatScrubber(): () => void {
	if (typeof document === 'undefined') return () => {};

	const track = document.querySelector<HTMLElement>('[data-rail-track]');
	const rail = document.querySelector<HTMLElement>('[data-section-rail]');
	if (!track || !rail) return () => {};

	/*
	 * Labels come from the rail's own anchors rather than a second copy of
	 * the map: the tick text and the announcement can then never disagree.
	 */
	const ticks = [...rail.querySelectorAll<HTMLElement>('[data-rail-tick]')];
	const labels = ticks.map((tick) => tick.textContent?.trim() || '');
	const total = Math.min(ticks.length, BANDS.length);
	if (total === 0) return () => {};

	function announce(index: number): void {
		const clamped = Math.min(total - 1, Math.max(0, index));
		track!.setAttribute('aria-valuenow', String(clamped));
		track!.setAttribute(
			'aria-valuetext',
			`${labels[clamped]} — beat ${clamped + 1} of ${total}`,
		);
	}

	/** Fly to a beat by scrolling its section into view. */
	function goTo(index: number): void {
		const clamped = Math.min(total - 1, Math.max(0, index));
		const section = document.getElementById(BANDS[clamped].section);
		if (!section) return;
		/*
		 * No explicit behaviour: `html { scroll-behavior: smooth }` is on
		 * under `prefers-reduced-motion: no-preference` and forced to `auto`
		 * otherwise, so the global rule in §16.4 decides this rather than a
		 * second copy of the same decision here.
		 */
		section.scrollIntoView({ block: 'start' });
		announce(clamped);
	}

	const onKey = (e: KeyboardEvent) => {
		const now = Number(track.getAttribute('aria-valuenow') ?? 0);
		let next = now;
		switch (e.key) {
			case 'ArrowDown':
			case 'ArrowRight':
				next = now + 1;
				break;
			case 'ArrowUp':
			case 'ArrowLeft':
				next = now - 1;
				break;
			case 'PageDown':
				next = now + PAGE_STEP;
				break;
			case 'PageUp':
				next = now - PAGE_STEP;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = total - 1;
				break;
			default:
				return;
		}
		e.preventDefault();
		goTo(next);
	};

	/** Measured on pointerdown and held for the gesture. */
	let rect: DOMRect | null = null;
	let docMax = 0;
	let dragging = false;

	function scrubTo(clientY: number): void {
		if (!rect) return;
		const t = rect.height > 0 ? (clientY - rect.top) / rect.height : 0;
		const progress = Math.min(1, Math.max(0, t));
		/*
		 * Instant, explicitly. The smooth scrolling that makes a beat jump
		 * feel like flight makes a DRAG feel broken — every move would queue
		 * another animation and the playhead would lag the pointer.
		 */
		window.scrollTo({ top: progress * docMax, behavior: 'instant' });
	}

	const onPointerDown = (e: PointerEvent) => {
		// Primary button / touch only; never hijack a right-click.
		if (e.button !== 0) return;
		rect = track.getBoundingClientRect();
		docMax = document.documentElement.scrollHeight - window.innerHeight;
		dragging = true;
		track.dataset.scrubbing = '';
		rail.dataset.scrubbing = '';
		track.setPointerCapture(e.pointerId);
		// The track is `touch-none`, so this is safe on a stylus or a touch
		// screen as well: the gesture is ours, not the page's.
		e.preventDefault();
		/*
		 * Focus, so the arrow keys carry on from wherever the pointer left
		 * off — but WITHOUT the focus ring. Chrome treats a programmatic
		 * `focus()` as focus-visible even when it came from a pointerdown,
		 * which drew the full 44px ring around the track for the duration of
		 * every mouse drag. `focusVisible: false` is the explicit signal that
		 * this was a pointer gesture; browsers that do not support the option
		 * ignore it and simply show the ring, which is the old behaviour
		 * rather than a break.
		 */
		track.focus({ preventScroll: true, focusVisible: false });
		scrubTo(e.clientY);
	};

	const onPointerMove = (e: PointerEvent) => {
		if (!dragging) return;
		scrubTo(e.clientY);
	};

	const endDrag = (e: PointerEvent) => {
		if (!dragging) return;
		dragging = false;
		rect = null;
		delete track.dataset.scrubbing;
		delete rail.dataset.scrubbing;
		if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
		/*
		 * Announce where the drag actually ended. Without this the value went
		 * stale the moment anyone dragged: the subscription below consumes a
		 * band change by updating `lastIndex`, so once the drag was over
		 * there was no further change left to react to, and the slider still
		 * reported beat 1 while the page sat at beat 5.
		 */
		announce(scrollState.bandIndex);
	};

	track.addEventListener('keydown', onKey);
	track.addEventListener('pointerdown', onPointerDown);
	track.addEventListener('pointermove', onPointerMove);
	track.addEventListener('pointerup', endDrag);
	track.addEventListener('pointercancel', endDrag);

	/*
	 * Keep the announcement in step with ordinary scrolling, so a screen
	 * reader that lands on the scrubber after the visitor has scrolled hears
	 * where they actually are. Only on a band change — `bandIndex` is stable
	 * between them, and this must not write attributes every frame.
	 */
	let lastIndex = -1;
	const unsubscribe = subscribe(() => {
		if (scrollState.bandIndex === lastIndex) return;
		lastIndex = scrollState.bandIndex;
		announce(lastIndex);
	});

	announce(scrollState.bandIndex);

	return () => {
		unsubscribe();
		track.removeEventListener('keydown', onKey);
		track.removeEventListener('pointerdown', onPointerDown);
		track.removeEventListener('pointermove', onPointerMove);
		track.removeEventListener('pointerup', endDrag);
		track.removeEventListener('pointercancel', endDrag);
		delete track.dataset.scrubbing;
		delete rail.dataset.scrubbing;
	};
}
