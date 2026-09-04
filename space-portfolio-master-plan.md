# Space Portfolio — Master Plan

**Codename:** DEEP FIELD
**Owner:** Shubham Tiwari — Frontend Engineer
**Stack:** Astro 7 (islands) + React 19 + TypeScript (strict) + Tailwind CSS v4
**Document status:** Implementation blueprint. No code in this document.
**Consumed by:** an AI coding agent or developer, executing phase by phase.

---

## How to use this document

1. Read §1–§7 once to absorb the concept. Every later decision assumes it.
2. Implement strictly in the order given by §30 Development Phases.
3. Do not skip ahead. Each phase has a **Things NOT to implement yet** list — obey it.
4. Every visual value comes from §18 Design Tokens. Never introduce a magic value.
5. If a decision seems missing, it is probably in §19–§26. If it is genuinely missing, choose the option that is cheapest to render and most accessible, then record the decision at the bottom of this file under *Decision log*.

### Deviation from the source brief

The brief (`phase-wise-planning-doc.md`) assumed Next.js. This project is already Astro 7 + React 19 + Tailwind v4. **The plan targets Astro, deliberately**, because this portfolio is ~90% static content plus a handful of heavy visual widgets — which is precisely the island architecture's strong case. Astro gives us zero-JS content by default and per-component hydration directives (including `client:media`, which lets us ship the expensive visuals to desktop only and never download them on mobile). Next.js RSC would work but would put a React runtime in front of content that never needs one.

Wherever the brief says "Server Component / Client Component", read: **`.astro` component (build-time, zero JS)** / **React island (hydrated, explicit directive)**.

---

## Content readiness — resolve before Phase 3

All copy comes from `portfolio-content.md`. That file is complete enough for Phases 0–2 but has **real gaps** that must be filled before the content phase. Do not paper over these with lorem ipsum or invented facts.

| # | Gap | Needed for | Owner action |
|---|-----|-----------|--------------|
| C1 | **No employer names, job titles, or dates.** The source has 7 achievements with no company, role, or duration. | §12 Trajectory | Provide company, role, start/end dates per position, and map the 7 achievements onto them. |
| C2 | **No project screenshots.** The current live site uses CSS gradient placeholders. | §10 Worlds | Capture 3–5 real screenshots per project (desktop + mobile), 16:10, ≥1600px wide. |
| C3 | **No case-study bodies.** Projects have a description but no problem / solution / role / impact. | §10 Worlds, `/worlds/[slug]` | Write 150–400 words per project against the schema in §20. |
| C4 | **Project 3 ("Static Websites") is not a project.** It is a category, with no demo link. | §10 Worlds | Either replace with a real named project, or fold it into §14 Instrument Bay as capability evidence. |
| C5 | **Unverified metric** — "reducing page publishing time by ~80%". | §12 Trajectory | Confirm the number and its basis, or soften the claim. Recruiters probe metrics. |
| C6 | **Resume PDF** `/Shubham_resume_2026.pdf` referenced but not in this repo. | §15 Dossier | Add the file to `public/`. |
| C7 | **About copy is generic** ("passionate… turning complex problems into simple, elegant solutions"). | §13 Observer's Log | Rewrite per the anti-generic rules in §13. Needs: engineering philosophy, what you are learning now, what you want to work on next. |
| C8 | **No availability/timezone/response-time** for contact. | §15 Uplink | Confirm: location (India), timezone (IST/UTC+5:30), typical response time, open to what kind of work. |

**Rule:** if a content field is unavailable at implementation time, the component must **omit the field entirely** (no empty label, no "coming soon" chip) and the Zod schema must mark it optional. Absent content should be invisible, not broken.

---

## 1. Vision

> **You are looking through my telescope. The longer you look at a small patch of sky, the more worlds you find.**

The Hubble Deep Field pointed at an apparently empty speck of sky for ten days and found thousands of galaxies. That is the organising idea of this portfolio: **depth over spectacle**. A visitor arrives at what looks like a quiet, elegant, near-black page and progressively discovers a structured, data-dense body of engineering work.

This inverts the usual space-portfolio failure mode. Most are loud on arrival and empty underneath — a particle explosion in the hero and three thin project cards below. DEEP FIELD is quiet on arrival and dense underneath.

**What the portfolio must achieve, in priority order:**

1. A recruiter or engineering manager can answer *who, what, which technologies, what work, how to contact* in under 60 seconds without scrolling past the fold twice.
2. The visual and interaction craft is itself evidence of frontend skill — the medium is a work sample.
3. It loads and responds fast enough that the craft claim is credible (a slow "performance engineer" portfolio is a self-refuting artifact).
4. It is memorable — a person who saw it a week ago can describe it.
5. It works completely with JavaScript disabled, motion disabled, or on a low-end Android phone.

**Anti-goals.** Not a game. Not a WebGL demo reel. Not neon cyberpunk. Not scroll-jacked. Not a preloader with a fake percentage bar (the current live site's simulated `zsh` boot screen is explicitly removed — it delays first contentful paint to perform work that isn't happening).

---

## 2. Experience Principles

These are tie-breakers. When two implementations are both defensible, the one that satisfies more principles wins.

| # | Principle | Practical test |
|---|-----------|----------------|
| P1 | **Content is never inside the effect.** | Disable canvas/WebGL: is every fact still on screen and selectable? |
| P2 | **Instruments, not decorations.** Space visuals encode real data or spatial position. | Point at any glowing thing: what does it *tell* you? If nothing, cut it. |
| P3 | **The metaphor is a subtitle, never the label.** Every codename ships with its plain name. | Can someone who dislikes space navigate with zero confusion? |
| P4 | **Scroll belongs to the user.** No hijacking, no snap-locking, no minimum-dwell gates. | Can you flick from top to Contact in one gesture? |
| P5 | **One background, many panels.** Spatial continuity comes from a single persistent cosmos, not per-section effects. | Count animated background systems on the home route: must be exactly 1. |
| P6 | **Cheapest medium that works.** CSS → SVG → Canvas → WebGL, in that order. | Is there a CSS/SVG version of this effect? Then WebGL is unjustified. |
| P7 | **Degrade to elegant, not to broken.** Every fallback is a designed state. | Screenshot the reduced-motion, no-JS, and mobile versions: are they all beautiful? |
| P8 | **Density is the flex.** Precision, alignment, and real data impress engineers more than motion. | Would a senior engineer find something to respect on a still screenshot? |

---

## 3. Creative Direction

### 3.1 The reference frame

The interface language is a **modern observatory survey console** — think ESA's Gaia archive, the Aladin Sky Atlas, NASA Eyes, and JWST press-release plates. These interfaces are dark, hairline-ruled, monospace-labelled, coordinate-annotated, and genuinely beautiful because the data is the ornament.

The emotional register is **cinematic + scientific + futuristic + elegant**:

- **Cinematic** — deep blacks, wide letter-spaced type, generous negative space, slow deliberate motion with mass.
- **Scientific** — coordinate readouts, magnitude scales, catalog IDs, units, hairline grids, tabular numerals.
- **Futuristic** — restrained. Achieved through precision and light, not chrome and neon.
- **Elegant** — a high-contrast serif for statements against monospace for data. Editorial, not arcade.

### 3.2 What this explicitly is not

| Avoid | Because |
|-------|---------|
| Neon cyan-on-magenta glow everywhere | Reads as gaming/cyberpunk; destroys the scientific register |
| Multiple competing accent colors | Three accents, each with a fixed job (§18) |
| Glow on body text | Destroys legibility and contrast compliance |
| Full-bleed nebula JPEGs | 1–3MB for decoration; we generate nebulae with 2 CSS gradients |
| Animated section dividers, wipes, curtains | Level-4 motion used at Level-1 frequency; nauseating |
| Icon fonts (the current site loads Material Symbols) | ~100KB+ for ~20 glyphs; use an inline SVG sprite |

### 3.3 Visual language

- **Background treatment.** Three stacked layers, all fixed, forming one cosmos: (1) base void color, (2) two large low-opacity radial gradients as nebula fields, drifting on a 60–90s loop, (3) procedural star field on one canvas. Above them, a 2KB tiling grain PNG at 3% opacity to kill gradient banding on cheap panels. No raster space photography anywhere.
- **Surfaces.** Content sits on near-transparent "instrument panels": `--surface-1` at 60–80% opacity with `backdrop-filter: blur(12px)` on capable browsers, solid `--surface-1` otherwise. Panels feel like glass readouts over the sky, not cards on a page.
- **Borders.** 1px hairlines in `--hairline` (ion at 12% alpha). Corner ticks — 8px L-shaped marks at panel corners — replace heavy borders on hero-level panels. This single motif does more theming work than any glow.
- **Glow.** Reserved for: stars, focused/hovered interactive elements, and the primary CTA. Three tiers as tokens (§18). Never on text under 1.5rem. Never static on more than 3 elements per viewport.
- **Gradients.** Only two kinds: large soft radial (nebula, background only) and 1px linear hairline fades (panel edges, dividers). No 45° "gamer" gradients on buttons.
- **Shadows.** Ambient dark shadows are near-invisible on a black ground, so depth comes from *light*: glow, hairline brightness, and blur/parallax offset instead of drop shadows.
- **Iconography.** One inline SVG sprite, 1.5px stroke, 24px grid, geometric, no filled pictograms. ~16 icons total.
- **Illustration style.** Procedural and generated: CSS/SVG spheres for project worlds (radial-gradient limb + terminator shading, seeded per project), SVG constellation lines, SVG orbit paths. Zero illustration assets to commission.
- **Typography.** High-contrast serif display against a neutral grotesque body against a technical mono. See §18.

### 3.4 Motion language, in one sentence

**Everything has mass and nothing snaps.** Objects accelerate out of rest and decelerate into place on an expo-out curve; ambient motion is linear and imperceptibly slow; interaction feedback is fast and short. Nothing in the interface moves for longer than 900ms except the sky.

---

## 4. Narrative

The site is a single survey session, ordered so that each section answers the question the previous one raises. The narrative is real: it is just the recruiter's question sequence, dressed.

| Order | Codename | Plain name | Question it answers |
|-------|----------|-----------|--------------------|
| 1 | **First Light** | Home | Who is this, and what do they do? |
| 2 | **Observer's Log** | About | How do they think, and are they any good? |
| 3 | **The Atlas** | Skills | What can they actually operate? |
| 4 | **Trajectory** | Experience | Where have they done it, and what changed because of them? |
| 5 | **Catalogued Worlds** | Projects | Show me the work. |
| 6 | **Instrument Bay** | What I Build / Lab | Can they build the hard parts, not just assemble? |
| 7 | **Transmissions** | Writing | Can they explain things? Do they engage with the field? |
| 8 | **Uplink** | Contact | How do I reach them, and are they available? |
| — | **Mission Dossier** | Résumé | Give me the PDF for my ATS. |

**"First light"** is the astronomical term for the first image a new telescope produces — the instrument opening its eye. It is the correct name for a hero section and it earns its place.

**Narrative rule.** Codename appears as a small mono eyebrow label; the plain name and the human sentence carry the actual meaning. Example composition for the hero: eyebrow `FIRST LIGHT · 28.6139°N 77.2090°E`, then `<h1>` "Hi, I'm Shubham Tiwari", then "Frontend Engineer". A visitor who ignores the eyebrow loses nothing.

---

## 5. Information Architecture

```text
/ (one-page survey — the full narrative, ~8 sections)
├── #first-light      Hero
├── #log              About
├── #atlas            Skills
├── #trajectory       Experience
├── #worlds           Projects (3 featured, links to case studies)
├── #instruments      Instrument Bay teaser (links to /instruments)
├── #transmissions    Writing (6 latest, links out to dev.to)
└── #uplink           Contact

/worlds/[slug]        Project case study (static, one per project)
/instruments          Engineering lab — components, experiments, architecture
/transmissions        Full writing index (mirrors dev.to, canonical → dev.to)
/dossier              Résumé page + PDF download
/404                  Lost signal
```

**Generated, not authored:** `/rss.xml`, `/sitemap-index.xml`, `/og/*.png` (build-time OG images).

### 5.1 Why hybrid (one-pager + real routes)

Chosen over a pure one-pager and over a pure multi-page site.

- The narrative in §4 only works as continuous descent, so the **primary experience is one scrolling page**.
- But case studies need **their own URLs** — recruiters share links, and `/worlds/payload-cms` is indexable, previewable in Slack, and linkable from a résumé. Burying them in a modal forfeits all of that.
- The Lab is the heaviest route (it holds the one WebGL experiment). Giving it its own route keeps that weight **off the home page's budget entirely**.
- Astro makes static detail pages nearly free (no client JS, no route-level runtime), so the cost of this split is close to zero. Astro's View Transitions preserve cinematic continuity across the navigation.

### 5.2 Per-section IA table

Full specifications are in §8–§15. Summary:

| Section | Purpose | User goal | Portfolio goal | Metaphor | Mobile behavior |
|---------|---------|-----------|---------------|----------|-----------------|
| First Light | Orient + identify | Know who this is | Establish craft in 3s | Telescope opening its eye | Static sky, type-led, no canvas |
| Observer's Log | Humanise + philosophy | Judge how they think | Differentiate from generic devs | Observer's field notes | Single column, portrait above text |
| The Atlas | Skill inventory | Scan capability fast | Show breadth + depth honestly | Constellations, magnitude = depth | Grouped list with bars, no SVG map |
| Trajectory | Career path | Verify real experience | Prove impact with metrics | Flight path with burn events | Vertical timeline, no orbit curve |
| Catalogued Worlds | The work | Evaluate projects | Drive to case studies | Catalogued planets | Stacked cards, static spheres |
| Instrument Bay | Engineering depth | See under the hood | Prove they build primitives | Instruments the observatory built | Teaser + link, no experiments |
| Transmissions | Writing | Gauge communication | Show field engagement | Signals broadcast outward | Compact list, no images |
| Uplink | Contact | Make contact | Convert | Comms array | Sticky mail CTA |

---

## 6. User Journey

Three real visitor types, with the path each must be able to take. Every one of these must be satisfiable **without JavaScript**.

### 6.1 The recruiter (60 seconds, mobile, distracted)

1. Lands. Sees name, role, "3+ years", and two CTAs above the fold. **≤1.8s to LCP.**
2. Taps **Download Résumé** — or scrolls once and sees the skills list.
3. Bounces to the PDF or to LinkedIn.

**Design consequence:** résumé must be reachable from the fixed header on every route and never more than one tap away. The stat "3+ years" is above the fold on a 360×640 viewport.

### 6.2 The engineering manager (5 minutes, desktop, evaluating)

1. Reads hero, notes the site itself feels fast and precise.
2. Scans The Atlas for stack overlap.
3. Reads Trajectory for scope and metrics.
4. Opens one project case study in a new tab, reads problem → solution → impact.
5. Skims Instrument Bay to see whether the person builds or assembles.
6. Copies the email from Uplink.

**Design consequence:** this is the primary journey. Case studies and Trajectory metrics get the most editorial effort. Instrument Bay exists specifically for step 5.

### 6.3 The peer engineer (curious, will open devtools)

1. Notices the sky and immediately opens devtools/Lighthouse to see how it's done.
2. Goes straight to `/instruments`.
3. Checks the performance panel and the JS bundle. Possibly disables JS to see what survives.
4. Reads a Transmission, follows to dev.to or GitHub.

**Design consequence:** the code must survive inspection. Clean DOM, correct semantics, small bundles, no console noise, and a genuinely honest `/instruments` page. This visitor becomes a referrer.

### 6.4 Journey guarantees

| Guarantee | Test |
|-----------|------|
| Résumé reachable in ≤1 interaction from any route | Manual, all routes |
| Email reachable in ≤2 interactions from any route | Manual, all routes |
| Every project has a live-demo or repo link, or is explicitly labelled unavailable | Content lint |
| No journey requires hover (touch parity) | Touch device pass |
| No journey requires JS | JS-disabled pass |

---

## 7. Navigation

### 7.1 Concept — the declination rail

Desktop navigation is a fixed vertical **instrument rail** on the right edge: a hairline vertical axis with a tick per section, mono labels, and a bright ion segment marking scroll progress. It reads as a telescope's declination scale, and it does the job a nav must do — show where you are, how far through you are, and let you jump.

Rejected alternatives: an orbital radial menu (poor discoverability, hostile to keyboard and screen readers, and hover-dependent) and a star-map overlay nav (an extra interaction gate in front of navigation, which P4 forbids).

### 7.2 Desktop (≥1024px)

- **Top bar** (fixed, 64px, blurred hairline-bottom): wordmark `SHUBHAM TIWARI` left, `DOSSIER ↓` button right. Nothing else. It never grows.
- **Right rail** (fixed, vertically centered, ~180px tall): 8 ticks. Active tick is a 12px ion dash with a glow; inactive are 6px `--text-low` dashes. Labels appear on hover/focus of the rail (or persistently ≥1440px, where there is room).
- **Active state** via `IntersectionObserver` with `rootMargin: "-45% 0px -45% 0px"` — the section crossing the viewport's vertical midpoint is active. Ties resolve to the later section.
- **Progress**: the rail's axis fills top-to-bottom with an ion gradient tracking document scroll, driven by CSS `animation-timeline: scroll()` where supported, falling back to a passive rAF-throttled scroll listener inside the existing island.
- **Route nav** (`/worlds/*`, `/instruments`, …): the rail is replaced by a back affordance — `← SURVEY` returning to `/#worlds` (or the originating anchor) — plus in-page sub-navigation where the route has sections.

### 7.3 Mobile (<768px) and tablet (768–1023px)

- **Mobile:** fixed bottom bar, 5 items with icon + 10px label: Home, Atlas, Trajectory, Worlds, Writing. A 6th `MORE` opens a sheet with Instrument Bay, Uplink, Dossier. 56px tall + safe-area inset; every target ≥44×44px. This preserves the current site's proven bottom-nav pattern.
- **Tablet:** top bar keeps the wordmark and Dossier; the right rail collapses to tick marks with no labels (tap reveals the label, then a second tap navigates — or label-on-focus for keyboard).
- The bottom bar hides on downward scroll past 240px and reappears on upward scroll, with a 200ms transition. It never hides while a focus ring is inside it.

### 7.4 Accessibility and semantics

- Rail and bottom bar are `<nav aria-label="Sections">` containing a `<ul>` of real `<a href="#…">`. Navigation works with zero JS; the island only adds the active/progress states.
- Active item carries `aria-current="true"`.
- `<a href="#main" class="skip-link">Skip to content</a>` is the first focusable element, visible on focus.
- Anchor targets have `scroll-margin-top: var(--nav-h)` so headings never land under the top bar.
- Focus ring: 2px `--ion` with 2px offset, on a `:focus-visible` basis, never removed.
- Anchor jumps use `scroll-behavior: smooth` gated on `prefers-reduced-motion: no-preference`; reduced-motion users get instant jumps.
- Rail label reveal is driven by `:hover, :focus-within` in CSS — never by JS mouse tracking.

---

## 8. Section Specifications

§9–§15 give the full specification for each major section using this fixed structure: *Narrative purpose · User objective · Content · Visual composition · Space metaphor · Interaction · Motion · Technical requirements · Responsive behavior · Accessibility · Performance*. This chapter defines what all of them share, plus the two sections that do not warrant their own chapter.

### 8.1 The section contract

Every section on the home route obeys this anatomy. Implement it once as a layout component; never hand-roll a section.

```text
<section id="{anchor}">                 semantic landmark, scroll-margin-top applied
  ├── eyebrow    CODENAME · {data readout}   mono, 12px, 0.14em tracking, --text-low
  ├── h2         Plain Name                  display serif, display-l
  ├── lede       one sentence, optional      body-l, --text-mid, max 68ch
  └── body       the section's own layout    max-width 1200px, 12-col grid ≥1024px
```

Shared rules:

- **Vertical rhythm:** `padding-block: var(--section-y)`. Never a fixed `100vh` — content decides height. (`100vh` sections cause mobile URL-bar jump and clip long content.)
- **One `<h1>` per document**, in First Light. Every section heading is an `<h2>`; nested headings step down without skipping.
- **No section owns a background animation.** The cosmos is one persistent layer behind everything (P5). Sections may only own a *local* static gradient wash.
- **Entrance animation** is identical everywhere: children fade+rise 16px, 560ms, `--ease-out-expo`, 60ms stagger, triggered once at 20% visibility, never replayed on scroll-back.
- **Data readouts in eyebrows** must be real, never fake: coordinates (First Light), counts (`24 ENTRIES` in The Atlas), date ranges (Trajectory), catalog counts (Worlds). Fabricated telemetry violates P2.

### 8.2 Transmissions (Writing)

**Narrative purpose.** Signals broadcast outward from the observatory. Evidence that the engineer can explain, not just build.

**User objective.** Judge communication quality in one glance and reach a full article in one click.

**Content.** 6 latest posts on the home route, all posts on `/transmissions`. Per post: title, publication date, reading time, excerpt (≤160 chars), source (dev.to), canonical URL, optional cover image. Data from `portfolio-content.md` today; long-term from the dev.to API at build time (§20.4). A `LOAD MORE` link on home routes to `/transmissions` — never a JS pagination widget on the home page.

**Visual composition.** A hairline-ruled list, not a card grid. Each row: mono date left (fixed 96px column, tabular numerals), title and excerpt center, ion `↗` right. Rows are separated by 1px `--hairline`, full row is the link target, 88px min height. The most recent post gets a slightly larger title and an optional 16:9 cover thumbnail at 160px. A list reads faster than cards and costs nothing to render.

**Space metaphor.** Rows are timestamped transmissions in a log; the `↗` indicates the signal leaves this system (external link). The date column doubles as the log's timestamp field, which is why it is monospace and tabular.

**Interaction.** Full-row hover/focus: background lifts to `--surface-2`, title shifts to `--text-hi`, `↗` translates 2px up-right, left edge grows a 2px ion bar. All CSS. Middle-click and cmd-click behave natively because rows are real `<a>` elements wrapping the row content.

**Motion.** Entrance per §8.1. Hover 200ms `--ease-ui`. No scroll-linked motion.

**Technical requirements.** Zero JS. Astro `.astro` component over a content collection. External links carry `target="_blank" rel="noopener noreferrer"` and a visually-hidden "(opens in a new tab)". If mirroring full post bodies later, `<link rel="canonical">` must point at dev.to to avoid duplicate-content penalties — see §27.

**Responsive behavior.** ≥1024px: date column beside content. <768px: date becomes a 12px mono line above the title, thumbnail drops entirely, excerpt clamps to 2 lines.

**Accessibility.** `<ol>` (chronological) of `<li>` with one `<a>` each. `<time datetime="2026-04-30">`. Accessible name is the post title, not "read more". Excerpt is inside the link, so keep names short by using `aria-label` on the anchor equal to the title when the excerpt makes the name unwieldy.

**Performance.** No images on mobile. Cover thumbnails: AVIF/WebP, 320px wide, `loading="lazy"`, explicit `width`/`height` to hold layout. Budget: ≤40KB total for the section on desktop, 0KB on mobile.

### 8.3 Mission Dossier (`/dossier`) and 404

**Dossier.** A static HTML résumé — an actual readable page, plus a prominent PDF download. Rationale: HTML is indexable, linkable, and readable on a phone in a way a PDF is not; the PDF exists for ATS pipelines. Layout: single 68ch column on a solid `--surface-1` panel (near-black, print-safe), no cosmos behind it, `@media print` stylesheet that strips the background to white and the text to black. Content mirrors the résumé PDF exactly — divergence between the two is a credibility risk, so both are generated from the same content collection where possible. Analytics event on PDF download.

