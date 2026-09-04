import { mulberry32 } from '../../../data/seed.ts';

/**
 * The simulation — master plan §14.3, §14.5.
 *
 * A **restricted** n-body problem, and the word matters. Four masses
 * attract each other pairwise; two thousand massless test particles are
 * integrated against those masses but exert no force of their own.
 *
 * That is a deliberate model choice, not a shortcut hidden behind a label.
 * True pairwise gravity across 2,000 bodies is 2 million interactions per
 * frame, which needs either a Barnes-Hut tree or a GPGPU pass — both of
 * which are more machinery than this exhibit can justify, and the plan's
 * own instruction is to simplify the physics rather than add a dependency.
 * The restricted problem costs ~10,000 force evaluations per frame, runs
 * comfortably inside the 10ms budget, and produces the thing worth looking
 * at: structure emerging around moving attractors. The UI states the model
 * in those words, so nobody has to infer it.
 *
 * Integration is semi-implicit (symplectic) Euler — velocity updated from
 * the current position, then position from the *new* velocity. It is one
 * line different from explicit Euler and vastly better behaved: explicit
 * Euler pumps energy into close encounters until the system flies apart.
 *
 * Gravity is Plummer-softened: dividing by (r² + ε²)^1.5 instead of r³
 * removes the singularity as r → 0. Without it a particle passing near a
 * mass takes an unbounded impulse and is instantly lost, which looks like
 * a bug and is one.
 *
 * Everything is a pre-allocated Float32Array. Nothing in `step()`
 * allocates, so the loop generates no garbage.
 */

/** Attractors, which do interact with each other. */
export const MASS_COUNT = 4;

/** Test particles. The hard cap from §14.3. */
export const MAX_PARTICLES = 2000;

/** Positions kept per particle for its trailing path. */
export const HISTORY = 5;

const G = 42;
/** Plummer softening length. */
const EPS = 2.2;
const EPS2 = EPS * EPS;
/** Softening for the cursor, which is heavier and should not fling. */
const CURSOR_EPS2 = 90;

export interface OrbitState {
	/** Attractor positions, xy interleaved. */
	mx: Float32Array;
	mv: Float32Array;
	mass: Float32Array;
	/** Particle positions and velocities, xy interleaved. */
	px: Float32Array;
	pv: Float32Array;
	/**
	 * Trail ring buffer, laid out **particle-major**: particle i occupies
	 * indices [i*HISTORY, (i+1)*HISTORY). That layout is what makes
	 * degradation cheap — halving the particle count is a contiguous
	 * `setDrawRange`, with no repacking.
	 */
	trail: Float32Array;
	/** Per-vertex speed, for colour. Same layout as `trail`. */
	speed: Float32Array;
	/** Which history slot the current frame writes. */
	slot: number;
	/** Live particle count; lowered by degradation. */
	active: number;
}

export function createState(seed: number): OrbitState {
	const rand = mulberry32(seed);

	const mx = new Float32Array(MASS_COUNT * 2);
	const mv = new Float32Array(MASS_COUNT * 2);
	const mass = new Float32Array(MASS_COUNT);

	/*
	 * Attractors on a ring, given tangential velocities so the group
	 * orbits its own centre of mass rather than immediately collapsing.
	 */
	for (let i = 0; i < MASS_COUNT; i++) {
		const angle = (i / MASS_COUNT) * Math.PI * 2 + rand() * 0.4;
		const radius = 12 + rand() * 6;
		mx[i * 2] = Math.cos(angle) * radius;
		mx[i * 2 + 1] = Math.sin(angle) * radius;
		const speed = 1.5 + rand() * 0.5;
		mv[i * 2] = -Math.sin(angle) * speed;
		mv[i * 2 + 1] = Math.cos(angle) * speed;
		mass[i] = 8 + rand() * 10;
	}

	const px = new Float32Array(MAX_PARTICLES * 2);
	const pv = new Float32Array(MAX_PARTICLES * 2);

	/*
	 * Particles start on an annulus *outside* the attractor ring, at
	 * near-circular speed for the enclosed mass. Seeded, so the poster frame
	 * and the live simulation open from the same initial conditions.
	 *
	 * The first attempt seeded from r=8 — inside the ring of masses, which
	 * sit at r 12–18. Those particles scattered chaotically off the
	 * attractors and were ejected: measured radius p90 reached 105 units
	 * against a 56-unit view, so most of the simulation was off-screen and
	 * the visible part looked sparse. Starting outside the ring, at full
	 * circular velocity rather than 0.62 of it, keeps the bulk bound.
	 */
	let totalMass = 0;
	for (let i = 0; i < MASS_COUNT; i++) totalMass += mass[i];

	for (let i = 0; i < MAX_PARTICLES; i++) {
		const angle = rand() * Math.PI * 2;
		const radius = 21 + Math.sqrt(rand()) * 42;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		px[i * 2] = x;
		px[i * 2 + 1] = y;
		// v = sqrt(G·M_total / r), perpendicular to the radius.
		const v = Math.sqrt((G * totalMass) / radius) * (0.94 + rand() * 0.12);
		pv[i * 2] = -Math.sin(angle) * v;
		pv[i * 2 + 1] = Math.cos(angle) * v;
	}

	const trail = new Float32Array(MAX_PARTICLES * HISTORY * 3);
	const speed = new Float32Array(MAX_PARTICLES * HISTORY);

	// Seed every history slot with the starting position, so the first
	// frames show points rather than streaks from the origin.
	for (let i = 0; i < MAX_PARTICLES; i++) {
		for (let h = 0; h < HISTORY; h++) {
			const v = (i * HISTORY + h) * 3;
			trail[v] = px[i * 2];
			trail[v + 1] = px[i * 2 + 1];
			trail[v + 2] = 0;
		}
	}

	return { mx, mv, mass, px, pv, trail, speed, slot: 0, active: MAX_PARTICLES };
}

