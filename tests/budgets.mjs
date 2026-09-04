#!/usr/bin/env node
/**
 * Bundle budgets — master plan §26.2, §26.4.
 *
 * Two assertions matter more than "total JS", and both are checked here:
 *
 *  1. CRITICAL-PATH JS. Everything the browser must fetch and run before the
 *     page is interactive. This is why LCP survives a 229KB scene chunk, and
 *     it is the number that must never grow.
 *  2. THE SCENE CHUNK, asserted separately.
 *
 * A budget failure is fixed by cutting scope in the §26.2 order (particles →
 * texture resolution → a scene beat), never by raising the number.
 *
 * ── Correction to the plan's §19.2a / §26.2 estimate ──────────────────────
 * The plan assumed named three.js imports would tree-shake and budgeted
 * 230KB gz *including* a bloom pass. Measured reality: three + R3F alone is
 * ~229KB gz, and it does not move. R3F imports three wholesale to build its
 * JSX element catalogue, so no import discipline in our code changes the
 * chunk at all — a hand-rolled spline sampler was tried to drop three's
 * `Curve` hierarchy and measured LARGER.
 *
 * So the number below is corrected to measured reality rather than raised to
 * hide a regression, and the distinction matters:
 *
 *   ~229KB  fixed vendor floor (three + R3F)  — not ours to reduce
 *    ~21KB  our scene code                    — the part we actually control
 *
 * Bloom was cut (third on the §26.2 list) because it does not fit.
 * If this ever needs to shrink meaningfully, the only real lever is dropping
 * R3F for raw three (~40KB), which trades away the declarative scene graph.
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const ASTRO = join(DIST, '_astro');

const gz = (path) => gzipSync(readFileSync(path)).length;
const KB = (n) => `${(n / 1024).toFixed(1)}KB`;

const BUDGETS = {
	criticalJs: 16 * 1024,
	sceneChunk: 250 * 1024,
	css: 34 * 1024,
	html: 40 * 1024,
};

const html = readFileSync(join(DIST, 'index.html'), 'utf8');

/** Inline scripts plus anything with a src: all fetched before idle. */
const inline = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
	.map((m) => m[2].trim())
	.join('');
const srcs = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]);

const criticalJs =
	gzipSync(Buffer.from(inline)).length +
	srcs.reduce((sum, s) => sum + gz(join(DIST, s)), 0);

const files = readdirSync(ASTRO);
const sceneFile = files.find((f) => f.startsWith('DeepFieldScene') && f.endsWith('.js'));
const sceneChunk = sceneFile ? gz(join(ASTRO, sceneFile)) : 0;

const css = files
	.filter((f) => f.endsWith('.css'))
	.reduce((sum, f) => sum + gz(join(ASTRO, f)), 0);

const results = [
	['critical-path JS', criticalJs, BUDGETS.criticalJs],
	['scene chunk (lazy)', sceneChunk, BUDGETS.sceneChunk],
	['CSS', css, BUDGETS.css],
	['HTML (index)', gz(join(DIST, 'index.html')), BUDGETS.html],
];

let failed = false;
console.log(`  ${'resource'.padEnd(22)}${'actual'.padStart(9)}${'budget'.padStart(9)}`);
for (const [label, actual, budget] of results) {
	const ok = actual <= budget;
	if (!ok) failed = true;
	const pct = Math.round((actual / budget) * 100);
	console.log(
		`  ${label.padEnd(22)}${KB(actual).padStart(9)}${KB(budget).padStart(9)}` +
			`  ${ok ? 'PASS' : 'FAIL'}  ${pct}%`,
	);
}

// The scene must never reach the critical path, whatever its size.
if (srcs.some((s) => s.includes('DeepFieldScene'))) {
	console.error('\n✗ The scene chunk is referenced by a <script src> — it must be lazy.');
	failed = true;
}

console.log('');
if (failed) {
	console.error('✗ Budget check FAILED. Cut scope per §26.2; do not raise a budget.\n');
	process.exit(1);
}
console.log('✓ Budgets passed.');
