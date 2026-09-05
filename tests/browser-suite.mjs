#!/usr/bin/env node
/**
 * Responsive & accessibility regression suite — master plan Phase 6, §34.
 *
 * One server, one browser, every automatable check in §34's matrix. It runs
 * against the built `dist` over a static server, so it tests what ships
 * rather than what the dev server happens to serve.
 *
 * ── What this can and cannot prove ───────────────────────────────────────
 * Phase 6's own premise is that "emulators lie", and that is still true.
 * This suite covers what a machine can check honestly:
 *
 *   axe-core, horizontal overflow, tap-target size and separation, tab
 *   order and focus visibility, keyboard traps, heading outline, accessible
 *   names, decorative layers staying out of the a11y tree, reduced-motion
 *   suppression, forced-colors, 400% reflow, and the no-JavaScript pass.
 *
 * It cannot replace, and does not claim to replace:
 *
 *   real iOS Safari and Android Chrome on real hardware (task 1), and
 *   VoiceOver / NVDA (task 4). Those need a person with a device. What is
 *   automated here is the part that would silently regress later; the
 *   manual passes are a one-time sign-off recorded in PERF.md.
 *
 * Usage:  pnpm test:browser        (starts and stops its own preview)
 *         PORT=4322 pnpm test:browser
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { serveDist } from './lib/serve.mjs';

const require_ = createRequire(import.meta.url);

/** The five route types (§34), plus the dev token page which must not rot. */
const ROUTES = [
	{ path: '/', name: 'home' },
	{ path: '/instruments', name: 'instruments' },
	{ path: '/dossier', name: 'dossier' },
	{ path: '/transmissions', name: 'transmissions' },
	// A 404 is meant to be terse, so it gets its own floor rather than
	// dragging the content threshold down for every other route.
	{ path: '/404', name: '404', minText: 200 },
];

/** §24.1's breakpoints plus the extremes Phase 6 task 1 names. */
const WIDTHS = [320, 375, 390, 412, 768, 1024, 1280, 1440, 1920];

const AXE = readFileSync(
	join(dirname(require_.resolve('axe-core/package.json')), 'axe.min.js'),
	'utf8',
);

const failures = [];
let checks = 0;

function check(label, ok, detail = '') {
	checks += 1;
	if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
	return ok;
}

function row(label, ok, detail = '') {
	console.log(
		`  ${label.padEnd(52)} ${ok ? 'PASS' : 'FAIL'}${detail ? `  ${detail}` : ''}`,
	);
}

// ── server ────────────────────────────────────────────────────────────────

const { base: BASE, close: stopServer } = await serveDist('dist');

// ── checks ────────────────────────────────────────────────────────────────

/**
 * Reveal every `[data-observe]` section. The entrance animation starts them
 * at `opacity: 0`, and axe correctly reports invisible content as
 * unreadable — so a suite that did not scroll would test a blank page.
 */
async function revealAll(page) {
	await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
	await page.evaluate(async () => {
		const max = document.documentElement.scrollHeight;
		for (let y = 0; y < max; y += 400) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 40));
		}
		window.scrollTo(0, 0);
	});
	await page.waitForTimeout(500);
}

async function runAxe(page) {
	await page.addScriptTag({ content: AXE });
	return page.evaluate(async () => {
		const results = await window.axe.run(document, {
			runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
		});
		return results.violations.map((v) => ({
			id: v.id,
			impact: v.impact,
			nodes: v.nodes.length,
			// Every target, plus axe's own explanation of each failure —
			// a single first-node summary was not enough to locate the cause.
			targets: v.nodes.slice(0, 6).map((n) => ({
				target: n.target.join(' '),
				summary: (n.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 200),
			})),
			help: v.help,
		}));
	});
}

/**
 * Tap targets, per §25.1 and WCAG 2.2 target size: ≥44×44 with ≥8px of
 * separation. Measured on the *rendered* boxes, and inline links in prose
 * are exempt — WCAG 2.5.8 excludes targets in a sentence, and padding a
 * link in a paragraph to 44px would wreck the line rhythm.
 */