**404 — "Lost signal".** Keeps the cosmos and the top bar. Content: `SIGNAL LOST · 404`, one line ("This coordinate isn't in the catalog."), and three real links — Survey (`/`), Worlds, Uplink. No cleverness that costs a visitor their next click. Zero JS.

---

## 9. Hero Experience — First Light

**Chosen concept: Option D — a minimal cinematic space scene where typography dominates**, with one restrained element of Option A (the sky resolving into focus as the instrument opens).

### 9.1 Why this concept, and why not the others

| Concept | Verdict | Reason |
|---------|---------|--------|
| **D — typography-led cinematic scene** | **Chosen** | The LCP element is text, so it can paint in <1s with zero JS. Editorial type is the strongest differentiator against neon space portfolios, degrades perfectly on mobile, and is the only option that satisfies both the 60-second recruiter and the peer engineer running Lighthouse. |
| A — approach a planet from deep space | Partially adopted | A full fly-in needs WebGL or a long canvas animation before the hero is legible, pushing LCP past 2s and gating content behind a spectacle. We keep only its *feeling*: a 700ms focus-resolve of the sky, pure CSS, non-blocking. |
| B — spacecraft navigating toward a scene | Rejected | Needs an illustrated or 3D craft (asset cost, load cost) and reads as game UI. Adds no information. |
| C — interactive star/planet system as the navigation layer | Rejected | Makes navigation dependent on JS, hover, and discovery. Violates P4 and the a11y baseline. A recruiter should never have to *play* to find the résumé. |

### 9.2 Composition (desktop ≥1280px)

A 12-column grid, content max-width 1200px, hero height `min(100svh, 900px)` with `min-height: 640px`.

```text
┌──────────────────────────────────────────────────────────────┐
│ SHUBHAM TIWARI                                    DOSSIER ↓  │  fixed top bar, 64px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FIRST LIGHT · 28.61°N 77.21°E · IST                    ┌──┐ │  mono eyebrow, --text-low
│                                                         │  │ │
│  Hi, I'm                                                │ ◐│ │  cols 1–7: type
│  Shubham Tiwari                                         │  │ │  cols 9–12: portrait
│  ─────────────────                                      └──┘ │  in a hairline frame
│  Frontend Engineer                                           │  with corner ticks
│                                                              │
│  I build fast, accessible web platforms — and the            │  lede, 58ch, --text-mid
│  systems that keep them fast as they grow.                   │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐                   │
│  │  VIEW THE WORK  │  │  DOWNLOAD RÉSUMÉ │                   │  primary + secondary
│  └─────────────────┘  └──────────────────┘                   │
│                                                              │
│  ○ GITHUB   ○ LINKEDIN   ○ DEV.TO   ○ INSTAGRAM              │  mono, 12px
│                                                              │
│  ── 3+ ──────── 23 ──────── 3 ──────────────────────────      │  stat strip, hairline
│     YEARS       TECHNOLOGIES  SHIPPED WORLDS                 │
└──────────────────────────────────────────────────────────────┘
                                                          ▌ rail
```

Type treatment: `Hi, I'm` at `display-m` in `--text-mid`; `Shubham Tiwari` at `display-xl` in Instrument Serif, `--text-hi`, `line-height: 0.95`, tracking `-0.02em`; a 1px 96px ion rule; `Frontend Engineer` at `display-m` in mono uppercase with `0.08em` tracking, `--ion`. The name is the LCP element and must never be an image or a WebGL texture.

Portrait: existing `hero_profile.png`, re-exported to AVIF + WebP at 480/720px, inside a hairline frame with corner ticks and a soft ion inner glow. `aspect-ratio` fixed to prevent CLS. Below 1024px it moves above the type at 160px circular; below 480px it is dropped entirely (the words matter more than the face on a 360px screen).

**Copy.** The source lede — "I create beautiful, functional, and user-friendly web experiences that make a difference. Let's build something amazing together." — is replaced. It is generic, could describe anyone, and wastes the most valuable 12 words on the site. Recommended: *"I build fast, accessible web platforms — and the systems that keep them fast as they grow."* This is specific, matches the actual Trajectory evidence (Next.js migration, headless CMS, Playwright suite), and states a point of view. Final wording is the owner's call, but it must be specific and evidence-backed (C7).

**Stat strip.** Three real numbers only: `3+ YEARS`, `24 TECHNOLOGIES` (the Atlas count — must be computed from the data, not hardcoded), `3 SHIPPED WORLDS`. Numbers use mono tabular figures at `display-m`.

### 9.3 The first 3 seconds

| Time | What happens | Mechanism |
|------|-------------|-----------|
| 0ms | HTML arrives with all hero text already in it. Void background, static pre-rendered star layer (CSS `radial-gradient` dots), nebula gradients in place. | Static Astro output, inlined critical CSS |
| ~0–400ms | Fonts swap in; layout does not shift (`size-adjust` metric overrides on the fallback stack). | Self-hosted woff2 + preload + `font-display: swap` |
| 120–820ms | **First light reveal:** the whole hero is masked by a vertical aperture wipe from center, and simultaneously the sky goes from `blur(6px) opacity(0)` to `blur(0) opacity(1)`. Type rises 12px into place with a 60ms stagger (eyebrow → name → role → lede → CTAs → socials → stats). | Pure CSS keyframes on load. No JS gate. |
| ~800ms | LCP recorded (the name). | — |
| 1000ms+ | `client:idle` hydrates the star-field canvas; it cross-fades over the static layer across 600ms and begins its ambient drift. If it never hydrates, the static layer stays and nothing looks wrong. | React island, canvas 2D |

**Critical rule:** nothing in this timeline blocks on JavaScript. There is no preloader, no splash, no "Enter portfolio" gate. The current live site's simulated terminal boot screen is removed — it adds a mandatory interaction and delays content for theatrical effect, which contradicts both P1 and the performance targets.

### 9.4 First scroll

The hero does not pin, snap, or scroll-jack. On first scroll:

- Hero content translates up at 1.0× and fades to 0 opacity across ~40vh (scroll-linked, `animation-timeline: view()` where supported, else a passive rAF listener).
- Star layers parallax at 0.15× (far), 0.35× (mid), 0.6× (near) — the only parallax in the whole site, which is what makes the transition into Observer's Log feel like movement rather than a page scroll.
- A scroll hint (`↓` + mono `SCROLL`, gently pulsing on a 2.4s loop) sits at the bottom center. It disappears after any scroll and never returns. Hidden entirely under reduced motion and when the viewport is short (<640px tall).

### 9.5 CTAs, navigation, and loading

- **Primary CTA** `VIEW THE WORK` → `#worlds`. Filled ion-tinted surface, ember-warm glow on hover, 48px tall, mono uppercase.
- **Secondary CTA** `DOWNLOAD RÉSUMÉ` → `/Shubham_resume_2026.pdf`, `download` attribute, hairline outline style. Fires the `dossier_download` analytics event. Also present in the fixed top bar so it survives scrolling.
- **Socials** render as 12px mono text labels with a small leading dot, not icon-only buttons — text labels are self-describing for screen readers and remove the icon-font dependency. Order: GitHub, LinkedIn, dev.to, Instagram (professional first).
- **Loading experience:** none by design. The page is usable at first paint.

### 9.6 Reduced motion and mobile fallback

**`prefers-reduced-motion: reduce`:** no aperture wipe, no blur resolve, no stagger, no parallax, no scroll hint, no canvas hydration at all (the static star layer is final). Content appears immediately at full opacity. A single 200ms fade on the hero group is the only motion retained.

**Mobile (<768px):** `min-height: 88svh` (never `100vh`); portrait above the type at 160px, dropped under 480px; `display-xl` clamps down to 3rem; CTAs become full-width stacked buttons with 12px gap; stat strip becomes a 3-column mono row at 11px; **star-field canvas never loads** (`client:media="(min-width: 768px)"`) — mobile keeps the static CSS star layer and the nebula gradients, which is indistinguishable in a screenshot and free.

### 9.7 Technical requirements, a11y, performance

**Technical.** `Hero.astro` (static) + `StarField.tsx` island (`client:idle` + `client:media`). Canvas is `position: fixed; inset: 0; z-index: 1; pointer-events: none`, sized to `min(devicePixelRatio, 1.5)`. Star data is generated from a seeded PRNG so the field is deterministic across reloads (a "random" sky that changes every reload feels broken).

**Accessibility.** `<h1>` contains the full accessible name "Hi, I'm Shubham Tiwari — Frontend Engineer" (the visual line break is `<span>`-based, not two headings). Canvas is `aria-hidden="true"` and `role="presentation"`. Corner ticks and rules are CSS pseudo-elements, invisible to AT. Stat strip is a `<dl>`. Contrast per §25.2: name ~16.4:1, lede ~7.3:1, mono eyebrow ~4.9:1 — all to be verified with a checker in Phase 1.

**Performance.** Hero ships **0KB of JS** for its content. LCP target ≤1.2s desktop / ≤1.8s mobile on 4G. The canvas island is ≤6KB gz, hydrates after idle, and never competes with LCP. No layout shift: portrait and stat strip have reserved dimensions. Budget: hero total (HTML+CSS+fonts+portrait) ≤180KB on desktop, ≤120KB on mobile.

---

## 10. Catalogued Worlds — Projects

The most important section on the site. Every decision here favours **evidence of engineering over visual effect** (P8).

**Narrative purpose.** The catalog of worlds this observer has found and mapped. Each project is a discovered world with a real data record.

**User objective.** Understand what was built, what the engineer's role was, what was hard, and what changed as a result — then reach a live demo, a repo, or a case study.

**Content (per world).** Catalog designation (`SHB-1b`), name, one-line summary, 40–80 word description, tech stack (3–6 tags), role, year, status (`LIVE` / `ARCHIVED` / `PRIVATE`), problem, approach, impact, live URL, repo URL, case-study slug, screenshots. From `portfolio-content.md`:

| ID | Project | Stack | Status | Link |
|----|---------|-------|--------|------|
| `SHB-1b` | **Payload CMS** — blog CMS with auth, admin dashboard, media management, analytics, PageSpeed testing, on-demand revalidation | Next.js, Tailwind, MongoDB, Node | LIVE | blazing-blogs-frontend.vercel.app |
| `SHB-2b` | **Gemini Zentauri** — AI content and image generation with a social feed interface | Next.js, Tailwind, MongoDB, Node | LIVE | gemini-ai-agent.vercel.app |
| `SHB-3b` | *"Static Websites"* — **not shippable as a project (C4)** | React, Next.js, Tailwind | — | none |

### 10.1 Featured world treatment

**Featured: `SHB-1b` Payload CMS.** Selection rule — feature the project with the most demonstrable engineering depth, not the trendiest. Payload CMS spans auth, an admin surface, media handling, analytics, and cache revalidation; that surface area supports a real case study. Gemini Zentauri is the strong second and gets a standard card.

Featured layout (≥1024px): full-width panel, asymmetric split — 7 columns of screenshot (16:10, hairline frame, corner ticks, subtle ion rim-light) and 5 columns of record. The record is a **data table**, not prose: designation, status pill, stack chips, role, year, then the 80-word summary, then two buttons (`OPEN LIVE ↗`, `READ CASE STUDY →`). The featured panel is 1.4× the height of a standard card and is the only project element allowed a background gradient wash.

`SHB-3b` is dropped from the section until C4 is resolved. Three cards where one is empty is worse than two strong cards. Its capabilities are represented in §14 instead.

### 10.2 Standard project cards

A 2-column grid ≥1024px, 1 column below. Each card is a single `<a>` wrapping the whole record — one focus stop, one hit target, native middle-click.

```text
┌────────────────────────────────────────┐
│  ⌐                                  ¬  │  corner ticks
│         ╭──────────╮                   │
│        │  procedural │   SHB-2b        │  sphere left, designation mono right
│        │    sphere   │   ● LIVE        │  status dot: ion=live, low=archived
│         ╰──────────╯                   │
│                                        │
│  Gemini Zentauri                       │  display-m, serif
│  AI content and image generation with   │  body, --text-mid, 3-line clamp
│  a social feed interface.              │
│                                        │
│  NEXT.JS  TAILWIND  MONGODB  NODE      │  mono chips, 11px, hairline borders
│  ─────────────────────────────────────  │
│  OPEN LIVE ↗              CASE STUDY → │
│  ⌏                                  ⌎  │
└────────────────────────────────────────┘
```

**The procedural sphere** is the project's "world": a CSS/SVG sphere built from a radial gradient (limb lighting + terminator), a hue derived deterministically from the slug hash, one thin elliptical ring on the featured world only, and a soft ion rim-light on hover. Zero image weight, infinitely scalable, and consistent with the metaphor. It is `aria-hidden`. **It is never the only identifier** — the name and designation are always text.

### 10.3 Case-study pages (`/worlds/[slug]`)

Static, one per project, generated from a content collection. Fixed structure so all case studies are comparable:

1. **Header** — designation, name, one-liner, status, year, stack, live/repo links.
2. **Hero screenshot** — 16:10, AVIF, priority-loaded (it is the LCP element on this route).
3. **Problem** — 80–150 words. What was broken or missing, and for whom.
4. **Approach** — 150–300 words. The engineering decisions and the trade-offs rejected. This is the section engineering managers actually read.
5. **Architecture** — one diagram (inline SVG, hand-authored, theme-aware) plus 3–6 bullets. No Mermaid runtime.
6. **Impact** — 2–4 metrics as large mono numbers with a plain caption. Honest: if there is no metric, write what improved qualitatively rather than inventing a number.
7. **Stack rationale** — a table: technology → why chosen → what it cost.
8. **Gallery** — 2–4 screenshots, lazy, in a hairline grid. No lightbox in v1 (a lightbox is a JS island for marginal value; images open in a new tab).
9. **Next / Prev world** — keeps the visitor in the catalog.

Route chrome: the right rail is replaced by `← SURVEY` (returns to `/#worlds`) plus an in-page section rail for the 9 blocks above on ≥1280px.

### 10.4 Filtering — deliberately deferred

**Do not build project filtering.** With 2–3 shippable projects, a filter UI is pure overhead: it adds an island, state, empty states, and URL-sync for a set a visitor can read in one glance. Revisit only at **≥6 projects**, and then implement it as static filtered pages (`/worlds/tag/[tag]`) or a `<details>`-based control rather than a client-state widget. Recorded here so a future agent does not "helpfully" add it.

### 10.5 Interaction and motion

- **Hover/focus (cards):** panel background `--surface-1` → `--surface-2`, hairline brightens 12% → 24%, sphere gains an ion rim-light and rotates 3° via `transform`, whole card lifts 2px. 200ms `--ease-ui`, `transform` and `opacity` only.
- **Entrance:** per §8.1 — featured panel first, then cards on a 60ms stagger.
- **Card → case study transition:** Astro View Transitions with `transition:name` shared between the card's sphere/title and the case-study header, so the world visually travels between routes. This is the single best justification for View Transitions in this project: it makes the multi-page architecture feel like one continuous space. Falls back to a plain navigation where unsupported, and is disabled under reduced motion.
- **Not allowed:** 3D tilt on cursor move, magnetic cursors, parallax inside cards, flip animations. Each costs jank and buys nothing.

### 10.6 Image and media strategy

- Formats: AVIF primary, WebP fallback, via Astro's `<Image />` / `astro:assets` at build time. No raw PNG/JPEG shipped.
- Sizes: card `640w`; case-study hero `1280w` + `1920w`; gallery `960w`. `sizes` set per breakpoint.
- Every image has explicit `width`/`height` (CLS 0) and meaningful `alt` describing the screen's content, not "screenshot of project".
- Budget: ≤120KB per card image, ≤200KB for a case-study hero, ≤700KB total per case-study route.
- Videos: none in v1. If a demo video is added later it must be a muted, `preload="none"`, poster-backed `<video>` behind a click-to-play — never autoplaying.

### 10.7 Loading states

The route is static HTML, so there is nothing to "load" for content — **no skeletons, no spinners**. Images reserve their box with a `--surface-2` fill and fade in over 200ms on decode. That is the entire loading design.

### 10.8 Responsive, accessibility, performance

**Responsive.** ≥1280px: featured 7/5 split + 2-col grid. 1024–1279px: featured stacks image over record, grid stays 2-col. 768–1023px: 1-col, sphere shrinks to 72px. <768px: 1-col, sphere inline at 56px beside the designation, stack chips wrap to 2 lines max then truncate with a `+2` chip, buttons full-width stacked.

**Accessibility.** Cards are `<article>` inside a `<ul>`; the anchor's accessible name is `"{name} — {one-liner}"`. Status is text (`LIVE`), never a color-only dot. Stack chips are a `<ul>` with a visually-hidden "Built with" label. `↗` icons are `aria-hidden` with a visually-hidden "(opens in a new tab)". Case-study headings form a correct h1→h2 outline. Spheres are decorative and hidden from AT.

**Performance.** Zero JS in the section (all hover is CSS; View Transitions are browser-native). Card images lazy except the featured one when it is above the fold at ≥1280px. Section budget: ≤260KB desktop, ≤140KB mobile.

---

## 11. The Atlas — Skills

**Narrative purpose.** A star chart of the technologies this observer has actually operated. Constellations group related tools; a star's **magnitude encodes depth of experience** — in astronomy, magnitude is literally how brightly something registers to an observer, which makes this the one place where the space metaphor carries real information rather than decoration (P2).

**User objective.** In ~10 seconds, determine stack overlap and whether depth claims are credible.

### 11.1 Fixing the data model first

The source data is 23 skills with self-assigned percentages. **Percentages are the "React ⭐⭐⭐⭐⭐" problem in a different costume** — nobody believes "TypeScript 88%", and the 7-point gap between 95% and 88% communicates nothing. Replace them with three honest, named tiers, and keep the underlying number only as a sort key.

| Tier | Label shown | Source % | Visual magnitude | Count |
|------|------------|----------|-----------------|-------|
| 1 | **CORE** — daily, can debug deeply, would defend design decisions | ≥88 | r=7, strong glow, label always visible | 10 |
| 2 | **WORKING** — shipped production work, comfortable without hand-holding | 78–87 | r=5, soft glow, label on hover/focus + in list | 11 |
| 3 | **FAMILIAR** — used, functional, would need a ramp-up | <78 | r=3, no glow, label in list only | 2 |

Resulting assignment: **Core** — HTML, CSS, JavaScript, React, Git (95), Tailwind (92), Node.js, AI-assisted development, Tooling & linting (90), TypeScript (88). **Working** — Next.js, Payload CMS, REST APIs, Figma (85), Astro, Express, Vercel, Playwright, Performance, Accessibility, SEO (80). **Familiar** — MongoDB (75), Docker (60).

Two content corrections while implementing:

- **"AI — 90%"** is not a technology. Rename to **"AI-assisted development"** and, better, make it specific to the evidence: LLM API integration (the Gemini Zentauri project) belongs in the Substrate constellation as *"Gemini / LLM APIs"*.
- **"Linting & Formatting — 90%"** is a practice, not a tool. Rename to **"ESLint / Prettier"** so it sits honestly beside Git and Vercel.

### 11.2 Constellations

Three constellations, each with a codename and a plain label:

| Constellation | Plain label | Members |
|--------------|-------------|---------|
| **INTERFACE** | Frontend | HTML, CSS, JavaScript, TypeScript, React, Next.js, Astro, Tailwind CSS |
| **SUBSTRATE** | Backend & data | Node.js, Express, REST APIs, Payload CMS, MongoDB, Gemini / LLM APIs |
| **OPERATIONS** | Tooling, quality & delivery | Git, Vercel, Docker, Figma, ESLint / Prettier, Playwright, Performance, Accessibility, SEO |

**Star positions are hand-authored, not random.** Each skill carries fixed `{x, y}` coordinates in the data file. A randomly generated constellation looks like noise and changes between reloads, which reads as a bug. Hand-placed stars let related tools sit near each other and let the three constellations occupy visually distinct regions.

**Constellation lines encode real relationships**, not decoration: React→TypeScript, React→Next.js, React→Astro, Next.js→Vercel, Node.js→Express, Express→REST APIs, Payload CMS→MongoDB, Playwright→Accessibility. A visitor tracing a line learns something true about the stack. Lines are 1px, `--hairline`, and never cross constellation boundaries except at one deliberate bridge (Next.js→Vercel) that shows frontend meeting delivery.

### 11.3 Visual composition — map plus list, both always present

This is the section's key decision: **the star map and a plain grouped list coexist on desktop; the list is the source of truth.**

```text
┌───────────────────────── 7 cols ──────────────┬────── 5 cols ────────┐
│  THE ATLAS · 23 ENTRIES · 3 CONSTELLATIONS    │  ○ CORE (10)         │
│                                               │    JavaScript        │
│      ·  ✦ React                               │    React             │
│    ✦ TypeScript    ✦ Next.js                  │    TypeScript   …    │
│         ·      ✦ Tailwind                     │                      │
│   ─── INTERFACE ───                           │  ○ WORKING (11)      │
│                                               │    Next.js           │
│         ✦ Node.js   · Express                 │    Astro        …    │
│   ─── SUBSTRATE ───                           │                      │
│                                               │  ○ FAMILIAR (2)      │
│      ✦ Git    · Playwright                    │    MongoDB           │
│   ─── OPERATIONS ───                          │    Docker            │
└───────────────────────────────────────────────┴──────────────────────┘
```

The map gives shape and memorability; the list gives scannability and is what a recruiter's eye actually uses. Hovering or focusing a star highlights its list row and vice versa — a two-way link that makes the map *useful* rather than ornamental. The list is grouped by tier (not by constellation) because "how deep" is the question a reader has; each row shows its constellation as a small mono suffix.

Section eyebrow: `THE ATLAS · 23 ENTRIES · 3 CONSTELLATIONS` — counts computed from data at build time.

### 11.4 Readable without interaction — the accessibility core

The brief requires that skill visualisation work with no interaction. Guarantees:

1. **Every skill name exists as real text in the DOM at all times** in the grouped list. The SVG map is supplementary.
2. **Core-tier star labels are always rendered** in the map — no hover needed for the 10 most important entries.
3. The SVG is `role="img"` with an `aria-label` summarising it ("Star chart of 23 technologies in 3 groups"), and its interactive stars are excluded from the tab order (`focusable="false"`, `aria-hidden="true"`) because **the list provides the accessible path**. Duplicating 23 tab stops would be hostile; one canonical interactive path is correct.
4. Tier is conveyed by **text label, not by size or glow alone** — `CORE`, `WORKING`, `FAMILIAR` are written words in the list headers.
5. With CSS disabled, the output is three headed lists of technologies. With JS disabled, everything above still holds.
6. **Mobile drops the SVG map entirely** and renders only the grouped list with a slim tier bar — no loss of information, no canvas cost.

### 11.5 Interaction, motion, technical, performance

**Interaction.** Star hover/focus: radius +2px, glow intensifies, label fades in, connected lines brighten to 24% alpha, matching list row gets an ion left-bar. List row hover: the matching star pulses once. Both directions are handled by one small island using `data-skill` attributes and a single delegated listener — no per-star React components.

