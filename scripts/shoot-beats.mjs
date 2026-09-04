/**
 * Screenshot the flight at given scroll fractions, in a browser where rAF
 * actually runs. The Browser pane does not composite while hidden, which
 * starves rAF, freezes the IntersectionObserver, and leaves the WebGL canvas
 * holding a stale frame — so it cannot verify a scroll-driven scene.
 */
import { chromium } from 'playwright-core';

const url = process.env.URL ?? 'http://localhost:4321/';
const outDir = process.argv[2];
const beats = process.argv.slice(3).map(Number);

const browser = await chromium.launch({
	channel: 'chrome',
	args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({
	viewport: { width: 1440, height: 900 },
	deviceScaleFactor: 1,
});
page.on('console', (m) => {
	if (m.type() === 'error') console.log('  [console error]', m.text().slice(0, 200));
});
page.on('response', (r) => {
	if (r.status() >= 400) console.log(`  [${r.status()}]`, r.url());
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true', {
	timeout: 20000,
});
await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

for (const beat of beats) {
	await page.evaluate((b) => {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		document.documentElement.scrollTop = Math.round(max * b);
	}, beat);
	// Let the camera lag (CAMERA_LAG_MS) settle and the band cross-fade finish.
	await page.waitForTimeout(2200);
	const state = await page.evaluate(() => ({
		scroll: getComputedStyle(document.body).getPropertyValue('--scroll').trim(),
		band: document.body.dataset.band,
		art: getComputedStyle(document.documentElement).getPropertyValue('--art-strength').trim(),
	}));
	const name = `beat-${String(beat).replace('.', '')}`;
	await page.screenshot({ path: `${outDir}/${name}.png` });
	console.log(name, JSON.stringify(state));
}

await browser.close();
