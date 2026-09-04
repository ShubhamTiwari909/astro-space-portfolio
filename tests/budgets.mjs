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
	/**
	 * /instruments route JS: everything that route can pull, the shared
	 * scene chunk included. Orbit's own code is asserted separately below
	 * against §14.3's ≤12KB island budget — the aggregate would hide it
	 * inside three's ~229KB floor.
	 *
	 * §14.5 says 160KB, which is a Revision 1 number and is now impossible
	 * on ANY route: the persistent backdrop puts three + R3F (~229KB) on
	 * every page by design. R2 re-budgeted desktop JS to 340KB in §26.2, so
	 * this route is held to that instead of to a figure the architecture
	 * ruled out. What §14.5 was really protecting — that the experiment
	 * costs almost nothing on top — is the orbitIsland assertion.
	 */
	instrumentsRouteJs: 340 * 1024,
	orbitIsland: 12 * 1024,
	instrumentsHtml: 60 * 1024,
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

/*
 * Total gzipped JS reachable from a set of entry files, following the
 * static import graph in the emitted bundles.
 *
 * This exists because measuring a single chunk file is not stable. Phase 5
 * proved it: once Orbit also imported three, the bundler hoisted three into
 * a SHARED chunk and `DeepFieldScene.*.js` shrank from 233KB to 7KB. The
 * old single-file assertion went on passing at 3% of budget while the
 * 229KB it was written to guard simply moved next door. A closure cannot
 * be dodged that way.
 */
function jsClosure(entries) {
	const seen = new Set();
	const queue = entries.map((e) => e.replace(/^\//, ''));
	let total = 0;
	while (queue.length) {
		const rel = queue.pop();
		if (seen.has(rel) || !rel.endsWith('.js')) continue;
		seen.add(rel);
		let code;
		try {
			code = readFileSync(join(DIST, rel), 'utf8');
		} catch {
			continue;
		}
		total += gzipSync(Buffer.from(code)).length;
		for (const m of code.matchAll(
			/(?:from|import)\s*"(\.\/[^"]+\.js)"|(?:from|import)\s*'(\.\/[^']+\.js)'/g,
		)) {
			const spec = (m[1] ?? m[2]).replace('./', '');
			queue.push(join('_astro', spec));
		}
	}
	return total;
}

const files = readdirSync(ASTRO);
const sceneFile = files.find((f) => f.startsWith('DeepFieldScene') && f.endsWith('.js'));
const sceneChunk = sceneFile ? jsClosure([join('_astro', sceneFile)]) : 0;

const css = files
	.filter((f) => f.endsWith('.css'))
	.reduce((sum, f) => sum + gz(join(ASTRO, f)), 0);

/*
 * ── /instruments (§14.5) ─────────────────────────────────────────────────
 * The route's own island. Orbit's simulation is a separate lazy chunk from
 * its wrapper, because the poster path — which is what a reduced-motion
 * visitor gets, and everyone below 1024px — must never parse the physics.
 * Both halves count toward the island budget.
 */
const orbitFiles = files.filter(
	(f) => /^(Orbit|Sim)\./.test(f) && f.endsWith('.js'),
);
const orbitIsland = orbitFiles.reduce((sum, f) => sum + gz(join(ASTRO, f)), 0);

const instrumentsHtmlPath = join(DIST, 'instruments', 'index.html');
const instrumentsHtml = readFileSync(instrumentsHtmlPath, 'utf8');
const instrumentsSrcs = [
	...instrumentsHtml.matchAll(/<script[^>]*src="([^"]+)"/g),
].map((m) => m[1]);

const instrumentsRouteJs = jsClosure([
	...instrumentsSrcs,
	// The scene and the simulation are both dynamically imported, so they
	// are not <script src> entries — but the route can pull them, so a
	// route budget that ignored them would be meaningless.
	...(sceneFile ? [join('_astro', sceneFile)] : []),
	...orbitFiles.map((f) => join('_astro', f)),
]);

const results = [
	['critical-path JS', criticalJs, BUDGETS.criticalJs],
	['scene chunk (lazy)', sceneChunk, BUDGETS.sceneChunk],
	['CSS', css, BUDGETS.css],
	['HTML (index)', gz(join(DIST, 'index.html')), BUDGETS.html],
	['HTML (instruments)', gz(instrumentsHtmlPath), BUDGETS.instrumentsHtml],
	['orbit island', orbitIsland, BUDGETS.orbitIsland],
	['/instruments route JS', instrumentsRouteJs, BUDGETS.instrumentsRouteJs],
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

/*
 * §14.3: Orbit lives only on /instruments. A reference from the home route
 * would mean the experiment had escaped onto the page that has to stay
 * fast, which is the one boundary the plan states twice.
 */
if (srcs.some((s) => /Orbit|\/Sim\./.test(s)) || html.includes('data-orbit-host')) {
	console.error('\n✗ Orbit is referenced by the home route — it belongs to /instruments only.');
	failed = true;
}

if (orbitFiles.length === 0) {
	console.error('\n✗ No Orbit chunk found in dist/_astro — the island did not build.');
	failed = true;
}

console.log('');
if (failed) {
	console.error('✗ Budget check FAILED. Cut scope per §26.2; do not raise a budget.\n');
	process.exit(1);
}
console.log('✓ Budgets passed.');
