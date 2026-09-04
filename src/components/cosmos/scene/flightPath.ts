/**
 * The flight path — master plan §4.1.
 *
 * Eight keyframes, one per section, in reading order. This file is the
 * single source of truth for the camera's journey and deliberately contains
 * NO rendering code: the rig samples it, nothing else touches it.
 *
 * The path runs forward along -Z from intergalactic space into a planet
 * system, and the final beat turns around to look back along everything the
 * visitor just crossed — which is what gives the site an ending rather than
 * merely a last section.
 *
 * Position and look-at are separate curves, so the camera can turn
 * independently of travel. That separation is what sells "flight" over
 * "dolly" (§4.1 rule 3).
 *
 * Uses three's `CatmullRomCurve3`. A hand-rolled sampler was tried first to
 * shave the `Curve` hierarchy out of the bundle and measured LARGER — R3F
 * imports three wholesale for its JSX catalogue, so no import discipline
 * here changes the chunk size at all. See the note in tests/budgets.mjs.
 */

import { CatmullRomCurve3, Vector3 } from 'three';

export interface Keyframe {
	/** Section anchor id — matches BANDS, so band and camera stay in step. */
	section: string;
	position: [number, number, number];
	lookAt: [number, number, number];
	/** What comes into frame here. Documentation, not used at runtime. */
	beat: string;
}

export const KEYFRAMES: readonly Keyframe[] = [
	{
		section: 'first-light',
		position: [0, 0, 120],
		lookAt: [0, 0, 40],
		beat: 'Intergalactic void. Distant galaxies, drifting dust, nearly still.',
	},
	{
		section: 'log',
		position: [20, 7, 82],
		lookAt: [-8, 2, 24],
		beat: 'Drifting toward a nebula wall; parallax deepens sharply.',
	},
	{
		section: 'atlas',
		position: [-14, 11, 46],
		lookAt: [2, 4, -6],
		beat: 'Inside a star cluster — the constellation globe forms here (4b).',
	},
	{
		section: 'trajectory',
		position: [28, -7, 16],
		lookAt: [-6, 0, -30],
		beat: 'Following a probe: an ember ion-trail arcs past (4b).',
	},
	{
		section: 'worlds',
		position: [7, 3, -16],
		lookAt: [-3, 0, -56],
		beat: 'Arriving in a planet system. Longest dwell — most important content.',
	},
	{
		section: 'instruments',
		position: [-22, 9, -52],
		lookAt: [-4, 3, -84],
		beat: 'Docking at an orbital structure (4b).',
	},
	{
		section: 'transmissions',
		position: [13, -5, -80],
		lookAt: [3, 0, -108],
		beat: 'Beside a relay array; gold signal beams pulse outward (4b).',
	},
	{
		section: 'uplink',
		position: [0, 16, -112],
		lookAt: [0, 0, 20],
		beat: 'Turned around, looking back along the whole path. The descent inverted.',
	},
] as const;

const toVec = (t: readonly [number, number, number]) => new Vector3(...t);

export const POSITION_CURVE = new CatmullRomCurve3(
	KEYFRAMES.map((k) => toVec(k.position)),
	false,
	'catmullrom',
	0.5,
);

export const LOOKAT_CURVE = new CatmullRomCurve3(
	KEYFRAMES.map((k) => toVec(k.lookAt)),
	false,
	'catmullrom',
	0.5,
);

/** Discrete keyframe vectors, for the reduced-motion "cut" path (§16.4). */
export const KEYFRAME_POSITIONS = KEYFRAMES.map((k) => toVec(k.position));
export const KEYFRAME_LOOKATS = KEYFRAMES.map((k) => toVec(k.lookAt));

/** Fixed FOV. Animating it on scroll induces motion sickness (§4.1 rule 4). */
export const CAMERA_FOV = 55;

/** Camera inertia: it arrives, it does not track (§3.6, §4.1 rule 2). */
export const CAMERA_LAG_MS = 140;
