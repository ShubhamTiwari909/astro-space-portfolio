// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// PENDING D2: replace with the real production domain before Phase 8 (SEO & Production).
// Canonicals, sitemap entries and absolute OG URLs all derive from this.
const SITE = 'https://example.com';

export default defineConfig({
	site: SITE,
	output: 'static',
	trailingSlash: 'never',

	integrations: [
		react(),
		sitemap({
			filter: (page) => !page.includes('/dev/'),
		}),
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
	},
});
