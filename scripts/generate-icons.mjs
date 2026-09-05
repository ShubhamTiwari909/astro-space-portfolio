#!/usr/bin/env node
/**
 * Icon set, generated from `public/favicon.svg` — the one source of truth.
 *
 * An SVG favicon alone is not enough in practice:
 *
 *  - Chrome requests `/favicon.ico` implicitly even when a `<link rel=icon>`
 *    is present, and a 404 there is cached hard — including the negative
 *    result, which is why a favicon added late often appears not to work
 *    long after the file exists.
 *  - Safari has never supported SVG favicons, and iOS uses
 *    `apple-touch-icon` for a home-screen bookmark.
 *
 * Run: pnpm icons
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const SVG = readFileSync('public/favicon.svg');

/** Rasterise at a high density so the curves stay clean when downscaled. */
const png = (size) =>
	sharp(SVG, { density: 600 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/**
 * Build an .ico. The format is a 6-byte header, then one 16-byte directory
 * entry per image, then the image payloads — and since Vista those payloads
 * may be PNGs rather than BMPs, which is what makes this ~20 lines instead
 * of a dependency.
 */
function ico(images) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // 1 = icon
	header.writeUInt16LE(images.length, 4);

	let offset = 6 + images.length * 16;
	const entries = [];
	for (const { size, data } of images) {
		const entry = Buffer.alloc(16);
		// 0 means 256 in this format; our sizes are all smaller.
		entry.writeUInt8(size >= 256 ? 0 : size, 0);
		entry.writeUInt8(size >= 256 ? 0 : size, 1);
		entry.writeUInt8(0, 2); // palette size
		entry.writeUInt8(0, 3); // reserved
		entry.writeUInt16LE(1, 4); // colour planes
		entry.writeUInt16LE(32, 6); // bits per pixel
		entry.writeUInt32LE(data.length, 8);
		entry.writeUInt32LE(offset, 12);
		entries.push(entry);
		offset += data.length;
	}

	return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const sizes = [16, 32, 48];
const images = await Promise.all(
	sizes.map(async (size) => ({ size, data: await png(size) })),
);
writeFileSync('public/favicon.ico', ico(images));
console.log(`✓ public/favicon.ico — ${sizes.join(', ')}px`);

writeFileSync('public/apple-touch-icon.png', await png(180));
console.log('✓ public/apple-touch-icon.png — 180px');
