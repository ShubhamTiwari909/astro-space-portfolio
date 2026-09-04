/**
 * Planet placement — master plan §10.6, §4.1 (the Worlds beat).
 *
 * At scroll 0.58–0.78 the camera sits at (7, 3, −16) looking toward
 * (−3, 0, −56), so the system is laid out in front of that look-at, spread
 * across the frame and receding.
 *
 * Scale encodes significance spatially: the featured world is ~1.7× the
 * others and nearest the camera. That is the one thing the DOM cannot
 * express, which is what earns these bytes under P2 — significance is
 * *also* stated as text ("Featured" label + catalogue order), so nothing is
 * size-only (§25.0).
 */

export interface PlanetSlot {
	position: [number, number, number];
	radius: number;
	/** Radians per second. Deliberately unequal so they never look synced. */
	spin: number;
	/** Axial tilt, so the surface bands are not all horizontal. */
	tilt: number;
}

/**
 * Slots in catalogue order. Index 0 is the featured world.
 *
 * A fixed table rather than a generated ring: a hand-placed system composes,
 * where a procedural ring reads as a screensaver. Extra projects beyond the
 * table wrap and recede further — see planetSlot().
 */
export const PLANET_SLOTS: readonly PlanetSlot[] = [
	{ position: [-9, 1, -58], radius: 5.4, spin: 0.045, tilt: 0.3 },
	{ position: [13, 6, -74], radius: 3.1, spin: 0.062, tilt: -0.18 },
	{ position: [-21, -6, -82], radius: 2.8, spin: 0.038, tilt: 0.5 },
	{ position: [5, -9, -94], radius: 2.4, spin: 0.055, tilt: -0.4 },
] as const;

/*
 * Distances were pulled back and radii trimmed after seeing the first
 * render: at z -50 the featured world subtended most of the frame and the
 * others crowded its ring. The system now reads as a system — bodies with
 * space between them — which is what the beat is for.
 */

export function planetSlot(index: number): PlanetSlot {
	const base = PLANET_SLOTS[index % PLANET_SLOTS.length];
	const lap = Math.floor(index / PLANET_SLOTS.length);
	if (lap === 0) return base;
	// Wrap: push further out so a fifth project cannot collide with the first.
	return {
		...base,
		position: [
			base.position[0] + lap * 6,
			base.position[1] - lap * 3,
			base.position[2] - lap * 28,
		],
		radius: base.radius * 0.8 ** lap,
	};
}

/** Minimal shape the scene needs; keeps collection types out of the scene. */
export interface PlanetDatum {
	slug: string;
	hue: number;
	featured: boolean;
	order: number;
}
