#!/usr/bin/env node
/**
 * Static performance audits — master plan Phase 7, tasks 5, 6 and 7.
 *
 * These are properties of the source and the built CSS, so they are checked
 * without a browser: the CSS shape, the animation discipline, and the canvas
 * discipline. Anything that needs the network or a real layout lives in
 * `tests/perf-audit.mjs` instead.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
let checks = 0;

function check(label, ok, detail = '') {
	checks += 1;
	if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
	console.log(`  ${label.padEnd(54)} ${ok ? 'PASS' : 'FAIL'}${detail ? `  ${detail}` : ''}`);
}

const src = (p) => readFileSync(p, 'utf8');
function walk(dir, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else out.push(full);
	}
	return out;
}

const styleFiles = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'));
const css = styleFiles.map((f) => src(join('dist/_astro', f))).join('\n');
const sources = walk('src').filter((f) => /\.(astro|tsx|ts|css)$/.test(f));

// ── Task 5: CSS ───────────────────────────────────────────────────────────
console.log('\n── CSS (task 5) ────────────────────────────────────────────');

check('exactly one stylesheet ships', styleFiles.length === 1, `${styleFiles.length} files`);

/*
 * The token block is defined once. Tailwind emits @theme onto :root, and a
 * duplicated block would mean the theme was imported twice — a real and easy
 * regression when a component adds its own `@import 'tailwindcss'`.
 *
 * Overrides inside a media query do not count: the forced-colors block
 * legitimately redefines every token onto system colours, and an earlier
 * version of this check flagged that as duplication.
 */
