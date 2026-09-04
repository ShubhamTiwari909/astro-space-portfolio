#!/usr/bin/env node --experimental-strip-types
/**
 * Flight-path assertions — master plan §4.1.
 *
 * The camera path is the centrepiece of Revision 2 and the hardest thing to
 * verify visually: a browser only paints the top of a document, so scrolled
 * camera states are awkward to screenshot. The maths, though, is fully
 * testable without a browser — which is what this does.
 *
 * Asserts the properties §4.1 actually promises:
 *   1. One keyframe per section, in the same order as the bands
 *   2. The spline passes through every keyframe (it is a path, not a hint)
 *   3. Motion is continuous — no jump cuts between samples
 *   4. The journey travels forward, never doubling back
 *   5. The final beat looks BACK along the path, which is what gives the
 *      site an ending rather than merely a last section
 *
 * Run with node's type stripping: `node --experimental-strip-types`.
 */

import { Vector3 } from 'three';
import {
	KEYFRAMES,
	LOOKAT_CURVE,
	POSITION_CURVE,
} from '../src/components/cosmos/scene/flightPath.ts';
import { BANDS } from '../src/lib/bands.ts';

const failures = [];
const scratch = new Vector3();

function check(label, ok, detail = '') {
	console.log(`  ${label.padEnd(46)} ${ok ? 'PASS' : 'FAIL'}${detail ? `  ${detail}` : ''}`);
	if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
}

// ── 1. One keyframe per section, same order as the bands ─────────────────
const kfSections = KEYFRAMES.map((k) => k.section).join(',');
const bandSections = BANDS.map((b) => b.section).join(',');
check(
	'keyframes match band order exactly',
	kfSections === bandSections,
	`${KEYFRAMES.length} keyframes`,
);

// ── 2. The spline visits every keyframe ──────────────────────────────────
const last = KEYFRAMES.length - 1;
let worstDeviation = 0;
let worstSection = '';
for (const [i, kf] of KEYFRAMES.entries()) {
	POSITION_CURVE.getPoint(i / last, scratch);
	const d = scratch.distanceTo(new Vector3(...kf.position));
	if (d > worstDeviation) {
		worstDeviation = d;
		worstSection = kf.section;
	}
}
check(
	'spline passes through every keyframe',
	worstDeviation < 0.01,
	`worst ${worstDeviation.toFixed(4)} at "${worstSection}"`,
);

// ── 3 & 4. Continuity and forward travel ─────────────────────────────────
const SAMPLES = 400;
let maxStep = 0;
let backtrack = 0;
let previous = null;
for (let i = 0; i <= SAMPLES; i++) {
	POSITION_CURVE.getPoint(i / SAMPLES, scratch);
	if (previous) {
		maxStep = Math.max(maxStep, scratch.distanceTo(previous));
		// The journey runs along -Z; a rise in z is doubling back.
		backtrack = Math.max(backtrack, scratch.z - previous.z);
	}
	previous = scratch.clone();
}

// A jump cut would show up as one sample far from its neighbour. The total
// path is ~250 units over 400 samples, so a step above 3 units is a seam.
check('motion is continuous (no jump cuts)', maxStep < 3, `max step ${maxStep.toFixed(2)}u`);
check(
	'journey never doubles back',
	backtrack < 0.5,
	`max +Z drift ${backtrack.toFixed(3)}u`,
);

// ── 5. The final beat looks back ─────────────────────────────────────────
POSITION_CURVE.getPoint(1, scratch);
const endZ = scratch.z;
LOOKAT_CURVE.getPoint(1, scratch);
const endLookZ = scratch.z;
check(
	'final beat looks back along the path',
	endLookZ > endZ,
	`camera z=${endZ.toFixed(0)} looking at z=${endLookZ.toFixed(0)}`,
);

// The path has to actually cover distance, or the "flight" is a hover.
POSITION_CURVE.getPoint(0, scratch);
const travelled = Math.abs(scratch.z - endZ);
check('path covers real distance', travelled > 100, `${travelled.toFixed(0)}u on Z`);

console.log('');
if (failures.length > 0) {
	console.error('✗ Flight-path assertions FAILED:\n');
	for (const f of failures) console.error(`  ${f}`);
	console.error('');
	process.exit(1);
}
console.log('✓ Flight path verified — 8 beats, continuous, forward, ends looking back.');
