#!/usr/bin/env node
/**
 * Backdrop plate + grain generator — master plan §3.4, §29.
 *
 * The plan specifies AI-generated art under a prompt contract. These plates
 * are PROCEDURAL stand-ins generated to the same contract (deep #04060D
 * ground, one dominant band hue plus a neighbour, volumetric dust with
 * visible depth layers, no text, no flares). They are palette-exact by
 * construction, which is the property the contract actually cares about.
 *
 * They are drop-in replaceable: when real AI art is produced, overwrite the
 * files at the same paths and dimensions and no code changes are needed.
 *
 * Run: node scripts/generate-art.mjs      (writes src/assets/art/*.png)
 * Then: pnpm build                        (astro:assets encodes to AVIF)
 *
 * Delegates pixel work to Python/PIL, which is already a dependency of the
 * toolchain via sharp's absence — see scripts/_art.py.
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

try {
	const out = execFileSync('python3', [join(here, '_art.py')], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit'],
	});
	process.stdout.write(out);
} catch (error) {
	console.error('\nArt generation failed. Requires python3 with Pillow:');
	console.error('  python3 -m pip install Pillow\n');
	process.exit(1);
}