**Motion.** Stars twinkle: opacity oscillation between 0.75 and 1 on individually randomised 3–6s loops, CSS only, `will-change` never set (23 elements × will-change is a memory leak). Constellation lines draw in on entrance via `stroke-dashoffset` over 900ms with a 40ms stagger, once. All twinkle and draw-in motion is removed under reduced motion (static full-opacity stars and solid lines).

**Technical.** `Atlas.astro` renders both the SVG (server-side, from the data file) and the list — so the map is in the initial HTML and needs no JS to appear. `AtlasLink.tsx` island (`client:visible`, ≤3KB) adds only the two-way highlight. `viewBox="0 0 800 600"` with `preserveAspectRatio`; all coordinates authored in that space.

**Responsive.** ≥1280px: 7/5 map + list. 1024–1279px: 6/6, map labels reduce to Core only. 768–1023px: map above list, full width, height 380px. <768px: **list only**.

**Performance.** SVG is ~8KB of markup, gzips to ~2KB. One island ≤3KB gz. No canvas, no WebGL, no images. Twinkle animations are compositor-only (`opacity`). Section budget: ≤15KB total.

---

## 12. Trajectory — Experience

**Narrative purpose.** The flight path so far: a continuous trajectory with **burn events** — the moments where deliberate effort changed the vehicle's course. Each achievement is a burn.

**User objective.** Verify that the experience is real, scoped, and consequential; find dates, employers, and measurable outcomes quickly.

### 12.1 Data model and the C1 problem

The source content lists **7 achievements with no employer, title, or dates**. That gap is disqualifying for a recruiter — an experience section without dates reads as concealment. It must be filled (C1).

Design the component for the correct shape from the start, so filling C1 requires no rework:

```text
Position
├── company, role, employmentType
├── startDate, endDate | "present"
├── location, mode (remote/hybrid/onsite)
├── summary (1 sentence)
├── technologies[]
└── achievements[]   ← the 7 existing entries map in here
    ├── title
    ├── description
    ├── metric?  { value, unit, label }   e.g. { 80, "%", "faster publishing" }
    └── technologies[]
```

Mapping of the existing 7 achievements: *Next.js platform modernization*, *Headless CMS & delivery* (metric: ~80% faster publishing — verify, C5), *Multi-brand CMS setup*, *Playwright automation suite*, *Cross-team collaboration*, *Database schema & migrations*, *Legacy JSP maintenance*. These describe one coherent role and should sit under a single position until C1 says otherwise.

**Interim rendering rule:** if `company` is absent, render the position header as the role plus date range only, and never emit an empty label or a placeholder like "Company Name". If dates are absent too, render the spine with achievements only and suppress the header entirely — degraded but never broken.

### 12.2 Visual composition

