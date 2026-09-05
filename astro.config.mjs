// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * The production origin. Canonicals, sitemap entries and absolute OG URLs
 * all derive from it, so a wrong value here is silently wrong everywhere.
 *
 * Resolved rather than hardcoded, in this order:
 *
 *  1. `SITE_URL` — set this in Vercel's environment once a custom domain is
 *     attached. It wins over everything.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — injected by Vercel on every build,
 *     and always the *production* domain even in a preview deployment, so
 *     preview builds never emit canonicals pointing at themselves.
 *  3. localhost, for a local build.
 *
 * This is why there is no `https://example.com` left to forget about: a
 * deployment cannot ship a placeholder domain, because there isn't one.
 */
const SITE =
	process.env.SITE_URL ??
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: 'http://localhost:4321');

export default defineConfig({
	site: SITE,
	output: 'static',
	trailingSlash: 'never',

	integrations: [
		react(),
		sitemap({
			filter: (page) => !page.includes('/dev/'),
		}),
		/*
		 * `client:capable` — see src/lib/sceneDirective.mjs.
		 *
		 * A local integration rather than a package: it exists only to
		 * register one directive, and the alternative was letting the scene
		 * chunk download on devices §24.2 says must never receive it.
		 */
		{
			name: 'client-capable-directive',
			hooks: {
				'astro:config:setup': ({ addClientDirective }) => {
					addClientDirective({
						name: 'capable',
						entrypoint: './src/lib/sceneDirective.mjs',
					});
				},
			},
		},
	],

	// Self-hosted, latin-subset, woff2, display:swap, with metric-override fallbacks
	// generated automatically (optimizedFallbacks defaults to true).
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Instrument Serif',
			cssVariable: '--ff-display',
			weights: [400],
			styles: ['normal', 'italic'],
			subsets: ['latin'],
			fallbacks: ['Iowan Old Style', 'Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--ff-body',
			weights: ['400 600'],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--ff-mono',
			weights: [400, 500],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],

	redirects: {
		'/projects': '/#worlds',
		'/blog': '/transmissions',
		'/resume': '/dossier',
		'/lab': '/instruments',
	},

	vite: {
		plugins: [tailwindcss()],
		build: {
			rollupOptions: {
				output: {
					/*
					 * Merge the shared runtime modules into one chunk.
					 *
					 * `src/lib/*` is imported from both the BaseLayout script
					 * and the MobileNav script, so the bundler split each one
					 * into its own file: scrollProgress, worldFocus, analytics,
					 * observeOnce and bands arrived as five separate requests
					 * totalling under 3KB. Five round trips for 3KB is worse
					 * than one, and they are always fetched together.
					 */
					manualChunks(id) {
						if (id.includes('/src/lib/') || id.includes('/src/data/')) {
							return 'runtime';
						}
						return undefined;
					},
				},
			},
		},
	},
});
