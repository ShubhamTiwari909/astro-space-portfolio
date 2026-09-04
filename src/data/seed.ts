/**
 * Deterministic randomness. A sky that changes on every reload reads as a bug,
 * so every "random" value on this site is derived from a fixed seed or a slug
 * hash — never from Date.now() or Math.random(). Master plan §9.7, §10.6.
 */

/** FNV-1a. Stable across runs and platforms, unlike hashCode variants. */
export function hashString(input: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/** Mulberry32 — small, fast, good enough for visual scatter. */
export function mulberry32(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Curated plate hues rather than a full 0–360 range. An unconstrained hash
 * produces muddy greens and reds that fight the palette; these five anchors
 * are all drawn from the theme's own accents, so any number of projects stays
 * visually coherent (§10.6).
 */
const PLATE_HUES = [
	193, // ion cyan
	258, // plasma violet
	172, // deep teal
	226, // indigo
	35, // ember
] as const;

export function plateHue(slug: string): number {
	return PLATE_HUES[hashString(slug) % PLATE_HUES.length];
}

/**
 * Hue by catalogue position. Preferred over `plateHue` wherever an order
 * exists, because a slug hash can collide — and two projects sharing a hue
 * defeats the whole point of hue-as-identity. Wraps if the set ever exceeds
 * the palette.
 */
export function plateHueForIndex(index: number): number {
	return PLATE_HUES[index % PLATE_HUES.length];
}

/** Star-field seed. Fixed constant: the sky is the same on every visit. */
export const SKY_SEED = 0x5eed_5147;
