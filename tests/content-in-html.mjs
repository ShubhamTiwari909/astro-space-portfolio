#!/usr/bin/env node
/**
 * Content-in-HTML assertion — master plan §27.4, §25.0.
 *
 * Asserts that every fact on the site ships as text in the built HTML, with
 * no JavaScript required. This is the automated form of P1 ("content is
 * never inside the effect") and it is the test that will catch a future
 * change that moves content into the WebGL scene or a client-only island.
 *
 * Counts come from the collections, never hardcoded, so adding a skill or a
 * project extends the assertion automatically.
 */

import { readFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');

/** Strip tags, then decode the entities Astro emits, so `&` compares. */
const text = html
	.replace(/<[^>]+>/g, ' ')
	.replace(/&amp;/g, '&')
	.replace(/&#39;|&apos;/g, "'")
	.replace(/&quot;/g, '"')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&nbsp;/g, ' ')
	.replace(/\s+/g, ' ');

const load = (name) =>
	JSON.parse(readFileSync(`src/content/${name}.json`, 'utf8'));

const skills = load('skills');
const projects = load('projects');
const [profile] = load('profile');
const experience = load('experience');
const instruments = load('instruments');

const failures = [];

function assertAll(label, values, haystack = text) {
	const missing = values.filter((v) => !haystack.includes(v));
	if (missing.length > 0) failures.push({ label, missing });
	const mark = missing.length === 0 ? 'PASS' : 'FAIL';
	console.log(`  ${label.padEnd(26)} ${String(values.length).padStart(3)}  ${mark}`);
}

assertAll('skill names', skills.map((s) => s.name));
assertAll('project names', projects.map((p) => p.name));
assertAll('project descriptions', projects.map((p) => p.description.slice(0, 40)));
assertAll('project live URLs', projects.map((p) => p.liveUrl), html);
assertAll('instrument names', instruments.map((i) => i.name));
assertAll('identity + contact', [
	profile.name,
	profile.role,
	profile.email,
	profile.lede.slice(0, 40),
	profile.philosophy.slice(0, 40),
]);
assertAll(
	'burn event titles',
	experience.flatMap((p) => p.achievements.map((a) => a.title)),
);

const metric = experience
	.flatMap((p) => p.achievements)
	.find((a) => a.metric)?.metric;
assertAll('metric + basis', [metric.value, metric.basis.slice(0, 30)]);

console.log('');
if (failures.length > 0) {
	console.error('✗ Content-in-HTML FAILED — these facts are not in the HTML:\n');
	for (const f of failures) console.error(`  ${f.label}: ${f.missing.join(', ')}`);
	console.error('\nContent must never live only in an island or the scene (P1).\n');
	process.exit(1);
}
console.log('✓ Content-in-HTML passed — every fact ships as text, no JS required.');