const cssOutsideMedia = css.replace(/@media[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
const voidDecls = (cssOutsideMedia.match(/--color-void:/g) ?? []).length;
check('token block is not duplicated', voidDecls === 1, `--color-void declared ${voidDecls}x outside @media`);

const indexHtml = src('dist/index.html');
const inlineStyle = [...indexHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
	.reduce((n, m) => n + m[1].length, 0);
check(
	'critical CSS is inlined in the document',
	inlineStyle > 0,
	`${(inlineStyle / 1024).toFixed(1)}KB inline`,
);

// ── Task 6: animation discipline ──────────────────────────────────────────
console.log('\n── Animation (task 6) ──────────────────────────────────────');

/**
 * Only `transform` and `opacity` may be animated — they are the two the
 * compositor can handle without layout or paint.
 *
 * Two sanctioned exceptions, both deliberate and both cheap:
 *  - `color`/`background-color` on interaction feedback, which cannot be
 *    expressed as transform or opacity and repaints one small element;
 *  - `width` on the section rail's active tick, a 1.5px→3px change on a
 *    positioned element that triggers no layout of surrounding content.
 */
const ALLOWED = new Set([
	'transform', 'opacity', 'none', 'all',
	/*
	 * Tailwind v4 implements `transition-transform` as the individual
	 * properties rather than the `transform` shorthand. They are the same
	 * thing to the compositor.
	 */
	'translate', 'scale', 'rotate',
	// `transition-colors` carries these so gradient stops interpolate; they
	// are custom properties holding colours, not layout.
	'--tw-gradient-from', '--tw-gradient-via', '--tw-gradient-to',
	'color', 'background-color', 'border-color', 'text-decoration-color',
	'outline-color', 'fill', 'stroke',
	// The rail's active tick: 1.5px -> 3px on an absolutely positioned
	// element, so it lays out nothing around it.
	'width',
	/*
	 * The transmission row's hover indent. This one DOES cause layout, and
	 * it is allowed deliberately rather than by oversight: it is bounded to
	 * one row's grid, it fires on hover rather than during scroll, and only
	 * one row can be hovered at a time. Expressing it as a transform would
	 * translate the row's left border along with the content, which is a
	 * different design. Same class of exception as `width` above.
	 */
	'padding-inline-start',
]);

/*
 * Only rules whose class is actually USED are considered. Tailwind emits the
 * full vocabulary of a utility it generates, so reading every
 * `transition-property` in the bundle measures the stylesheet rather than
 * the site — the first version of this check reported `filter`,
 * `backdrop-filter` and `content-visibility` as offenders when nothing on
 * any page transitions them.
 */
const allHtml = walk('dist')
	.filter((f) => f.endsWith('.html'))
	.map((f) => src(f))
	.join('\n');
const usedClasses = new Set(
	[...allHtml.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)),
);

const animatedProps = new Map();
for (const m of css.matchAll(/\.([^{},\s]+)(?:[^{}]*)\{([^{}]*transition-property:\s*([^;}]+)[^{}]*)\}/g)) {
	// Tailwind escapes special characters in selectors; unescape to compare.
	const cls = m[1].replace(/\\/g, '');
	if (!usedClasses.has(cls)) continue;
	for (const prop of m[3].split(',')) {
		const name = prop.trim();
		if (name) animatedProps.set(name, cls);
	}
}
const offenders = [...animatedProps].filter(([p]) => !ALLOWED.has(p));
check(
	'every transitioned property is compositor-friendly',
	offenders.length === 0,
	offenders.map(([p, c]) => `${p} (.${c})`).join(', ') ||
		`${animatedProps.size} distinct properties in use`,
);

/*
 * `will-change` left applied is a permanent memory cost: it promotes a layer
 * for the life of the element rather than for the life of the animation.
 */
const willChange = sources.filter((f) => /will-change/.test(src(f)));
check('no will-change left applied', willChange.length === 0, willChange.join(', '));

/*
 * Layout reads inside a frame loop are the classic thrash — a read after a
 * style write forces a synchronous recalc, every frame.
 *
 * Scoped to the CALLBACK BODY, not the file. A file-level grep flagged
 * `scrollProgress.ts` for reads that live in `measure()`, which runs on
 * resize only; the point is where the read happens, not whether the module
 * ever measures anything.
 */
const LAYOUT_READ = /getBoundingClientRect|\boffsetWidth\b|\boffsetHeight\b|\bscrollHeight\b|\bclientHeight\b|getComputedStyle/;

/** Body of the callback beginning at `marker`, matched by brace depth. */
function callbackBody(text, marker) {
	const start = text.indexOf(marker);
	if (start === -1) return '';
	let depth = 0;
	let i = text.indexOf('{', start);
	if (i === -1) return '';
	const from = i;
	for (; i < text.length; i++) {
		if (text[i] === '{') depth++;
		else if (text[i] === '}' && --depth === 0) return text.slice(from, i + 1);
	}
	return text.slice(from);
}

const FRAME_ENTRIES = [
	['src/lib/scrollProgress.ts', 'function frame()'],
	['src/components/cosmos/scene/DeepFieldScene.tsx', 'useFrame('],
	['src/components/instruments/orbit/Sim.tsx', 'useFrame('],
	['src/components/cosmos/scene/CameraRig.tsx', 'useFrame('],
];
const thrash = FRAME_ENTRIES.filter(([file, marker]) =>
	LAYOUT_READ.test(callbackBody(src(file), marker)),
).map(([file]) => file);
check(
	'no layout reads inside a frame loop',
	thrash.length === 0,
	thrash.join(', ') || `${FRAME_ENTRIES.length} frame callbacks checked`,
);

// ── Task 7: canvas discipline ─────────────────────────────────────────────
console.log('\n── Canvas (task 7) ─────────────────────────────────────────');

const scene = src('src/components/cosmos/scene/DeepFieldScene.tsx');
const tier = src('src/components/cosmos/scene/useSceneTier.ts');
const orbit = src('src/components/instruments/Orbit.tsx');
const sim = src('src/components/instruments/orbit/Sim.tsx');
const physics = src('src/components/instruments/orbit/physics.ts');

check('scene: DPR is capped', /dpr=\{Math\.min/.test(scene));
check('scene: degradation is one-way', /degraded\.current|degrade\(/.test(scene) && /degraded\.current = true|onDegrade/.test(scene));
check('scene: stalls are discarded, not counted', /STALL_THRESHOLD/.test(scene));
check('scene: star count comes from the tier', /tier\.stars/.test(scene));
check('scene: tier ladder has a "none" rung', /'none'/.test(tier));

check('orbit: DPR is capped', /dpr=\{\[1, 1\.5\]\}/.test(orbit));
check('orbit: frame loop pauses when off-screen or hidden', /frameloop=\{active \? 'always' : 'never'\}/.test(orbit));
check('orbit: visibilitychange is observed', /visibilitychange/.test(orbit));
check('orbit: IntersectionObserver gates the context', /IntersectionObserver/.test(orbit));
check('orbit: particle count is hard-capped', /MAX_PARTICLES = \d+/.test(physics));
check('orbit: stalls are discarded, not counted', /STALL_S/.test(sim));
check('orbit: degradation is one-way then stops', /halved\.current/.test(sim) && /stopped\.current = true/.test(sim));

/*
 * Zero per-frame allocation. `new` or an array/object literal inside the
 * frame callback would produce garbage every frame at 60Hz; the physics
 * pre-allocates every buffer in `createState`.
 */
function frameBody(text, marker) {
	const i = text.indexOf(marker);
	if (i === -1) return '';
	// Crude but sufficient: the rest of the function, bounded generously.
	return text.slice(i, i + 3000);
}
const simFrame = frameBody(sim, 'useFrame((_, delta)');
check(
	'orbit: no allocation inside the frame loop',
	!/\bnew [A-Z]/.test(simFrame) && !/=\s*\[\]/.test(simFrame),
	'',
);
const stepBody = frameBody(physics, 'export function step');
check(
	'orbit: no allocation inside the integrator',
	!/\bnew [A-Z]/.test(stepBody) && !/=\s*\[\]/.test(stepBody),
	'',
);

// ── report ────────────────────────────────────────────────────────────────
console.log('');
if (failures.length) {
	console.error(`✗ Static performance audit FAILED — ${failures.length} of ${checks}:\n`);
	for (const f of failures) console.error(`  • ${f}`);
	console.error('');
	process.exit(1);
}
console.log(`✓ Static performance audit passed — ${checks} checks.\n`);
