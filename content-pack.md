# Content Pack — DEEP FIELD

**Status:** Phase 0 deliverable. **Authoritative content source** for implementation.
**Supersedes:** `portfolio-content.md` (kept as the raw extract of the previous site; use it only as an archival record and as the source for project `SHB-3b`).
**Plan:** `space-portfolio-master-plan.md`

All eight content gaps (C1–C8) are resolved. Every field below is final copy — implement it verbatim unless the owner changes it.

---

## Profile

| Field | Value |
|-------|-------|
| Name | Shubham Tiwari |
| Role | Frontend Engineer |
| Years experience | **4** |
| Location | India |
| Timezone | Asia/Kolkata (UTC+5:30) |
| Availability | Weekdays |
| Open to | Frontend / platform roles |
| Email | shubhmtiwri00@gmail.com |
| Résumé | `/Shubham_resume_2026.pdf` (in `public/`, 59KB) |
| Portrait | `hero_profile.png` — 864×1184. **Move to `src/assets/images/` so `astro:assets` can generate AVIF/WebP; files in `public/` are served unoptimised.** |

### Socials (professional order)

| Network | URL |
|---------|-----|
| GitHub | https://github.com/ShubhamTiwari909 |
| LinkedIn | https://www.linkedin.com/in/shubham-tiwari-b7544b193/ |
| dev.to | https://dev.to/shubhamtiwari909 |
| Instagram | https://www.instagram.com/supremacism__shubh/ |

---

## First Light (Hero)

- **Eyebrow:** `FIRST LIGHT · INDIA · UTC+5:30`
- **h1:** Hi, I'm Shubham Tiwari
- **Role line:** Frontend Engineer
- **Lede:** I build fast, accessible web platforms — and the systems that keep them fast as they grow.
- **Primary CTA:** VIEW THE WORK → `#worlds`
- **Secondary CTA:** DOWNLOAD RÉSUMÉ → `/Shubham_resume_2026.pdf`
- **Stat strip:** `4 YEARS` · `24 TECHNOLOGIES` · `4 SHIPPED WORLDS`
  (technology and world counts are computed from collections at build time, never hardcoded — they updated themselves when Zentauri was added)

---

## Observer's Log (About) — C7 resolved

### Philosophy pull-quote

> Most frontend problems are really delivery problems — the interesting work is making the fast path the easy path for everyone who touches the codebase.

### Prose (159 words)

I've spent four years on frontend platforms — the kind where the hard part isn't the component, it's that a lot of people need to ship pages without breaking the build. Most of my work has been migrations and plumbing: moving legacy applications onto Next.js, standing up a headless CMS that took page publishing from two pages a sprint to two a day, and wiring a Playwright suite covering E2E, API, accessibility, and visual regression so releases stopped being a negotiation.

I care more about the second year of a codebase than the first week of it. In practice that means I'd rather add a lint rule than a conventions document, and I'll usually argue for the boring, typed, testable version of a feature. Outside of work I build small things to learn from — an AI content app on Gemini, a blog CMS on Payload — and I write up what breaks at dev.to.

### Field notes (`<dl>`)

| Label | Value |
|-------|-------|
| LOCATION | India |
| TIMEZONE | Asia/Kolkata · UTC+5:30 |
| EXPERIENCE | 4 years |
| FOCUS | Frontend platforms, performance, accessibility |
| CURRENTLY | Astro, design systems |
| AVAILABILITY | Weekdays |
| WRITES AT | dev.to/shubhamtiwari909 |
| OPEN TO | Frontend / platform roles |

### Open questions

- → How far can a design system go before it starts constraining product velocity?
- → What does genuinely accessible rich-text editing look like?
- → Where does AI-assisted development actually pay off in a large codebase — and where does it just add review load?

### Tag chips

TypeScript · React · Design systems · A11y · Performance

---

## The Atlas (Skills) — 24 entries

Tiers per §11.1 of the plan. Percentages are retained **only as `sortScore`** and are never displayed.

### CORE (10) — daily, can debug deeply, would defend design decisions

| Skill | Constellation | sortScore |
|-------|--------------|-----------|
| HTML | INTERFACE | 95 |
| CSS | INTERFACE | 95 |
| JavaScript | INTERFACE | 95 |
| React | INTERFACE | 95 |
| Git | OPERATIONS | 95 |
| Tailwind CSS | INTERFACE | 92 |
| Node.js | SUBSTRATE | 90 |
| AI-assisted development | OPERATIONS | 90 |
| ESLint / Prettier | OPERATIONS | 90 |
| TypeScript | INTERFACE | 88 |

### WORKING (12) — shipped production work, comfortable unsupervised

| Skill | Constellation | sortScore |
|-------|--------------|-----------|
| Next.js | INTERFACE | 85 |
| Payload CMS | SUBSTRATE | 85 |
| REST APIs | SUBSTRATE | 85 |
| Figma | OPERATIONS | 85 |
| Gemini / LLM APIs | SUBSTRATE | 85 |
| Astro | INTERFACE | 80 |
| Express | SUBSTRATE | 80 |
| Vercel | OPERATIONS | 80 |
| Playwright | OPERATIONS | 80 |
| Performance optimisation | OPERATIONS | 80 |
| Accessibility | OPERATIONS | 80 |
| SEO | OPERATIONS | 80 |

