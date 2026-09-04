/**
 * The ONE IntersectionObserver for entrance animations — §8.1, §16.3.
 *
 * Adds `is-revealed` to every `[data-observe]` element the first time it is
 * 20% visible, then stops observing it. Entrances never replay: re-animating
 * on scroll-back is the most common way portfolios become exhausting.
 *
 * Every later phase reuses this. Adding a second observer is a review failure.
 *
 * Safety: the CSS hidden state is scoped to `html.observer-ready`, and that
 * class is only set once an observer has actually been constructed here. If
 * this module fails to load, throws, or the browser lacks
 * IntersectionObserver, the hidden state never applies and all content is
 * simply visible. Invisible content is a catastrophe; a missing fade is not.
 */

const REVEALED = 'is-revealed';
const READY = 'observer-ready';

let observer: IntersectionObserver | null = null;

export function observeOnce(root: ParentNode = document): () => void {
	if (typeof window === 'undefined') return () => {};

	const targets = root.querySelectorAll<HTMLElement>('[data-observe]');
	if (targets.length === 0) return () => {};

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Reduced motion or no IO support: the final state IS the designed state.
	if (reduced || typeof IntersectionObserver === 'undefined') {
		targets.forEach((el) => el.classList.add(REVEALED));
		return () => {};
	}

	if (!observer) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.classList.add(REVEALED);
					observer?.unobserve(entry.target);
				}
			},
			{ threshold: 0.2 },
		);
		// Only now is it safe for CSS to hide anything.
		document.documentElement.classList.add(READY);
	}

	targets.forEach((el) => observer?.observe(el));

	return () => {
		observer?.disconnect();
		observer = null;
		document.documentElement.classList.remove(READY);
	};
}
