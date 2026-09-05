/**
 * The ONE scroll loop — master plan §19.2b, §22.
 *
 * Scroll position is needed by the DOM (band tint, progress) and, from
 * Phase 4, by the scene's camera. Three islands each running their own
 * listener is the classic way this becomes janky, so there is exactly one
 * rAF loop here, reading `scrollY` once per frame and publishing to two
 * channels:
 *
 *   1. CSS custom properties on <body> — consumed with zero JS involvement.
 *   2. A mutable state object — read by the scene inside useFrame, via ref.
 *      NEVER through React state: a setState at 60fps re-renders the tree
 *      every frame and costs more than every other optimisation combined.
 *
 * This is a module singleton, not a store library: no dependency, no
 * provider, ~100 lines. Islands import it; they never talk to each other.
 */

import { BANDS, type Band } from './bands';

export interface ScrollState {
	/** Document scroll progress, 0 → 1. */
	progress: number;
	/** Scroll delta of the last frame, in px. Used to skip frames on low tier. */
	velocity: number;
	/** Index into BANDS of the currently dominant band. */
	bandIndex: number;
	/** 0 → 1 blend toward the next band, for cross-fading. */
	bandBlend: number;
}

/** Single mutable state object. Read it; never replace it. */
export const scrollState: ScrollState = {
	progress: 0,
	velocity: 0,
	bandIndex: 0,
	bandBlend: 0,
};

type Subscriber = (state: ScrollState) => void;
const subscribers = new Set<Subscriber>();

let running = false;
let rafId = 0;
let lastY = 0;
let lastBandIndex = -1;

/** Section elements in flight-path order, resolved once at start(). */
let sections: HTMLElement[] = [];

/*
 * Cached geometry. The loop must not read layout.
 *
 * This used to call getBoundingClientRect() for every section plus
 * documentElement.scrollHeight on EVERY frame, and then write custom
 * properties to <body> in the same frame. A write to <body> invalidates
 * style for the whole subtree, so the next frame's reads forced a full
 * style recalc and layout — a synchronous reflow sixty times a second, for
 * geometry that only changes when the viewport or the document does.
 *
 * Section offsets are absolute document positions, so `scrollY` alone
 * decides the band. Re-measured on resize and whenever the document's own
 * size changes (images decoding, sections revealing), never per frame.
 */
let sectionTops: number[] = [];
let docMax = 0;
let viewportH = 0;
let resizeObserver: ResizeObserver | null = null;

function resolveSections(): void {
	sections = BANDS.map((b) => document.getElementById(b.section)).filter(
		(el): el is HTMLElement => el !== null,
	);
	measure();
}

/** The only place layout is read. Never called from the frame loop. */
function measure(): void {
	viewportH = window.innerHeight;
	docMax = document.documentElement.scrollHeight - viewportH;
	const y = window.scrollY;
	sectionTops = sections.map((el) => el.getBoundingClientRect().top + y);
}

/**
 * Which band dominates, and how far we are toward the next one.
 *
 * Based on section midpoints rather than tops: a band should take over when
 * its section owns the middle of the viewport, which is the same rule the
 * rail uses for `aria-current` so the two can never disagree.
 */
function computeBand(y: number): { index: number; blend: number } {
	if (sectionTops.length === 0) return { index: 0, blend: 0 };

	// The document position of the viewport's middle.
	const mid = y + viewportH / 2;
	let index = 0;

	for (let i = 0; i < sectionTops.length; i++) {
		if (sectionTops[i] <= mid) index = i;
		else break;
	}

	// Blend across the gap between this section's midpoint and the next.
	let blend = 0;
	const next = sectionTops[index + 1];
	if (next !== undefined) {
		const span = next - sectionTops[index];
		if (span > 0) blend = Math.min(1, Math.max(0, (mid - sectionTops[index]) / span));
	}

	return { index, blend };
}

function applyBand(index: number): void {
	if (index === lastBandIndex) return;
	lastBandIndex = index;

	const band: Band = BANDS[index];
	const body = document.body;
	body.style.setProperty('--band', band.hex);
	body.style.setProperty('--band-rgb', band.rgb.join(' '));
	// Exposed for the rail and for debugging; not used for styling.
	body.dataset.band = band.section;
}

function frame(): void {
	// scrollY is the only layout-adjacent read left, and it is cheap: the
	// scroll offset is maintained by the compositor, not recomputed.
	const y = window.scrollY;

	scrollState.velocity = y - lastY;
	lastY = y;
	scrollState.progress = docMax > 0 ? Math.min(1, Math.max(0, y / docMax)) : 0;

	const { index, blend } = computeBand(y);
	scrollState.bandIndex = index;
	scrollState.bandBlend = blend;

	document.body.style.setProperty('--scroll', scrollState.progress.toFixed(4));
	applyBand(index);

	for (const fn of subscribers) fn(scrollState);

	rafId = requestAnimationFrame(frame);
}

function onVisibility(): void {
	// A hidden tab must do zero work (§26.3).
	if (document.hidden) stop();
	else start();
}

export function start(): void {
	if (running || typeof window === 'undefined') return;
	running = true;
	resolveSections();
	lastY = window.scrollY;
	rafId = requestAnimationFrame(frame);
}

export function stop(): void {
	if (!running) return;
	running = false;
	cancelAnimationFrame(rafId);
}

/** Subscribe to per-frame updates. Returns an unsubscribe function. */
export function subscribe(fn: Subscriber): () => void {
	subscribers.add(fn);
	return () => subscribers.delete(fn);
}

export function init(): () => void {
	if (typeof window === 'undefined') return () => {};

	start();
	document.addEventListener('visibilitychange', onVisibility);
	window.addEventListener('resize', measure, { passive: true });

	/*
	 * The document's height changes without a resize event — images decode,
	 * sections reveal, fonts swap. A ResizeObserver on <body> catches those;
	 * without it the cached offsets would slowly go stale and the band would
	 * change at the wrong scroll position.
	 */
	if (typeof ResizeObserver !== 'undefined') {
		resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(document.body);
	}

	return () => {
		stop();
		document.removeEventListener('visibilitychange', onVisibility);
		window.removeEventListener('resize', measure);
		resizeObserver?.disconnect();
		resizeObserver = null;
	};
}