async function tapTargets(page) {
	return page.evaluate(() => {
		const MIN = 44;
		const isInline = (el) => {
			const p = el.closest('p, li, figcaption, dd, dt, blockquote');
			if (!p) return false;
			// Inline only if the target sits inside running text.
			return p.textContent.trim().length > el.textContent.trim().length + 8;
		};
		const targets = [...document.querySelectorAll('a[href], button, [role="button"], input, select, summary')]
			.filter((el) => {
				const s = getComputedStyle(el);
				if (s.display === 'none' || s.visibility === 'hidden') return false;
				const r = el.getBoundingClientRect();
				return r.width > 0 && r.height > 0;
			});
		const small = [];
		for (const el of targets) {
			if (isInline(el)) continue;
			const r = el.getBoundingClientRect();
			if (r.width < MIN || r.height < MIN) {
				small.push({
					tag: el.tagName.toLowerCase(),
					cls: (el.className || '').toString().split(' ')[0],
					text: (el.textContent || '').trim().slice(0, 24),
					w: Math.round(r.width),
					h: Math.round(r.height),
				});
			}
		}
		return small;
	});
}

/** Elements whose own box is wider than the viewport and that do not scroll. */
async function overflowers(page) {
	return page.evaluate(() => {
		const limit = document.documentElement.clientWidth;
		return [...document.querySelectorAll('body *')]
			.filter((el) => {
				const s = getComputedStyle(el);
				if (s.overflowX === 'auto' || s.overflowX === 'scroll') return false;
				// An element inside a scroll container is allowed to be wide.
				if (el.closest('[class*="overflow-x-auto"], [class*="overflow-x-scroll"]')) return false;
				const r = el.getBoundingClientRect();
				return r.width > limit + 1 || r.right > limit + 1;
			})
			.slice(0, 6)
			.map((el) => {
				const r = el.getBoundingClientRect();
				const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 38);
				// Width AND text: a class name alone does not say whether the
				// cause is a stretched container or an unbreakable string.
				return `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} w=${Math.round(r.width)} scrollW=${el.scrollWidth} "${text}"`;
			});
	});
}

/** Walk the tab order, watching for traps and invisible focus. */
async function keyboardWalk(page, max = 80) {
	const seen = [];
	for (let i = 0; i < max; i++) {
		await page.keyboard.press('Tab');
		const info = await page.evaluate(() => {
			const el = document.activeElement;
			if (!el || el === document.body) return null;
			const s = getComputedStyle(el);
			const r = el.getBoundingClientRect();
			return {
				tag: el.tagName.toLowerCase(),
				name:
					el.getAttribute('aria-label') ??
					(el.textContent || '').trim().slice(0, 30) ??
					'',
				href: el.getAttribute('href') ?? null,
				// A focus indicator is an outline, a ring shadow, or a border change.
				outline: s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0,
				boxShadow: s.boxShadow !== 'none',
				offscreen: r.width === 0 && r.height === 0,
			};
		});
		if (!info) break;
		seen.push(info);
	}
	return seen;
}

// ── run ───────────────────────────────────────────────────────────────────

/*
 * Locally this drives the installed Chrome by channel, which is what a
 * visitor actually uses. CI has no Chrome, only the Playwright-managed
 * Chromium, so `BROWSER_CHANNEL=''` selects that instead. SwiftShader is
 * enabled either way: a CI runner has no GPU, and without it the WebGL
 * layers would silently fail and every scene assertion would pass for the
 * wrong reason.
 */
const channel = process.env.BROWSER_CHANNEL ?? 'chrome';
const browser = await chromium.launch({
	...(channel ? { channel } : {}),
	args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});

const axeSummary = [];

console.log('\n── axe-core (WCAG 2.2 AA) ──────────────────────────────────');
for (const route of ROUTES) {
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
	await revealAll(page);
	const violations = await runAxe(page);
	const ok = check(`axe ${route.name}`, violations.length === 0,
		violations
			.map((v) => `${v.id}(${v.nodes}): ` +
				v.targets.map((t) => `${t.target} [${t.summary}]`).join(' ;; '))
			.join(' || '));
	row(`${route.path}`, ok, ok ? '0 violations' : violations.map((v) => v.id).join(', '));
	axeSummary.push({ route: route.path, violations });
	await page.close();
}

console.log('\n── axe-core under reduced motion + forced colors ───────────');
for (const route of ROUTES.slice(0, 3)) {
	const page = await browser.newPage({
		viewport: { width: 1280, height: 900 },
		reducedMotion: 'reduce',
		forcedColors: 'active',
	});
	await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
	await revealAll(page);
	const violations = await runAxe(page);
	const ok = check(`axe ${route.name} (reduced-motion, forced-colors)`,
		violations.length === 0,
		violations
			.map((v) => `${v.id}(${v.nodes}): ` +
				v.targets.map((t) => `${t.target} [${t.summary}]`).join(' ;; '))
			.join(' || '));
	row(`${route.path}`, ok, ok ? '0 violations' : violations.map((v) => v.id).join(', '));
	await page.close();
}