/**
 * Advance one step.
 *
 * `dt` is clamped by the caller. A tab that was backgrounded hands back a
 * multi-second delta, and integrating that in one step detonates the
 * system — the same class of bug the scene's frame governor guards against.
 */
export function step(
	state: OrbitState,
	dt: number,
	cursor: { x: number; y: number; active: boolean },
): void {
	const { mx, mv, mass, px, pv, trail, speed } = state;

	// ---- attractors: pairwise, 6 interactions for 4 bodies ----
	for (let i = 0; i < MASS_COUNT; i++) {
		let ax = 0;
		let ay = 0;
		for (let j = 0; j < MASS_COUNT; j++) {
			if (i === j) continue;
			const dx = mx[j * 2] - mx[i * 2];
			const dy = mx[j * 2 + 1] - mx[i * 2 + 1];
			const r2 = dx * dx + dy * dy + EPS2;
			const inv = (G * mass[j]) / (r2 * Math.sqrt(r2));
			ax += dx * inv;
			ay += dy * inv;
		}
		// Gentle restoring pull toward the origin keeps the group framed.
		ax -= mx[i * 2] * 0.05;
		ay -= mx[i * 2 + 1] * 0.05;
		mv[i * 2] += ax * dt;
		mv[i * 2 + 1] += ay * dt;
	}
	for (let i = 0; i < MASS_COUNT * 2; i++) mx[i] += mv[i] * dt;

	// ---- particles: forced by the attractors, and by the cursor ----
	const slot = state.slot;
	const active = state.active;

	for (let i = 0; i < active; i++) {
		const xi = i * 2;
		let ax = 0;
		let ay = 0;

		for (let m = 0; m < MASS_COUNT; m++) {
			const dx = mx[m * 2] - px[xi];
			const dy = mx[m * 2 + 1] - px[xi + 1];
			const r2 = dx * dx + dy * dy + EPS2;
			const inv = (G * mass[m]) / (r2 * Math.sqrt(r2));
			ax += dx * inv;
			ay += dy * inv;
		}

		if (cursor.active) {
			const dx = cursor.x - px[xi];
			const dy = cursor.y - px[xi + 1];
			const r2 = dx * dx + dy * dy + CURSOR_EPS2;
			const inv = (G * 26) / (r2 * Math.sqrt(r2));
			ax += dx * inv;
			ay += dy * inv;
		}

		// Semi-implicit Euler: velocity first, then position from the new
		// velocity. This is the line that keeps the system stable.
		pv[xi] += ax * dt;
		pv[xi + 1] += ay * dt;
		px[xi] += pv[xi] * dt;
		px[xi + 1] += pv[xi + 1] * dt;

		const v = (i * HISTORY + slot) * 3;
		trail[v] = px[xi];
		trail[v + 1] = px[xi + 1];
		speed[i * HISTORY + slot] = Math.hypot(pv[xi], pv[xi + 1]);
	}

	state.slot = (slot + 1) % HISTORY;
}
