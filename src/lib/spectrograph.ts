/**
 * The spectrograph — an instrument for the Atlas (§11).
 *
 * §3.3 builds the whole palette out of real emission lines, and a
 * spectrograph is the instrument that produces exactly that: a continuum
 * with bright lines standing on it. So this reads the skills as lines in the
 * site's own spectrum — position is depth of experience, height is tier —
 * and lets the visitor sweep across them.
 *
 * ── Why one tab stop and not twenty-four ─────────────────────────────────
 * §11.4 makes `SkillList` the canonical, sole tab path, and
 * `ConstellationMap` excludes all 24 of its stars because "duplicating 24
 * tab stops would be hostile". The same reasoning applies here, but a
 * decoration nobody can operate is not an instrument — so the strip is ONE
 * focusable element with `role="slider"`, and the arrow keys tune it across
 * the lines. One stop, fully operable, and `aria-valuetext` names the line
 * the way a readout would.
 *
 * ── Why the readouts are server-rendered ─────────────────────────────────
 * Every line's readout ships as text in the HTML, hidden except the current
 * one. That keeps §27.4 honest — the dependency lists here are the only
 * place `connections` reaches the page as prose rather than as SVG lines —
 * and it means this module never builds a string, only toggles `hidden`.
 *
 * Costs nothing extra to deliver: it lives in `src/lib`, so it is bundled
 * into the shared `runtime` chunk that `BaseLayout` already fetches, rather
 * than adding an entry chunk and a request the §26.2 budget has no room for.
 */

/** Root, and the two things inside it that this drives. */
const ROOT = '[data-spectrograph]';

interface Line {
	el: SVGElement;
	/** Position along the viewBox, for pointer hit-testing. */
	x: number;
	skillId: string;
	/** Pre-composed announcement, e.g. "React — Core, Frontend". */
	label: string;
}

export function initSpectrograph(): () => void {
	if (typeof document === 'undefined') return () => {};

	const root = document.querySelector<HTMLElement>(ROOT);
	if (!root) return () => {};

	const slider = root.querySelector<HTMLElement>('[data-spec-slider]');
	const svg = root.querySelector<SVGSVGElement>('svg');
	if (!slider || !svg) return () => {};

	const lines: Line[] = [...root.querySelectorAll<SVGElement>('[data-spec-line]')]
		.map((el) => ({
			el,
			x: Number(el.dataset.specX ?? 0),
			skillId: el.dataset.specLine ?? '',
			label: el.dataset.specLabel ?? '',
		}))
		.sort((a, b) => a.x - b.x);

	if (lines.length === 0) return () => {};

	const readouts = new Map<string, HTMLElement>();
	for (const el of root.querySelectorAll<HTMLElement>('[data-spec-readout]')) {
		readouts.set(el.dataset.specReadout ?? '', el);
	}

	/** The viewBox width, so pointer x can be compared with line x. */
	const span = svg.viewBox.baseVal.width || 1;

	let current = -1;

	function select(index: number): void {
		const next = Math.min(lines.length - 1, Math.max(0, index));
		if (next === current) return;

		const previous = current >= 0 ? lines[current] : null;
		current = next;
		const line = lines[current];

		previous?.el.removeAttribute('data-active');
		line.el.setAttribute('data-active', '');

		/*
		 * The caret rides a custom property rather than an inline transform,
		 * so the strip's CSS owns how it moves and this owns only where.
		 */
		root!.style.setProperty('--spec-x', String(line.x));

		for (const [id, el] of readouts) el.hidden = id !== line.skillId;

		slider!.setAttribute('aria-valuenow', String(current));
		slider!.setAttribute('aria-valuetext', line.label);

		/*
		 * Cross-highlight the canonical list (§11.4). The rows already carry
		 * `data-skill-row` — the hook predates this instrument — so the two
		 * views of the same 24 facts stay pointed at the same one.
		 */
		for (const row of document.querySelectorAll('[data-skill-row][data-spec-active]')) {
			row.removeAttribute('data-spec-active');
		}
		document
			.querySelector(`[data-skill-row="${line.skillId}"]`)
			?.setAttribute('data-spec-active', '');
	}

	/** Nearest line to a client-space x. The whole strip is the hit area, so
	 *  no individual line has to be a 44px target. */
	function nearest(clientX: number): number {
		const rect = svg!.getBoundingClientRect();
		if (rect.width === 0) return current;
		const x = ((clientX - rect.left) / rect.width) * span;
		let best = 0;
		let bestDistance = Infinity;
		for (let i = 0; i < lines.length; i++) {
			const distance = Math.abs(lines[i].x - x);
			if (distance < bestDistance) {
				bestDistance = distance;
				best = i;
			}
		}
		return best;
	}

	const onKey = (e: KeyboardEvent) => {
		let next = current;
		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowUp':
				next = current + 1;
				break;
			case 'ArrowLeft':
			case 'ArrowDown':
				next = current - 1;
				break;
			case 'PageUp':
				next = current + 5;
				break;
			case 'PageDown':
				next = current - 5;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = lines.length - 1;
				break;
			default:
				return;
		}
		// Only now: an unhandled key must keep its default (Tab, typing).
		e.preventDefault();
		select(next);
	};

	/*
	 * Sweeping is the gesture a spectrograph invites, so hovering the strip
	 * tunes it — no press required. `pointermove` rather than per-line
	 * `mouseenter`: one listener, and it works between lines as well as on
	 * them.
	 */
	const onPointerMove = (e: PointerEvent) => select(nearest(e.clientX));

	const onPointerDown = (e: PointerEvent) => {
		select(nearest(e.clientX));
		// Focus follows the press, so the arrow keys continue where the
		// pointer left off.
		slider!.focus();
	};

	slider.addEventListener('keydown', onKey);
	svg.addEventListener('pointermove', onPointerMove);
	svg.addEventListener('pointerdown', onPointerDown);

	/*
	 * Start where the server rendered: index 0 is already the visible
	 * readout, so `select(0)` would be a no-op and leave the caret and the
	 * aria state unset. Force the first pass.
	 */
	current = -1;
	select(Number(slider.getAttribute('aria-valuenow') ?? 0));

	return () => {
		slider.removeEventListener('keydown', onKey);
		svg.removeEventListener('pointermove', onPointerMove);
		svg.removeEventListener('pointerdown', onPointerDown);
	};
}