### FAMILIAR (2) — used, functional, would need a ramp-up

| Skill | Constellation | sortScore |
|-------|--------------|-----------|
| MongoDB | SUBSTRATE | 75 |
| Docker | OPERATIONS | 60 |

> **Counts: CORE 10 · WORKING 12 · FAMILIAR 2 = 24 entries.** The 24th exists because `Gemini / LLM APIs` was split out of the old vague "AI — 90%" entry (plan §11.1). Decision **D1** may fold it back to 23 — but the hero stat strip and Atlas eyebrow both compute their counts from this collection at build time, so either choice needs no code change. **Default: keep it at 24.**

### Constellation relationship lines

React→TypeScript · React→Next.js · React→Astro · Next.js→Vercel · Node.js→Express · Express→REST APIs · Payload CMS→MongoDB · Playwright→Accessibility · Gemini / LLM APIs→REST APIs

---

## Trajectory (Experience) — C1 + C5 resolved

**No employer names are used.** One position, identified by role and duration only.

- **Position header:** `FRONTEND ENGINEER · 4 YEARS`
- **Company field:** omitted entirely (schema makes it optional — see plan §20.3)

### Burn events

| # | Title | Description | Metric |
|---|-------|-------------|--------|
| 01 | Next.js platform modernization | Led the migration of legacy frontend applications to Next.js, improving performance, SEO, accessibility, and developer experience. | — |
| 02 | Headless CMS & delivery | Designed and built a scalable headless CMS on Next.js, Payload CMS, and PostgreSQL, transforming how fast pages reach production. | **14×** faster page delivery — from 2 pages per 14-day sprint to 2 pages per day |
| 03 | Multi-brand CMS setup | Architected a multi-brand CMS on a monorepo, improving code reuse, maintainability, and onboarding speed for new brands. | — |
| 04 | Playwright automation suite | Built a Playwright suite covering E2E flows, API testing, UI and snapshot tests, accessibility checks, link validation, and authentication workflows. | — |
| 05 | Cross-team delivery ownership | Worked with backend, QA, and product teams to own frontend delivery and improve product stability and release confidence. | — |
| 06 | Database schema & data migrations | Performed database schema and data migrations in coordination with Payload CMS and PostgreSQL. | — |
| 07 | Legacy JSP maintenance | Maintained and enhanced legacy JSP applications, enabling gradual modernization without disrupting production systems. | — |

### C5 — metric basis (recorded, defensible)

Before the CMS: **2 pages per 14-day sprint** (≈1 page per 7 days). After: **2 pages per day** (≈1 page per 0.5 days).
→ **14× throughput increase**, equivalently a ~93% reduction in time-to-publish per page.

Use **"14× faster page delivery"** as the headline metric — it is stronger and more concrete than the previous "~80% faster" claim, and the basis above should be stated in one line beneath it so it survives scrutiny.

---

## Catalogued Worlds (Projects) — C2, C3, C4 resolved

**No screenshots.** Every project uses the theme's procedural gradient visual (§10.2 / §10.6 of the plan). **No detailed case studies** — cards carry the full record and link straight to the live site.

### SHB-1b — Zentauri UI *(featured)*

- **One-liner:** A published React + Tailwind v4 component library with token-first theming and axe-core in CI.
- **Description:** A React and Tailwind v4 component library published to npm, built on a `--zui-*` token contract with CVA-backed variant APIs, optional Framer Motion entry points, a headless hooks catalog, and a CLI for scaffolding. Covered by 1,359 assertions across 139 test files, including 46 accessibility tests that run axe-core and keyboard interaction against every interactive component.
- **Stack:** React · Tailwind CSS · TypeScript · Framer Motion · Vitest
- **Status:** LIVE · **Year:** 2026
- **Live:** https://zentauri-ui.vercel.app
- **npm:** `@zentauri-ui/zentauri-components`

> **Why this is featured rather than Payload CMS.** The plan's selection rule
> is depth of demonstrable engineering, not trendiness (§10.1). A published
> package with a CLI, typed variant APIs, 1,359 assertions and axe-core
> running in CI is the strongest evidence in the portfolio. It is also
> instrument **I-01**, so the project entry and the Instrument Bay reinforce
> each other rather than duplicating.

### SHB-2b — Payload CMS

- **One-liner:** A blog CMS with authentication, an admin dashboard, and on-demand revalidation.
- **Description:** A personal blog content management system built with Next.js, Tailwind CSS, and MongoDB. Includes user authentication, an admin dashboard, content and media management, analytics, PageSpeed testing, and on-demand revalidation.
- **Stack:** Next.js · Tailwind CSS · MongoDB · Node.js
- **Status:** LIVE · **Year:** 2025
- **Live:** https://blazing-blogs-frontend.vercel.app

### SHB-3b — Gemini Zentauri

