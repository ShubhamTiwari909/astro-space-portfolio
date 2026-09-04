import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { readFile } from 'node:fs/promises';
import { fetchArticles, type ArticleRecord } from './lib/devto';
// Imported directly rather than from `astro:content`, whose `z` re-export is
// deprecated in Astro 7. Version pinned to match Astro's own zod (4.5.x).
import * as z from 'zod';

/**
 * Master plan §20.3. Schemas are the contract: a missing required field fails
 * the build, which is the guardrail that stops placeholder content shipping.
 *
 * Notably absent by decision:
 *  - projects: no `screenshots`, no `problem`/`approach`/`impact` (C2, C3).
 *    Unused schema fields invite an agent to fill them.
 *  - experience: `company` is OPTIONAL (C1). No employer names are used.
 */

const STATUS = z.enum(['LIVE', 'ARCHIVED', 'PRIVATE']);
const TIER = z.enum(['CORE', 'WORKING', 'FAMILIAR']);
const CONSTELLATION = z.enum(['INTERFACE', 'SUBSTRATE', 'OPERATIONS']);

const projects = defineCollection({
	loader: file('src/content/projects.json'),
	schema: z.object({
		designation: z.string(),
		slug: z.string(),
		name: z.string(),
		oneLiner: z.string(),
		description: z.string(),
		stack: z.array(z.string()).min(1).max(6),
		status: STATUS,
		year: z.number().int(),
		liveUrl: z.url(),
		featured: z.boolean().default(false),
		order: z.number().int(),
		repoUrl: z.url().optional(),
	}),
});

const experience = defineCollection({
	loader: file('src/content/experience.json'),
	schema: z.object({
		role: z.string(),
		durationLabel: z.string(),
		achievements: z
			.array(
				z.object({
					title: z.string(),
					description: z.string(),
					technologies: z.array(z.string()).optional(),
					metric: z
						.object({
							value: z.string(),
							label: z.string(),
							basis: z.string(),
						})
						.optional(),
				}),
			)
			.min(1),
		// Optional by decision (C1) — omitted entirely when absent, never
		// rendered as an empty label or a placeholder.
		company: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		summary: z.string().optional(),
		technologies: z.array(z.string()).optional(),
	}),
});

const skills = defineCollection({
	loader: file('src/content/skills.json'),
	schema: z.object({
		name: z.string(),
		tier: TIER,
		constellation: CONSTELLATION,
		/** Hand-authored position in the Atlas viewBox (0 0 800 620), §11.2.
		 *  Never generated: a random constellation looks like noise. */
		x: z.number().min(0).max(800),
		y: z.number().min(0).max(620),
		sortScore: z.number().int().min(0).max(100),
		/** Real dependency relationships, so a traced line teaches something. */
		connections: z.array(z.string()).default([]),
	}),
});

/**
 * Articles come from dev.to at build time, with the committed JSON as the
 * fallback (§20.4). A custom loader rather than `file()` so the network path
 * and the fallback live in one place.
 */
const articles = defineCollection({
	loader: async (): Promise<ArticleRecord[]> => {
		const live = await fetchArticles();
		if (live) return live;
		// Committed fallback: a network hiccup makes the list stale, never
		// empty, and never fails the build (§20.4).
		return JSON.parse(
			await readFile('src/content/articles.json', 'utf8'),
		) as ArticleRecord[];
	},
	schema: z.object({
		title: z.string(),
		url: z.url(),
		publishedAt: z.iso.date(),
		source: z.string().default('dev.to'),
		excerpt: z.string().max(200).optional(),
		readingMinutes: z.number().int().optional(),
		coverImage: z.url().optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const instruments = defineCollection({
	loader: file('src/content/instruments.json'),
	schema: z.object({
		designation: z.string(),
		name: z.string(),
		claim: z.string(),
		body: z.string(),
		order: z.number().int(),
		evidence: z.enum(['demo', 'diagram', 'code', 'live']),
		links: z
			.array(z.object({ label: z.string(), url: z.url() }))
			.optional(),
	}),
});

const profile = defineCollection({
	loader: file('src/content/profile.json'),
	schema: z.object({
		name: z.string(),
		role: z.string(),
		location: z.string(),
		timezone: z.string(),
		availability: z.string(),
		openTo: z.string(),
		email: z.email(),
		yearsExperience: z.number().int(),
		resumePdf: z.string(),
		lede: z.string(),
		socials: z.array(
			z.object({
				network: z.string(),
				label: z.string(),
				url: z.url(),
				professional: z.boolean().default(true),
			}),
		),
		philosophy: z.string().optional(),
		prose: z.array(z.string()).optional(),
		fieldNotes: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
		openQuestions: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = {
	projects,
	experience,
	skills,
	articles,
	instruments,
	profile,
};
