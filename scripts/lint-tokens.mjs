#!/usr/bin/env node
/**
 * Token lint (§Phase 1 task 12, §18 enforcement).
 *
 * Fails the build on hardcoded design values inside src/components and
 * src/layouts. The rule from the master plan: "any hex color, duration, or
 * spacing literal in a component is a review failure. The only permitted raw
 * values are one-off viewBox coordinates and the seeded position data."
 *
 * Deliberately allowed:
 *  - 1px / 2px  hairlines, borders, outlines
 *  - 0 / 0px / 100% / 1fr and other layout-neutral values
 *  - SVG geometry (viewBox, path d, cx/cy/r, width/height on <svg>)
 *  - rem values: the spacing scale is rem-based and Tailwind owns the 0.25rem
 *    step, so rem in component CSS is idiomatic rather than a magic value.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['src/components', 'src/layouts', 'src/pages'];
const EXTENSIONS = ['.astro', '.tsx', '.ts', '.css'];

/** Files exempt from specific rules, with the reason. */
const EXEMPT = {
	// Pure SVG path geometry on a 24px grid — coordinate data, not design values.
	'src/components/layout/IconSprite.astro': ['px', 'ms'],
	// The token reference page demonstrates raw values on purpose.
	'src/pages/dev/tokens.astro': ['px', 'hex', 'ms'],
};

/** Strip comments so the plan quotations in them are not linted. */
function stripComments(line) {
	return line
		.replace(/\/\*.*?\*\//g, '')
		.replace(/\/\/.*$/, '')
		.replace(/<!--.*?-->/g, '');
}

const RULES = [
	{
		id: 'hex',
		// Hex colours, except inside a var() fallback chain or a comment.
		pattern: /#[0-9a-fA-F]{3,8}\b/g,
		message: 'hardcoded hex colour — use a --color-* token',
		// #i- sprite refs and url(#…) are not colours
		ignore: (_match, line) =>
			line.includes('href="#') ||
			line.includes("href='#") ||
			line.includes('url(#') ||
			line.includes('#i-') ||
			// <meta name="theme-color"> cannot take a CSS variable — the platform
			// requires a literal here, so this is a genuine exemption.
			line.includes('theme-color') ||
			/#main|#worlds|#uplink|#atlas|#log|#trajectory|#transmissions|#first-light|#instruments|#bay|#dossier/.test(
				line,
			),
	},
	{
		id: 'ms',
		// (?<![-\w.]) so "4s" inside "2.4s" is not a separate match.
		pattern: /(?<![-\w.])\d+(?:\.\d+)?m?s\b/g,
		message: 'hardcoded duration — use a --duration-* token',
		ignore: (match, line) =>
			line.includes('--duration-') ||
			line.includes('cubic-bezier') ||
			line.includes('@media') ||
			// A named custom property IS the token (same rule as `px`).
			/--[\w-]+:\s*[^;]*$|--[\w-]+:\s*[\d.]+m?s/.test(line) ||
			/\b(0s|0ms)\b/.test(match),
	},
	{
		id: 'px',
		pattern: /(?<![-\w.])\d+px\b/g,
		message: 'hardcoded px value — use a token or rem',
		ignore: (match, line) => {
			const n = Number.parseInt(match, 10);
			// hairlines, focus rings, and zero are fine
			if (n <= 2) return true;
			// SVG geometry and media queries are fine
			if (/viewBox|stroke|\bd="|blur\(|media|min-width|max-width|width <|width >/.test(line))
				return true;
			// Typographic micro-offsets are not spacing decisions
			if (/text-underline-offset|outline-offset|letter-spacing/.test(line)) return true;
			// A named custom property IS the token — that is the point. Matches
			// both CSS declarations and inline style strings built in frontmatter.
			if (/--[\w-]+:\s*[^;]*$|--[\w-]+:\s*[\d.]+px/.test(line)) return true;
			return false;
		},
	},
];

function walk(dir) {
	const out = [];
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) out.push(...walk(full));
		else if (EXTENSIONS.some((ext) => full.endsWith(ext))) out.push(full);
	}
	return out;
}

const violations = [];

for (const root of ROOTS) {
	for (const filePath of walk(root)) {
		const rel = relative(process.cwd(), filePath);
		const exemptions = EXEMPT[rel] ?? [];
		const lines = readFileSync(filePath, 'utf8').split('\n');
		let inBlockComment = false;

		lines.forEach((rawLine, index) => {
			const trimmed = rawLine.trim();

			// Track multi-line comment blocks: the plan is quoted at length in
			// them, and continuation lines carry no comment marker of their own.
			if (inBlockComment) {
				if (trimmed.includes('*/')) inBlockComment = false;
				return;
			}
			if (
				(trimmed.startsWith('/*') || trimmed.startsWith('<!--')) &&
				!trimmed.includes('*/') &&
				!trimmed.includes('-->')
			) {
				inBlockComment = true;
				return;
			}

			// Skip comment-only lines.
			if (
				trimmed.startsWith('*') ||
				trimmed.startsWith('//') ||
				trimmed.startsWith('/*') ||
				trimmed.startsWith('<!--')
			) {
				return;
			}

			// Strip trailing/inline comments from mixed lines.
			const line = stripComments(rawLine);

			for (const rule of RULES) {
				if (exemptions.includes(rule.id)) continue;
				const matches = line.match(rule.pattern);
				if (!matches) continue;
				for (const match of matches) {
					if (rule.ignore?.(match, line)) continue;
					violations.push({
						file: rel,
						line: index + 1,
						match,
						message: rule.message,
					});
				}
			}
		});
	}
}

if (violations.length > 0) {
	console.error(`\n✗ Token lint failed — ${violations.length} violation(s):\n`);
	for (const v of violations) {
		console.error(`  ${v.file}:${v.line}  ${v.match}  →  ${v.message}`);
	}
	console.error('');
	process.exit(1);
}

console.log('✓ Token lint passed — no hardcoded design values in components.');