- **One-liner:** AI content and image generation behind a social-feed interface.
- **Description:** An AI-powered app for generating content and images, wrapped in a social-media-style feed with posting and interaction features.
- **Stack:** Next.js · Tailwind CSS · MongoDB · Node.js · Gemini API
- **Status:** LIVE · **Year:** 2025
- **Live:** https://gemini-ai-agent.vercel.app/

### SHB-4b — Portfolio v1 *(replaces "Static Websites")*

- **One-liner:** The predecessor to this site — a Material-3 token system with a live dev.to feed.
- **Description:** A single-page developer portfolio built on a Material-3 inspired token system, with a live dev.to article feed, a mobile-first bottom-tab navigation pattern, and animated section reveals.
- **Stack:** Next.js · React · Tailwind CSS · dev.to API
- **Status:** LIVE · **Year:** 2026
- **Live:** https://shubham-portfolio-modern.vercel.app/

> **Two consequences of listing Portfolio v1, both important:**
> 1. **Do not redirect `shubham-portfolio-modern.vercel.app` to the new domain.** The plan originally recommended that redirect to consolidate link equity (§35); it is now cancelled, because the redirect would break this project's live link. The predecessor stays deployed as an exhibit.
> 2. Name it **"Portfolio v1"**, not "Modern Portfolio". A visitor is looking at the *current* portfolio, so the lineage has to be explicit or the entry reads as a broken duplicate. Framing it as v1 turns a possible confusion into visible iteration.

---

## Instrument Bay — 4 instruments (§14.2, unchanged)

| ID | Name | Claim | Evidence |
|----|------|-------|----------|
| I-01 | **Zentauri UI** | React + Tailwind v4, token-first, axe-core in CI | Live docs at zentauri-ui.vercel.app + the Apr 2026 dev.to write-up. Also project `SHB-1b` |
| I-02 | Playwright automation suite | E2E, API, snapshot, a11y, link validation, auth flows | Coverage matrix + one annotated spec excerpt |
| I-03 | Multi-brand monorepo CMS | Next.js + Payload + PostgreSQL across brands | Architecture SVG + reuse/onboarding outcome |
| I-04 | Orbit | Canvas n-body simulation with live telemetry | Built for this site |

**Capability index** (honest scope labelling, not portfolio pieces): Dashboards · Responsive Websites · E-commerce · Landing Pages · Admin Panel · Portfolio · CMS Websites · AI Websites · Blogs

---

## Transmissions (Writing) — 6 latest

Fetched from the dev.to API at build time; this list is the committed fallback (`src/content/articles/fallback.json`).

| Date | Title | URL |
|------|-------|-----|
| 2026-04-30 | I built a React component library with Tailwind v4, Framer Motion & typed hooks | https://dev.to/shubhamtiwari909/i-built-a-react-component-library-with-tailwind-v4-framer-motion-typed-hooks-19ci |
| 2025-12-22 | Next.js Data Fetching Mistake That Blocks Your Entire Page (And How to Fix It) | https://dev.to/shubhamtiwari909/nextjs-data-fetching-mistake-that-blocks-your-entire-page-and-how-to-fix-it-k9a |
| 2025-08-20 | 5 Essential JavaScript Patterns Every Developer Should Know | https://dev.to/shubhamtiwari909/javascript-patterns-7fo |
| 2025-08-19 | Next JS + Express + Mongo + AI stack | https://dev.to/shubhamtiwari909/next-js-express-mongo-ai-stack-4epj |
| 2025-08-18 | From Server to Client: Handling Initial Data Fetching and Infinite Scroll | https://dev.to/shubhamtiwari909/the-perfect-blend-server-side-rendering-with-client-side-infinite-scrolling-4j4i |
| 2025-07-15 | Mastering Tailwind CSS: Hidden Gems & Productivity Hacks | https://dev.to/shubhamtiwari909/tailwind-tips-and-tricks-bfa |

Excerpt-only, always linking out to dev.to (plan §27.3).

---

## Uplink (Contact) — C8 resolved

- **Eyebrow:** `UPLINK · ASIA/KOLKATA UTC+5:30 · WEEKDAYS`
- **Heading:** Let's build something together.
- **Availability:** `● OPEN TO FRONTEND / PLATFORM ROLES · WEEKDAYS`
- **Email:** shubhmtiwri00@gmail.com (plain text in HTML, with a copy button)
- **Links:** GitHub · LinkedIn · dev.to
- **Final CTA:** DOWNLOAD RÉSUMÉ ↓
- No contact form (plan §15.1)

---

## Footer

- Wordmark: `SHUBHAM TIWARI`
- © 2026 Shubham Tiwari · Crafted with precision.
- Socials: GitHub · LinkedIn · dev.to · Instagram
- Build stamp: `BUILD {date} · ASTRO` (computed at build)

---

## Remaining owner decisions

| # | Decision | Default if unanswered |
|---|----------|----------------------|
| D1 | Skill count: keep `Gemini / LLM APIs` as a separate entry (**24 skills**) or fold it back (23)? | 24 |
| D2 | Production domain for the new site | Vercel default until a custom domain is chosen |
| D3 | Analytics provider (Vercel Analytics vs Plausible) | Vercel Analytics |
| D4 | Are the two personal projects' years (2025) correct? | As listed |
