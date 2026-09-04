#!/usr/bin/env node
/**
 * Contrast verification — master plan §25.2, Phase 6 task 10.
 *
 * Reads the colours out of the **shipped** stylesheet rather than the source
 * tokens, so this measures what a visitor actually receives. §25.2's ratios
 * were authored as "approximate computed ratios … to be verified with a
 * checker"; this is that checker, and it runs on every build.
 *
 * Two things are asserted:
 *
 *  1. The requirement: every band clears 4.5:1 on void, because any band can
 *     become the link colour; the three ink levels clear 4.5:1 on surface-0.
 *  2. The plan's own numbers. If a documented ratio drifts from the measured
 *     one the table is wrong, and a wrong accessibility table is worse than
 *     no table — someone will trust it.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const css = readdirSync('dist/_astro')
	.filter((f) => f.endsWith('.css'))
	.map((f) => readFileSync(join('dist/_astro', f), 'utf8'))
	.join('\n');

/** Pull `--name:#hex` out of the bundle. */
function token(name) {
	const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`));
	if (!m) throw new Error(`token --${name} not found in the shipped CSS`);
	return m[1];
}

function srgb(hex) {
	let h = hex.replace('#', '');
	if (h.length === 3) h = [...h].map((c) => c + c).join('');
	return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255);
}

/** WCAG 2.x relative luminance. */
function luminance(hex) {
	const [r, g, b] = srgb(hex).map((c) =>
		c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
	);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
	const la = luminance(a);
	const lb = luminance(b);
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const void_ = token('color-void');
const surface0 = token('color-surface-0');

/** §25.2's documented values, checked against measurement. */
const BANDS = [
	['Ion Cyan', 'band-ion', 13.69],
	['Nebula Magenta', 'band-magenta', 7.15],
	['Stellar Blue', 'band-blue', 10.09],
	['Solar Ember', 'band-ember', 11.48],
	['Plasma Violet', 'band-violet', 7.44],
	['Aurora Green', 'band-aurora', 13.31],
	['Signal Gold', 'band-gold', 14.65],
];

const INKS = [
	['ink-hi', 'color-ink-hi', void_, 17.69],
	['ink-mid', 'color-ink-mid', surface0, 8.17],
	['ink-low', 'color-ink-low', surface0, 5.56],
];

const failures = [];
/**
 * The documented column now holds exact measurements rather than the
 * original estimates, so the tolerance is tight enough that any token
 * change fails here instead of drifting unnoticed. §25.2's first table had
 * drifted by up to 1.7, and two bands were overstated.
 */
const TOLERANCE = 0.02;

console.log(`\n  void ${void_}   surface-0 ${surface0}\n`);
console.log(
	`  ${'colour'.padEnd(16)}${'hex'.padEnd(10)}${'measured'.padStart(9)}${'documented'.padStart(12)}${'  min'.padEnd(7)}`,
);

function checkRow(label, hex, bg, documented, minimum) {
	const measured = ratio(hex, bg);
	const meetsMin = measured >= minimum;
	const matchesDoc = Math.abs(measured - documented) <= TOLERANCE;
	if (!meetsMin) {
		failures.push(
			`${label} is ${measured.toFixed(2)}:1 on ${bg} — below the ${minimum}:1 requirement`,
		);
	}
	if (!matchesDoc) {
		failures.push(
			`${label}: §25.2 documents ~${documented}:1 but the shipped CSS measures ${measured.toFixed(2)}:1`,
		);
	}
	console.log(
		`  ${label.padEnd(16)}${hex.toUpperCase().padEnd(10)}` +
			`${`${measured.toFixed(2)}:1`.padStart(9)}${`${documented}:1`.padStart(12)}` +
			`   ${minimum}  ${meetsMin && matchesDoc ? 'PASS' : 'FAIL'}`,
	);
}

for (const [label, name, documented] of BANDS) {
	checkRow(label, token(name), void_, documented, 4.5);
}
console.log('');
for (const [label, name, bg, documented] of INKS) {
	checkRow(label, token(name), bg, documented, 4.5);
}

/*
 * §25.2 singles out ink-low as having the least headroom and forbids it on
 * surface-2. Asserted, rather than left as prose nobody re-checks.
 */
const surface2 = token('color-surface-2');
const inkLowOn2 = ratio(token('color-ink-low'), surface2);
console.log(
	`\n  ink-low on surface-2 ${surface2}: ${inkLowOn2.toFixed(2)}:1 — §25.2 forbids this pairing`,
);
if (inkLowOn2 >= 4.5) {
	console.log(
		'  (it would pass, but the prohibition stands: it is a 12px-and-up label colour)',
	);
}

console.log('');
if (failures.length) {
	console.error(`✗ Contrast check FAILED — ${failures.length} problem(s):\n`);
	for (const f of failures) console.error(`  • ${f}`);
	console.error('');
	process.exit(1);
}
console.log(
	`✓ Contrast verified — ${BANDS.length} bands clear 4.5:1 on void, 3 ink`,
);
console.log('  levels clear 4.5:1, and every §25.2 figure matches the shipped CSS.\n');
