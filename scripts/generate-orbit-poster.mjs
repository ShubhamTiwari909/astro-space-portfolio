#!/usr/bin/env node
/**
 * Generate Orbit's poster from the real simulation — master plan §14.3,
 * Phase 5 task 8 ("keep the poster in sync with the real sim's look").
 *
 * The poster is what most visitors see: everyone below 1024px, and everyone
 * with `prefers-reduced-motion`. A hand-drawn approximation would drift from
 * the simulation every time the physics changed, and the drift would be
 * invisible to us and obvious to nobody — which is how a fallback quietly
 * becomes a lie. So it is a screenshot of the running thing.
 *
 * Requires the dev server. Run:  pnpm dev  →  pnpm poster
 */
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ = process.env.URL ?? 'http://localhost:4321/instruments';
const OUT = 'src/assets/images/orbit-poster.avif';
/** Seconds of simulation before the frame is taken. */
const SETTLE = Number(process.env.SETTLE ?? 14);

const browser = await chromium.launch({
	channel: 'chrome',
	args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({
	// Wide enough that the island's client:media query matches.
	viewport: { width: 1600, height: 1000 },
	deviceScaleFactor: 2,
});

page.on('console', (m) => {
	if (m.type() === 'error') console.log('  [console error]', m.text().slice(0, 160));
});
page.on('response', (r) => {
	if (r.status() >= 400) console.log(`  [${r.status()}]`, r.url());
});

console.log(`→ ${URL_}`);
await page.goto(URL_, { waitUntil: 'networkidle' });

/*
 * Scroll to the instrument first. The island only creates a WebGL context
 * once its container intersects, so a screenshot taken without scrolling
 * catches the *backdrop* canvas instead — which is what happened the first
 * time this ran, and the giveaway was telemetry reading zero FPS.
 */
const host = page.locator('[data-orbit-host]');
await host.scrollIntoViewIfNeeded();

const canvas = host.locator('canvas');
await canvas.waitFor({ state: 'visible', timeout: 30000 });

console.log(`→ settling ${SETTLE}s of simulation`);
await page.waitForTimeout(SETTLE * 1000);

const stats = await page.evaluate(() => {
	const readouts = [...document.querySelectorAll('dl[aria-live="off"] div')];
	return readouts.map((row) => row.textContent?.trim()).join(' | ');
});
console.log(`→ telemetry: ${stats}`);

const shot = join(mkdtempSync(join(tmpdir(), 'orbit-')), 'frame.png');
await canvas.screenshot({ path: shot });
await browser.close();

/*
 * Encoded at the same 1200x700 the live canvas is capped to, so the poster
 * and the canvas are the same size and swapping between them cannot shift
 * layout.
 */
const info = await sharp(shot)
	.resize(1200, 700, { fit: 'cover' })
	.avif({ quality: 62 })
	.toFile(OUT);

console.log(`✓ ${OUT} — ${(info.size / 1024).toFixed(1)}KB`);