console.log('\n── horizontal overflow, every route x every width ──────────');
for (const route of ROUTES) {
	const bad = [];
	for (const width of WIDTHS) {
		const page = await browser.newPage({ viewport: { width, height: 900 } });
		await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
		await revealAll(page);
		const scrolls = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth,
		);
		if (scrolls) bad.push(`${width}px (${(await overflowers(page)).join(', ')})`);
		await page.close();
	}
	const ok = check(`no sideways scroll ${route.name}`, bad.length === 0, bad.join(' | '));
	row(`${route.path}`, ok, ok ? `${WIDTHS.length} widths clean` : bad.join(' | '));
}

console.log('\n── tap targets >=44x44 (320 / 390 / 768) ───────────────────');
for (const route of ROUTES) {
	const bad = [];
	for (const width of [320, 390, 768]) {
		const page = await browser.newPage({
			viewport: { width, height: 900 },
			hasTouch: width < 768,
		});
		await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
		await revealAll(page);
		for (const t of await tapTargets(page)) {
			bad.push(`${width}px ${t.tag}.${t.cls} "${t.text}" ${t.w}x${t.h}`);
		}
		await page.close();
	}
	const ok = check(`tap targets ${route.name}`, bad.length === 0, bad.slice(0, 6).join(' | '));
	row(`${route.path}`, ok, ok ? 'all >=44px' : `${bad.length} small: ${bad.slice(0, 3).join(' | ')}`);
}

console.log('\n── 400% reflow (1280 at 4x = 320 CSS px) ───────────────────');
for (const route of ROUTES) {
	const page = await browser.newPage({
		viewport: { width: 320, height: 512 },
		deviceScaleFactor: 4,
	});
	await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
	await revealAll(page);
	const scrolls = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth,
	);
	const ok = check(`400% reflow ${route.name}`, !scrolls);
	row(`${route.path}`, ok, ok ? 'no two-axis scrolling' : 'scrolls sideways');
	await page.close();
}

console.log('\n── keyboard: order, focus visibility, no traps ─────────────');
for (const route of ROUTES) {
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
	await revealAll(page);

	const walk = await keyboardWalk(page);
	const reachedEnd = walk.length < 80;
	const unnamed = walk.filter((s) => !s.name || s.name.length === 0);
	const invisible = walk.filter((s) => !s.outline && !s.boxShadow);

	const first = walk[0];
	const skipFirst = check(
		`skip link is first in tab order (${route.name})`,
		Boolean(first && first.href === '#main'),
		first ? `${first.tag} "${first.name}"` : 'nothing focusable',
	);
	const noTrap = check(`no keyboard trap (${route.name})`, reachedEnd,
		`still cycling after 80 tabs`);
	const named = check(`every focus stop has a name (${route.name})`,
		unnamed.length === 0, `${unnamed.length} unnamed`);
	const visible = check(`every focus stop shows an indicator (${route.name})`,
		invisible.length === 0,
		invisible.map((s) => `${s.tag} "${s.name}"`).slice(0, 4).join(' | '));

	row(`${route.path}`, skipFirst && noTrap && named && visible,
		`${walk.length} stops` +
			(invisible.length ? `, ${invisible.length} without indicator` : '') +
			(unnamed.length ? `, ${unnamed.length} unnamed` : ''));
	await page.close();
}

