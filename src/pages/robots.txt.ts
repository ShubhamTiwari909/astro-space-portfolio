import type { APIRoute } from 'astro';

/**
 * robots.txt, generated rather than committed.
 *
 * The sitemap line has to carry an absolute URL, so a static file in
 * `public/` would mean hardcoding the production domain in a second place —
 * and the whole point of resolving `site` from the environment
 * (`astro.config.mjs`) is that the domain lives in exactly one place. This
 * derives from the same value, so a preview build and a production build
 * each get a correct one without anyone remembering to edit a file.
 */
export const GET: APIRoute = ({ site }) => {
	if (!site) throw new Error('`site` is not configured — robots.txt needs it');

	const body = [
		'User-agent: *',
		'Allow: /',
		'',
		// The token reference page is a development surface. It already
		// carries `noindex`, but keeping crawlers out of it entirely costs
		// nothing and means the noindex is a second line of defence.
		'Disallow: /dev/',
		'',
		`Sitemap: ${new URL('sitemap-index.xml', site).href}`,
		'',
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
