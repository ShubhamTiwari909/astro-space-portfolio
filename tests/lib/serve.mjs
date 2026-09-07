/**
 * A static server for `dist`, in-process.
 *
 * Replaces `astro preview` in the test suites. `astro preview` daemonises:
 * killing the process you spawned leaves the actual server running, so every
 * suite leaked a listener, a second suite could not bind its port, and the
 * failure surfaced as a bare ERR_CONNECTION_REFUSED several steps later.
 *
 * A plain file server also makes the tests honest about what they measure.
 * The site is fully static, so this serves exactly the bytes a CDN would,
 * with no dev middleware in the path — and it starts in milliseconds instead
 * of seconds.
 *
 * ── Why it compresses ────────────────────────────────────────────────────
 * That claim used to be false, and it quietly corrupted every byte-sensitive
 * measurement taken through this server. Vercel serves `content-encoding: br`;
 * this served the raw file. The scene chunk therefore measured 880KB locally
 * and 237KB deployed, and because Lighthouse's simulated throttling derives
 * its timings from OBSERVED transfer sizes, the home route's local FCP was
 * inflated to 2.2-5.1s against a deployed 1.0s — a score of 56-91 for a site
 * that scores 93-100. The suite was grading a test server, not the site.
 *
 * So it negotiates encoding the way the CDN does: brotli if the client asks
 * for it, gzip otherwise, and identity for formats that are already
 * compressed (avif, webp, woff2), where a second pass costs CPU and saves
 * nothing. Results are cached per file+encoding, because a Lighthouse run
 * fetches the same asset repeatedly and compression is not free.
 */

import { createServer } from 'node:http';
import { brotliCompressSync, gzipSync, constants as zlibConstants } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.avif': 'image/avif',
	'.webp': 'image/webp',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.woff2': 'font/woff2',
	'.pdf': 'application/pdf',
	'.xml': 'application/xml',
	'.txt': 'text/plain; charset=utf-8',
};

/**
 * Formats worth compressing. Everything absent from this list either is
 * already compressed (avif, webp, woff2, png) or is too small for the header
 * to pay for itself.
 */
const COMPRESSIBLE = new Set([
	'.html',
	'.css',
	'.js',
	'.json',
	'.svg',
	'.xml',
	'.txt',
]);

/** file path + encoding -> encoded body. A run refetches the same assets. */
const encoded = new Map();

/**
 * The encoding the client prefers, restricted to what the CDN actually
 * serves. Brotli first: it is what Vercel picks, and picking anything else
 * would put the local numbers back out of step with production.
 */
function negotiate(acceptEncoding, ext) {
	if (!COMPRESSIBLE.has(ext)) return null;
	const accept = String(acceptEncoding ?? '');
	if (accept.includes('br')) return 'br';
	if (accept.includes('gzip')) return 'gzip';
	return null;
}

function encode(body, encoding) {
	if (encoding === 'br') {
		return brotliCompressSync(body, {
			// Vercel's static brotli quality. Level 11 would be slower than any
			// CDN serves and would flatter the numbers.
			params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 6 },
		});
	}
	return gzipSync(body, { level: 6 });
}

async function resolveFile(root, pathname) {
	// Reject traversal before touching the filesystem.
	const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
	const candidates = [
		join(root, clean),
		join(root, clean, 'index.html'),
		join(root, `${clean}.html`),
	];
	for (const candidate of candidates) {
		if (!candidate.startsWith(root)) continue;
		try {
			const s = await stat(candidate);
			if (s.isFile()) return candidate;
		} catch {
			/* try the next shape */
		}
	}
	return null;
}

/**
 * @param {string} root  directory to serve, usually 'dist'
 * @param {number} port
 * @returns {Promise<{ base: string, close: () => Promise<void> }>}
 */
export async function serveDist(root = 'dist', port = 0) {
	const abs = normalize(join(process.cwd(), root));

	const server = createServer(async (req, res) => {
		const url = new URL(req.url ?? '/', 'http://localhost');
		const file = await resolveFile(abs, url.pathname);

		if (!file) {
			const notFound = await resolveFile(abs, '/404');
			const body = notFound ? await readFile(notFound) : Buffer.from('Not found');
			res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
			res.end(body);
			return;
		}

		const ext = extname(file);
		const raw = await readFile(file);
		const encoding = negotiate(req.headers['accept-encoding'], ext);

		let body = raw;
		if (encoding) {
			const key = `${file}\u0000${encoding}`;
			let hit = encoded.get(key);
			if (!hit) {
				hit = encode(raw, encoding);
				encoded.set(key, hit);
			}
			body = hit;
		}

		res.writeHead(200, {
			'content-type': TYPES[ext] ?? 'application/octet-stream',
			'content-length': String(body.byteLength),
			...(encoding ? { 'content-encoding': encoding, vary: 'accept-encoding' } : {}),
			/*
			 * The cache policy §26.4 asks for, so the suites exercise the
			 * real thing: hashed assets immutable for a year, HTML always
			 * revalidated.
			 */
			'cache-control': file.includes('/_astro/')
				? 'public, max-age=31536000, immutable'
				: 'public, max-age=0, must-revalidate',
		});
		res.end(body);
	});

	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, '127.0.0.1', resolve);
	});

	const address = server.address();
	const actualPort = typeof address === 'object' && address ? address.port : port;

	return {
		base: `http://127.0.0.1:${actualPort}`,
		close: () =>
			new Promise((resolve) => {
				server.closeAllConnections?.();
				server.close(() => resolve());
			}),
	};
}
