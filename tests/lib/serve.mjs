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
 */

import { createServer } from 'node:http';
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

		const body = await readFile(file);
		res.writeHead(200, {
			'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
			'content-length': String(body.byteLength),
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