**Desktop (≥1024px):** a single vertical **spine** at the left of the content column — a 2px line with a subtle ion gradient — carrying a marker per burn event. Each event is a panel to the right of the spine at a consistent offset. The spine is gently curved (an SVG path with a ~40px horizontal drift over the section's height) so it reads as an arc rather than a ruler; markers sit exactly on the path.

Per event: mono index (`BURN 01`), title in `display-m` serif, 1–2 line description, a metric block when present (mono `80%` at `display-l` in ember, with a plain caption beneath), and technology chips. Position headers interrupt the spine with a wider node, the company and role in `display-m`, and a mono date range.

**Mobile (<768px):** the spine becomes a **straight 1px vertical line inset 16px**, markers become 8px dots, panels become full-width with no offset. No curve, no SVG path — a border-left on a flex column. Identical information, a tenth of the cost.

### 12.3 Motion, and how it works without heavy JS

The only motion is the spine drawing itself as the section scrolls into view, plus the standard §8.1 entrance for each event panel.

Implementation, in preference order:

1. **CSS scroll-driven animation** — `animation-timeline: view()` on `stroke-dashoffset` (desktop) or `scaleY` (mobile). Zero JS, runs off the main thread, correct by construction.
2. **Fallback where unsupported** — the spine renders **fully drawn** and static. Not a JS polyfill; the static state is a designed state (P7).
3. Event panels use the shared `IntersectionObserver` entrance utility already needed by §8.1 — no per-section scroll listener, ever.

**Mobile explicitly gets no scroll-linked animation** — the spine is fully drawn from the start. Rationale: scroll-linked work on low-end Android is the most common source of dropped frames in portfolios like this, and the effect is nearly invisible on a 6-inch screen. Under reduced motion, the spine is static everywhere and panels appear instantly.

### 12.4 Technical, accessibility, performance

**Technical.** `Trajectory.astro` (static) + one shared entrance utility. SVG path is authored in a `viewBox` and scales; markers are positioned with `offset-path` where supported, otherwise absolute percentages computed at build time from the data length.

**Accessibility.** `<ol>` of positions, each containing an `<ol>` of achievements — the DOM order *is* the chronology, so screen readers get the timeline for free. `<time datetime>` on every date. Metrics are `<p><strong>80%</strong> faster publishing</p>`, so the number is never orphaned from its meaning. The spine SVG is `aria-hidden`. Headings: position = `h3`, achievement title = `h4`.

**Performance.** Zero JS beyond the shared observer (~1KB, amortised). SVG ≤3KB. Section budget ≤20KB. No images.

---

## 13. Observer's Log — About

**Narrative purpose.** The observer's own field notes. This is the only section allowed to be personal, and the only one written in a human voice rather than an instrument's.

**User objective.** Decide whether this is someone they would want on their team — judged on how the person thinks, not on what they list.

### 13.1 Content model and the anti-generic rules

The source copy fails on specificity: *"I'm a passionate Frontend Engineer… I love turning complex problems into simple, elegant solutions"* and *"When I'm not coding, you can find me exploring new technologies"* could be pasted into ten thousand portfolios. It must be rewritten (C7).

**Hard rules for this section's copy:**

1. Ban the words **passionate**, **love what I do**, **turning complex problems into elegant solutions**, **detail-oriented**, **think outside the box**, and **coffee**.
2. Every paragraph must contain at least one **verifiable specific** — a technology, a number, a decision, or a named thing.
3. Include one **opinion** that a reasonable engineer could disagree with. This is what makes a person legible.
4. Include what is being learned **right now** and what they want to work on **next**. Recruiters read this as trajectory, and it dates the page honestly.
5. Maximum 180 words of prose. The section earns interest through density, not length.

**Content model:** `philosophy` (one pull-quote sentence), `prose` (2 short paragraphs, ≤180 words total), `fieldNotes` (5–7 label/value pairs), `openQuestions` (2–4 items — what they want to work on next), `portrait`, `interests` (3–5 short items).

Field notes are real data, from the source content plus C8: `LOCATION India`, `TIMEZONE IST · UTC+5:30`, `EXPERIENCE 3+ years`, `FOCUS Frontend platforms, performance, accessibility`, `CURRENTLY Astro, design systems`, `WRITES AT dev.to/shubhamtiwari909`, `OPEN TO Frontend / platform roles`.

### 13.2 Visual composition

Two columns ≥1024px (5/7). Left: portrait in a hairline frame with corner ticks, and beneath it the **field notes** as a mono `<dl>` — label in `--text-low`, value in `--text-hi`, hairline between rows. It looks like an instrument's metadata panel and gives the section its scientific register.

Right: the **philosophy pull-quote** in Instrument Serif italic at `display-m` with an ion vertical rule to its left; then the two prose paragraphs at `body-l`; then `OPEN QUESTIONS` — 2–4 items as a mono list with `→` markers, each one thing the observer wants to point the telescope at next. The existing tag row (`TypeScript · React · Design systems · A11y · Performance`) becomes small mono chips beneath the prose.

The `OPEN QUESTIONS` block is the section's distinctive move: it converts the usual "I'm always learning" cliché into a specific, dated, forward-looking list — and it gives an interviewer an obvious opening question, which is exactly what a candidate wants.

### 13.3 Interaction, motion, technical, responsive, a11y, performance

**Interaction.** Almost none, deliberately — this is a reading section. Only the dev.to field-note value and the open-question items are links; standard hairline-underline hover.

**Motion.** §8.1 entrance only. The pull-quote's ion rule draws downward over 560ms as a single accent. Nothing else moves. No text-scramble, no typewriter effect (both delay reading and break screen readers).

**Technical.** Fully static `.astro`. Portrait via `astro:assets` → AVIF/WebP at 480w and 720w. Zero JS.

**Responsive.** ≥1024px 5/7 split. 768–1023px: portrait 200px left-floated with field notes below the prose. <768px: portrait 140px circular centered, then philosophy, prose, field notes as a 2-column mono grid, then open questions.

**Accessibility.** Pull-quote is a `<blockquote>`. Field notes are a real `<dl>`. Portrait `alt` is `"Shubham Tiwari"` (a portrait's alt is the person's name, not a description of the photo). Prose sits at ≤68ch for readability. Contrast on `--text-mid` prose is ≥8:1.

**Performance.** Portrait ≤60KB AVIF at 720w. Section budget ≤80KB. Zero JS.

---

## 14. Instrument Bay — Engineering Showcase (`/instruments`)

**Narrative purpose.** The instruments this observatory built for itself. Not products — *the tools and systems behind the products*. This is where the portfolio proves the difference between assembling and engineering.

**User objective.** For a senior engineer or hiring manager: see evidence of building primitives, testing systems, and architecture — not just screens.

### 14.1 Replacing the old "UI Showcase"

The current site's UI Showcase is nine icon chips (`Dashboards`, `Responsive Websites`, `E-commerce`, `Landing Pages`, `Admin Panel`, `Portfolio`, `CMS Websites`, `AI Websites`, `Blogs`). These are **unevidenced claims** — the weakest content on the site, and shuffling them with a button adds motion without meaning. Reframe:

- The nine categories become a modest, honestly-labelled **capability index** strip at the bottom of the route: `CATEGORIES OF WORK DELIVERED`, plain mono chips, no icons, no shuffle. Stated as scope, not as portfolio pieces.
- The section's substance becomes **four real instruments**, each backed by artifacts that already exist in the owner's history.

### 14.2 The four instruments

| # | Instrument | What it demonstrates | Existing evidence |
|---|-----------|---------------------|-------------------|
| I-01 | **Component library** — Tailwind v4 + Framer Motion + typed hooks | API design, typing, animation systems, DX | Already written up: the Apr 2026 dev.to article. Link it, and embed 3–4 live component demos. |
| I-02 | **Playwright automation suite** — E2E, API, snapshot, a11y, link validation, auth flows | Testing strategy and release confidence | Trajectory achievement #4. Present the coverage matrix and one annotated example spec as a code excerpt. |
| I-03 | **Multi-brand monorepo CMS** — Next.js + Payload + PostgreSQL across brands | Architecture, code reuse, onboarding cost | Trajectory achievements #2 and #3. One SVG architecture diagram plus the reuse/onboarding outcome. |
| I-04 | **Orbit** — an interactive n-body simulation | Canvas/rAF engineering, perf discipline, graceful degradation | Built for this site (§14.3). |

Each instrument is a panel: designation, name, one-line claim, 60–120 word explanation, a **live demo or a diagram or a code excerpt** (never all three), and links out. Code excerpts are build-time highlighted (Shiki, via Astro's built-in support) — static HTML, no client-side highlighter.

### 14.3 The one experiment — `I-04 Orbit`

**Exactly one interactive experiment exists on this site.** More than one turns a portfolio into a toy box.

**Chosen: an n-body orbit simulation on Canvas 2D.** ~200 bodies, semi-implicit Euler integration, softened gravity, seeded initial conditions, cursor acting as an optional attractor. It renders as trailing light paths over the void — visually cohesive with the rest of the site because it is literally orbital mechanics.

**Why Canvas 2D and not WebGL/R3F:** 200 bodies with trails is comfortably inside Canvas 2D's budget, and the honest answer to "why not WebGL" is that it isn't needed — which is itself the engineering point the section is making (P6). WebGL/R3F remains an explicitly optional Phase 5b item, to be taken **only** if the effect proves impossible in Canvas, and it must then be desktop-only, lazily imported, and under 120KB gz.

**The experiment displays its own instrumentation** — live FPS, body count, frame time, and DPR — as mono readouts beside the canvas. This is both thematically perfect (an instrument reporting its own telemetry) and a genuine Phase 5 performance demonstration.

**Strict boundaries** (from the brief, made concrete):

- Lives only on `/instruments`. **Never on the home route.**
- `client:visible` **and** `client:media="(min-width: 1024px)"` — never downloaded on phones or tablets.
- Hard-capped: 200 bodies, DPR ≤1.5, canvas ≤1200×700 CSS px.
- rAF loop stops on `IntersectionObserver` exit and on `document.visibilitychange`. Never runs unseen.
- Auto-degrades: if rolling mean frame time exceeds 20ms for 2 seconds, halve the body count; if it exceeds 26ms again, stop and show the static poster.
- Under `prefers-reduced-motion`, it does not start: a static rendered poster frame appears with a `START SIMULATION` button, so the choice stays with the user.
- Below 1024px: static poster image plus a one-line description. No canvas, no JS.
- It is never a navigation surface and never covers content.
- Total island budget ≤12KB gz.

### 14.4 Home-route teaser

The home route carries only a compact **Instrument Bay** teaser: eyebrow, `h2`, one lede line, four mono rows (`I-01 … I-04` with names and one-line claims), and `OPEN INSTRUMENT BAY →`. Zero JS, ≤6KB. All weight stays on `/instruments`.

### 14.5 Responsive, accessibility, performance

**Responsive.** ≥1024px: 2-col instrument grid; Orbit full-width with side readouts. 768–1023px: 1-col; Orbit → poster. <768px: 1-col; code excerpts scroll horizontally in their own `overflow-x: auto` container (the page never scrolls sideways); Orbit → poster.

**Accessibility.** Each instrument is an `<article>` with an `h3`. Canvas is `aria-hidden` with a real text description of what the simulation shows immediately adjacent — the accessible equivalent of the visual (a hard requirement from §19 of the brief). The `START SIMULATION` control is a real `<button>` with `aria-pressed`. Code excerpts are inside `<pre><code>` with a language label and are focusable for keyboard scrolling. Telemetry readouts are `aria-live="off"` (constantly-changing numbers must never be announced).

**Performance.** Route budget: ≤160KB gz JS total (of which Orbit ≤12KB and the rest is the React runtime shared with the home route's islands), ≤400KB images. The route must still hit Lighthouse Performance ≥90 on mobile, which is achievable precisely because the experiment never loads there.

---

## 15. Uplink — Contact

**Narrative purpose.** The communications array — the point where the visitor transmits back.

**User objective.** Contact the engineer with zero friction, and know whether they are available.

### 15.1 Decision: no contact form

**Recommended: email-first, no form.** A form requires a serverless endpoint, spam protection, delivery monitoring, success/error states, and validation — new failure modes and a maintenance surface for a page that gets a handful of submissions. Recruiters overwhelmingly prefer email or LinkedIn, and a `mailto:` plus a copy button never breaks. Deferred to §37 Future Enhancements should volume ever justify it.

### 15.2 Content and composition

Content: availability status line, email (`shubhmtiwri00@gmail.com`), copy-to-clipboard control, timezone and typical response time (C8), `LOCATION India`, three professional links (GitHub, LinkedIn, dev.to), and a final résumé CTA.

Composition: a centered panel, max-width 720px, with the strongest corner-tick treatment on the site — this is the last thing seen and should feel like the most solid object on the page.

```text
        UPLINK · IST UTC+5:30 · TYPICAL REPLY < 24H

              Let's build something
                    together.

        ● OPEN TO FRONTEND / PLATFORM ROLES

        ┌────────────────────────────────────────┐
        │  shubhmtiwri00@gmail.com        COPY   │
        └────────────────────────────────────────┘

        GITHUB ↗     LINKEDIN ↗     DEV.TO ↗

              DOWNLOAD RÉSUMÉ ↓
```

The heading replaces the source's *"Available for global strategic collaborations"* — which is vague corporate phrasing — with a concrete availability statement. The status dot is ion when open, `--text-low` when not, **always accompanied by text** (never color-only).

### 15.3 Interaction, motion, technical, a11y, performance

**Interaction.** The email row is an `<a href="mailto:">`; `COPY` is a separate `<button>` beside it (never nested inside the link). On copy: the label swaps to `COPIED ✓` in ion for 2s, then reverts. On `navigator.clipboard` failure, the button selects the email text instead and the label reads `SELECTED — PRESS ⌘C`. Fires `uplink_copy_email`.

**Motion.** §8.1 entrance. The copy confirmation is a 200ms crossfade — no toast, no bounce.

**Technical.** `CopyEmail.tsx`, `client:visible`, ≤1.5KB gz. Everything else static. Email is rendered as plain text in the HTML (obfuscation breaks copy/paste and screen readers for negligible spam benefit; the address is already public on GitHub and dev.to).

**Accessibility.** Button has `aria-label="Copy email address"`; the confirmation is announced via a polite live region that is empty until the copy occurs. Focus never moves on copy. Contrast on the ion confirmation ≥7:1. Touch targets ≥44px.

**Performance.** ≤2KB total JS. No images.

### 15.4 Footer

Below Uplink: a hairline-topped footer with `SHUBHAM TIWARI` wordmark, `© 2026 · Crafted with precision.` (retained from the source — it is specific and earns its place), the four social links, and a mono build stamp `BUILD {date} · ASTRO` computed at build time. The build stamp is a small, honest engineering signal that costs nothing.

---

## 16. Motion System

### 16.1 Global principles

1. **Mass, not snap.** Entrances decelerate on `--ease-out-expo`. UI feedback uses `--ease-ui`. Ambient loops are `linear` (physical drift has no easing).
2. **Compositor only.** Animate `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, `filter` on scroll, or `box-shadow` on large elements. The two sanctioned exceptions are `stroke-dashoffset` (SVG line draw, compositor-friendly enough at these sizes) and a one-shot `filter: blur()` on the hero sky reveal.
3. **One purpose per animation.** Before adding motion, name which purpose it serves: hierarchy, feedback, spatial continuity, information reveal, storytelling, or memorability. If none applies, it is decoration — cut it.
4. **Never replay.** Entrance animations fire once, on first intersection. Re-animating on scroll-back is the most common way portfolios become exhausting.
5. **No motion gates.** Nothing waits for an animation to finish before becoming readable or clickable.
6. **`will-change` is a last resort.** Applied to at most one element at a time (the hero sky during reveal), removed after.
7. **Budget:** ≤4ms of main-thread work per frame for all ambient motion combined.

### 16.2 Motion hierarchy

| Level | Name | What | Where used | Cost ceiling |
|-------|------|------|-----------|-------------|
| **L1** | Ambient | Star drift + twinkle, nebula gradient drift | The single persistent background layer only | 1 canvas, ≤4ms/frame, paused when hidden |
| **L2** | Interaction | Hover, focus, active, copy confirmation | Every interactive element | ≤200ms, CSS only |
| **L3** | Navigation | Section entrances, rail active state, spine draw, scroll-linked parallax | Section boundaries, nav | ≤560ms, once per element |
| **L4** | Storytelling | Hero first-light reveal, cross-route View Transitions | Hero (once per load), route changes | ≤900ms, ≤2 occurrences per session |

**Where each level is allowed.** L1 exists exactly once, site-wide. L2 is everywhere and is the only level allowed to respond to input. L3 fires once per element per page load. L4 is reserved for the two moments that define the experience — arrival, and travelling to a world.

**Explicitly forbidden:** L4-scale motion at L2 frequency (e.g. cinematic transitions on every hover), text scramble/typewriter effects, cursor followers, magnetic buttons, 3D card tilt, scroll-snap on the home route, and any animation that moves an element more than 24px on entrance.

### 16.3 Specification values

| Motion | Duration | Easing | Delay/Stagger | Trigger |
|--------|----------|--------|---------------|---------|
| Hero first-light reveal | 700ms | `--ease-out-expo` | 120ms initial | Page load (CSS) |
| Hero child stagger | 560ms | `--ease-out-expo` | 60ms per child | Page load (CSS) |
| Section entrance | 560ms | `--ease-out-expo` | 60ms per child | IntersectionObserver, 20% visible, once |
| Hover / focus | 200ms | `--ease-ui` | 0 | CSS `:hover`, `:focus-visible` |
| Copy confirmation | 200ms in, 2000ms hold, 200ms out | `--ease-ui` | 0 | Click |
| Rail active change | 320ms | `--ease-ui` | 0 | Scroll-spy |
| Spine draw | scroll-linked | linear | 0 | `animation-timeline: view()` |
| Star parallax (hero only) | scroll-linked | linear | 0 | `animation-timeline: scroll()` or passive rAF |
| Constellation line draw | 900ms | `--ease-out-expo` | 40ms per line | First intersection, once |
| Star twinkle | 3000–6000ms | linear | randomised per star | Infinite loop (L1) |
| Nebula drift | 24s–36s | linear | 0 | Infinite loop (L1) |
| View Transition (route) | 320ms | `--ease-ui` | 0 | Navigation |

### 16.4 Reduced motion, mobile, and low-power

**`prefers-reduced-motion: reduce`** — implemented as one global rule plus per-component opt-ins, never forgotten per-component:

- L1: **off entirely.** The star-field canvas does not hydrate; the static CSS star layer is final. Nebula gradients are static.
- L2: retained but reduced to 120ms opacity/color changes. Feedback must survive — removing it harms usability.
- L3: replaced by a single 200ms opacity fade with no transform and no stagger. Parallax off. Spine renders fully drawn.
- L4: off. Hero renders final-state immediately; View Transitions disabled.
- Smooth anchor scrolling off (instant jumps).
- The Orbit experiment does not auto-start; it shows a poster and a `START SIMULATION` button.

**Mobile (<768px)** — motion reduction independent of user preference: no canvas, no parallax, no scroll-linked animation, entrances shortened to 320ms with 40ms stagger. Rationale: scroll-linked and canvas work on low-end Android is the top cause of jank, and the effects are barely perceptible at that size.

**Low-power / low-end detection** (desktop and tablet only, applied at island init):

```text
if (prefers-reduced-motion) → static, no canvas
else if (navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4) → 400 stars, 30fps cap, no parallax
else if (viewport < 768px) → no canvas
else → 900 stars, 60fps, parallax on
```

Plus runtime degradation: if rolling mean frame time exceeds 20ms for 2s, halve the star count once; if it exceeds 26ms again, stop the loop and keep the last frame. Degradation is one-way per session — never oscillate.

---

## 17. Visual System

### 17.1 The background system (the "cosmos")

One system, mounted once in the base layout, fixed, behind everything, on every route.

| Layer | z | Implementation | Cost | Mobile |
|-------|---|---------------|------|--------|
| Void | 0 | `background: var(--color-void)` on `<body>` | 0 | Same |
| Nebula | 1 | 2 large `radial-gradient`s (plasma at 6% alpha top-left, ion at 4% alpha bottom-right), each drifting via a 24–36s `transform: translate3d` loop | ~0 | Static, no drift |
| Static stars | 2 | Pre-rendered CSS: 3 tiled `radial-gradient` dot layers at 3 sizes/opacities. Always present. | ~0 | **This is the entire star field on mobile** |
| Live stars | 2 | Canvas 2D island, cross-fades over the static layer on hydration | ≤4ms/frame | Not loaded |
| Grain | 3 | 128×128 tiling PNG (~2KB) at 3% opacity, `pointer-events: none` | ~2KB | Same |

The static-star layer is the reason this system degrades perfectly: the live canvas is a *refinement*, never a requirement. If it fails to hydrate, is blocked, or is skipped for preference/viewport reasons, the sky still looks intentional.

### 17.2 Panels, hairlines, corner ticks

- **Panel:** `background: color-mix(in oklab, var(--color-surface-1) 72%, transparent)`, `backdrop-filter: blur(12px)`, 1px `--color-hairline` border, `--radius-panel`. Inside `@supports not (backdrop-filter: blur(1px))`, the background becomes fully opaque `--color-surface-1`. Under `prefers-reduced-transparency: reduce`, also fully opaque.
- **Hairline:** 1px, `--color-hairline` (ion at 12% alpha). Brightens to 24% on hover/focus of its container. This single behaviour carries most of the site's interactivity feel.
- **Corner ticks:** 8px L-shaped marks inset 8px at panel corners, drawn with two `::before`/`::after` pseudo-elements using `border-top`/`border-left` etc. Three intensities: subtle (cards), standard (featured, about, uplink), strong (hero portrait frame). This motif is the site's signature and costs zero bytes.
- **Dividers:** 1px linear-gradient fading from transparent → hairline → transparent, so section edges dissolve rather than cut.

### 17.3 Typography rules

| Role | Family | Size token | Weight | Tracking | Case |
|------|--------|-----------|--------|----------|------|
| Hero name | `--font-display` | `--text-display-xl` | 400 | -0.02em | As written |
| Section title | `--font-display` | `--text-display-l` | 400 | -0.01em | As written |
| Sub-heading | `--font-display` | `--text-display-m` | 400 | 0 | As written |
| Body | `--font-body` | `--text-body` / `--text-body-l` | 400 | 0 | As written |
| Eyebrow / label | `--font-mono` | `--text-label` | 500 | 0.14em | UPPERCASE |
| Data / chips / dates | `--font-mono` | `--text-data` | 400 | 0.04em | UPPERCASE for labels, as-written for values |
| Metric numbers | `--font-mono` | `--text-display-l` | 500 | 0 | — |

Rules: mono uses `font-variant-numeric: tabular-nums` everywhere numbers align. Prose max 68ch. Display type never exceeds 2 lines at any breakpoint (verify at 320px). No text glow below `--text-display-m`. No letter-spacing on body copy. Serif italic is reserved for the About pull-quote — used once, so it stays special.

### 17.4 Component visual states

Every interactive element defines all six states; a missing state is a bug: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading` (only where async exists — currently only the copy button).

**Primary button:** `--color-surface-2` fill, 1px ion hairline at 40%, ion text, `--shadow-glow-1`. Hover: hairline 70%, `--shadow-glow-2`, translate -1px. Focus-visible: 2px ion ring, 2px offset. Active: translate 0, glow back to tier 1.
**Secondary button:** transparent fill, hairline border, `--color-ink-hi` text. Hover: `--color-surface-1` fill, hairline brightens.
**Link (inline):** ion text, 1px underline at 40% alpha, `text-underline-offset: 3px`. Hover: underline to 100%.
**Chip:** `--radius-chip`, hairline border, `--color-ink-mid` mono text, no hover state (chips are not interactive).

---

## 18. Design Tokens

Implemented in `src/styles/global.css` using Tailwind v4's CSS-first `@theme` block. **No `tailwind.config.js`** — v4 does not need one, and adding one splits the source of truth.

### 18.1 Naming and the alias note

Tailwind v4 reserves namespaces: `--color-*`, `--font-*`, `--text-*` (font size), `--spacing-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--breakpoint-*`, `--container-*`, `--animate-*`. Text **colors** must therefore be `--color-ink-*`, not `--text-*` — `--text-hi` would generate a font-size utility called `text-hi` and collide.

Earlier chapters of this document use readable shorthand. Canonical mapping:

| Shorthand used above | Canonical token |
|---------------------|-----------------|
| `--ion`, `--plasma`, `--ember` | `--color-ion`, `--color-plasma`, `--color-ember` |
| `--text-hi`, `--text-mid`, `--text-low` | `--color-ink-hi`, `--color-ink-mid`, `--color-ink-low` |
| `--surface-1`, `--surface-2` | `--color-surface-1`, `--color-surface-2` |
| `--hairline` | `--color-hairline` |

### 18.2 Token set

```text
COLOR — void & surfaces
--color-void          #04060D    page ground
--color-surface-0     #080C16    lowest panel
--color-surface-1     #0D1322    default panel
--color-surface-2     #141C2E    raised / hover panel

COLOR — ink
--color-ink-hi        #EAF0FA    headings, key values      (~16.4:1 on void)
--color-ink-mid       #9BA8C2    body copy                 (~7.3:1 on surface-0)
--color-ink-low       #7C89A5    labels, captions          (~4.9:1 on surface-0)

COLOR — accents (one job each)
--color-ion           #7DE2FF    interactive, live, active, focus   (~13:1 on void)
--color-plasma        #A78BFA    narrative & nebula, non-interactive
--color-ember         #FFB454    primary CTA, metrics, "you are here" (~10.9:1 on void)
--color-danger        #FF8080    errors only

COLOR — derived
--color-hairline      color-mix(in oklab, var(--color-ion) 12%, transparent)
--color-hairline-hi   color-mix(in oklab, var(--color-ion) 24%, transparent)

FONT
--font-display  "Instrument Serif", "Iowan Old Style", Georgia, serif
--font-body     "Inter Variable", system-ui, -apple-system, sans-serif
--font-mono     "JetBrains Mono", ui-monospace, SFMono-Regular, monospace

TYPE SCALE (fluid)
--text-label       0.75rem     / 1.4  / 0.14em tracking
--text-data        0.8125rem   / 1.5
--text-body        1rem        / 1.65
--text-body-l      1.125rem    / 1.7
--text-display-s   clamp(1.25rem, 1.2vw + 1rem, 1.5rem)   / 1.3
--text-display-m   clamp(1.5rem, 2vw + 1rem, 2.25rem)     / 1.2
--text-display-l   clamp(2.25rem, 4vw + 1rem, 4rem)       / 1.08
--text-display-xl  clamp(3rem, 7vw + 1rem, 7rem)          / 0.95

SPACING — Tailwind's 0.25rem base scale, plus semantic:
--spacing-section  clamp(6rem, 12vh, 10rem)   section padding-block
--spacing-gutter   clamp(1rem, 4vw, 2.5rem)   horizontal page gutter
--nav-h            4rem                        fixed top bar height
--rail-w           3rem                        right rail width
--tabbar-h         3.5rem                      mobile bottom bar

RADIUS
--radius-chip   2px      --radius-card   8px
--radius-panel  16px     --radius-pill   999px

SHADOW / GLOW
--shadow-glow-1  0 0 12px -2px color-mix(in oklab, var(--color-ion) 40%, transparent)
--shadow-glow-2  0 0 24px -4px color-mix(in oklab, var(--color-ion) 55%, transparent)
--shadow-glow-3  0 0 48px -8px color-mix(in oklab, var(--color-ember) 45%, transparent)
--shadow-panel   inset 0 1px 0 0 color-mix(in oklab, var(--color-ion) 8%, transparent)

MOTION
--duration-instant 120ms   --duration-fast 200ms      --duration-base 320ms
--duration-slow    560ms   --duration-cinematic 900ms --duration-ambient 24s
--ease-out-expo    cubic-bezier(0.16, 1, 0.3, 1)
--ease-ui          cubic-bezier(0.4, 0, 0.2, 1)
--ease-soft        cubic-bezier(0.65, 0, 0.35, 1)
--stagger          60ms

Z-INDEX (plain custom properties, not a Tailwind namespace)
--z-void 0   --z-nebula 1   --z-stars 2   --z-grain 3
--z-content 10   --z-rail 40   --z-nav 45   --z-overlay 60   --z-skip 90

BREAKPOINTS — keep Tailwind v4 defaults; our tiers map onto them:
xs 30rem/480 (added)   md 48rem/768   lg 64rem/1024   xl 80rem/1280   2xl 96rem/1536
Mobile = <md · Tablet = md–lg · Desktop = ≥lg · Wide = ≥xl

CONTAINERS
--container-content 75rem (1200px)   --container-panel 45rem (720px)   prose 68ch
```

**Enforcement:** any hex color, duration, or spacing literal in a component is a review failure. The only permitted raw values are one-off `viewBox` coordinates and the seeded star/skill position data.

---

## 19. Technical Architecture

For each technology: why, where, where not, cost, mobile, fallback.

### 19.1 Astro 7 — the framework

**Why.** The site is ~90% static content with ~6 interactive widgets. Astro renders everything to HTML at build time and hydrates only what is marked, with per-component directives including `client:media` — the single most valuable feature for this project, because the expensive visuals can be made *undownloadable* on mobile rather than merely unused. Also gives content collections with Zod validation, `astro:assets` image optimisation, build-time Shiki highlighting, and View Transitions, all first-party.
**Where.** Every route, every layout, every content component.
**Where not.** Nothing. No SPA router, no client-side routing beyond View Transitions.
**Cost.** Zero runtime.
**Mobile.** Ideal — static HTML.
**Fallback.** None needed.
**Output mode.** `output: 'static'`. No SSR adapter — nothing on this site needs a server. This keeps hosting trivial and CDN-cacheable.

### 19.2 React 19 — islands only

**Why.** Already installed; needed for the 6 stateful widgets; the owner's existing component-library work is React, so `/instruments` demos are React.
**Where.** Exactly the islands listed in §20.2. Nothing else.
**Where not.** Never for layout, text, lists, cards, navigation markup, or anything that renders identically on every load. A React component that has no state and no effects must be an `.astro` component instead.
**Cost.** ~11KB gz shared runtime (react + react-dom/client), loaded once, only when at least one island on the route hydrates.
**Mobile.** Only the rail scroll-spy and copy-email islands hydrate on mobile (~5KB of island code). Home mobile total stays inside the 60KB JS budget.
**Fallback.** Every island's server-rendered HTML is the fallback and must be independently correct.

### 19.3 TypeScript (strict) — already configured

`astro/tsconfigs/strict` is in place. Rules: no `any` in committed code, content collection types derive from Zod schemas via `InferEntrySchema`, island props are explicit interfaces, and the seeded-data files are typed and validated so a malformed skill coordinate fails the build rather than the page.

### 19.4 Tailwind CSS v4

**Why.** Already installed via `@tailwindcss/vite`; v4's `@theme` gives us the token system and the utility layer from one CSS file.
**Where.** All styling.
**Where not.** No arbitrary values carrying design decisions (`text-[#7DE2FF]` is a review failure — use `text-ion`). No `@apply` chains longer than 3 utilities; if a pattern repeats, it becomes an `.astro` component, not a CSS abstraction.
**Cost.** ~20–30KB gz of generated CSS for this site.
**Fallback.** None needed.

### 19.5 CSS platform features — the primary animation engine

- **Scroll-driven animations** (`animation-timeline: scroll() / view()`) for the spine draw and hero parallax. Off the main thread, zero JS. Guarded in `@supports (animation-timeline: view())`; the unsupported path is the designed static state.
- **View Transitions** (Astro's `<ClientRouter />`) for card → case-study continuity, with `transition:name` on the shared sphere and title. ~4KB. Disabled under reduced motion.
- **`color-mix()`, `oklab`** for all alpha derivations, so accents stay perceptually consistent.
- **`@supports`, `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`** as first-class branches, not afterthoughts.

### 19.6 SVG — the default for data visuals

**Why.** Crawlable, accessible, scalable, stylable by tokens, zero runtime.
**Where.** Skills constellation, trajectory spine, project spheres (gradient-based), architecture diagrams, icon sprite, corner-tick-adjacent flourishes.
**Where not.** Anything with more than ~300 animated nodes (DOM cost) — that is Canvas's job.
**Mobile.** Constellation SVG is dropped for the list; the spine SVG is replaced by a CSS border.
**Fallback.** Inline SVG needs none; `<img>`-referenced SVG would, so all SVG is inlined.

### 19.7 Canvas 2D — the only imperative renderer

**Why.** The star field (~900 moving points) and the Orbit experiment (~200 bodies with trails) exceed what SVG/DOM can animate smoothly, and both are pure decoration/experiment, so a non-DOM renderer costs nothing accessibility-wise (their content equivalents are text).
**Where.** `StarField` (all routes, desktop/tablet), `Orbit` (`/instruments` only, desktop only).
**Where not.** Never for text, never for layout, never for anything a visitor needs.
**Cost.** ≤4ms/frame star field, ≤10ms/frame Orbit, both capped and self-degrading.
**Mobile.** Neither loads.
**Fallback.** Static CSS star layer; static poster image for Orbit.

### 19.8 Explicitly rejected dependencies

| Technology | Verdict | Reasoning |
|-----------|---------|-----------|
| **Framer Motion / Motion One** | **Do not add** | Every animation in §16.3 is expressible in CSS keyframes, transitions, or scroll-driven animations. A 15–40KB animation runtime to do what `@keyframes` does contradicts P6 and the JS budget. *Sole exception:* the owner's own component-library demos on `/instruments` may pull Framer Motion, since demonstrating that library is the point — and it loads only on that route. |
| **Three.js / React Three Fiber** | **Deferred, likely never** | ~150KB+ gz for effects Canvas 2D already covers here. Permitted only as optional Phase 5b if Orbit provably cannot be built in Canvas — desktop-only, dynamically imported, ≤120KB gz. |
| **GSAP + ScrollTrigger** | Rejected | Same reasoning as Framer Motion; scroll-driven CSS covers our two scroll-linked effects. |
| **Lenis / smooth-scroll libraries** | Rejected | Overriding native scroll violates P4, breaks accessibility expectations, and is a common source of jank and scroll-anchoring bugs. |
| **A state manager (Zustand/Jotai/Redux)** | Rejected | See §22 — there is no cross-island state. |
| **An icon library / icon font** | Rejected | ~16 icons ship as one inline SVG sprite. The current site's Material Symbols font is removed. |
| **A UI kit (shadcn, MUI, etc.)** | Rejected | The visual system is bespoke; a kit would be fought, not used. |
| **A client-side syntax highlighter** | Rejected | Shiki runs at build time via Astro. |
| **A carousel/lightbox library** | Rejected | No carousels in the design; gallery images open in a new tab. |

**Dependency admission rule:** a new runtime dependency requires a written justification naming (a) the requirement it satisfies, (b) why CSS/SVG/Canvas cannot, (c) its gzipped cost, and (d) its mobile behaviour. Record it in the Decision log.

---

## 20. Rendering Strategy

### 20.1 Default: static, zero-JS

Every route is pre-rendered to HTML at build (`output: 'static'`). All text, headings, lists, links, images, tables, code excerpts, and SVG are in the initial HTML. **No content is ever fetched at runtime**, so there are no loading states, no skeletons, no empty states, and no client-side data layer.

### 20.2 Island inventory — the complete, closed list

Any island not on this list must be justified in the Decision log before being added.

| # | Island | Route(s) | Directive | Budget (gz) | Server-rendered fallback |
|---|--------|----------|-----------|-------------|-------------------------|
| 1 | `StarField` | all | `client:idle` + `client:media="(min-width: 768px)"` | ≤6KB | Static CSS star layer (permanent) |
| 2 | `SectionRail` | `/` | `client:idle` | ≤3KB | Plain anchor list, fully functional |
| 3 | `AtlasLink` | `/` | `client:visible` | ≤3KB | SVG + grouped list, both complete |
| 4 | `CopyEmail` | `/`, `/dossier` | `client:visible` | ≤1.5KB | `mailto:` link (button hidden until hydrated) |
| 5 | `MobileNav` | all (<md) | `client:idle` | ≤2KB | Static bottom bar; JS adds hide-on-scroll + sheet |
| 6 | `Orbit` | `/instruments` | `client:visible` + `client:media="(min-width: 1024px)"` | ≤12KB | Static poster + description |

**Directive rationale.** `client:idle` for anything that improves the page but is not needed at first paint (rail, star field) so it never competes with LCP. `client:visible` for below-the-fold interactivity. `client:media` wherever the feature is desktop-only — this is what keeps mobile at ~5KB of island code. **`client:load` is not used anywhere**; nothing on this site is urgent enough to hydrate before idle.

**Hydration-gap rule.** A hydrated island must never appear *after* its own fallback in a way that shifts layout or flashes. `CopyEmail`'s button is the one element that appears on hydration; it therefore occupies reserved space from the server render (visibility, not display) so nothing moves.

### 20.3 Content collections

`src/content/` with Zod schemas. Schemas are the contract; a missing required field fails the build, which is exactly the guardrail that prevents placeholder content shipping.

| Collection | Type | Required | Optional |
|-----------|------|----------|----------|
| `projects` | data | `id` (`SHB-1b`), `slug`, `name`, `oneLiner`, `description`, `stack[]`, `status`, `year`, `featured` | `role`, `liveUrl`, `repoUrl`, `problem`, `approach`, `architecture`, `impact[]`, `stackRationale[]`, `screenshots[]`, `sphereHue` |
| `experience` | data | `company`\*, `role`, `startDate`, `achievements[]` | `endDate`, `location`, `mode`, `summary`, `technologies[]`; per achievement: `metric{value,unit,label}` |
| `skills` | data | `name`, `tier`, `constellation`, `x`, `y`, `sortScore` | `connections[]`, `url` |
| `articles` | data | `title`, `url`, `publishedAt`, `source` | `excerpt`, `readingMinutes`, `coverImage`, `tags[]` |
| `instruments` | data | `id` (`I-01`), `name`, `claim`, `body` | `demo`, `diagram`, `codeExcerpt`, `links[]` |
| `profile` | data (single) | `name`, `role`, `location`, `timezone`, `email`, `socials[]`, `yearsExperience` | `philosophy`, `prose[]`, `fieldNotes[]`, `openQuestions[]`, `availability`, `resumePdf` |

\* `company` is required by the schema deliberately, to force C1 to be resolved rather than silently skipped. If it genuinely cannot be disclosed, the value must be an explicit string such as `"Confidential (agency client work)"` — a conscious choice, not an omission.

### 20.4 Articles data — dev.to at build time

Articles come from the dev.to API (`/api/articles?username=shubhamtiwari909`) **at build time only**, never from the browser. Requirements:

1. Fetch during the build; map to the `articles` schema; sort by `publishedAt` desc.
2. On fetch failure or non-200, **fall back to a committed `src/content/articles/fallback.json`** (seeded from `portfolio-content.md`'s six posts) and emit a build warning. A network hiccup must never fail or empty the build.
3. After a successful fetch, the result is written back to that committed file, so the fallback stays fresh.
4. Excerpts are truncated to 160 chars at build time, on a word boundary.
5. No API key needed; the endpoint is public. Do not add auth or a proxy.
6. Freshness comes from redeploys (a weekly scheduled rebuild is enough; see §35).

### 20.5 Server / client boundary rules

1. If a component renders the same output on every load → `.astro`.
2. If it needs `useState`/`useEffect`/event handlers → React island, with an explicit directive and a correct server-rendered fallback.
3. An island never wraps content. It wraps *behaviour*. Content is passed in as children or props rendered on the server where possible.
4. No island may exceed 12KB gz. Larger means it is doing too much.
5. Islands never fetch. All data arrives as props at build time.
6. No island depends on another island. There is no shared client state (§22).

---

## 21. Component Architecture

### 21.1 Tree

```text
src/
├── layouts/
│   └── BaseLayout.astro          <head>, fonts, cosmos, top bar, skip link, footer, slot
├── components/
│   ├── cosmos/
│   │   ├── Cosmos.astro          composes the 5 background layers (§17.1)
│   │   ├── StaticStars.astro     CSS star layers (permanent fallback)
│   │   ├── StarField.tsx         ISLAND — canvas 2D
│   │   └── Grain.astro
│   ├── layout/
│   │   ├── TopBar.astro          wordmark + Dossier CTA
│   │   ├── SectionRail.tsx       ISLAND — scroll-spy + progress
│   │   ├── MobileNav.tsx         ISLAND — bottom bar + more-sheet
│   │   ├── Footer.astro
│   │   └── SkipLink.astro
│   ├── ui/
│   │   ├── Section.astro         the §8.1 contract: id, eyebrow, title, lede, slot
│   │   ├── Panel.astro           surface + hairline + corner ticks (variant: subtle|standard|strong)
│   │   ├── Button.astro          variant: primary|secondary|ghost; as: a|button
│   │   ├── Chip.astro
│   │   ├── StatusDot.astro       always renders text beside the dot
│   │   ├── DataList.astro        <dl> for field notes / readouts
│   │   ├── MetricBlock.astro     big mono number + caption
│   │   ├── Icon.astro            inline sprite reference
│   │   └── ExternalLink.astro    ↗ + visually-hidden "(opens in a new tab)"
│   ├── hero/
│   │   ├── Hero.astro
│   │   ├── HeroPortrait.astro
│   │   ├── StatStrip.astro       counts computed from collections
│   │   └── ScrollHint.astro
│   ├── about/
│   │   ├── ObserversLog.astro
│   │   ├── Philosophy.astro      <blockquote> pull-quote
│   │   └── OpenQuestions.astro
│   ├── atlas/
│   │   ├── Atlas.astro           renders BOTH the SVG map and the list
│   │   ├── ConstellationMap.astro  server-rendered SVG from skills data
│   │   ├── SkillList.astro       tier-grouped <ul> — the source of truth
│   │   └── AtlasLink.tsx         ISLAND — two-way star↔row highlight
│   ├── trajectory/
│   │   ├── Trajectory.astro
│   │   ├── Spine.astro           SVG path (desktop) / border (mobile)
│   │   ├── Position.astro
│   │   └── BurnEvent.astro
│   ├── worlds/
│   │   ├── WorldsSection.astro
│   │   ├── FeaturedWorld.astro
│   │   ├── WorldCard.astro       one <a> wrapping the whole record
│   │   ├── WorldSphere.astro     procedural CSS/SVG sphere, seeded by slug
│   │   ├── WorldRecord.astro     the data table (id, status, stack, role, year)
│   │   └── case-study/
│   │       ├── CaseStudyHeader.astro
│   │       ├── CaseStudySection.astro
│   │       ├── ImpactMetrics.astro
│   │       ├── StackRationale.astro
│   │       ├── Gallery.astro
│   │       └── WorldPager.astro  prev/next world
│   ├── instruments/
│   │   ├── InstrumentTeaser.astro    home route, zero JS
│   │   ├── InstrumentPanel.astro
│   │   ├── CodeExcerpt.astro         build-time Shiki
│   │   ├── ArchitectureDiagram.astro inline SVG, theme-aware
│   │   ├── CapabilityIndex.astro     the 9 honest category chips
│   │   ├── Orbit.tsx                 ISLAND — canvas n-body
│   │   └── OrbitPoster.astro         static fallback + START button host
│   ├── transmissions/
│   │   ├── Transmissions.astro
│   │   └── TransmissionRow.astro
│   └── uplink/
│       ├── Uplink.astro
│       ├── AvailabilityStatus.astro
│       └── CopyEmail.tsx             ISLAND
├── content/                      collections + schemas (config.ts)
├── data/
│   ├── skills.ts                 hand-authored star coordinates + connections
│   └── seed.ts                   seeded PRNG (stars, sphere hues) — deterministic
├── lib/
│   ├── observeOnce.ts            shared IntersectionObserver entrance utility
│   ├── prefersReducedMotion.ts
│   ├── deviceTier.ts             the §16.4 capability ladder
│   ├── analytics.ts              thin typed event wrapper
│   └── seo.ts                    metadata + JSON-LD builders
├── pages/
│   ├── index.astro
│   ├── worlds/[slug].astro
│   ├── instruments.astro
│   ├── transmissions.astro
│   ├── dossier.astro
│   ├── 404.astro
│   └── og/[...route].ts          build-time OG images
├── styles/
│   └── global.css                @theme tokens + base + a11y utilities
└── assets/
    ├── fonts/                    self-hosted woff2 subsets
    ├── icons/sprite.svg
    ├── grain.png                 ~2KB tile
    └── images/                   portrait, screenshots (processed by astro:assets)
```

### 21.2 Responsibilities, props, and boundaries

| Component | Responsibility | Key props | State | Boundary |
|-----------|---------------|-----------|-------|----------|
| `BaseLayout` | Head, fonts, cosmos, chrome, one `<main id="main">` | `title`, `description`, `ogImage`, `route` | none | Server |
| `Section` | The §8.1 anatomy + entrance hook attribute | `id`, `codename`, `readout`, `title`, `lede` | none | Server |
| `Panel` | Surface, hairline, corner ticks, transparency fallbacks | `variant`, `as` | none | Server |
| `StarField` | Ambient canvas sky; capability ladder; self-degradation | `density?` | local: rAF handle, star array, frame stats | Island |
| `SectionRail` | Active section + scroll progress | `sections[]` | local: `activeId`, `progress` | Island |
| `AtlasLink` | Two-way star↔row highlight via delegated listeners | none (reads `data-skill`) | local: `hoveredSkill` | Island |
| `WorldCard` | One project record as a single link | `project` | none | Server |
| `WorldSphere` | Deterministic sphere from slug hash | `slug`, `hue?`, `size` | none | Server |
| `Orbit` | n-body sim + telemetry + degradation + start control | `bodyCount?` | local: sim state, running, fps | Island |
| `CopyEmail` | Clipboard + confirmation + live region | `email` | local: `copied` | Island |

**Reusable primitives** are exactly: `Section`, `Panel`, `Button`, `Chip`, `StatusDot`, `DataList`, `MetricBlock`, `Icon`, `ExternalLink`. Everything else is a composition. Do not create additional primitives without a third use case — two uses is a coincidence, three is a pattern.

**Animation boundary rule.** Entrance animation is applied by `Section` via a `data-observe` attribute consumed by one shared utility. Individual components never register their own scroll listeners or observers.

---

## 22. State Management

**There is no global state, and no state library.** The full inventory:

| State | Owner | Scope | Persistence |
|-------|-------|-------|-------------|
| Active section id | `SectionRail` island | local | none |
| Scroll progress | `SectionRail` island (or pure CSS where supported) | local | none |
| Hovered skill | `AtlasLink` island | local | none |
| Copied confirmation | `CopyEmail` island | local, 2s | none |
| Mobile nav sheet open + bar visibility | `MobileNav` island | local | none |
| Star field runtime (array, rAF handle, frame stats, degraded flag) | `StarField` island | local | none |
| Orbit sim state + running flag | `Orbit` island | local | none |
| Reduced-motion preference | CSS media query; `prefersReducedMotion.ts` only where JS must branch | read-only | OS-level |
| Device tier | `deviceTier.ts`, computed once at island init | read-only | none |
| Theme | **none — the site is dark-only** | — | — |

**Why dark-only:** the entire concept is a night sky. A light mode would require a second complete visual system (the cosmos, glows, and hairlines have no light-mode analogue) for a use case that does not exist here. `color-scheme: dark` is declared so form controls and scrollbars match. This is a deliberate, recorded decision — not an oversight.

**Rules.** No island reads another island's state. No `window` globals. No custom events between islands. No URL state (no filters, no tabs, no modals — by design). If a future feature seems to need cross-island state, the correct first move is to move that UI into a single island or onto its own route.

---

## 23. Routing

Astro file-based routing, `output: 'static'`, `trailingSlash: 'never'`, `site: 'https://<production-domain>'` (required for sitemap and absolute OG URLs).

| Route | File | Generation | Notes |
|-------|------|-----------|-------|
| `/` | `pages/index.astro` | static | The survey; 8 anchor sections |
| `/worlds/[slug]` | `pages/worlds/[slug].astro` | `getStaticPaths()` from `projects` | Only projects with a case study; others link out directly |
| `/instruments` | `pages/instruments.astro` | static | Heaviest route; holds Orbit |
| `/transmissions` | `pages/transmissions.astro` | static | Full article index |
| `/dossier` | `pages/dossier.astro` | static | HTML résumé + PDF link |
| `/404` | `pages/404.astro` | static | Lost signal |
| `/rss.xml` | `pages/rss.xml.ts` | build | Articles feed |
| `/sitemap-index.xml` | `@astrojs/sitemap` | build | — |
| `/og/*.png` | `pages/og/[...route].ts` | build | One image per route + per project |

**Redirects:** `/projects → /worlds`, `/project/:slug → /worlds/:slug`, `/blog → /transmissions`, `/resume → /dossier`, `/lab → /instruments`. Rationale: the codenames are the site's own vocabulary, but visitors and old links will use the conventional words. Configured in `astro.config.mjs` `redirects` (emitted as static redirect pages) and/or at the host.

**Anchors are part of the API.** `#first-light`, `#log`, `#atlas`, `#trajectory`, `#worlds`, `#instruments`, `#transmissions`, `#uplink` are stable and linkable. Do not rename them once published.

**View Transitions:** `<ClientRouter />` in `BaseLayout`, with `transition:name` pairs on world sphere and title between `WorldCard` and `CaseStudyHeader`. `transition:persist` on the `Cosmos` layer so the sky does not flash between routes — this is what makes the multi-page architecture feel continuous. Disabled entirely under `prefers-reduced-motion`.

---

## 24. Responsive Strategy

Mobile-first authoring: the base stylesheet is the mobile experience, and every enhancement is added at a `min-width` breakpoint. This guarantees mobile can never inherit a desktop cost.

### 24.1 Tier definitions

| Tier | Range | Experience |
|------|-------|-----------|
| **Mobile** | <768px | Full content, zero canvas, zero parallax, zero scroll-linked motion. Single column. Bottom tab bar. |
| **Tablet** | 768–1023px | Content + live star field at reduced density. No parallax. Rail without labels. 1–2 column layouts. |
| **Desktop** | 1024–1279px | Full experience: star field, parallax, constellation map, curved spine, Orbit. |
| **Wide** | ≥1280px | Adds persistent rail labels, 7/5 asymmetric splits, larger display type. No new effects. |

### 24.2 Effect matrix

| Effect | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| Static star layer + nebula | **Preserved** | Preserved | Preserved |
| Live star canvas | **Removed** (`client:media`) | Simplified (400 stars, no parallax) | Full (900 stars) |
| Hero parallax | Removed | Removed | Full |
| First-light reveal | **Simplified** (fade only, 320ms) | Full | Full |
| Constellation map | **Replaced** by tier-grouped list | Full width, Core labels only | Full + list |
| Trajectory spine | **Replaced** by CSS border-left | Straight SVG, static | Curved SVG, scroll-drawn |
| Project spheres | Preserved (static, 56px) | Preserved | Preserved + hover rim-light |
| Orbit experiment | **Removed** (poster) | **Removed** (poster) | Full |
| Section entrances | Simplified (320ms, 40ms stagger) | Full | Full |
| View Transitions | Preserved (cheap, native) | Preserved | Preserved |
| Backdrop blur panels | Simplified (opaque surfaces <768px — blur is expensive on mobile GPUs) | Full | Full |
| Hover states | **Replaced** by `:active` feedback | Full | Full |

### 24.3 Touch and input rules

- Every target ≥44×44px with ≥8px separation.
- No information is hover-only anywhere. Where desktop reveals on hover (rail labels, star labels), touch either shows it permanently or the information also exists in a list.
- `@media (hover: hover) and (pointer: fine)` guards every hover style, so touch devices never get stuck hover states.
- Safe-area insets respected on the bottom bar (`padding-bottom: env(safe-area-inset-bottom)`).
- Test viewports: 320×568 (smallest realistic), 360×640, 390×844, 768×1024, 1280×800, 1440×900, 1920×1080.
- Use `svh`/`dvh`, never `vh`, for any viewport-relative height — `100vh` causes the mobile URL-bar jump.

---

## 25. Accessibility

**Target: WCAG 2.2 Level AA, with zero axe-core violations on every route.** Accessibility is a Definition-of-Done gate on every phase, not a Phase 6 cleanup task — Phase 6 only verifies and covers the gaps that need real devices.

### 25.1 Non-negotiables

1. **All content in the DOM as text.** Nothing a visitor needs exists only in canvas, only in an image, or only after hover. (P1)
2. **Semantic structure:** one `<h1>`; `<h2>` per section, no skipped levels; `<header>`, `<nav>`, `<main id="main">`, `<section>`, `<article>`, `<footer>`; lists for lists; `<dl>` for label/value data; `<time datetime>` for all dates.
3. **Real controls only.** `<a>` navigates, `<button>` acts. No `div` with a click handler, no `tabindex` above 0, no ARIA substituting for semantics.
4. **Keyboard:** every interactive element reachable and operable in a logical order; visible `:focus-visible` ring (2px ion, 2px offset) never removed; skip link first; `scroll-margin-top` so anchors clear the fixed bar; focus never trapped (there are no modals).
5. **Screen readers:** decorative SVG/canvas `aria-hidden="true"`; informative SVG `role="img"` + `aria-label`; external links carry a visually-hidden "(opens in a new tab)"; the copy confirmation is a polite live region; rapidly-changing telemetry is `aria-live="off"`.
6. **Color independence:** status, tier, and active state are always conveyed by text or shape in addition to color.
7. **Motion:** `prefers-reduced-motion` honoured at every level (§16.4); no animation loops longer than 5s that cannot be stopped; nothing flashes more than 3×/second.
8. **Zoom and reflow:** usable at 200% zoom and at 320px width with no horizontal page scroll; wide tables, code blocks, and diagrams scroll inside their own `overflow-x: auto` containers.
9. **`prefers-reduced-transparency`** and `prefers-contrast: more` supported: opaque surfaces, hairlines raised to 40% alpha, glows removed.

### 25.2 Contrast targets

All values must be verified with a contrast checker during Phase 1 and re-verified after any token change. Approximate computed ratios for the §18 palette:

| Foreground | Background | Ratio | Use | Requirement |
|-----------|-----------|-------|-----|-------------|
| `ink-hi` #EAF0FA | `void` #04060D | ~16.4:1 | Headings, key values | ≥4.5:1 ✓ |
| `ink-mid` #9BA8C2 | `surface-0` #080C16 | ~7.3:1 | Body copy | ≥4.5:1 ✓ |
| `ink-low` #7C89A5 | `surface-0` #080C16 | ~4.9:1 | Labels, captions (small text) | ≥4.5:1 ✓ |
| `ion` #7DE2FF | `void` #04060D | ~13:1 | Links, active, focus ring | ≥4.5:1 text / ≥3:1 UI ✓ |
| `ember` #FFB454 | `void` #04060D | ~10.9:1 | CTA text, metrics | ≥4.5:1 ✓ |
| `hairline` (ion 12%) | `surface-1` | <3:1 | **Decorative only** — never the sole indicator of a boundary or state | n/a |

`ink-low` has the least headroom, so it is capped: never below 12px, never for body copy, never on `surface-2`. If any token shifts, `ink-low` is the first value to re-check.

### 25.3 Per-feature accessible equivalents

| Visual feature | Accessible equivalent |
|---------------|----------------------|
| Star-field canvas | `aria-hidden`; purely decorative, no information encoded |
| Constellation map | The tier-grouped skill list (always in DOM, sole tab path) |
| Star magnitude/glow | Written tier labels: `CORE`, `WORKING`, `FAMILIAR` |
| Constellation lines | Prose sentence in the section lede naming the relationships shown |
| Trajectory spine | `<ol>` DOM order carries the chronology; spine is `aria-hidden` |
| Project sphere | `aria-hidden`; project identified by text name + designation |
| Status dot | Adjacent text (`LIVE`, `ARCHIVED`) |
| Metric block | `<strong>` number inside a sentence with its label |
| Orbit simulation | Adjacent paragraph describing what the simulation shows and what it demonstrates; `START` is a real button |
| Corner ticks / hairlines / grain | CSS pseudo-elements, invisible to AT |
| Scroll progress | `aria-current` on the active rail item |

### 25.4 Testing

Automated: `axe-core` via Playwright on all 6 route types, plus `@axe-core/cli` in CI — zero violations required. Manual: full keyboard pass per route; VoiceOver (macOS Safari) and NVDA (Windows Firefox) pass on `/` and one case study; 200% zoom; 320px reflow; forced-colors mode; reduced-motion pass; JS-disabled pass.

---

## 26. Performance

### 26.1 Targets — Definition of Done gates

Measured on the deployed production URL. Mobile = Moto G Power class, Slow 4G, via Lighthouse mobile preset.

| Metric | Mobile target | Desktop target |
|--------|--------------|----------------|
| Lighthouse Performance | **≥95** (`/` and `/worlds/*`); ≥90 (`/instruments`) | ≥98 |
| Lighthouse Accessibility | **100** (all routes) | 100 |
| Lighthouse Best Practices / SEO | ≥95 / 100 | ≥95 / 100 |
| LCP | **≤1.8s** | ≤1.2s |
| CLS | **≤0.02** | ≤0.02 |
| INP | **≤150ms** | ≤100ms |
| TBT | ≤150ms | ≤100ms |
| TTFB (static CDN) | ≤200ms | ≤200ms |

### 26.2 Budgets — per route, gzipped

| Resource | `/` mobile | `/` desktop | `/worlds/*` | `/instruments` |
|----------|-----------|------------|-------------|---------------|
| HTML | ≤35KB | ≤35KB | ≤30KB | ≤40KB |
| CSS | ≤30KB | ≤30KB | ≤30KB | ≤32KB |
| JS (total) | **≤20KB** | **≤60KB** | ≤14KB | ≤160KB |
| Fonts | ≤110KB | ≤110KB | ≤110KB | ≤110KB |
| Images | ≤120KB | ≤260KB | ≤700KB | ≤400KB |
| **Total transfer** | **≤320KB** | ≤500KB | ≤900KB | ≤750KB |
| Requests | ≤22 | ≤28 | ≤30 | ≤30 |

Mobile JS is ~20KB because only `SectionRail`, `MobileNav`, and `CopyEmail` hydrate there; the React runtime is the bulk of it. If mobile JS exceeds 20KB, the correct fix is to convert an island to a CSS-only solution, not to raise the budget.

### 26.3 Techniques, in order of impact

1. **Static output + CDN.** Zero server work, immutable hashed assets, `Cache-Control: max-age=31536000, immutable` for assets and `max-age=0, must-revalidate` for HTML.
2. **Text LCP.** The hero's LCP element is text, so LCP is bounded by font + CSS, not by an image or JS.
3. **Islands with `client:idle` / `client:media`.** No JS competes with LCP; mobile never downloads the expensive islands.
4. **Fonts:** self-hosted woff2, latin subset only, `font-display: swap`, `<link rel="preload">` for the display and body faces only (not mono), and `size-adjust`/`ascent-override` on the fallback stack so the swap causes no shift. Budget ≤110KB total.
5. **Critical CSS inlined** by Astro; the rest is one hashed stylesheet.
6. **Images:** `astro:assets` → AVIF + WebP, explicit dimensions, `loading="lazy"` + `decoding="async"` everywhere except a single above-the-fold candidate per route, correct `sizes`.
7. **Zero-image cosmos.** The sky is gradients, canvas, and a 2KB grain tile — the usual 1–3MB nebula JPEG is never downloaded.
8. **No icon font.** One inline SVG sprite.
9. **Canvas discipline:** DPR capped at 1.5; `IntersectionObserver` + `visibilitychange` pause; capped counts; runtime self-degradation; no per-frame allocation (pre-allocated typed arrays for star positions).
10. **Compositor-only animation** (§16.1) plus scroll-driven CSS off the main thread.
11. **One shared IntersectionObserver** for all entrance animations rather than one per component.
12. **Build-time everything:** syntax highlighting, OG images, article fetching, excerpt truncation, count computation.

### 26.4 Monitoring and CI enforcement

- **Lighthouse CI** on every PR against `/`, `/worlds/payload-cms`, `/instruments`; the targets in §26.1 are assertions, and a regression **fails the build**.
- **Bundle budget check** in CI against §26.2.
- **Real-user vitals** via the analytics provider's Web Vitals collection (§28), reviewed after launch.
- A `PERF.md` (or the Decision log) records each measured value at each phase exit, so regressions are attributable to a specific phase.

---

## 27. SEO

The immersive design must not cost discoverability. Because everything is static HTML, this is mostly a matter of not omitting things.

### 27.1 Metadata

- **Titles:** `Shubham Tiwari — Frontend Engineer` (home); `{Project} — Case Study · Shubham Tiwari`; `Instrument Bay — Engineering Lab · Shubham Tiwari`; `Writing · Shubham Tiwari`; `Résumé · Shubham Tiwari`. ≤60 characters.
- **Descriptions:** unique, 140–160 characters, written per route — never generated from body text.
- **Canonical** on every route. `site` must be set in `astro.config.mjs` so canonicals and OG URLs are absolute.
- **OpenGraph + Twitter/X:** `og:title`, `og:description`, `og:type`, `og:url`, `og:image` (1200×630), `og:image:alt`, `twitter:card=summary_large_image`, `twitter:creator`.
- **OG images generated at build** — one per route plus one per project — using Satori/`astro-og-canvas`: void background, hairline frame, corner ticks, name in Instrument Serif, route title, mono designation. Consistent with the site, and no manual image work per project.
- `lang="en"`, `color-scheme: dark`, theme-color meta, favicon set, `robots.txt`, `sitemap-index.xml` via `@astrojs/sitemap`.

### 27.2 Structured data (JSON-LD)

| Route | Types |
|-------|-------|
| `/` | `Person` (name, jobTitle, address, email, sameAs[GitHub, LinkedIn, dev.to, Instagram], knowsAbout[skills]) + `WebSite` |
| `/worlds/[slug]` | `CreativeWork` (or `SoftwareApplication` where it is a running app) + `BreadcrumbList` |
| `/transmissions` | `ItemList` of `BlogPosting`, each with `url` pointing at dev.to |
| `/dossier` | `Person` + `ProfilePage` |

### 27.3 Duplicate-content rule for articles

Articles live on dev.to. The site shows **title, date, and a ≤160-character excerpt, then links out**. It must not mirror full post bodies. If full mirroring is ever added, every mirrored page must carry `<link rel="canonical" href="{devto-url}">`. Getting this wrong would have the portfolio compete with the owner's own dev.to ranking — a real, avoidable harm.

### 27.4 Content-in-HTML guarantee

An SEO smoke test (Playwright, `javaScriptEnabled: false`) asserts that the following exist in raw HTML on `/`: the `h1` with the full name, the role string, all 23 skill names, every project name and description, every article title, and the email address. If any of that ever moves inside canvas or a client-only island, this test fails.

---

## 28. Analytics

**Provider: Vercel Analytics** if deploying on Vercel, otherwise **Plausible**. Both are cookieless and collect no PII, so **no consent banner is required** — which matters, because a cookie banner would be the first thing a visitor sees and would wreck the arrival experience.

### 28.1 Event set — closed list of 8

| Event | Trigger | Properties |
|-------|---------|-----------|
| `dossier_download` | Résumé PDF click (any location) | `location: hero \| topbar \| uplink \| dossier` |
| `world_open` | Case-study navigation | `slug` |
| `world_link_click` | Live demo or repo click | `slug`, `kind: live \| repo` |
| `uplink_copy_email` | Copy button success | — |
| `uplink_social_click` | Social link click | `network` |
| `transmission_click` | Article click | `slug` |
| `instrument_interact` | Orbit started, or a component demo used | `instrument: I-01…I-04` |
| `section_reach` | Section first becomes 50% visible | `section` (fires once per section per session) |

Rules: no scroll-depth percentages, no mouse heatmaps, no session recording, no third-party pixels, no PII, no cross-site identifiers. `section_reach` is throttled to one fire per section per session and rides the existing shared IntersectionObserver — it adds no new listener. All events go through `lib/analytics.ts`, which is a no-op when the provider is absent, so local development is silent and event names stay typed.

**Web Vitals** are collected by the provider's built-in RUM (INP/LCP/CLS from real visitors) and reviewed against §26.1 after launch.

---

## 29. Asset Strategy

**Principle: generate, don't download.** The cosmos is procedural, so the entire visual theme costs ~2KB of raster.

| Asset | Method | Source | Budget |
|-------|--------|--------|--------|
| Star field (live) | **Procedural** — Canvas 2D, seeded PRNG | Code | 0 bytes |
| Star field (static) | **CSS** — 3 tiled `radial-gradient` layers | Code | 0 bytes |
| Nebulae | **CSS** — 2 large radial gradients | Code | 0 bytes |
| Grain overlay | Raster, 128×128 tiling PNG | Generated once | ~2KB |
| Project spheres | **CSS/SVG** — radial gradients seeded by slug hash | Code | 0 bytes |
| Constellation map | **SVG**, server-rendered from `skills.ts` | Code + data | ~2KB gz |
| Trajectory spine | **SVG** path / CSS border | Code | <1KB |
| Icons (~16) | **Inline SVG sprite**, 1.5px stroke, 24px grid | Hand-authored or Lucide paths, inlined | ≤4KB gz |
| Portrait | Raster, AVIF + WebP at 480w/720w | Existing `hero_profile.png` — re-export | ≤60KB |
| Project screenshots | Raster, AVIF + WebP, 640/1280/1920w | **Must be captured (C2)** | ≤120KB card, ≤200KB hero |
| Architecture diagrams | **Inline SVG**, hand-authored, token-colored | Authored per case study | ≤8KB each |
| Orbit poster | Raster, AVIF, 1200×700 | Screenshot of the running sim | ≤80KB |
| OG images | **Generated at build** (Satori) | Code + content | ≤80KB each, not on critical path |
| Fonts | Self-hosted woff2, latin subset | Google Fonts source files | ≤110KB total |
| Résumé PDF | External file | **Must be added (C6)** | ≤400KB, not on critical path |

**Explicitly forbidden:** stock space photography, full-bleed nebula JPEGs, video backgrounds, Lottie files, icon fonts, and any single image over 250KB.

**Font subsetting:** latin + latin-ext only; the mono face is subset further to the glyphs actually used in labels and data (uppercase, digits, `·↗→←↓✓%°`). Verify final sizes in Phase 7 and re-subset if over budget.

---

## 30. Development Phases

**Execution rules for the implementing agent**

1. Phases run in order. Do not start a phase whose prerequisites are unmet.
2. **Obey "Things NOT to implement yet."** It exists to stop later phases leaking into earlier ones.
3. Every phase ends with its Definition of Done fully satisfied, verified, and recorded in the Decision log. A phase is not "done because the code exists".
4. Accessibility and performance criteria are gates in *every* phase, not just Phases 6 and 7.
5. When a phase's task list conflicts with an earlier chapter of this document, the earlier chapter wins — it is the specification; the task list is the route to it.

### Current baseline (already complete)

Astro 7.3.1, React 19.2, `@tailwindcss/vite` 4.3.3 + `tailwindcss` 4.3.3, `@astrojs/react` 6.0.5, TypeScript `astro/tsconfigs/strict`, `pnpm`, `src/styles/global.css`, `src/pages/index.astro`, `src/components/Demo.tsx` (scaffold — to be deleted in Phase 1).

---

## Phase 0 — Discovery & Creative Direction

### Goal
Lock the creative direction and remove every content blocker, so that no later phase has to invent facts or design decisions.

### Why this phase exists
Most portfolio builds stall in the content phase, discover they lack employer names and screenshots, and fill the gap with placeholders that ship. This phase makes the gaps explicit and closes them before any component depends on them.

### Prerequisites
This document.

### Tasks
1. Confirm the DEEP FIELD concept, the eight section codenames (§4), and the plain labels. Any renaming happens **now**, not later — anchors become a public API in Phase 2.
2. Resolve the content gaps **C1–C8** in §"Content readiness". Produce final copy for hero lede, About prose, philosophy pull-quote, and open questions.
3. Verify font licensing for Instrument Serif, Inter, and JetBrains Mono for web use, self-hosted (all three are OFL/free; confirm and record).
4. Validate the §18 palette with a contrast checker; adjust `ink-low` first if any value falls below its requirement.
5. Capture project screenshots (C2) and write case-study bodies (C3).
6. Decide `SHB-3b`: replace with a real project or move its capabilities into §14 (C4).
7. Add `Shubham_resume_2026.pdf` to `public/` (C6).
8. Choose the production domain and the analytics provider (§28).

### Files / Areas Affected
`portfolio-content.md` (updated with resolved gaps), `public/Shubham_resume_2026.pdf`, `src/assets/images/*`, this document's Decision log.

### Components
None.

### Data
Final copy and assets for every collection defined in §20.3.

### State
None.

### Animation
None.

### Responsive Behavior
Screenshots captured at both desktop (1600×1000) and mobile (390×844) framing.

### Accessibility
Palette contrast verified. Every screenshot has written `alt` text authored alongside it.

### Performance
Source screenshots ≥1600px wide but ≤2MB each before processing.

### Testing
Manual review: is every field in every §20.3 schema either filled or consciously marked optional?

### Acceptance Criteria
- C1–C8 each either resolved or explicitly deferred with a recorded reason.
- Final hero lede and About copy pass the §13.1 anti-generic rules.
- Contrast table (§25.2) verified with measured values recorded.
- Résumé PDF present in `public/`.

### Definition of Done
A content pack exists that can fill every required schema field without invention, and no open creative question remains.

### AI Implementation Notes
This phase is mostly **not** the coding agent's work — it needs the owner's facts. If asked to proceed with unresolved gaps, do not invent employers, dates, metrics, or screenshots. Instead, mark the affected schema fields optional, omit them from the UI, and list them in the Decision log as outstanding.

### Things NOT to implement yet
No code at all. No tokens in CSS. No components. No package installs.

### Expected output
Updated content source + assets + a filled-in contrast table + a Decision log with 8 resolved or deferred entries.

---

## Phase 1 — Foundation

### Goal
Tokens, fonts, base layout, primitives, and typed content collections — everything later phases build on, and nothing visible beyond a styled placeholder page.

### Why this phase exists
If tokens and primitives arrive after sections, every section gets hand-rolled values and the design system becomes retrofitting. Doing it first makes drift impossible.

### Prerequisites
Phase 0 acceptance criteria met (or gaps consciously deferred).

### Tasks
1. Delete `src/components/Demo.tsx` and reset `src/pages/index.astro`.
2. Write the complete §18 token set into `src/styles/global.css` inside `@theme`. Include base resets, `color-scheme: dark`, focus-visible styles, `.sr-only`, the skip-link style, and the global `prefers-reduced-motion` rule.
3. Self-host the three fonts: subset to latin (+ mono glyph subset), place in `src/assets/fonts/`, declare `@font-face` with `font-display: swap` and fallback metric overrides, preload display + body only.
4. Build `BaseLayout.astro`: `<head>` (meta, canonical, OG placeholders, favicon, theme-color), skip link, `<TopBar>`, `<main id="main">` slot, `<Footer>`. No cosmos yet.
5. Build the `ui/` primitives: `Section`, `Panel`, `Button`, `Chip`, `StatusDot`, `DataList`, `MetricBlock`, `Icon`, `ExternalLink` — with all six visual states from §17.4.
6. Create the icon sprite with the ~16 icons actually needed.
7. Define content collections and Zod schemas per §20.3 in `src/content/config.ts`. Seed every collection with the real Phase 0 content.
8. Create `src/data/skills.ts` with hand-authored coordinates, tiers, constellations, and connections for all 23 skills (§11.1–11.2), and `src/data/seed.ts` with the seeded PRNG.
9. Create route files as styled placeholders: `/`, `/worlds/[slug]`, `/instruments`, `/transmissions`, `/dossier`, `/404`. Each renders `BaseLayout` + a `Section` with its real title.
10. Configure `astro.config.mjs`: `site`, `output: 'static'`, `trailingSlash: 'never'`, `@astrojs/sitemap`, the §23 redirects.
11. Add a **token lint guard**: a CI grep that fails on hex colors, `ms`/`s` duration literals, and `px` spacing values inside `src/components/**` (allowing `1px` hairlines, `viewBox` numbers, and the data files).
12. Build a `/dev/tokens` page (excluded from the sitemap and from production output) rendering every token and every primitive state. This is the visual regression baseline for later phases.

### Files / Areas Affected
`src/styles/global.css`, `src/layouts/`, `src/components/ui/`, `src/components/layout/`, `src/content/`, `src/data/`, `src/pages/*`, `src/assets/fonts/`, `src/assets/icons/sprite.svg`, `astro.config.mjs`, CI config.

### Components
`BaseLayout`, `TopBar`, `Footer`, `SkipLink`, and the nine `ui/` primitives.

### Data
All six collections defined, validated, and seeded with real content. The build must fail if a required field is missing.

### State
None. No islands in this phase.

### Animation
Only `:hover`/`:focus-visible` transitions on primitives (200ms, `--ease-ui`). No entrances, no ambient motion.

### Responsive Behavior
Layout container, gutters, and the fluid type scale work from 320px to 1920px. `TopBar` is responsive. Primitives reflow and keep ≥44px targets on touch.

### Accessibility
Skip link works. Focus rings visible on every primitive. `Button` renders `<a>` or `<button>` correctly per `as`. `ExternalLink` includes the visually-hidden new-tab text. `StatusDot` always renders text. `axe-core` clean on the placeholder routes. Contrast values verified against §25.2.

### Performance
Placeholder home route: HTML ≤20KB, CSS ≤25KB gz, **JS 0KB**, fonts ≤110KB. Lighthouse Performance ≥99 and Accessibility 100 (trivially achievable with no content — this is the baseline to defend later).

### Testing
Build succeeds. Token lint passes. `/dev/tokens` renders every state. Playwright smoke test: all 6 routes return 200 and contain their `h1`/`h2`. `axe-core` zero violations. JS-disabled pass.

### Acceptance Criteria
- Zero hex/duration/spacing literals in `src/components/**`.
- All six collections typed, validated, and seeded; a deliberately broken field fails the build.
- `/dev/tokens` shows the full system and is absent from production output and the sitemap.
- Home route ships 0KB of JS.
- Fonts total ≤110KB with no layout shift on swap (CLS 0 measured).

### Definition of Done
A developer can build any section using only primitives and tokens, without inventing a value.

### AI Implementation Notes
Tailwind v4 is CSS-first: put tokens in `@theme` in `global.css` and **do not create `tailwind.config.js`**. Remember the `--text-*` namespace is font-size, so text colors are `--color-ink-*` (§18.1). Keep `Section` dumb — it renders anatomy and sets `data-observe`; the observer arrives in Phase 2. Prefer `.astro` for every primitive; none of them needs React.

### Things NOT to implement yet
No cosmos/background layers. No star field. No hero content. No section content. No islands or `client:*` directives. No View Transitions. No animation beyond hover/focus. No scroll behaviour. No OG image generation. No analytics.

### Expected output
Six styled-but-empty routes, a complete token system, nine primitives, six validated collections, and a `/dev/tokens` reference page — all shipping zero JavaScript.

---

## Phase 2 — Core Experience

### Goal
The arrival experience and the spatial frame: the cosmos background, navigation with scroll-spy, the hero, and the shared section entrance architecture.

### Why this phase exists
This is the phase that makes the site feel like the concept. It is also where the performance ceiling gets set — the background system and the hero determine LCP for every route, so they must be right before content volume hides regressions.

### Prerequisites
Phase 1 done.

### Tasks
1. Build the `cosmos/` layer stack (§17.1): `Cosmos.astro` composing void, nebula gradients, `StaticStars.astro`, and `Grain.astro`. Mount it in `BaseLayout` with `transition:persist`. **CSS only — no canvas in this phase.**
2. Build `Hero.astro` per §9.2 with real Phase 0 copy: eyebrow with real coordinates, `h1`, role, lede, both CTAs, social text links, `StatStrip` (counts computed from collections), `HeroPortrait`, `ScrollHint`.
3. Implement the first-light reveal (§9.3) in pure CSS: aperture wipe + sky blur-resolve + child stagger, all on page load, nothing JS-gated.
4. Build `lib/observeOnce.ts`: **one** shared `IntersectionObserver` that adds an `is-revealed` class to every `[data-observe]` element at 20% visibility, once, and disconnects per-element. Wire the §8.1 entrance CSS to it.
5. Build `SectionRail.tsx` island (`client:idle`): scroll-spy via `IntersectionObserver` with `rootMargin: "-45% 0px -45% 0px"`, `aria-current` on the active anchor, and progress via `animation-timeline: scroll()` with a passive rAF fallback. The server render is a complete, working anchor list.
6. Build `MobileNav.tsx` island (`client:idle`, `client:media="(max-width: 47.99rem)"`): 5 items + `MORE` sheet, hide-on-scroll, safe-area insets. Server render is a static, functional bar.
7. Add the eight anchor sections to `/` as empty `Section` shells with real ids, codenames, readouts, and titles. Apply `scroll-margin-top: var(--nav-h)`.
8. Gate smooth anchor scrolling on `prefers-reduced-motion: no-preference`.
9. Implement hero parallax (desktop only) via `animation-timeline: scroll()` inside `@supports`, with no fallback (static is the designed state).
10. Add `<ClientRouter />` for View Transitions with `transition:persist` on the cosmos; verify the sky does not flash between routes.

### Files / Areas Affected
`src/components/cosmos/*`, `src/components/hero/*`, `src/components/layout/SectionRail.tsx`, `MobileNav.tsx`, `src/lib/observeOnce.ts`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/styles/global.css`.

### Components
`Cosmos`, `StaticStars`, `Grain`, `Hero`, `HeroPortrait`, `StatStrip`, `ScrollHint`, `SectionRail` (island), `MobileNav` (island).

### Data
`profile` collection (name, role, lede, socials, résumé path, coordinates); computed counts for the stat strip. **Counts must be derived from collections, never hardcoded.**

### State
`SectionRail`: `activeId`, `progress`. `MobileNav`: `sheetOpen`, `barVisible`. Nothing else, nothing shared.

### Animation
First-light reveal (700ms + 60ms stagger, CSS, on load). Section entrance via the shared observer (560ms, `--ease-out-expo`, once). Hero parallax (scroll-linked, desktop only). Nebula drift (24–36s linear). Rail active transition (320ms). All L1/L3/L4 motion removed under `prefers-reduced-motion`; entrances shortened on mobile.

### Responsive Behavior
Hero per §9.6 (portrait moves then drops at 480px; `min-height: 88svh` mobile). Rail ≥1024px, labels ≥1280px. Bottom bar <768px. No parallax below 1024px. `svh`/`dvh` only.

### Accessibility
`<h1>` accessible name is the full "Hi, I'm Shubham Tiwari — Frontend Engineer". Cosmos layers `aria-hidden`. Nav is `<nav aria-label="Sections">` with real anchors that work with JS off. `aria-current` on active. Skip link lands on `<main>`. Stat strip is a `<dl>`. Scroll hint hidden under reduced motion and on short viewports. Keyboard pass: top bar → rail → hero CTAs → socials in a sane order. `axe-core` clean.

### Performance
LCP element is the `h1` text. **Mobile JS ≤14KB gz** (rail + mobile nav + React runtime); desktop ≤14KB (star field is Phase 4). Cosmos adds ≤3KB (2KB grain + CSS). LCP ≤1.8s mobile / ≤1.2s desktop measured on a deployed preview. CLS ≤0.02 with the portrait and stat strip reserving space. Lighthouse Performance ≥98 (the site is still nearly empty — defend this number in later phases).

### Testing
Playwright: hero content present with JS disabled; rail anchors navigate with JS disabled; `aria-current` updates on scroll with JS enabled; reduced-motion emulation shows no transforms; mobile viewport shows the bottom bar and no parallax. Lighthouse on the deployed preview. `axe-core` on `/`. Visual check at 320/390/768/1280/1920.

### Acceptance Criteria
- Hero is fully readable at first paint with JS disabled and with CSS animations disabled.
- No preloader, no splash, no entry gate anywhere.
- Exactly **one** `IntersectionObserver` handles all entrance animations.
- Exactly **one** ambient background system exists, mounted once, persisting across routes.
- Reduced-motion pass shows a static sky, no wipe, no parallax, no stagger — and looks deliberate.
- Rail and bottom bar fully usable by keyboard and with JS off.

### Definition of Done
Arrival feels like the concept, the frame is in place for content, and the measured performance baseline is at or above target.

### AI Implementation Notes
Build the reveal with CSS keyframes on load — do **not** add a JS orchestrator. Use `animation-timeline` inside `@supports` and let the unsupported branch be static; do not polyfill. The rail island must be additive only: delete its JS and navigation still works. Keep `observeOnce.ts` generic — every later phase reuses it, and adding a second observer later is a review failure.

### Things NOT to implement yet
No star-field canvas (Phase 4). No section content — About, Atlas, Trajectory, Worlds, Transmissions, Uplink remain empty shells (Phase 3). No case-study pages. No Instrument Bay content or Orbit. No constellation SVG. No trajectory spine. No OG images. No analytics events.

### Expected output
A home route with a complete, cinematic hero on a persistent procedural cosmos, working navigation with active-section tracking, eight empty anchor sections, and ≤14KB of JS.

---

## Phase 3 — Portfolio Content

### Goal
Fill every section with real content: Observer's Log, The Atlas, Trajectory, Catalogued Worlds (plus case-study routes), Transmissions, Uplink, and the Dossier route.

### Why this phase exists
This is the phase that makes the site useful. Everything before it was frame; everything after it is enhancement. **At the end of this phase the portfolio must be shippable** — if Phases 4–5 never happened, this would still be a strong portfolio.

### Prerequisites
Phases 1–2 done. Content pack from Phase 0 (C1–C8 resolved or consciously deferred).

### Tasks
1. **Observer's Log** (§13): portrait, field-notes `<dl>`, philosophy `<blockquote>`, prose, open questions, tag chips.
2. **The Atlas** (§11): `ConstellationMap.astro` — server-rendered SVG from `skills.ts` with hand-authored coordinates, tier-based radii, always-visible Core labels, and relationship lines. `SkillList.astro` — tier-grouped list, the source of truth. Both rendered; mobile shows the list only. **No interactivity in this phase.**
3. **Trajectory** (§12): positions and burn events from the `experience` collection; `MetricBlock` for metrics; spine renders **fully drawn and static** (scroll-draw is Phase 4). Mobile spine is a CSS border.
4. **Catalogued Worlds** (§10): `FeaturedWorld` for `SHB-1b`, `WorldCard` for the rest, `WorldSphere` seeded from slug, `WorldRecord` data table. Cards are single anchors. Hover states are CSS only.
5. **Case studies**: `/worlds/[slug]` via `getStaticPaths()`, using the fixed 9-block structure. Hand-author one architecture SVG per case study. `WorldPager` for prev/next. Route chrome swaps the rail for `← SURVEY`.
6. **Transmissions** (§8.2): hairline row list from the `articles` collection. Implement the build-time dev.to fetch with the committed fallback per §20.4.
7. **Uplink** (§15): availability status, email row, `CopyEmail.tsx` island (`client:visible`), social links, résumé CTA. Reserve the copy button's space in the server render.
8. **Instrument Bay teaser** (§14.4): four mono rows + link to `/instruments`. Zero JS.
9. **Dossier** (§8.3): HTML résumé from the `profile` collection + PDF download + print stylesheet.
10. **404** (§8.3): lost-signal page with three real links.
11. Wire the `world_open`, `world_link_click`, `dossier_download`, `uplink_copy_email`, `transmission_click`, and `uplink_social_click` call sites through `lib/analytics.ts` as **no-ops** (the provider is connected in Phase 8).

### Files / Areas Affected
`src/components/about/*`, `atlas/*`, `trajectory/*`, `worlds/**`, `transmissions/*`, `uplink/*`, `instruments/InstrumentTeaser.astro`, `src/pages/index.astro`, `worlds/[slug].astro`, `transmissions.astro`, `dossier.astro`, `404.astro`, `src/content/**`, `src/lib/analytics.ts`.

### Components
All `about/`, `atlas/`, `trajectory/`, `worlds/` (incl. `case-study/`), `transmissions/`, `uplink/` components, plus `InstrumentTeaser` and `CapabilityIndex`.

### Data
All six collections fully populated. Article fetch with fallback working. Counts and designations computed at build. **If `company` is unavailable, use the explicit disclosed-alternative string from §20.3 — never an empty label.**

### State
`CopyEmail`: `copied` (2s). Nothing else. The Atlas is static in this phase.

### Animation
Section entrances via the shared observer only. CSS hover/focus on cards and rows. Philosophy ion rule draws once (560ms). **No scroll-linked animation, no canvas, no constellation interactivity.**

### Responsive Behavior
Per-section responsive specs in §10.8, §11.5, §12.2, §13.3, §8.2. Verify at 320/360/390/768/1024/1280/1920. Atlas map is absent below 768px. Case-study galleries reflow to one column. Code and tables scroll inside their own containers.

### Accessibility
Every §25.3 accessible equivalent implemented. Heading outline correct on all routes (h1 → h2 → h3 → h4, no skips). `<ol>` for chronology, `<dl>` for data pairs, `<time datetime>` on every date. Skill names all present as text. Status as text. Card accessible names are `"{name} — {one-liner}"`. Copy confirmation via a polite live region. `axe-core` zero violations on all six route types. Full keyboard and VoiceOver pass on `/` and one case study.

### Performance
Home: mobile total ≤320KB and JS ≤20KB gz; desktop total ≤500KB. Case study ≤900KB with images. All images AVIF/WebP with explicit dimensions; only one above-fold image per route is eager. Lighthouse Performance ≥95 mobile on `/` and `/worlds/*`. CLS ≤0.02.

### Testing
Playwright: the §27.4 content-in-HTML assertion (JS disabled — `h1`, role, all 23 skill names, every project name, every article title, the email address all present in raw HTML); every external link has `rel="noopener noreferrer"`; case-study routes generate for every project with a case study; article fallback path works with the network stubbed to fail. `axe-core` all routes. Lighthouse CI. Visual pass at all viewports.

### Acceptance Criteria
- Every section renders real content; **no lorem ipsum, no placeholder images, no "coming soon" chips**.
- Absent optional fields are invisible — no empty labels anywhere.
- The site is genuinely shippable as-is: a recruiter can find role, skills, experience, projects, writing, résumé, and email.
- Content-in-HTML test passes with JS disabled.
- Build fails if a required content field is missing.
- Article build fetch survives a network failure via the committed fallback.

### Definition of Done
A complete, accurate, accessible, fast portfolio that stands on its own without any Phase 4+ enhancement.

### AI Implementation Notes
This is the highest-value phase — spend effort on content fidelity, not effects. Keep the Atlas SVG server-rendered from data so Phase 4 only adds a listener. Do not build the sphere as an image; it is gradients seeded by a slug hash (`src/data/seed.ts`). If a case-study body is missing, omit the case-study route for that project and link the card straight to the live demo rather than generating a thin page. Register analytics call sites now so Phase 8 is configuration only.

### Things NOT to implement yet
No star-field canvas. No constellation hover/highlight interactivity. No scroll-drawn spine. No View Transition `transition:name` pairs on cards (Phase 4). No `/instruments` content beyond the teaser. No Orbit. No OG image generation. No analytics provider. No filtering (§10.4 — deferred indefinitely).

### Expected output
A shippable portfolio: eight populated sections, 2–3 case-study routes, a writing index, a Dossier route, a 404, ≤20KB of mobile JS, Lighthouse ≥95 mobile, and zero axe violations.

---

## Phase 4 — Advanced Space Experience

### Goal
Add the refinement layer that makes the site memorable: the live star field, constellation interactivity, the scroll-drawn spine, and cross-route world transitions.

### Why this phase exists
Everything here is **enhancement over an already-complete site**. Structuring it this way means visual ambition can never compromise content or ship half-finished — each item can be abandoned individually with no loss.

### Prerequisites
Phase 3 done and its performance targets met. **Do not start this phase if Phase 3 is below target** — enhancements built on a failing baseline cannot be measured.

### Tasks
1. **`StarField.tsx`** island (`client:idle` + `client:media="(min-width: 768px)"`): seeded PRNG star generation, pre-allocated typed arrays, DPR capped at 1.5, three depth layers, twinkle, slow drift, 600ms cross-fade over the static layer on hydration.
2. Implement `lib/deviceTier.ts` and wire the §16.4 capability ladder: 900 stars desktop / 400 tablet-and-low-end, 30fps cap on low-end, no hydration under reduced motion.
3. Implement runtime self-degradation: rolling mean frame time >20ms for 2s → halve star count once; >26ms again → stop the loop and keep the last frame. One-way only.
4. Pause the rAF loop on `IntersectionObserver` exit and on `visibilitychange`. Verify with a CPU profile that a hidden tab does zero work.
5. **`AtlasLink.tsx`** island (`client:visible`): one delegated listener over `data-skill` attributes providing two-way star↔row highlight, connected-line brightening, and label reveal for Working/Familiar stars. Stars stay out of the tab order; the list remains the sole tab path.
6. Constellation line draw-in on first intersection (`stroke-dashoffset`, 900ms, 40ms stagger, once).
7. **Trajectory spine scroll-draw**: `animation-timeline: view()` on `stroke-dashoffset` inside `@supports`; desktop only; static full line as the unsupported and mobile state.
8. **View Transition pairs**: `transition:name` on the world sphere and title shared between `WorldCard`/`FeaturedWorld` and `CaseStudyHeader`. Verify the cosmos persists and does not flash. Disable under reduced motion.
9. Extend `section_reach` analytics onto the existing shared observer (no new listener).
10. Re-measure every §26.1 target and record the deltas against the Phase 3 numbers.

### Files / Areas Affected
`src/components/cosmos/StarField.tsx`, `src/components/atlas/AtlasLink.tsx`, `trajectory/Spine.astro`, `worlds/WorldCard.astro`, `worlds/case-study/CaseStudyHeader.astro`, `src/lib/deviceTier.ts`, `src/lib/observeOnce.ts`, `src/styles/global.css`.

### Components
`StarField` (island), `AtlasLink` (island); modifications to `Spine`, `WorldCard`, `FeaturedWorld`, `CaseStudyHeader`.

### Data
`src/data/seed.ts` (deterministic PRNG); `skills.ts` connections consumed for line brightening. No new content.

### State
`StarField`: star arrays, rAF handle, frame stats, degraded flag, visibility — all local. `AtlasLink`: `hoveredSkill` — local. No shared state, no cross-island communication.

### Animation
L1 ambient star drift and twinkle. Constellation line draw (once). Spine scroll-draw (desktop). Card→case-study View Transition (320ms). Everything gated per §16.4: mobile gets none of it, reduced motion gets none of it.

### Responsive Behavior
Star canvas ≥768px only, reduced density 768–1023px. Atlas interactivity ≥768px (the map does not exist below that). Spine scroll-draw ≥1024px. View Transitions everywhere (native and cheap).

### Accessibility
Canvas `aria-hidden` + `role="presentation"`. Star field encodes no information. Atlas tab path unchanged from Phase 3 — verify the island adds **zero** tab stops. Reduced-motion pass: no canvas hydration at all, static lines, static spine, no route transitions. Re-run `axe-core` on all routes; still zero violations.

### Performance
Star field ≤6KB gz, ≤4ms/frame, zero per-frame allocation. `AtlasLink` ≤3KB gz. **Desktop home JS ≤60KB gz; mobile home JS unchanged at ≤20KB** (nothing added there). No regression against Phase 3 on LCP, CLS, INP, or Lighthouse. Hidden tab: 0% CPU.

### Testing
Playwright: canvas absent at 375px width; canvas present at 1280px; reduced-motion emulation shows no canvas element hydrated; `axe-core` clean. Manual: 60s CPU profile on desktop (ambient ≤4ms/frame), background-tab profile (zero work), low-end throttle (4× CPU) triggers degradation exactly once, hard-refresh produces an identical sky (seeded determinism). Lighthouse CI regression check against recorded Phase 3 numbers.

### Acceptance Criteria
- Mobile bundle is **byte-for-byte unchanged** from Phase 3.
- Killing all JS leaves the site visually intact (static sky, static lines, static spine, working navigation).
- Star field is deterministic across reloads.
- Hidden tab does zero rAF work.
- Degradation fires under throttling and never oscillates.
- No Lighthouse or Web Vitals regression versus Phase 3.

### Definition of Done
The site is memorable, and every enhancement is provably removable without loss of content or function.

### AI Implementation Notes
Pre-allocate star arrays once (`Float32Array`) and mutate in place — allocating per frame is the classic cause of GC sawtooth in canvas star fields. Seed the PRNG from a constant, not from `Date.now()`. The cross-fade must go over the static layer, never replace it — if hydration fails mid-way the static sky must still be there. Do not add a scroll listener for the spine; use `animation-timeline: view()` and accept the static fallback. Resist adding a second experiment here — the one experiment belongs in Phase 5 on its own route.

### Things NOT to implement yet
No WebGL, no Three.js, no R3F. No Orbit simulation (Phase 5). No `/instruments` content. No mouse-follow, cursor-distortion, magnetic, or tilt effects — ever. No additional ambient systems. No OG images or analytics provider (Phase 8).

### Expected output
A living sky and an interactive star chart on desktop, an unchanged mobile bundle, cinematic world transitions, and no measured performance regression.

---

## Phase 5 — Engineering Showcase

### Goal
Build `/instruments`: four real engineering artifacts plus the single interactive experiment, with the honest capability index.

### Why this phase exists
This is the section that separates "makes nice screens" from "engineers systems". It is also the only place a visitor sees code and architecture, which is what a senior reviewer is looking for.

### Prerequisites
Phase 3 done (the teaser exists). Phase 4 is *not* required — this phase is independent and can run in parallel with it (§31).

### Tasks
1. Build `/instruments`: header, four `InstrumentPanel`s (I-01…I-04 per §14.2), `CapabilityIndex` strip, back-to-survey chrome.
2. `CodeExcerpt.astro` using Astro's build-time Shiki. One annotated excerpt for I-02 (Playwright) and up to two for I-01. No client-side highlighter.
3. `ArchitectureDiagram.astro`: hand-authored inline SVG for I-03 (multi-brand monorepo CMS), colored by tokens, `role="img"` with a real `aria-label`, plus a bulleted text description beside it.
4. I-01 component-library demos: 3–4 live component instances. If they require Framer Motion, it loads **only on this route** (§19.8) and must stay inside the route JS budget.
5. **`Orbit.tsx`** (§14.3): Canvas 2D n-body sim, ≤200 bodies, semi-implicit Euler, softened gravity, seeded initial conditions, optional cursor attractor, trailing paths. `client:visible` + `client:media="(min-width: 1024px)"`.
6. Orbit telemetry readouts: FPS, body count, frame time, DPR — mono, `aria-live="off"`.
7. Orbit lifecycle and guards: rAF pause on intersection exit and `visibilitychange`; two-stage auto-degradation (>20ms/2s → halve; >26ms → stop and show poster); hard caps on count, DPR, and canvas size.
8. `OrbitPoster.astro`: static AVIF poster + description; hosts the `START SIMULATION` button under reduced motion; is the only thing rendered below 1024px.
9. Wire `instrument_interact` analytics call sites (still no-op until Phase 8).
10. Measure the route against its own budget (§26.2) and record it.

### Files / Areas Affected
`src/pages/instruments.astro`, `src/components/instruments/*`, `src/assets/images/orbit-poster.avif`, `src/lib/analytics.ts`.

### Components
`InstrumentPanel`, `CodeExcerpt`, `ArchitectureDiagram`, `CapabilityIndex`, `Orbit` (island), `OrbitPoster`.

### Data
`instruments` collection (4 entries). Code excerpts and diagram content authored as content, not hardcoded in components.

### State
`Orbit`: sim arrays, running flag, frame stats, degraded flag — all local. Component demos own their own local state.

### Animation
Orbit simulation (L1-class ambient, but user-startable and stoppable). Section entrances via the shared observer. Component demos animate per their own library. Nothing else.

### Responsive Behavior
≥1024px: 2-col panels, Orbit live with side telemetry. 768–1023px: 1-col, Orbit → poster. <768px: 1-col, Orbit → poster, code excerpts scroll inside `overflow-x: auto` containers (the page never scrolls sideways).

### Accessibility
Each instrument is an `<article>` with an `h3`. Canvas `aria-hidden`, with an adjacent paragraph describing what the simulation shows and what it demonstrates — the required accessible equivalent. `START SIMULATION` is a real `<button>` with `aria-pressed`. Code blocks are `<pre><code>` with a language label and are keyboard-scrollable. Telemetry is `aria-live="off"`. Diagram has a text equivalent. `axe-core` zero violations.

### Performance
Route JS ≤160KB gz total (Orbit ≤12KB; the rest is React runtime plus any component-library dependency). Images ≤400KB. Orbit ≤10ms/frame with hard caps. **Lighthouse Performance ≥90 mobile** — achievable because Orbit and the demos never load there. Zero impact on the home route's budget.

### Testing
Playwright: no canvas element at 768px or below; canvas present and running at 1280px; reduced-motion shows the poster and a start button; `axe-core` clean. Manual: 4× CPU throttle triggers degradation exactly once then stops cleanly; hidden tab does zero work; 5-minute soak shows no memory growth (heap snapshot comparison); keyboard pass over all panels and controls.

### Acceptance Criteria
- Every instrument is backed by real evidence — a live demo, a real code excerpt, or a real diagram. **No unevidenced claims.**
- The nine capability categories appear only as an honestly-labelled index, never as portfolio pieces.
- Orbit never loads below 1024px and never runs unseen.
- Home route budgets are unaffected.
- Memory is flat over a 5-minute soak.

### Definition of Done
A senior engineer reading this route learns something true about how the owner works, and the route stays within budget.

### AI Implementation Notes
Exactly **one** experiment. If Orbit becomes hard, simplify the physics — do not reach for WebGL (§19.8; R3F is optional Phase 5b only, and only on proof that Canvas cannot do it). Pre-allocate all body arrays; no per-frame allocation. Keep the poster in sync with the real sim's look, since it is what most visitors see. Author code excerpts as content entries so they can be updated without touching components.

### Things NOT to implement yet
No second experiment. No WebGL/R3F. No live GitHub API calls (a build-time fetch is acceptable later; a runtime one is not). No playground/sandbox editor. No OG images or analytics provider (Phase 8).

### Expected output
An `/instruments` route with four evidenced instruments, one well-behaved Canvas experiment with live telemetry, honest capability labelling, and Lighthouse ≥90 mobile.

---

## Phase 6 — Responsive & Accessibility Hardening

### Goal
Verify and close every responsive and accessibility gap on real devices and real assistive technology.

### Why this phase exists
Phases 1–5 each carried a11y and responsive gates, so this phase is *verification and edge cases*, not remediation. It exists because emulators lie: real iOS Safari, real Android Chrome, and real screen readers surface issues nothing else does.

### Prerequisites
Phases 1–5 done (Phase 5 may still be in flight if `/instruments` is excluded from this pass and re-tested after).

### Tasks
1. Device matrix pass: iPhone SE (320/375), iPhone 15 (390), Pixel (412), iPad (768/1024), 1280, 1440, 1920. Real hardware or BrowserStack for at least iOS Safari and Android Chrome.
2. Fix every horizontal-overflow, clipped-text, and tap-target issue found. Verify no page scrolls sideways at 320px.
3. Full keyboard pass on all six route types: order, visibility, no traps, skip link, anchor `scroll-margin`, rail and bottom bar operability.
4. Screen-reader pass: VoiceOver + Safari (macOS and iOS) and NVDA + Firefox on `/`, one case study, and `/instruments`. Verify heading outlines, list semantics, `<dl>` pairs, dates, link names, live regions, and that no decorative layer is announced.
5. 200% zoom and 400% reflow pass; `prefers-contrast: more` and forced-colors pass.
6. Reduced-motion pass on every route: confirm each of the four motion levels is correctly suppressed and the result looks intentional.
7. JS-disabled pass on every route: content, navigation, and all links functional.
8. Touch pass: confirm no hover-only information anywhere, no stuck hover states, safe-area insets correct, bottom bar behaviour correct with a focus ring inside it.
9. Add the automated a11y suite to CI: `axe-core` via Playwright across all route types, zero violations, plus a keyboard-order snapshot test for `/`.
10. Re-verify the §25.2 contrast table against the shipped CSS.

### Files / Areas Affected
Fixes across `src/components/**` and `src/styles/global.css`; new `tests/a11y/*` and `tests/responsive/*`; CI config.

### Components / Data / State
No new components, data, or state. Fixes only. If a fix requires new markup, it must reuse existing primitives.

### Animation
No new animation. Verify suppression only.

### Responsive Behavior
The §24.2 effect matrix is verified line by line on real devices and signed off.

### Accessibility
**WCAG 2.2 AA conformance on every route**, verified automatically and manually per §25.4.

### Performance
No regression. Mobile budgets (§26.2) still met after fixes. Watch for fixes that add DOM or CSS weight.

### Testing
The full §34 matrix, executed and recorded. Automated suites added to CI so regressions are caught later.

### Acceptance Criteria
- Zero `axe-core` violations on all six route types, enforced in CI.
- Zero horizontal scroll at 320px on every route.
- All targets ≥44×44px with ≥8px separation.
- Complete keyboard operability with a visible focus indicator throughout.
- Screen-reader pass with no unlabelled controls, no announced decoration, and a correct heading outline.
- Reduced-motion and JS-disabled passes both look deliberate on every route.
- Contrast table re-verified with measured values.

### Definition of Done
The site is conformant, usable on a 320px screen and with a screen reader, and CI will fail if that regresses.

### AI Implementation Notes
Fix causes, not symptoms: an overflow at 320px is usually a missing `min-width: 0` on a flex child or an unwrapped long string, not a case for `overflow: hidden`. Never fix a focus-visibility problem by removing the outline. If a screen-reader issue tempts you toward ARIA, first check whether the correct element would solve it.

### Things NOT to implement yet
No new features. No visual redesign. No new motion. Do not "improve" content here.

### Expected output
A conformant, device-verified site with automated a11y and responsive regression tests in CI, and a recorded test matrix.

---

## Phase 7 — Performance

### Goal
Measure everything, close every gap against §26.1 and §26.2, and lock the budgets into CI.

### Why this phase exists
Budgets were enforced per phase, but only a whole-site pass can find cumulative issues: font subsetting waste, duplicated CSS, image over-delivery, and unnecessary hydration.

### Prerequisites
Phases 1–6 done. A deployed production-equivalent preview URL (local numbers are not authoritative).

### Tasks
1. Bundle analysis per route. Identify every byte of JS and justify it against the §20.2 island inventory. Delete anything unjustified.
2. Confirm hydration reality: verify in devtools that mobile hydrates only `SectionRail`, `MobileNav`, and `CopyEmail`, and that no `client:media`-gated island downloads outside its media condition.
3. Font audit: verify subsets, confirm ≤110KB total, confirm only two faces are preloaded, and confirm fallback metric overrides produce CLS 0 on swap. Re-subset the mono face if over budget.
4. Image audit: every image AVIF/WebP with correct `sizes`, explicit dimensions, and exactly one eager image per route. Verify no image exceeds its §26.2 budget and no over-delivery (a 640px slot must not receive a 1920px file).
5. CSS audit: one hashed stylesheet, critical CSS inlined, no duplicated token blocks, ≤30KB gz.
6. Animation audit: confirm every animated property is `transform`/`opacity` (plus the two sanctioned exceptions), no `will-change` left applied, and no layout thrash in a scroll profile.
7. Canvas audit: DPR cap, pause-on-hidden, zero per-frame allocation, capped counts, one-way degradation — for both `StarField` and `Orbit`.
8. Lighthouse (mobile + desktop) on `/`, `/worlds/*`, `/instruments`, `/transmissions`, `/dossier`. Record every metric.
9. Close all gaps against §26.1/§26.2. If a target cannot be met, **reduce scope** (fewer stars, drop an effect) rather than raising the budget.
10. Add Lighthouse CI and a bundle-size budget check to CI as **failing** assertions.
11. Verify cache headers: immutable hashed assets, revalidating HTML.

### Files / Areas Affected
`astro.config.mjs`, `src/styles/global.css`, font assets, image assets, island code, CI config, `PERF.md` (recorded measurements).

### Components / Data / State
No new ones. Some components may be converted from island to static if the audit shows their JS is unjustified — that is the ideal outcome of this phase.

### Animation
Optimisation only; no new motion. Reduce star counts or drop an effect if budgets demand it.

### Responsive Behavior
Verify mobile really is the cheapest tier (it should be the smallest bundle by a wide margin).

### Accessibility
No regression — re-run the Phase 6 automated suite after every optimisation. Never trade accessibility for bytes (P8 and §37 of the brief).

### Performance
All §26.1 targets met on the deployed preview; all §26.2 budgets met per route.

### Testing
Lighthouse CI in place and failing on regression. Bundle budget check in place. Manual: 4× CPU + Slow 4G throttled pass on `/`; 60s ambient CPU profile; hidden-tab profile; 5-minute Orbit soak for memory.

### Acceptance Criteria
- Lighthouse mobile: Performance ≥95 (`/`, `/worlds/*`), ≥90 (`/instruments`); Accessibility 100 everywhere.
- LCP ≤1.8s mobile / ≤1.2s desktop; CLS ≤0.02; INP ≤150ms.
- Mobile home JS ≤20KB gz; desktop home JS ≤60KB gz.
- Fonts ≤110KB; CSS ≤30KB gz; mobile home total ≤320KB.
- CI fails on any budget or Lighthouse regression.
- Every remaining byte of JS is attributable to a listed island.

### Definition of Done
The measured numbers match the plan, they are recorded, and CI prevents silent regression.

### AI Implementation Notes
Measure before changing anything; optimise the largest item first. The most likely wins here are font subsetting and image over-delivery, not JS. If a target is missed, the correct response is to cut an effect — the effects were designed to be individually removable precisely so this decision is easy.

### Things NOT to implement yet
No new features. No new dependencies (a performance library would be self-defeating). Do not add SSR or an adapter to "improve" anything — static is already optimal here.

### Expected output
A measured, recorded, CI-enforced performance profile meeting every target, with all numbers written into `PERF.md`.

---

## Phase 8 — SEO & Production

### Goal
Make the site discoverable, shareable, observable, and deployed.

### Prerequisites
Phases 1–7 done. Production domain chosen (Phase 0).

### Tasks
1. Per-route metadata via `lib/seo.ts`: titles (≤60 chars), unique descriptions (140–160 chars), canonicals, OG/Twitter tags, `og:image:alt`.
2. Build-time OG image generation (`pages/og/[...route].ts`, Satori) — one per route plus one per project, in the site's visual language.
3. JSON-LD per §27.2: `Person` + `WebSite` on `/`, `CreativeWork`/`SoftwareApplication` + `BreadcrumbList` on case studies, `ItemList` of `BlogPosting` on `/transmissions`, `ProfilePage` on `/dossier`. Validate with Google's Rich Results Test.
4. `@astrojs/sitemap`, `robots.txt`, `/rss.xml`. Exclude `/dev/tokens` from both the sitemap and production output.
5. Enforce the §27.3 canonical rule for articles: excerpt-only, links out to dev.to.
6. Add the §27.4 content-in-HTML SEO smoke test to CI.
7. Connect the analytics provider (§28) and switch the eight call sites from no-op to live. Verify each fires exactly once per intended action and that no PII is sent.
8. Verify error states: 404 renders correctly for any unknown path; all redirects (§23) work; no broken internal or external links (link-check in CI).
9. Deploy per §35: production build, host configuration, cache headers, domain, HTTPS, redirect from any preview/legacy domain.
10. Post-deploy verification: Lighthouse on the production URL, social-preview check (paste links into Slack/LinkedIn/X), search-console submission, and a real-user vitals check after ~48 hours.

### Files / Areas Affected
`src/lib/seo.ts`, `src/pages/og/*`, `astro.config.mjs`, `public/robots.txt`, `src/pages/rss.xml.ts`, `src/lib/analytics.ts`, host config, CI config.

### Components / State
`SEOHead` partial inside `BaseLayout`. No new client state.

### Data
Metadata fields per route and per project; social handles from `profile`.

### Accessibility
OG images carry `og:image:alt`. Metadata language is `en`. No accessibility regression (re-run the suite).

### Performance
OG generation is build-time only and must not appear on any critical path. Analytics script ≤2KB, loaded `defer`/async, and must not affect INP. Re-run Lighthouse after adding analytics — it is the most likely late regression.

### Testing
Rich Results Test passes for every structured-data type. Content-in-HTML test passes with JS disabled. Link-check clean. Social previews render correctly on at least three platforms. Analytics events verified once each in the provider dashboard. Lighthouse on production still meets §26.1.

### Acceptance Criteria
- Every route has a unique title, description, canonical, and OG image.
- Structured data validates with zero errors.
- Sitemap and robots correct; `/dev/tokens` absent from production.
- Article pages do not compete with dev.to (excerpt-only, links out).
- All eight analytics events fire exactly once per action, with no PII and no consent banner required.
- Production Lighthouse still meets Phase 7 targets **after** analytics is live.
- 404 and all redirects work on the production host.

### Definition of Done
The site is live on its domain, indexable, shareable with correct previews, and instrumented.

### AI Implementation Notes
Set `site` in `astro.config.mjs` before generating anything — canonicals and OG URLs silently break without it. Generate OG images at build; never at request time. Keep `analytics.ts` a no-op when the provider key is absent so local development and CI stay silent.

### Things NOT to implement yet
No consent banner (not needed with a cookieless provider — do not add one "to be safe"). No third-party pixels. No A/B testing. No newsletter or CMS integration.

### Expected output
A live, indexed, instrumented production site with validated structured data and correct social previews on every route.

---

## Phase 9 — QA & Polish

### Goal
Cross-browser, cross-device verification and the final visual pass that separates "complete" from "premium".

### Prerequisites
Phase 8 deployed.

### Tasks
1. Browser matrix (§33): Chrome, Safari, Firefox, Edge on desktop; iOS Safari and Android Chrome on mobile. Two most recent major versions each.
2. Verify graceful degradation of newer CSS in older-but-supported browsers: `animation-timeline` (static fallback), `color-mix` (verify support or add fallbacks), `backdrop-filter` (opaque fallback), View Transitions (plain navigation), `@supports` branches all exercised.
3. Interaction QA: every link and button on every route; every external link opens correctly with `rel="noopener noreferrer"`; copy-to-clipboard on Safari and in a non-secure context; PDF download on iOS Safari (a known problem case for `download`).
4. Visual polish pass at 1440px and 390px: optical alignment of corner ticks and hairlines, consistent section rhythm, no orphaned words in display type, consistent chip sizing, spacing of the stat strip, terminal punctuation and casing across all mono labels.
5. Copy proofread: spelling, capitalisation of technology names (`Next.js`, `Node.js`, `Tailwind CSS`, `TypeScript`, `Playwright`, `PostgreSQL`), date formats, and the §13.1 banned-words check.
6. Content accuracy audit against reality: every link resolves, every metric is defensible, every stack list matches the actual project, the year is current, and the "currently learning" copy is not stale.
7. Console hygiene: zero errors and zero warnings on every route in every browser.
8. Empty/edge-state review: what a case study with no metrics looks like; what Transmissions looks like if the fetch falls back; what the Atlas looks like if a skill lacks connections.
9. Re-run the full §34 matrix one final time on production.
10. Write the Decision log's final entries and update `README.md` with the architecture summary, the phase status, and how to run/deploy.

### Files / Areas Affected
Small fixes across `src/**`; `README.md`; the Decision log.

### Components / Data / State / Animation
Refinements only. Any change larger than a polish fix belongs in a new phase, not here.

### Accessibility / Performance
Full suites re-run on production; all Phase 6 and Phase 7 criteria must still hold. This is the last gate.

### Testing
The complete §34 matrix on production, recorded. All CI suites green.

### Acceptance Criteria
- Correct rendering and behaviour in all six target browsers.
- Zero console errors or warnings anywhere.
- All links resolve; all copy proofread; all technology names correctly cased.
- Every `@supports` fallback visually verified, not just assumed.
- Accessibility and performance suites green on production.
- `README.md` and the Decision log are current.

### Definition of Done
Nothing on the site looks unfinished, and every claim in this document is verifiably true of the deployed site.

### AI Implementation Notes
Verify fallbacks by actually disabling the feature (devtools flags, or a temporary `@supports` inversion), not by reasoning about support tables. Test the PDF download on a real iPhone — `download` on cross-origin or in-app browsers behaves differently and this is a genuine conversion path.

### Things NOT to implement yet
No new sections, effects, dependencies, or content. Anything new goes to §37 Future Enhancements.

### Expected output
A verified, polished, production portfolio with green suites, a current README, and a complete Decision log.

---

## 31. Phase Dependencies

```text
Phase 0  Discovery & Creative Direction
   │  (content pack, locked direction)
   ▼
Phase 1  Foundation — tokens, primitives, collections, routes
   │
   ▼
Phase 2  Core Experience — cosmos, nav, hero, scroll architecture
   │
   ▼
Phase 3  Portfolio Content ◄──── SHIPPABLE MILESTONE
   │        (site is complete and launchable here)
   ├──────────────────────────┐
   ▼                          ▼
Phase 4  Advanced Space    Phase 5  Engineering Showcase
   │     (home enhancements)  │      (/instruments route)
   └──────────┬───────────────┘
              ▼
Phase 6  Responsive & Accessibility Hardening
              ▼
Phase 7  Performance
              ▼
Phase 8  SEO & Production
              ▼
Phase 9  QA & Polish
```

### 31.1 Parallelisable work

| Can run in parallel | Why it is safe |
|--------------------|----------------|
| **Phase 4 and Phase 5** | Phase 4 touches home-route enhancements (`cosmos/`, `atlas/`, `trajectory/`, `worlds/`); Phase 5 builds a separate route (`instruments.astro`, `instruments/`). No shared files except `analytics.ts`. |
| Phase 0 content work and Phase 1 foundation | Phase 1 needs the *schemas*, not the final copy. Foundation can proceed with real-but-incomplete seed data as long as Phase 3 does not start until Phase 0 is closed. |
| Screenshot capture (C2) and Phases 1–2 | Assets are only consumed in Phase 3. |
| Font subsetting and Phase 1 | Independent of component work, needed by the end of Phase 1. |
| Automated test scaffolding and Phases 2–5 | Playwright/axe harness setup can precede the assertions it will run. |

### 31.2 Hard sequencing constraints

- **Phase 1 before everything else.** Sections built before tokens exist will hardcode values.
- **Phase 2 before Phase 3.** Sections need the `Section` contract and the shared observer.
- **Phase 3 before Phase 4.** Enhancements need a measured baseline; without it, regressions are undetectable.
- **Phases 4 and 5 before Phase 7.** Performance work must measure the final feature set.
- **Phase 7 before Phase 8.** Analytics is added last so it cannot mask a performance problem.
- **Phase 8 before Phase 9.** Final QA runs against production.
- **Anchor ids are frozen at Phase 2** (§23) — renaming later breaks shared links.

### 31.3 The shippable milestone

**End of Phase 3 is a genuine launch point.** If the project must stop there — time, priorities, anything — the result is a complete, fast, accessible, honest portfolio. Phases 4–5 add memorability; Phases 6–9 add rigour. This ordering is deliberate: it means the project can never be caught with a spectacular hero and no content.

---

## 32. Definition of Done

### 32.1 Universal DoD — applies to every phase

A phase is done only when **all** of the following hold:

1. Every task in the phase is complete, or explicitly deferred with a recorded reason in the Decision log.
2. Every acceptance criterion in the phase is verified — measured or manually confirmed, not assumed.
3. `pnpm build` succeeds with **zero errors and zero warnings**.
4. TypeScript passes with no `any` and no suppressions in committed code.
5. `axe-core` reports **zero violations** on every route the phase touched.
6. The phase's performance budgets (§26.2) are met and the measured values are recorded.
7. The JS-disabled pass and the reduced-motion pass both look deliberate on every route the phase touched.
8. Zero console errors or warnings in Chrome and Safari.
9. No new runtime dependency was added without a Decision log entry per §19.8.
10. No hardcoded design values were introduced (token lint passes).
11. Nothing from a later phase leaked in (the "Things NOT to implement yet" list was respected).

### 32.2 Project-level DoD

The project is done when: every phase's DoD is satisfied; §38's Final Quality Checklist is fully ticked; the site is live on its production domain; CI enforces accessibility, performance, and content-in-HTML on every PR; and the Decision log explains every significant deviation from this document.

### 32.3 What "done" explicitly does not mean

Not: "the code exists". Not: "it works on my machine". Not: "Lighthouse was 95 locally". Not: "it looks right in Chrome". Every criterion is verified on a deployed preview at the specified viewport, with the specified assistive technology, at the specified throttling.

---

## 33. Risk Register

| # | Risk | Prob. | Impact | Mitigation | Fallback |
|---|------|-------|--------|-----------|----------|
| R1 | **Content gaps never close** (C1–C8), especially employer names and screenshots | **High** | **High** — an experience section without dates reads as concealment | Phase 0 gates the content phase; `company` is a *required* schema field so the build fails rather than shipping a gap | Ship Phase 3 with the explicit disclosed-alternative string and screenshots replaced by procedural spheres; add real data post-launch |
| R2 | **Theme overpowers content** — visitors remember the sky, not the work | Medium | High | P1/P2/P8 as review tie-breakers; one background system only; density-over-spectacle in Worlds and Trajectory | Reduce star count and glow tiers; increase panel opacity; the content layout is independent of the effects |
| R3 | **Poor mobile performance** on low-end Android | Medium | High | `client:media` gating means the expensive islands are never downloaded on mobile; mobile JS budget ≤20KB; no canvas, parallax, or scroll-linked motion below 768px | Static cosmos only (already the mobile default) — nothing further to remove |
| R4 | **Scope creep into a WebGL project** | Medium | High | §19.8 rejects Three.js/R3F; exactly one experiment, on its own route, ≤12KB; dependency admission rule requires written justification | Delete the experiment; `/instruments` still stands on code, diagrams, and demos |
| R5 | **Over-engineering** — abstractions, state libraries, animation frameworks | Medium | Medium | Closed island list (§20.2); no state library (§22); primitives require a third use case; §37-style "avoid overengineering" rule | Delete the abstraction; the plan's components are intentionally shallow |
| R6 | **Accessibility regressions from visual work** | Medium | High | a11y is a gate in every phase; `axe-core` in CI; the list (not the map) is the Atlas's canonical tab path; every visual has a text equivalent (§25.3) | Remove the offending effect — every effect is individually removable by design |
| R7 | **`animation-timeline` / `color-mix` / `backdrop-filter` support gaps** | Medium | Low | All three are used inside `@supports` with designed static fallbacks; Phase 9 verifies each fallback by disabling the feature | Static spine, solid surfaces, plain colors — all already designed |
| R8 | **Canvas memory leak or GC sawtooth** | Low | Medium | Pre-allocated typed arrays, no per-frame allocation, pause on hidden/off-screen, 5-minute soak test with heap snapshots | One-way runtime degradation stops the loop and keeps the last frame |
| R9 | **Font weight blows the budget** (3 families) | Medium | Medium | Latin-only subsets, mono subset to used glyphs, only 2 faces preloaded, ≤110KB total verified in Phase 7 | Drop Instrument Serif and use the body face at display sizes with tighter tracking |
| R10 | **dev.to API changes or fails at build** | Low | Low | Build-time fetch with a committed fallback file that is refreshed on every successful build; failure warns, never breaks | The committed fallback (six posts) ships |
| R11 | **Long initial load from images** on case studies | Medium | Medium | AVIF/WebP via `astro:assets`, one eager image per route, per-image budgets, `sizes` correctness audited in Phase 7 | Reduce gallery to 2 images; defer all but the hero |
| R12 | **Duplicate content vs dev.to** harming the owner's own rankings | Low | Medium | §27.3: excerpt-only, always link out; canonical rule if mirroring is ever added | Remove excerpts; keep title + date + link |
| R13 | **Fake-terminal / preloader nostalgia** — reintroducing the old site's boot splash | Low | Medium | Explicitly forbidden in §1, §9.3, and Phase 2's NOT-yet list | n/a — it is simply not built |
| R14 | **Anchor renaming after launch** breaks shared links | Low | Medium | Anchors frozen at Phase 2 (§23) and treated as a public API | Add redirects for old anchors via a tiny client-side hash map (last resort) |

---

## 34. Testing Strategy

### 34.1 Functional

| Area | Coverage | Tool |
|------|----------|------|
| Routes | All six route types return 200 and render their heading | Playwright |
| Navigation | Rail and bottom bar anchors scroll to the right sections, with and without JS | Playwright |
| Links | Every internal and external link resolves; external links have `rel="noopener noreferrer"` | Playwright + link-check in CI |
| Case studies | One route generated per project with a case study; prev/next paging correct | Playwright |
| Résumé | PDF downloads on desktop and on iOS Safari (manual for iOS) | Playwright + manual |
| Copy email | Clipboard success path, failure path, and confirmation announcement | Playwright |
| Article fallback | Build succeeds and renders six posts with the network stubbed to fail | Build test |
| Redirects | All §23 redirects resolve on the production host | Manual + CI |

**No contact form exists (§15.1), so there is no form validation surface to test.**

### 34.2 Visual

Playwright screenshot comparison at 320, 390, 768, 1280, 1920 for `/`, one case study, and `/instruments`. Baselines updated deliberately, never automatically. `/dev/tokens` is the primitive-level baseline. Manual optical pass at 1440 and 390 in Phase 9.

### 34.3 Accessibility

`axe-core` via Playwright on all six route types — **zero violations, enforced in CI**. Keyboard-order snapshot test for `/`. Manual per §25.4: VoiceOver (macOS + iOS Safari), NVDA (Windows Firefox), 200% zoom, 400% reflow, forced-colors, `prefers-contrast: more`, reduced-motion, JS-disabled.

### 34.4 Performance

Lighthouse CI on `/`, `/worlds/payload-cms`, `/instruments` (mobile + desktop) with §26.1 as failing assertions. Bundle-size budget check against §26.2. Manual: 4× CPU + Slow 4G pass; 60s ambient CPU profile (≤4ms/frame); hidden-tab profile (zero work); 5-minute Orbit soak with heap snapshots; real-user vitals reviewed 48h after launch.

### 34.5 Browser compatibility

Must be tested, not assumed: Chrome, Safari, Firefox, Edge (two latest majors each) on desktop; iOS Safari and Android Chrome (two latest majors) on mobile. Per browser: layout integrity, `@supports` fallback behaviour, canvas rendering, View Transitions, clipboard, PDF download, focus visibility, and console cleanliness.

### 34.6 Content and SEO

The §27.4 content-in-HTML assertion (JS disabled) in CI. Structured-data validation via Google's Rich Results Test. Social-preview verification on three platforms. Banned-words check for §13.1. Technology-name casing check in Phase 9.

### 34.7 CI gates — a PR cannot merge if any fail

1. `pnpm build` clean (zero warnings)
2. TypeScript clean
3. Token lint (no hardcoded design values)
4. `axe-core` zero violations, all routes
5. Lighthouse CI assertions met
6. Bundle budgets met
7. Content-in-HTML test passes
8. Link check clean
9. Visual regression reviewed (not auto-approved)

---

## 35. Deployment Strategy

**Host: Vercel** (recommended) or Netlify/Cloudflare Pages — any static host works, since `output: 'static'` means there is nothing to run. Vercel is preferred because the owner already deploys there, its Analytics is cookieless and needs no banner, and preview deployments per PR are what Lighthouse CI should measure.

| Concern | Decision |
|---------|----------|
| Build | `pnpm build` → `dist/`, Node ≥22.12 (per `package.json` engines) |
| Output | Fully static; **no SSR adapter** — adding one would be pure cost |
| Previews | One per PR; Lighthouse CI and axe run against the preview URL, not localhost |
| Production branch | `main`; every merge deploys |
| Cache headers | Hashed assets `max-age=31536000, immutable`; HTML `max-age=0, must-revalidate`; `/Shubham_resume_2026.pdf` `max-age=3600` |
| Domain | Custom domain with HTTPS and HSTS; `www` → apex redirect (or the reverse, chosen once) |
| Legacy site | Redirect the old `shubham-portfolio-modern.vercel.app` to the new domain to consolidate link equity |
| Freshness | A weekly scheduled rebuild keeps dev.to articles current (§20.4); no runtime fetching |
| Rollback | Host's instant rollback to the previous deployment; every deploy is immutable |
| Secrets | None required. The dev.to endpoint is public; the analytics key is a public client key. **Nothing sensitive belongs in this repo.** |
| Monitoring | Provider RUM for Web Vitals; a weekly manual Lighthouse check for the first month |

**Pre-launch gate:** Phases 1–8 DoD satisfied, production Lighthouse and axe green, social previews verified, all redirects working, 404 correct, and the résumé PDF downloading on a real iPhone.

---

## 36. Folder Structure

The complete tree is specified in **§21.1** and is the authoritative version. Root-level files that complete it:

```text
astro-space-portfolio/
├── .claude/launch.json        dev-server config for tooling (port 4321 — Astro 7 default)
├── astro.config.mjs           site, static output, sitemap, redirects, ClientRouter
├── tsconfig.json              extends astro/tsconfigs/strict (already configured)
├── package.json               Astro 7 · React 19 · Tailwind v4 (already configured)
├── pnpm-workspace.yaml        allowBuilds: esbuild, sharp
├── AGENTS.md → CLAUDE.md      agent instructions (existing)
├── README.md                  architecture summary, phase status, run/deploy
├── PERF.md                    recorded measurements per phase (created in Phase 7)
├── space-portfolio-master-plan.md   this document
├── phase-wise-planning-doc.md       the brief this document answers
├── portfolio-content.md             source content (updated in Phase 0)
├── public/
│   ├── Shubham_resume_2026.pdf      (C6)
│   ├── robots.txt
│   └── favicon assets
├── src/                       see §21.1
└── tests/
    ├── a11y/                  axe + keyboard-order
    ├── functional/            routes, links, nav, clipboard
    ├── visual/                screenshot baselines
    └── seo/                   content-in-HTML, structured data
```

**Structural conventions.** Components are grouped by *section*, not by type, because they change together — `worlds/` changes when the projects section changes, and nothing else does. `ui/` is the only cross-cutting group and holds exactly nine primitives. Islands (`.tsx`) sit beside the `.astro` components they enhance, so the client/server boundary is visible in the file listing rather than hidden in a `client/` folder. `data/` holds hand-authored structural data (star coordinates, PRNG); `content/` holds editorial content. Anything in `lib/` must be used by at least two callers.

---

## 37. Future Enhancements

Deliberately out of scope. Do not build these during Phases 0–9; record any new idea here rather than acting on it.

| Idea | Condition for revisiting |
|------|-------------------------|
| Project filtering / tag pages | At ≥6 projects (§10.4), implemented as static filtered routes |
| Contact form | Only if email volume proves insufficient; needs an endpoint, spam protection, and monitoring (§15.1) |
| Full article mirroring from dev.to | Only with `rel="canonical"` to dev.to on every mirrored page (§27.3) |
| Light mode | Only if a real need appears; requires a complete second visual system (§22) |
| WebGL / R3F experiment | Only on proof that Canvas 2D cannot achieve the effect; desktop-only, ≤120KB gz (§19.8) |
| A second experiment in the Instrument Bay | Only if the first is proven to hold engagement without hurting the route's budget |
| Case-study reading progress / TOC | Only if case studies exceed ~1,500 words |
| i18n | Only for a concrete audience need; the fluid type scale and token system already accommodate it |
| Live GitHub stats | Build-time fetch only, with a committed fallback — never a runtime API call |
| MDX-authored case studies | If case-study layouts start needing per-project custom blocks |
| View-source / "how this was built" page | A natural extension of `/instruments`; high appeal to the peer-engineer journey (§6.3) |
| Print stylesheet for case studies | Low cost, occasionally requested by recruiters |

---

## 38. Final Quality Checklist

Tick every box before declaring the project complete.

**Creative direction**
- [ ] The DEEP FIELD concept is legible without explanation
- [ ] Every codename ships with its plain label (P3)
- [ ] The visual register is cinematic/scientific — not neon, not gaming
- [ ] Every space visual encodes real data or spatial position (P2)
- [ ] Exactly one ambient background system exists site-wide (P5)

**UX**
- [ ] Recruiter journey (§6.1) completes in ≤60s on mobile
- [ ] Résumé reachable in ≤1 interaction from every route
- [ ] Email reachable in ≤2 interactions from every route
- [ ] No journey requires hover, JS, or motion
- [ ] Scroll is never hijacked, snapped, or gated (P4)

**UI**
- [ ] Every value comes from a token; token lint passes
- [ ] All six visual states defined for every interactive element
- [ ] Type never exceeds 2 lines at any breakpoint, verified at 320px
- [ ] No text glow below `--text-display-m`
- [ ] Corner-tick and hairline treatment consistent across all panels

**Content**
- [ ] C1–C8 resolved or consciously deferred and recorded
- [ ] No lorem ipsum, no placeholder images, no "coming soon" chips
- [ ] Absent optional fields are invisible, not empty-labelled
- [ ] §13.1 banned words absent; every paragraph carries a verifiable specific
- [ ] Every metric is defensible; every stack list matches reality
- [ ] Technology names correctly cased throughout

**Components**
- [ ] Island list matches §20.2 exactly — no unlisted islands
- [ ] No island exceeds 12KB gz
- [ ] Every island's server-rendered fallback is independently correct
- [ ] Only nine `ui/` primitives; no abstraction without a third use case
- [ ] No React component without state or effects

**Animation**
- [ ] Every animation maps to a §16.2 level and a named purpose
- [ ] Only `transform`/`opacity` animated (plus the two sanctioned exceptions)
- [ ] Entrances fire once and never replay
- [ ] Exactly one `IntersectionObserver` drives all entrances
- [ ] Reduced motion suppresses L1/L3/L4 and looks deliberate

**Responsive**
- [ ] §24.2 effect matrix verified line by line on real devices
- [ ] Zero horizontal page scroll at 320px on every route
- [ ] All targets ≥44×44px with ≥8px separation
- [ ] `svh`/`dvh` used everywhere; no `100vh`
- [ ] Mobile is the smallest bundle by a wide margin

**Accessibility**
- [ ] Zero `axe-core` violations on all six route types, enforced in CI
- [ ] WCAG 2.2 AA conformance verified
- [ ] Full keyboard operability with a visible focus indicator
- [ ] VoiceOver and NVDA passes recorded
- [ ] Every §25.3 accessible equivalent implemented
- [ ] Contrast table (§25.2) verified with measured values
- [ ] JS-disabled pass complete on every route

**Performance**
- [ ] Lighthouse mobile ≥95 (`/`, `/worlds/*`), ≥90 (`/instruments`); Accessibility 100
- [ ] LCP ≤1.8s mobile / ≤1.2s desktop; CLS ≤0.02; INP ≤150ms
- [ ] Mobile home JS ≤20KB gz; desktop ≤60KB gz
- [ ] Fonts ≤110KB; CSS ≤30KB gz; mobile home total ≤320KB
- [ ] Hidden tab does zero rAF work; 5-minute soak shows flat memory
- [ ] CI fails on any budget or Lighthouse regression
- [ ] Every byte of JS attributable to a listed island

**SEO**
- [ ] Unique title, description, canonical, and OG image per route
- [ ] Structured data validates with zero errors
- [ ] Sitemap, robots, and RSS correct; `/dev/tokens` excluded from production
- [ ] Articles are excerpt-only and link out to dev.to
- [ ] Content-in-HTML test passes with JS disabled

**Analytics**
- [ ] Exactly the eight §28.1 events, each firing once per action
- [ ] No PII, no third-party pixels, no consent banner needed
- [ ] Lighthouse re-verified after analytics went live

**Testing**
- [ ] All nine §34.7 CI gates green
- [ ] Full §34 matrix executed on production and recorded

**Deployment**
- [ ] Live on the custom domain with HTTPS and correct cache headers
- [ ] All §23 redirects working; legacy domain redirected
- [ ] 404 correct for arbitrary paths
- [ ] Résumé PDF verified downloading on a real iPhone
- [ ] Rollback path confirmed

**Browser compatibility**
- [ ] Chrome, Safari, Firefox, Edge, iOS Safari, Android Chrome all verified
- [ ] Every `@supports` fallback verified by disabling the feature
- [ ] Zero console errors or warnings in any browser

**Production readiness**
- [ ] Every phase's DoD satisfied
- [ ] `README.md` and `PERF.md` current
- [ ] Decision log explains every deviation from this document
- [ ] No secrets in the repository

---

# Final Master Checklist

A single-pass sign-off. Every line is a yes/no with evidence.

| # | Item | Evidence required |
|---|------|------------------|
| 1 | Creative concept is coherent and legible without explanation | Someone unfamiliar describes the site correctly after 30s |
| 2 | The five questions in §38 are answerable in 60s on mobile | Timed run with a real person |
| 3 | Content is complete, accurate, and specific — no placeholders | Content audit against §20.3 schemas |
| 4 | Site is fully functional with JavaScript disabled | Playwright run, JS off, all routes |
| 5 | Site is fully functional with motion disabled | Reduced-motion pass, all routes |
| 6 | Site is fully functional on a 320px screen | Manual pass, no horizontal scroll |
| 7 | Zero accessibility violations; WCAG 2.2 AA verified | axe CI + manual SR/keyboard/zoom passes |
| 8 | Performance targets met on production | Lighthouse + Web Vitals records in `PERF.md` |
| 9 | Mobile bundle is minimal and expensive islands never download there | Network panel evidence per route |
| 10 | Every animation has a named purpose and a suppression path | §16.3 table reconciled against shipped code |
| 11 | Exactly one background system and one experiment exist | Code audit |
| 12 | Island list matches §20.2 with no additions | Build output audit |
| 13 | No unjustified runtime dependency was added | `package.json` diff + Decision log |
| 14 | Design tokens are the sole source of visual values | Token lint green |
| 15 | SEO complete: metadata, structured data, sitemap, OG images, canonicals | Rich Results Test + social previews |
| 16 | Analytics limited to the eight defined events, no PII | Provider dashboard |
| 17 | All nine CI gates enforce the above on every PR | CI config review |
| 18 | Cross-browser verified on six browsers | Test matrix record |
| 19 | Deployed on a custom domain with redirects and rollback | Production checks |
| 20 | The portfolio would have been shippable at the end of Phase 3 | Retrospective confirmation |

---

## Decision log

Append one row per significant decision, deviation, or deferral. This is how a future agent or reader understands why the shipped site differs from this plan.

| Date | Phase | Decision / Deviation | Reason |
|------|-------|---------------------|--------|
| 2026-09-04 | 0 | Architecture targets **Astro 7 islands**, not Next.js as the brief assumed | The project is already Astro 7 + React 19 + Tailwind v4, and the content is ~90% static with 6 interactive widgets — the island model's strongest case (§19.1) |
| 2026-09-04 | 0 | **Dark-only**; no light mode | The concept is a night sky; a light mode needs a complete second visual system for no established need (§22) |
| 2026-09-04 | 0 | **No animation library**, no Three.js/R3F, no state library | Every specified animation is expressible in CSS; there is no cross-island state (§19.8, §22) |
| 2026-09-04 | 0 | **No contact form** | Adds an endpoint, spam surface, and failure modes for a channel recruiters do not prefer (§15.1) |
| 2026-09-04 | 0 | **No project filtering** | 2–3 projects; revisit at ≥6 (§10.4) |
| 2026-09-04 | 0 | Old site's simulated terminal boot splash **removed** | Gates content behind theatre and delays first paint (§1, §9.3) |
| 2026-09-04 | 0 | Skill percentages **replaced by three named tiers** | Percentages are the "React ⭐⭐⭐⭐⭐" problem restated; tiers are honest and readable (§11.1) |
| 2026-09-04 | 0 | `SHB-3b` "Static Websites" **dropped from Projects** pending C4 | It is a category, not a project, and has no demo (§10.1) |
| 2026-09-04 | 0 | Hero lede rewritten from the source copy | The original is generic and could describe anyone (§9.2, C7) |
| 2026-09-04 | 0 | "UI Showcase" reframed as **Instrument Bay** with four evidenced instruments | Nine icon chips were unevidenced claims — the weakest content on the old site (§14.1) |

