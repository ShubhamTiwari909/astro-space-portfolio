/**
 * DOM → scene focus channel — master plan §10.6, §20.2.
 *
 * The plan specified a `WorldViewer` React island for this. It is a
 * singleton with one delegated listener instead, and that is a better fit:
 *
 *  - the project cards are server-rendered `.astro` content, and wrapping
 *    them in React would have moved content into an island for the sake of
 *    a hover effect — exactly what P1 forbids;
 *  - `focusin`/`focusout` mean keyboard focus drives the scene identically
 *    to pointer hover, with no extra code (§10.6 requires this);
 *  - it costs ~0.5KB in the existing BaseLayout script rather than a new
 *    island plus a React runtime entry.
 *
 * Same shape as `scrollProgress`: a mutable object the scene reads inside
 * useFrame, never React state.
 */

export interface WorldFocus {
	/** Slug of the world under pointer or keyboard focus, or null. */
	activeSlug: string | null;
}

export const worldFocus: WorldFocus = { activeSlug: null };

/** Attribute the cards carry; also the hook the scene matches against. */
const ATTR = 'data-world-slug';

export function initWorldFocus(): () => void {
	if (typeof document === 'undefined') return () => {};

	const resolve = (target: EventTarget | null): string | null => {
		if (!(target instanceof Element)) return null;
		return target.closest(`[${ATTR}]`)?.getAttribute(ATTR) ?? null;
	};

	const onEnter = (e: Event) => {
		const slug = resolve(e.target);
		if (slug) worldFocus.activeSlug = slug;
	};

	const onLeave = (e: Event) => {
		// Only clear if we are actually leaving the card that is active, so
		// moving between a card's children does not flicker the scene.
		const slug = resolve(e.target);
		if (slug && worldFocus.activeSlug === slug) worldFocus.activeSlug = null;
	};

	// Capture phase: pointerenter/leave do not bubble, so delegation needs it.
	document.addEventListener('pointerenter', onEnter, true);
	document.addEventListener('pointerleave', onLeave, true);
	// focusin/focusout DO bubble, which is what gives keyboard parity.
	document.addEventListener('focusin', onEnter);
	document.addEventListener('focusout', onLeave);

	return () => {
		document.removeEventListener('pointerenter', onEnter, true);
		document.removeEventListener('pointerleave', onLeave, true);
		document.removeEventListener('focusin', onEnter);
		document.removeEventListener('focusout', onLeave);
		worldFocus.activeSlug = null;
	};
}
