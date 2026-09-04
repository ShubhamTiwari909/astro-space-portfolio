/**
 * dev.to articles at BUILD TIME only — master plan §20.4.
 *
 * Never fetched from the browser. On failure or a non-200 we fall back to
 * the committed `src/content/articles.json`, so a network hiccup can never
 * fail or empty the build — it only makes the list slightly stale.
 *
 * No API key: the endpoint is public. Do not add auth or a proxy.
 */

const ENDPOINT =
	'https://dev.to/api/articles?username=shubhamtiwari909&per_page=30';

/** Excerpts are truncated here, at build, on a word boundary (§20.4). */
const EXCERPT_MAX = 160;

export interface ArticleRecord {
	id: string;
	title: string;
	url: string;
	publishedAt: string;
	source: string;
	excerpt?: string;
	readingMinutes?: number;
	coverImage?: string;
	tags?: string[];
}

interface DevToArticle {
	slug?: string;
	title?: string;
	url?: string;
	published_at?: string;
	description?: string;
	reading_time_minutes?: number;
	cover_image?: string | null;
	tag_list?: string[];
}

function truncate(text: string, max = EXCERPT_MAX): string {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (clean.length <= max) return clean;
	const cut = clean.slice(0, max);
	const lastSpace = cut.lastIndexOf(' ');
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

function isUsable(a: DevToArticle): boolean {
	return Boolean(a.slug && a.title && a.url && a.published_at);
}

export async function fetchArticles(): Promise<ArticleRecord[] | null> {
	try {
		const res = await fetch(ENDPOINT, {
			headers: { accept: 'application/json' },
			signal: AbortSignal.timeout(8000),
		});
		if (!res.ok) {
			console.warn(
				`[articles] dev.to returned ${res.status}; using committed fallback.`,
			);
			return null;
		}

		const raw: unknown = await res.json();
		if (!Array.isArray(raw)) {
			console.warn('[articles] unexpected dev.to payload; using fallback.');
			return null;
		}

		const mapped = (raw as DevToArticle[])
			.filter(isUsable)
			.map((a): ArticleRecord => ({
				id: a.slug!,
				title: a.title!,
				url: a.url!,
				publishedAt: a.published_at!.slice(0, 10),
				source: 'dev.to',
				excerpt: a.description ? truncate(a.description) : undefined,
				readingMinutes: a.reading_time_minutes,
				coverImage: a.cover_image ?? undefined,
				tags: a.tag_list?.length ? a.tag_list : undefined,
			}))
			.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

		if (mapped.length === 0) {
			console.warn('[articles] dev.to returned no usable posts; using fallback.');
			return null;
		}

		console.info(`[articles] fetched ${mapped.length} posts from dev.to.`);
		return mapped;
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		console.warn(`[articles] dev.to fetch failed (${reason}); using fallback.`);
		return null;
	}
}
