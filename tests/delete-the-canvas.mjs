#!/usr/bin/env node
/**
 * The delete-the-canvas gate — master plan §34.3, §25.0.
 *
 * The most important test in this project: it converts the parallel-DOM
 * contract from a promise into a check. The scene is a LAYER, never a
 * container, so removing it must leave the site complete.
 *
 * As it turns out the shipped guarantee is stronger than the plan assumed.
 * `DeepFieldScene` returns null during SSR (no WebGL on the server), so the
 * scene container and canvas are created *entirely client-side* — the served
 * HTML contains no scene at all. A visitor with JS disabled, or on a
 * `saveData` connection, or without WebGL, never receives the element in the
 * first place. So this asserts absence rather than aria-hidden.
 *
 * Static assertions here:
 *   1. No <canvas> and no scene container in the served HTML
 *   2. The art fallback layer is unconditional, with a plate per band
 *   3. The scene never reaches the critical path, and is its own chunk
 *   4. Source-level: the scene container is aria-hidden, presentational and
 *      pointer-events-none, and nothing in the scene tree is focusable
 *
 * The runtime half — remove the live <canvas>, then re-compare content, tab
 * order and CLS — needs a browser and lands in Phase 6 with the Playwright
 * a11y suite. What runs here catches the failure mode that actually matters
 * while Phase 4/4b are being built: content or interactivity migrating into
 * the scene.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync('dist/index.html', 'utf8');
const SCENE_DIR = 'src/components/cosmos/scene';
const failures = [];

function check(label, ok, detail = '') {
	console.log(`  ${label.padEnd(48)} ${ok ? 'PASS' : 'FAIL'}`);
	if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
}

// ── 1. Nothing of the scene is in the served HTML ────────────────────────
check('no <canvas> in served HTML', !/<canvas/i.test(html));
check(
	'no scene container in served HTML',
	!html.includes('--z-scene'),
	'the scene must be created client-side only',
);

// ── 2. The art fallback is unconditional ─────────────────────────────────
/*
 * Matched on `data-art-layer`, not on a class name. This assertion used to
 * grep for `z-[var(--z-art)]` and broke the moment those classes moved to
 * Tailwind v4's `z-(--z-art)` shorthand — a rename with no behavioural
 * change failed a gate about whether the fallback exists at all. A test
 * guarding a guarantee should key on a stable hook, not on the styling
 * syntax that happens to be in fashion.
 */
check(
	'art fallback layer present',
	/<div[^>]*\sdata-art-layer/.test(html),
	'the ArtBackdrop container must carry data-art-layer',
);
const plates = (html.match(/class="art-plate/g) ?? []).length;
check('an art plate per band', plates === 8, `found ${plates}`);

// ── 3. The scene is lazy and independently droppable ─────────────────────
check(
	'scene not on the critical path',
	!/<script[^>]*src="[^"]*DeepFieldScene[^"]*"/.test(html),
);
const chunks = readdirSync(join('dist', '_astro'));
check(
	'scene is its own lazy chunk',
	chunks.some((f) => f.startsWith('DeepFieldScene') && f.endsWith('.js')),
);

// ── 4. Source-level contract on the scene subtree ────────────────────────
const root = readFileSync(join(SCENE_DIR, 'DeepFieldScene.tsx'), 'utf8');
check('scene container aria-hidden', root.includes('aria-hidden="true"'));
check('scene container role="presentation"', root.includes("role=\"presentation\""));
check('scene container pointer-events-none', root.includes('pointer-events-none'));

/**
 * Nothing in the scene may be focusable: the scene contributes zero tab
 * stops (§25.0 rule 1). Checked across the whole scene directory, since a
 * future set piece in Phase 4b is exactly where a stray <button> would land.
 */
const sceneFiles = readdirSync(SCENE_DIR).filter((f) => f.endsWith('.tsx'));
const offenders = sceneFiles.filter((f) => {
	const src = readFileSync(join(SCENE_DIR, f), 'utf8');
	// Strip comments so prose about buttons does not trip this.
	const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
	return (
		/<\s*(a|button|input|select|textarea|iframe)[\s>]/i.test(code) ||
		/tabIndex=\{?["']?(?!-1)/.test(code)
	);
});
check(
	'no focusable elements in the scene tree',
	offenders.length === 0,
	offenders.join(', '),
);

console.log('');
if (failures.length > 0) {
	console.error('✗ Delete-the-canvas gate FAILED:\n');
	for (const f of failures) console.error(`  ${f}`);
	console.error(
		'\nThe canvas is a layer, never a container. Move content OUT of the\n' +
			'scene — never relax this assertion (§25.0).\n',
	);
	process.exit(1);
}
console.log(
	`✓ Delete-the-canvas gate passed — the scene is absent from the HTML\n` +
		`  entirely, so it is removable by construction (${sceneFiles.length} scene files checked).`,
);