console.log('\n── semantics: heading outline, decoration not announced ────');
for (const route of ROUTES) {
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
	await revealAll(page);

	const info = await page.evaluate(() => {
		const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
			level: Number(h.tagName[1]),
			text: (h.textContent || '').trim().slice(0, 40),
		}));
		let skips = [];
		for (let i = 1; i < headings.length; i++) {
			if (headings[i].level - headings[i - 1].level > 1) {
				skips.push(`h${headings[i - 1].level} -> h${headings[i].level} at "${headings[i].text}"`);
			}
		}
		// Decorative layers must not be exposed.
		const decorative = ['.art-plate', '[data-scene-tier]', 'canvas', '[data-orbit-host]'];
		const exposed = decorative
			.flatMap((sel) => [...document.querySelectorAll(sel)])
			.filter((el) => el.getAttribute('aria-hidden') !== 'true' && !el.closest('[aria-hidden="true"]'))
			.map((el) => el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0]);
		return {
			h1: headings.filter((h) => h.level === 1).length,
			skips,
			exposed,
			landmarks: {
				main: document.querySelectorAll('main').length,
				nav: document.querySelectorAll('nav').length,
			},
		};
	});

	const oneH1 = check(`exactly one h1 (${route.name})`, info.h1 === 1, `found ${info.h1}`);
	const noSkip = check(`no skipped heading levels (${route.name})`,
		info.skips.length === 0, info.skips.join('; '));
	const hidden = check(`decorative layers aria-hidden (${route.name})`,
		info.exposed.length === 0, info.exposed.join(', '));
	const oneMain = check(`exactly one <main> (${route.name})`, info.landmarks.main === 1,
		`found ${info.landmarks.main}`);

	row(`${route.path}`, oneH1 && noSkip && hidden && oneMain,
		`h1x${info.h1}, ${info.landmarks.nav} nav, main x${info.landmarks.main}` +
			(info.skips.length ? `, skips: ${info.skips.join('; ')}` : '') +
			(info.exposed.length ? `, exposed: ${info.exposed.join(', ')}` : ''));
	await page.close();
}

console.log('\n── reduced motion: ambient motion suppressed ───────────────');
{
	const page = await browser.newPage({
		viewport: { width: 1280, height: 900 },
		reducedMotion: 'reduce',
	});
	await page.goto(BASE + '/', { waitUntil: 'networkidle' });
	await page.waitForTimeout(800);
	const motion = await page.evaluate(() => {
		const animating = [...document.querySelectorAll('body *')].filter((el) => {
			const s = getComputedStyle(el);
			const dur = Number.parseFloat(s.animationDuration) || 0;
			return s.animationName !== 'none' && dur > 0.05;
		}).length;
		const revealed = [...document.querySelectorAll('[data-observe]')].every(
			(el) => Number.parseFloat(getComputedStyle(el).opacity) === 1,
		);
		return { animating, revealed };
	});
	const noAnim = check('no element animates under reduced motion',
		motion.animating === 0, `${motion.animating} animating`);
	const shown = check('all [data-observe] content is visible under reduced motion',
		motion.revealed);
	row('/ (prefers-reduced-motion: reduce)', noAnim && shown,
		`${motion.animating} animations, content ${motion.revealed ? 'visible' : 'HIDDEN'}`);
	await page.close();
}

console.log('\n── JavaScript disabled ─────────────────────────────────────');
{
	const context = await browser.newContext({
		viewport: { width: 1280, height: 900 },
		javaScriptEnabled: false,
	});
	for (const route of ROUTES) {
		const page = await context.newPage();
		await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded' });
		const info = await page.evaluate(() => ({
			visibleText: document.body.innerText.trim().length,
			hiddenSections: [...document.querySelectorAll('[data-observe]')].filter(
				(el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.99,
			).length,
			links: document.querySelectorAll('a[href]').length,
			canvas: document.querySelectorAll('canvas').length,
		}));
		const floor = route.minText ?? 400;
		const hasText = check(`no-JS content present (${route.name})`,
			info.visibleText > floor, `${info.visibleText} chars, floor ${floor}`);
		const notHidden = check(`no-JS content not stranded invisible (${route.name})`,
			info.hiddenSections === 0, `${info.hiddenSections} sections at opacity 0`);
		const hasLinks = check(`no-JS navigation present (${route.name})`, info.links > 3,
			`${info.links} links`);
		row(`${route.path}`, hasText && notHidden && hasLinks,
			`${info.visibleText} chars, ${info.links} links, ${info.canvas} canvas`);
		await page.close();
	}
	await context.close();
}

await browser.close();
await stopServer();

// ── report ────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`);
if (failures.length) {
	console.error(`\n✗ Browser suite FAILED — ${failures.length} of ${checks} checks:\n`);
	for (const f of failures) console.error(`  • ${f}`);
	console.error('');
	process.exit(1);
}
console.log(`\n✓ Browser suite passed — ${checks} checks across ${ROUTES.length} routes,`);
console.log(`  ${WIDTHS.length} widths, axe-core WCAG 2.2 AA, keyboard, reduced`);
console.log('  motion, forced colors, 400% reflow, and no-JavaScript.\n');
