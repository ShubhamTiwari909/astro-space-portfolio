#!/usr/bin/env node
/**
 * Lighthouse — master plan Phase 7, tasks 8 and 10.
 *
 * ── What is and is not asserted, and why ─────────────────────────────────
 * Phase 7 states plainly that "local numbers are not authoritative", and for
 * this site that is more than boilerplate: the machine running this has no
 * GPU available to headless Chrome, so every WebGL frame is rasterised in
 * software. A performance score measured that way says something about
 * SwiftShader, not about the site.
 *
 * So this asserts the numbers that ARE stable locally:
 *
 *   Accessibility = 100 on every route. A hard gate. It is stable because
 *   it is a static analysis of the DOM, and §25 makes it non-negotiable.
 *
 * and it RECORDS, without asserting, the performance metrics — LCP, CLS,
 * TBT, and the score — so there is a local baseline to compare the deployed
 * numbers against. Asserting a performance threshold here would either be
 * so loose it catches nothing or so tight it fails on an unrelated machine.
 *
 * Set LH_ASSERT_PERF=1 once the site is deployed and the thresholds in
 * §26.1 have been confirmed against the real host.
 */

import { chromium } from 'playwright-core';
import lighthouse from 'lighthouse';
import { serveDist } from './lib/serve.mjs';

const ROUTES = [
	{ path: '/', name: 'home', perf: 78 },
	{ path: '/instruments', name: 'instruments', perf: 72 },
	{ path: '/transmissions', name: 'transmissions', perf: 85 },
	{ path: '/dossier', name: 'dossier', perf: 85 },
];

const ASSERT_PERF = process.env.LH_ASSERT_PERF === '1';
const { base, close } = await serveDist('dist');

/*
 * Lighthouse needs a debugging port, so the browser is launched with one
 * rather than driven through Playwright's protocol session.
 */
const channel = process.env.BROWSER_CHANNEL ?? 'chrome';
const browser = await chromium.launch({
	...(channel ? { channel } : {}),
	args: ['--remote-debugging-port=9222', '--use-gl=angle', '--enable-unsafe-swiftshader'],
});

const failures = [];
const results = [];

console.log('\n══ Lighthouse (mobile emulation) ═════════════════════════════\n');
console.log(
	`  ${'route'.padEnd(16)}${'perf'.padStart(6)}${'a11y'.padStart(6)}${'bp'.padStart(5)}${'seo'.padStart(5)}` +
		`${'LCP'.padStart(9)}${'CLS'.padStart(8)}${'TBT'.padStart(9)}`,
);

for (const route of ROUTES) {
	const runnerResult = await lighthouse(
		base + route.path,
		{ port: 9222, output: 'json', logLevel: 'error' },
		undefined,
	);
	if (!runnerResult) {
		failures.push(`${route.path}: lighthouse returned nothing`);
		continue;
	}

	const lhr = runnerResult.lhr;
	const score = (id) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
	const audit = (id) => lhr.audits[id]?.numericValue ?? 0;

	const perf = score('performance');
	const a11y = score('accessibility');
	const bp = score('best-practices');
	const seo = score('seo');
	const lcp = audit('largest-contentful-paint');
	const cls = lhr.audits['cumulative-layout-shift']?.numericValue ?? 0;
	const tbt = audit('total-blocking-time');

	console.log(
		`  ${route.name.padEnd(16)}${String(perf).padStart(6)}${String(a11y).padStart(6)}` +
			`${String(bp).padStart(5)}${String(seo).padStart(5)}` +
			`${`${(lcp / 1000).toFixed(2)}s`.padStart(9)}${cls.toFixed(3).padStart(8)}` +
			`${`${Math.round(tbt)}ms`.padStart(9)}`,
	);

	// The hard gate: §25 does not bend for bytes.
	if (a11y !== 100) {
		failures.push(`${route.path}: accessibility ${a11y}, must be 100`);
		for (const a of Object.values(lhr.audits)) {
			if (a.score === 0 && lhr.categories.accessibility.auditRefs.some((r) => r.id === a.id)) {
				failures.push(`    ${a.id}: ${a.title}`);
			}
		}
	}

	// CLS is layout stability — it does not depend on the GPU, so it is
	// meaningful here and §26.1 caps it at 0.02.
	if (cls > 0.02) failures.push(`${route.path}: CLS ${cls.toFixed(3)} exceeds 0.02`);

	if (ASSERT_PERF && perf < route.perf) {
		failures.push(`${route.path}: performance ${perf} below ${route.perf}`);
	}

	results.push({ route: route.path, perf, a11y, bp, seo, lcp, cls, tbt });
}

await browser.close();
await close();

console.log('');
if (!ASSERT_PERF) {
	console.log('  Performance is RECORDED, not asserted: this machine gives headless');
	console.log('  Chrome no GPU, so WebGL rasterises in software. Set LH_ASSERT_PERF=1');
	console.log('  against the deployed URL to turn the §26.1 thresholds on.');
}
console.log('');

if (failures.length) {
	console.error(`✗ Lighthouse FAILED — ${failures.length} problem(s):\n`);
	for (const f of failures) console.error(`  • ${f}`);
	console.error('');
	process.exit(1);
}
console.log('✓ Lighthouse passed — accessibility 100 everywhere, CLS within 0.02.\n');
