# Space Portfolio — Master Plan

**Codename:** DEEP FIELD
**Owner:** Shubham Tiwari — Frontend Engineer
**Stack:** Astro 7 (islands) + React 19 + React Three Fiber + TypeScript (strict) + Tailwind CSS v4
**Document status:** Implementation blueprint — **Revision 2**. No code in this document.
**Consumed by:** an AI coding agent or developer, executing phase by phase.

---

## Revision 2 — the maximalist turn

Revision 1 was a deliberately restrained site: a static page, a CSS star field, three accent colours, six tiny islands, no WebGL and no raster imagery. It would have been fast and tasteful and **not memorable enough**. The owner's call, and it is the right one for a portfolio whose job is to be remembered:

> Space-related imagery, 3D components, something unique, React for the interactive and complex parts, and multiple space colours.

**Four decisions define Revision 2:**

| # | Decision | What it replaces |
|---|----------|-----------------|
| 1 | **A single persistent WebGL scene spans the whole site.** Scroll drives a camera along a continuous flight path from intergalactic space to an orbital station. | A static CSS star field |
| 2 | **Eight spectral bands.** Each section owns an accent hue drawn from real emission-line astronomy, and that hue drives both the DOM accents and the 3D scene's lighting at that point in the flight. | Three fixed accents |
| 3 | **AI-generated space art**, tuned to the palette, for backdrops, planet textures and no-WebGL fallbacks. | Zero raster imagery |
| 4 | **React owns everything interactive or complex** — the scene graph, planets, the skills globe, the simulation. | Six ≤12KB islands |

### What this costs, stated plainly

Revision 1's budgets are unreachable now, and pretending otherwise would make this document useless. The honest new numbers (full detail in §26):

| | Revision 1 | Revision 2 |
|---|---|---|
| Desktop JS | ≤60KB gz | **≤340KB gz** (three.js ~150KB + R3F ~40KB + drei subset + app) |
| Mobile JS | ≤20KB gz | **≤190KB gz** (mobile keeps the 3D, at reduced fidelity) |
| Images | ~60KB | **≤1.6MB** desktop / ≤600KB mobile (AVIF) |
| Desktop LCP | ≤1.2s | **≤2.2s** |
| Mobile LCP | ≤1.8s | **≤3.0s** |
| Lighthouse mobile | ≥95 | **≥78** |
| Lighthouse a11y | 100 | **100 — unchanged, non-negotiable** |

**Accessibility does not move.** Nor does the content contract. Everything else was negotiable; these two are not, and §25 gets *stricter* in this revision, not looser, because a WebGL spine is exactly the architecture that tends to eat its own content.

### The one rule that makes a 3D spine survivable

**The canvas is a layer, never a container.**

The 3D scene sits `position: fixed` behind the page at `--z-scene`. The DOM content scrolls over it as ordinary, selectable, crawlable, keyboard-navigable HTML. Scroll position drives the camera; scroll itself is never intercepted.

```text
┌─ DOM (scrolls normally, owns all content) ──────────┐
│  <main> — headings, prose, records, links, lists    │  z: 10+
├─ Canvas (fixed, aria-hidden, decorative) ───────────┤
│  camera position = f(scrollProgress)                │  z: 2
├─ AI-art stills + CSS gradients (fixed) ─────────────┤
│  the no-WebGL fallback, always present underneath   │  z: 1
└─────────────────────────────────────────────────────┘
```

Consequences, all load-bearing:

1. **Delete the canvas and the site still works completely.** Same headings, same reading order, same links. The backdrop degrades to AI-art stills — a designed state, not a blank page.
2. **LCP stays text.** The hero heading paints from static HTML; R3F hydrates after first paint and cross-fades in over the still. The canvas is never the LCP element.
3. **No scroll-jacking, ever.** The camera follows the scrollbar; the scrollbar never follows the camera. A visitor can flick from top to Contact in one gesture and the camera simply arrives with them.
4. **Nothing is gated behind an animation.** No "scroll to continue", no minimum dwell, no transition that must finish before text is readable.

Any implementation that violates one of these four is wrong, however good it looks.

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

## Content readiness — RESOLVED

**Authoritative content source: `content-pack.md`.** All copy, data, and assets are final there. `portfolio-content.md` is retained only as the raw extract of the previous site and as the source record for project `SHB-3b`.

All eight content gaps are closed. Their resolutions changed several design decisions, so this table is load-bearing, not history:

| # | Gap | Resolution | Consequence for this plan |
|---|-----|-----------|--------------------------|
| C1 | No employer names, titles, or dates | **No employer names are used.** One position: `FRONTEND ENGINEER · 4 YEARS` | §12 redesigned around a role-only position; `company` is now **optional** in the schema (§20.3). Experience count is **4 years**, not "3+" |
| C2 | No project screenshots | **No screenshots at all** — projects use the theme's procedural gradient visual | §10.6 rewritten; the raster image budget for projects drops to **zero** (§26.2, §29) |
| C3 | No case-study bodies | **Detailed case studies are not wanted** | **`/worlds/[slug]` routes are removed** (§10.3, §23). Cards carry the full record and link straight to the live site |
| C4 | "Static Websites" is not a project | **Replaced by `SHB-3b` Portfolio v1** — the previous portfolio, https://shubham-portfolio-modern.vercel.app/ | Three real projects again (§10). **Cancels the legacy-domain redirect** in §35 — that URL must stay live |
| C5 | Unverified "~80% faster" metric | **Verified and strengthened: 14× faster page delivery** — from 2 pages per 14-day sprint to 2 pages per day | §12 uses `14×` with the basis stated in one line beneath it |
| C6 | Résumé PDF missing | **Added:** `public/Shubham_resume_2026.pdf` (59KB). Portrait added: `public/images/hero_profile.png` (864×1184) | Portrait must **move to `src/assets/images/`** so `astro:assets` can optimise it — files in `public/` ship unprocessed |
| C7 | About copy generic | **Rewritten in full** — philosophy pull-quote, 159 words of prose, field notes, three open questions | §13.1 rules retained as the standard the final copy already meets |
| C8 | No availability details | **Location India · Asia/Kolkata (UTC+5:30) · available weekdays · open to frontend / platform roles** | §15 uses these; no response-time claim is made |

**Two owner decisions remain** (defaults apply if unanswered — see `content-pack.md` §"Remaining owner decisions"): whether `Gemini / LLM APIs` counts as a separate skill (making the total **24**, the default, rather than 23), and the production domain plus analytics provider.

**Standing rule:** if a content field is ever unavailable, the component must **omit the field entirely** — no empty label, no "coming soon" chip — and the Zod schema must mark it optional. Absent content is invisible, never broken.

---

## 1. Vision

> **A single continuous descent — from the deep field, through a nebula, into a star system where each world is something I built.**

The site is one flight. You begin in intergalactic space with nothing but distant galaxies and dust; you scroll, and the camera moves. A nebula wall fills the frame while you read who this engineer is. A star cluster resolves into a constellation of the technologies they operate. A probe trail arcs past, marked with the moments their work changed something. Then three planets — the projects — and finally an orbital station, and a view back across the whole system you just crossed.

The metaphor is not decoration layered onto a page. **The page's reading order and the flight path are the same sequence**, which is what makes the 3D earn its weight: scrolling forward is travelling forward, and arriving somewhere new means learning something new.

**Why maximalism is the right call here.** A portfolio's job is to be remembered by someone who looked at nine others the same afternoon. Restraint is the safer aesthetic and the weaker strategy. The risk of maximalism is that spectacle replaces substance — so the structure of this plan is designed so that **substance ships first and spectacle is layered on top of it, removably** (see §31: the site is complete and launchable at the end of Phase 3, before any of the 3D exists).

**What the portfolio must achieve, in priority order:**

1. A recruiter or engineering manager can answer *who, what, which technologies, what work, how to contact* in under 60 seconds — and on a phone.
2. It is **memorable**. Someone who saw it last week can describe it unprompted.
3. The visual and interaction craft is itself evidence of frontend skill — a 60fps scroll-driven WebGL scene that degrades cleanly is a stronger work sample than any bullet point about it.
4. It stays fast enough that the craft claim is credible. Ambition is not an excuse for a 6-second load.
5. It works completely with WebGL unavailable, JavaScript disabled, motion disabled, or on a low-end Android phone.

**Anti-goals.** Not a game — there is no win state and no controls to learn. Not a demo reel — every effect sits behind real content, never instead of it. Not scroll-jacked. Not neon cyberpunk (colour is emission-line accurate, §3.3). No loading gate: no fake percentage bar, no "Enter" button, no simulated boot screen — the previous site's `zsh` splash stays deleted, and a WebGL scene is *not* a licence to reintroduce it.

---

## 2. Experience Principles

These are tie-breakers. When two implementations are both defensible, the one that satisfies more principles wins.

| # | Principle | Practical test |
|---|-----------|----------------|
| P1 | **Content is never inside the effect.** The canvas is a layer, never a container. | Delete the canvas element: is every fact still on screen, selectable and in reading order? |
| P2 | **Spectacle must carry meaning.** 3D that encodes position, progress, relationship or identity earns its bytes; 3D that is merely pretty does not. | Point at any moving thing: what does it *tell* you? Beauty alone is only allowed in the backdrop. |
| P3 | **The metaphor is a subtitle, never the label.** Every codename ships with its plain name. | Can someone who dislikes space navigate with zero confusion? |
| P4 | **Scroll belongs to the user.** The camera follows the scrollbar; the scrollbar never follows the camera. | Can you flick from top to Contact in one gesture and have the camera simply arrive with you? |
| P5 | **One scene, one canvas.** Spatial continuity comes from a single persistent WebGL scene driven by scroll — never per-section canvases. | Count `<canvas>` elements on the home route: must be exactly 1. |
| P6 | **Cheapest medium that reaches the bar.** CSS → SVG → Canvas → WebGL still holds *below* the spine; the spine itself is the one sanctioned exception, because no cheaper medium produces a continuous camera path through a volumetric scene. | Is this effect part of the spine? If not, could CSS or SVG do it? Then do that. |
| P7 | **Every fallback is a designed state.** No-WebGL, reduced-motion, no-JS and low-end mobile each get a deliberate composition — not a broken one and not a blank one. | Screenshot all four: would you ship any of them on its own? |
| P8 | **Substance ships first.** The site must be complete and launchable before the spine exists (§31). | If Phases 4–6 were cancelled today, is this still a strong portfolio? |
| P9 | **Frame budget is a feature.** A dropped frame is a bug with the same severity as a broken link. | 60fps desktop / 30fps floor mobile, verified under 4× CPU throttle. |

---

## 3. Creative Direction

### 3.1 The reference frame

Two references, deliberately fused:

**For the 3D backdrop — the cinematic space film.** *Interstellar*, *Gravity*, *Ad Astra*, and JWST press plates. Volumetric, layered, enormous. Real astrophotography is not clean: it has dust lanes, chromatic depth, bloom around bright stars, and colour that comes from physics. The backdrop should feel photographed, not rendered.

**For the interface on top — the observatory survey console.** ESA's Gaia archive, the Aladin Sky Atlas, NASA Eyes. Dark, hairline-ruled, monospace-labelled, coordinate-annotated. The data is the ornament.

The tension between the two *is* the design: a precise, almost clinical instrument panel floating in front of something vast and beautiful. Neither half works alone — the console alone is Revision 1 (tasteful, forgettable); the film alone is a screensaver.

The emotional register is **cinematic + scientific + futuristic + elegant**:

- **Cinematic** — volumetric depth, real bloom, slow camera moves with mass, wide letter-spaced type over negative space.
- **Scientific** — emission-line-accurate colour, coordinate readouts, magnitude scales, catalog IDs, tabular numerals.
- **Futuristic** — achieved through precision and light, not chrome and neon.
- **Elegant** — a high-contrast serif for statements against monospace for data. Editorial, not arcade.

### 3.2 What this explicitly is not

Revision 2 raises the ceiling on ambition; it does not remove the floor on taste.

| Avoid | Because |
|-------|---------|
| Saturated neon-on-black gaming palette | Colour here is emission-line accurate (§3.3), which is *why* it looks expensive rather than cheap |
| All eight band hues visible at once | One dominant hue per viewport. The palette is a journey, not a swatch dump (§3.3) |
| Glow on body text | Destroys legibility and contrast compliance, at any ambition level |
| Lens flares, god rays, chromatic aberration on everything | Post-processing is a scalpel: bloom only, on bright emitters only (§17.1) |
| A loading gate, progress bar, or "Enter" button | Still forbidden. The scene arrives *behind* content that is already readable |
| Scroll-snapping between sections | Still forbidden (P4). Long-form scroll, camera follows |
| Text baked into textures or rendered in the canvas | Still forbidden (P1). All type is DOM type |
| Animated section wipes and curtains | L4 motion at L1 frequency; nauseating |
| Icon fonts (the current site loads Material Symbols) | ~100KB+ for ~20 glyphs; use an inline SVG sprite |

### 3.3 Colour — eight spectral bands

The brief asked for multiple space colours. The failure mode is a rainbow, so the palette is **systematic rather than decorative**: each section owns one accent hue, and the hues are drawn from **real emission lines and real astrophysical sources**. That grounding is what keeps a colourful site from looking like a toy.

| Order | Section | Band | Hex | Physical source |
|-------|---------|------|-----|-----------------|
| 1 | First Light | **Ion Cyan** | `#7DE2FF` | O III / instrument starlight |
| 2 | Observer's Log | **Nebula Magenta** | `#FF5FA2` | H-alpha hydrogen emission — the colour of most nebulae |
| 3 | The Atlas | **Stellar Blue** | `#8FB8FF` | Hot O/B-type young stars |
| 4 | Trajectory | **Solar Ember** | `#FFB454` | G-type stellar warmth, ion-engine glow |
| 5 | Catalogued Worlds | **Plasma Violet** | `#A78BFA` | Deep-space reflection nebulae |
| 6 | Instrument Bay | **Aurora Green** | `#5BE9B9` | O III aurora / oxygen airglow |
| 7 | Transmissions | **Signal Gold** | `#FFD76E` | Sodium-line / relay beacon |
| 8 | Uplink | **Ion Cyan** (returns) | `#7DE2FF` | Closes the loop where it began |

**How a band is used.** At any scroll position exactly one band is dominant. Its hue drives, in the same breath:

- the section's DOM accents — eyebrow, hairlines, focus ring tint, active nav tick, link colour;
- the **3D scene's key light and nebula tint** at that point on the flight path;
- the bloom colour on bright emitters in frame.

So the whole composition — page and scene together — shifts hue as you travel. Bands **cross-fade over the scroll distance between sections**, never cut. One CSS custom property (`--band`) and one uniform in the scene read from the same source of truth, so DOM and WebGL can never disagree.

**Discipline rules, non-negotiable:**

1. `--color-ink-*` never changes. Body text is the same near-white in every band, so reading never gets harder.
2. Band hue is applied to accents, never to large text or backgrounds.
3. Every band must clear 4.5:1 on `--color-void` at label sizes — verified in §25.2. This is why the bands are all light, high-value hues rather than saturated mid-tones.
4. Bloom intensity is fixed across bands; only hue changes. Varying both produces "one section is broken" perception.

### 3.4 AI-generated art — the specification

Backdrops, planet textures and every no-WebGL fallback still are generated art, tuned to the palette (owner's decision; no attribution burden, perfect palette consistency). Generated art is only an asset if it is *consistent*, so it is specified rather than vibed:

**Global prompt contract** — every generated asset shares these: deep near-black `#04060D` ground; one dominant band hue plus at most one neighbouring hue; volumetric dust with visible depth layers; no visible planets/spacecraft unless the asset is specifically a planet; no text, no logos, no lens flares; astrophotography realism, not painterly or "digital art" styling; 16:9 or square; generated at 2× the delivered resolution and downsampled for grain.

**Per-asset list, target sizes after AVIF encode:**

| Asset | Use | Delivered | Budget |
|-------|-----|----------|--------|
| `field-deep.avif` | Hero fallback still + scene skybox base | 2560×1440 | ≤180KB |
| `nebula-magenta.avif` | Observer's Log backdrop + scene volume texture | 2048×2048 | ≤160KB |
| `cluster-blue.avif` | The Atlas backdrop | 2048×1152 | ≤140KB |
| `trail-ember.avif` | Trajectory backdrop | 2048×1152 | ≤140KB |
| `system-violet.avif` | Worlds backdrop | 2560×1440 | ≤180KB |
| `station-aurora.avif` | Instrument Bay backdrop | 2048×1152 | ≤140KB |
| `planet-{slug}.avif` ×3 | Planet surface maps (equirectangular 2:1) | 2048×1024 | ≤120KB each |
| `planet-{slug}-still.avif` ×3 | Mobile/no-WebGL planet stills | 800×800 | ≤60KB each |

Each backdrop also ships a **32×18 LQIP** inlined as a data URI, so the fallback layer paints instantly with no request.

**Honest caveat to hold.** Some engineers recognise and discount AI imagery. Two mitigations: the art is **backdrop only** — never presented as a photograph of anything, never captioned as real astronomy — and the *foreground* craft (the scene, the type, the data density) is what carries the credibility. If an asset ever reads as generic "AI space art", regenerate it tighter to the contract rather than shipping it.

### 3.5 Visual language

- **Backdrop stack.** Four fixed layers behind all content (detail in §17.1): (1) void ground, (2) the band-tinted AI-art still with its inlined LQIP — always present, and the complete no-WebGL fallback, (3) **the WebGL scene**, cross-faded in after first paint, (4) a 2KB tiling grain PNG at 3% opacity, which also kills banding in the gradients and unifies art and render into one image.
- **Surfaces.** Content sits on "instrument panels": `--surface-1` at 60–80% opacity with `backdrop-filter: blur(12px)`, solid otherwise. Over a live 3D scene the blur does real work — it separates the console from the vastness behind it, and it is the single most important element in keeping text legible against a moving backdrop.
- **Panel legibility contract (new in R2).** Any panel containing body copy must sit on ≥68% opacity surface *and* carry a subtle inward vignette, so the text's local contrast never depends on what the camera happens to be looking at. Verified by screenshotting each section at three scroll offsets (§34.2).
- **Borders.** 1px hairlines tinted with the active band at 12% alpha. Corner ticks — 8px L-marks — remain the signature motif; they now also read as instrument reticles over the scene.
- **Glow / bloom.** Two systems that must not be confused: **DOM glow** (three `--shadow-glow-*` tiers, for focus and CTAs) and **scene bloom** (post-processing on bright emitters only — stars, planet limbs, engine trails). Fixed intensity, band-tinted hue. Never bloom on anything text-adjacent.
- **Gradients.** Large soft radials (backdrop only) and 1px hairline fades (panel edges). No 45° gamer gradients on buttons, at any ambition level.
- **Depth cues.** On a black ground, drop shadows are invisible, so depth comes from *light and parallax*: bloom, hairline brightness, blur separation, and the scene's own perspective. The DOM never fakes depth the scene is already providing.
- **Iconography.** One inline SVG sprite, 1.5px stroke, 24px grid, geometric. ~17 icons.
- **Illustration.** Generated art (§3.4) for backdrops and planet maps; procedural CSS/SVG for spheres, constellation lines and orbit paths in every fallback state.
- **Typography.** High-contrast serif display, neutral grotesque body, technical mono. Unchanged from R1 — see §18. The type is the one part of the composition that stays still, which is precisely what makes the moving parts readable.

### 3.6 Motion language, in two sentences

**Everything has mass and nothing snaps.** Interface objects accelerate out of rest and decelerate into place on an expo-out curve; interaction feedback is fast and short; and the camera — the one thing allowed to move continuously — glides on a spline with inertia, always trailing the scrollbar slightly rather than tracking it rigidly, because a camera that snaps to scroll position feels like a scrubber instead of a flight.

---

## 4. Narrative

The site is a single survey session, ordered so that each section answers the question the previous one raises. The narrative is real: it is just the recruiter's question sequence, dressed.

| Order | Codename | Plain name | Question it answers | Band |
|-------|----------|-----------|--------------------|------|
| 1 | **First Light** | Home | Who is this, and what do they do? | Ion Cyan |
| 2 | **Observer's Log** | About | How do they think, and are they any good? | Nebula Magenta |
| 3 | **The Atlas** | Skills | What can they actually operate? | Stellar Blue |
| 4 | **Trajectory** | Experience | Where have they done it, and what changed because of them? | Solar Ember |
| 5 | **Catalogued Worlds** | Projects | Show me the work. | Plasma Violet |
| 6 | **Instrument Bay** | What I Build / Lab | Can they build the hard parts, not just assemble? | Aurora Green |
| 7 | **Transmissions** | Writing | Can they explain things? Do they engage with the field? | Signal Gold |
| 8 | **Uplink** | Contact | How do I reach them, and are they available? | Ion Cyan |
| — | **Mission Dossier** | Résumé | Give me the PDF for my ATS. | — |

### 4.1 The flight path

Scroll progress `0 → 1` maps to a camera path through one continuous scene. **The reading order and the flight path are the same sequence** — this is the claim that justifies the spine's cost.

| Scroll | Section | Where the camera is | What comes into frame |
|--------|---------|--------------------|-----------------------|
| 0.00–0.12 | First Light | Intergalactic void, nearly still | Distant galaxy sprites, drifting dust. The name resolves out of the dark |
| 0.12–0.26 | Observer's Log | Drifting toward a nebula wall | Volumetric magenta clouds fill the frame; parallax deepens sharply |
| 0.26–0.42 | The Atlas | Inside a star cluster | Surrounding stars resolve into the constellation globe — the section's own instrument |
| 0.42–0.58 | Trajectory | Following a probe's flight | An ember ion-trail arcs past with burn markers at each achievement |
| 0.58–0.78 | Catalogued Worlds | Arriving in a planet system | Three planets, sized by significance; the featured one nearest |
| 0.78–0.88 | Instrument Bay | Docking at an orbital structure | A wireframe station; aurora rim-light |
| 0.88–0.96 | Transmissions | Beside a relay array | Gold signal beams pulsing outward |
| 0.96–1.00 | Uplink | Turned around, looking back | The whole system behind you, small — the descent inverted |

**Why this ordering is load-bearing.** The camera decelerates as it arrives (Worlds gets the longest scroll distance, 0.20, because it is the most important content and deserves the most dwell). The final beat looks *back* along the path, which gives the site an ending rather than just a last section — the visitor sees the distance they covered, and the résumé CTA sits at that vantage point.

**Camera rules:**

1. Position is a Catmull-Rom spline through eight keyframes, sampled by eased scroll progress — never a straight lerp between section anchors, which reads as mechanical.
2. The camera **trails** scroll with ~140ms of inertia (§3.6). It arrives; it does not track.
3. Look-at target is its own spline, so the camera can turn independently of travel — this is what sells "flight" over "dolly".
4. FOV is fixed. Animating FOV on scroll induces motion sickness in a meaningful fraction of viewers.
5. Under `prefers-reduced-motion`, the camera **cuts** to each section's keyframe instead of interpolating (§16.4) — you still get the eight compositions, with zero continuous movement.

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
├── #worlds           Projects (3 records, links out to live sites)
├── #instruments      Instrument Bay teaser (links to /instruments)
├── #transmissions    Writing (6 latest, links out to dev.to)
└── #uplink           Contact

/instruments          Engineering lab — components, experiments, architecture
/transmissions        Full writing index (excerpts, canonical → dev.to)
/dossier              Résumé page + PDF download
/404                  Lost signal
```

**Generated, not authored:** `/rss.xml`, `/sitemap-index.xml`, `/og/*.png` (build-time OG images).

### 5.1 Why one page plus three routes

Chosen over a pure one-pager and over a multi-page site with per-project detail pages.

- The narrative in §4 only works as continuous descent, so the **primary experience is one scrolling page**, and every project record lives on it in full.
- **There are no `/worlds/[slug]` case-study routes** (C3). With three compact projects and no detailed write-ups wanted, a per-project route would be a thin page — and this plan's own rule is that a thin page is worse than no page. Project cards therefore carry the complete record and link straight to the live site. Case studies are parked in §37 for if the project set ever grows.
- `/instruments` is the heaviest route (it holds the one Canvas experiment), so giving it its own route keeps that weight **off the home page's budget entirely**. This is the strongest remaining reason for a multi-route structure.
- `/transmissions` and `/dossier` exist because both are things people link to directly and index separately.
- Astro makes these static routes nearly free (no client JS, no route-level runtime). View Transitions with a persistent cosmos keep the navigation between them continuous.

### 5.2 Per-section IA table

Full specifications are in §8–§15. Summary:

| Section | Purpose | User goal | Portfolio goal | Metaphor | Mobile behavior |
|---------|---------|-----------|---------------|----------|-----------------|
| First Light | Orient + identify | Know who this is | Establish craft in 3s | Telescope opening its eye | Static sky, type-led, no canvas |
| Observer's Log | Humanise + philosophy | Judge how they think | Differentiate from generic devs | Observer's field notes | Single column, portrait above text |
| The Atlas | Skill inventory | Scan capability fast | Show breadth + depth honestly | Constellations, magnitude = depth | Grouped list with bars, no SVG map |
| Trajectory | Career path | Verify real experience | Prove impact with metrics | Flight path with burn events | Vertical timeline, no orbit curve |
| Catalogued Worlds | The work | Evaluate projects | Drive to live demos | Catalogued planets | Stacked cards, static spheres |
| Instrument Bay | Engineering depth | See under the hood | Prove they build primitives | Instruments the observatory built | Teaser + link, no experiments |
| Transmissions | Writing | Gauge communication | Show field engagement | Signals broadcast outward | Compact list, no images |
| Uplink | Contact | Make contact | Convert | Comms array | Sticky mail CTA |

---

## 6. User Journey

Three real visitor types, with the path each must be able to take. Every one of these must be satisfiable **without JavaScript**.

### 6.1 The recruiter (60 seconds, mobile, distracted)

1. Lands. Sees name, role, "4 years", and two CTAs above the fold. **≤3.0s to LCP on mobile** — from static HTML, before the scene exists.
2. Taps **Download Résumé** — or scrolls once and sees the skills list.
3. Bounces to the PDF or to LinkedIn.

**Design consequence:** résumé must be reachable from the fixed header on every route and never more than one tap away. The stat "4 years" is above the fold on a 360×640 viewport.

### 6.2 The engineering manager (5 minutes, desktop, evaluating)

1. Reads hero, notes the site itself feels fast and precise.
2. Scans The Atlas for stack overlap.
3. Reads Trajectory for scope and metrics.
4. Reads the project records and opens one live demo in a new tab.
5. Skims Instrument Bay to see whether the person builds or assembles.
6. Copies the email from Uplink.

**Design consequence:** this is the primary journey. Because there are no case-study pages (C3), the project *cards* must carry the full record — stack, role, year, status, and a description that says what was actually built — since the card is now the only place that story is told. Trajectory metrics get the most editorial effort. Instrument Bay exists specifically for step 5.

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
| Every project has a live-demo link (all three now do) | Content lint |
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

**Chosen concept: typography-led composition over a live volumetric deep field** — Option D's editorial discipline in the foreground, Option A's cinematic depth behind it, made possible because the two are on *different layers* rather than competing for the same one.

### 9.1 Why this concept, and why not the others

| Concept | Verdict | Reason |
|---------|---------|--------|
| **D + A layered — type in front, live scene behind** | **Chosen** | Gets both: the LCP element is still DOM text that paints from static HTML in <1s, *and* the visitor arrives into something vast and moving. Because the scene is a fixed backdrop rather than a container, it costs nothing on the critical path and can fail without touching the hero. |
| A alone — a scripted fly-in to a planet | Rejected | A cinematic entry sequence gates content behind a spectacle and pushes LCP past 3s. The camera in R2 starts already in position: **arrival is instant, movement begins on scroll.** |
| B — spacecraft navigating toward a scene | Rejected | Needs a modelled craft (asset + load cost) and reads as game UI. Adds no information. |
| C — the 3D scene *is* the navigation | Rejected | Makes navigation depend on JS, WebGL, pointer precision and discovery. Violates P1 and P4. A recruiter must never have to fly somewhere to find the résumé. **This is the single most tempting mistake available in R2 and it is forbidden.** |

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
│  ── 4 ───────── 24 ──────── 3 ──────────────────────────      │  stat strip, hairline
│     YEARS       TECHNOLOGIES  SHIPPED WORLDS                 │
└──────────────────────────────────────────────────────────────┘
                                                          ▌ rail
```

Type treatment: `Hi, I'm` at `display-m` in `--text-mid`; `Shubham Tiwari` at `display-xl` in Instrument Serif, `--text-hi`, `line-height: 0.95`, tracking `-0.02em`; a 1px 96px ion rule; `Frontend Engineer` at `display-m` in mono uppercase with `0.08em` tracking, `--ion`. The name is the LCP element and must never be an image or a WebGL texture.

Portrait: existing `hero_profile.png`, re-exported to AVIF + WebP at 480/720px, inside a hairline frame with corner ticks and a soft ion inner glow. `aspect-ratio` fixed to prevent CLS. Below 1024px it moves above the type at 160px circular; below 480px it is dropped entirely (the words matter more than the face on a 360px screen).

**Copy — final.** The source lede ("I create beautiful, functional, and user-friendly web experiences that make a difference…") is replaced: it is generic, could describe anyone, and wastes the most valuable 12 words on the site. The final lede is:

> **I build fast, accessible web platforms — and the systems that keep them fast as they grow.**

Specific, backed by the actual Trajectory evidence (Next.js migration, headless CMS, Playwright suite), and states a point of view. Eyebrow: `FIRST LIGHT · INDIA · UTC+5:30`.

**Stat strip.** Three real numbers only: `4 YEARS`, `24 TECHNOLOGIES`, `3 SHIPPED WORLDS`. The technology and world counts are **computed from the collections at build time, never hardcoded** — so the skill-count decision (23 vs 24, see Content readiness) resolves itself. Numbers use mono tabular figures at `display-m`.

### 9.3 The first 3 seconds

| Time | What happens | Mechanism |
|------|-------------|-----------|
| 0ms | HTML arrives with all hero text in it. Void ground painted; the `field-deep` LQIP (32×18, inlined data URI) paints as a blurred deep-field wash. | Static Astro output, inlined critical CSS |
| ~0–400ms | Fonts swap in; no layout shift. The full-resolution `field-deep.avif` decodes and cross-fades over its LQIP. | Self-hosted woff2 + preload; `fetchpriority="high"` on the one backdrop plate |
| 120–820ms | **First light reveal:** an aperture wipe from centre; the backdrop resolves from `blur(6px)` to sharp; type rises 12px with a 60ms stagger (eyebrow → name → role → lede → CTAs → socials → stats). | Pure CSS keyframes on load. No JS gate. |
| ~700–900ms | **LCP recorded — the name.** Still text, still from HTML, still before any JavaScript matters. | — |
| ~1000ms | Browser goes idle. `ScrollDriver` (2KB) is already live; the scene chunk begins downloading. | `client:idle` |
| ~1600–2200ms | Scene initialises, warms one frame off-screen, then **cross-fades over the art still across 600ms**. The camera is already at keyframe 0 — nothing flies in, nothing announces itself. The visitor's read is uninterrupted. | R3F, one lazy chunk |
| never | If the scene fails, is blocked, is skipped for tier/preference, or loses context — the art still remains and the hero is complete. | The art layer never unmounts |

**Critical rules, unchanged from R1 and now more important:**

- **Nothing in this timeline blocks on JavaScript.** No preloader, no splash, no "Enter portfolio" gate, no progress bar. A 230KB scene chunk is *exactly* the pressure that makes teams add a loading screen; the answer is the art layer, not a spinner.
- **The scene must not animate on arrival.** The camera sits at keyframe 0 and waits for scroll. A hero that moves before the visitor acts steals attention from the sentence they are trying to read.
- **The cross-fade must be imperceptible.** If you can see the moment the scene takes over, the art plate and the scene's opening composition are not matched closely enough — regenerate the plate from a screenshot of the scene's keyframe 0.

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

**Mobile (<768px):** `min-height: 88svh` (never `100vh`); portrait above the type at 160px, dropped under 480px; `display-xl` clamps down to 3rem; CTAs become full-width stacked buttons with 12px gap; stat strip becomes a 3-column mono row at 11px. **The scene still loads** (R2, owner's decision) at the low tier — 3,000 particles, DPR 1.0, no bloom — over a half-resolution art plate, with opaque rather than blurred panels (§24.2).

### 9.7 Technical requirements, a11y, performance

**Technical.** `Hero.astro` (static) + `StarField.tsx` island (`client:idle` + `client:media`). Canvas is `position: fixed; inset: 0; z-index: 1; pointer-events: none`, sized to `min(devicePixelRatio, 1.5)`. Star data is generated from a seeded PRNG so the field is deterministic across reloads (a "random" sky that changes every reload feels broken).

**Accessibility.** `<h1>` contains the full accessible name "Hi, I'm Shubham Tiwari — Frontend Engineer" (the visual line break is `<span>`-based, not two headings). Canvas is `aria-hidden="true"` and `role="presentation"`. Corner ticks and rules are CSS pseudo-elements, invisible to AT. Stat strip is a `<dl>`. Contrast per §25.2: name ~16.4:1, lede ~7.3:1, mono eyebrow ~4.9:1 — all to be verified with a checker in Phase 1.

**Performance.** Hero ships **0KB of JS** for its content — the heading, lede, CTAs and stats are all static HTML. LCP target ≤2.2s desktop / ≤3.0s mobile, and the LCP element is the name. The scene chunk hydrates after idle and never competes with it (§9.3). No layout shift: portrait, stat strip and the fixed backdrop all reserve or sit outside flow. Budget: hero-critical bytes (HTML+CSS+fonts+portrait+hero art plate) ≤400KB desktop, ≤300KB mobile.

---

## 10. Catalogued Worlds — Projects

The most important section on the site. Every decision here favours **evidence of engineering over visual effect** (P8).

**Narrative purpose.** The catalog of worlds this observer has found and mapped. Each project is a discovered world with a real data record.

**User objective.** Understand what was built and with what, then reach the live site.

**Content (per world).** Catalog designation (`SHB-1b`), name, one-line summary, 40–80 word description, tech stack (3–6 tags), year, status, live URL, and a `gradientSeed`. **No screenshots** (C2) and **no case-study fields** (C3) — the card is the complete record. Final data in `content-pack.md`:

| ID | Project | Stack | Status | Link |
|----|---------|-------|--------|------|
| `SHB-1b` | **Payload CMS** *(featured)* — blog CMS with auth, admin dashboard, media management, analytics, PageSpeed testing, on-demand revalidation | Next.js, Tailwind, MongoDB, Node | LIVE · 2025 | blazing-blogs-frontend.vercel.app |
| `SHB-2b` | **Gemini Zentauri** — AI content and image generation behind a social-feed interface | Next.js, Tailwind, MongoDB, Node, Gemini API | LIVE · 2025 | gemini-ai-agent.vercel.app |
| `SHB-3b` | **Portfolio v1** — the predecessor to this site: Material-3 token system, live dev.to feed, mobile-first bottom nav | Next.js, React, Tailwind, dev.to API | LIVE · 2026 | shubham-portfolio-modern.vercel.app |

**Two rules attached to `SHB-3b`, both easy to get wrong:**

1. It must be named **"Portfolio v1"**, never "Modern Portfolio". The visitor is looking at the *current* portfolio, so the lineage has to be explicit or the entry reads as a broken duplicate. Framed as v1, a possible confusion becomes visible iteration.
2. **The legacy domain must stay live and must not be redirected** — see §35, where the original redirect recommendation is cancelled. Redirecting it would break this project's only link.

### 10.1 Featured world treatment

**Featured: `SHB-1b` Payload CMS.** Selection rule — feature the project with the most demonstrable engineering depth, not the trendiest. Payload CMS spans auth, an admin surface, media handling, analytics, and cache revalidation; that breadth is the most to talk about. Gemini Zentauri is the strong second and gets a standard card.

Featured layout (≥1024px): full-width panel, asymmetric split — 5 columns of record beside 7 columns of **open space through which the featured planet is visible in the scene** (§10.6). Where the scene is unavailable, those 7 columns carry the planet still (`planet-{slug}-still.avif`) in a hairline frame with corner ticks. The record is a **data table**, not prose: designation, status pill, stack chips, year, then the 80-word description, then one button (`OPEN LIVE ↗`). The featured panel is 1.4× the height of a standard card and gets the largest sphere and the most saturated plate.

All three cards are populated (C4 resolved), so the section is a featured panel plus a 2-up grid.

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
│  2025                       OPEN LIVE ↗ │  year left, single action right
│  ⌏                                  ⌎  │
└────────────────────────────────────────┘
```

**The procedural sphere** is the project's "world": a CSS/SVG sphere built from a radial gradient (limb lighting + terminator), a hue derived deterministically from the slug hash, one thin elliptical ring on the featured world only, and a soft ion rim-light on hover. Zero image weight, infinitely scalable, and consistent with the metaphor. It is `aria-hidden`. **It is never the only identifier** — the name and designation are always text.

### 10.3 No case-study pages — decided

**`/worlds/[slug]` routes are not built** (C3). The owner does not want detailed write-ups, and with three compact projects a per-project route would be a thin page — which this plan already forbids in Phase 3's implementation notes ("a thin page is worse than no page"). Building them anyway would produce three routes each carrying a heading, a gradient, and forty words.

**Therefore the card is the whole record.** Everything a visitor learns about a project must fit on it: designation, name, one-liner, 40–80 word description, full stack, year, status, and the live link. This raises the bar on card copy — see §6.2, where the engineering-manager journey now depends on the card rather than a case study.

**What this removes from the plan:** the `/worlds/[slug]` route (§23), the `case-study/` component group (§21.1), the case-study image budget (§26.2), case-study structured data (§27.2), and the card→case-study View Transition pair (§10.5).

**If this reverses later** (more projects, or a desire for depth), §37 carries the case-study route as a future enhancement, and the 9-block structure that was specified here is recoverable from this document's git history. Do not pre-build for it.

### 10.4 Filtering — deliberately deferred

**Do not build project filtering.** With 2–3 shippable projects, a filter UI is pure overhead: it adds an island, state, empty states, and URL-sync for a set a visitor can read in one glance. Revisit only at **≥6 projects**, and then implement it as static filtered pages (`/worlds/tag/[tag]`) or a `<details>`-based control rather than a client-state widget. Recorded here so a future agent does not "helpfully" add it.

### 10.5 Interaction and motion

- **Hover/focus (cards):** panel background `--surface-1` → `--surface-2`, hairline brightens 12% → 24%, sphere gains an ion rim-light and rotates 3° via `transform`, whole card lifts 2px. 200ms `--ease-ui`, `transform` and `opacity` only.
- **Entrance:** per §8.1 — featured panel first, then cards on a 60ms stagger.
- **Card → live site:** an external navigation, so there is no transition to design. The `↗` affordance and the new-tab behaviour carry it.
- **View Transitions** now serve a narrower purpose: continuity between the home route and `/instruments`, `/transmissions`, and `/dossier`, with `transition:persist` on the cosmos so the sky never flashes. That persistence — not the removed card→case-study pair — is the real justification (§19.5).
- **Not allowed:** 3D tilt on cursor move, magnetic cursors, parallax inside cards, flip animations. Each costs jank and buys nothing.

### 10.6 Visual strategy — real 3D planets (R2)

Projects are the payoff beat of the flight path (§4.1, scroll 0.58–0.78, the longest dwell on the site). Each project is a **textured 3D planet in the live scene**, and the DOM record sits in a panel beside it.

**Still no screenshots** (C2 stands): screenshots of a CMS admin panel become grey mush at card size and date instantly. R2 replaces R1's flat CSS gradient plate with something far better — an actual world.

| Element | Implementation |
|---------|---------------|
| Geometry | `SphereGeometry`, 64 segments desktop / 48 tablet / 32 mobile |
| Surface | AI-generated equirectangular map, `planet-{slug}.avif` (2048×1024 desktop, 1024×512 mobile), hue-anchored to the Plasma Violet band with per-planet variation |
| Lighting | One directional key light in the band hue + a rim/limb light, so each planet reads as a lit sphere rather than a textured ball |
| Atmosphere | A slightly larger back-face sphere with a fresnel shader — the thin bright limb that makes planets look real |
| Rings | Featured world (`SHB-1b`) only, one thin ring; a ring on all three would flatten the hierarchy |
| Idle motion | Slow axial rotation, ~0.02 rad/s, different per planet so they never look synchronised |
| Scale | Featured planet ~1.6× the others and nearest the camera — significance expressed spatially (P2) |
| Hover / focus | Planet scales 1.04×, limb light brightens, rotation eases toward the camera. Driven from the DOM card, so it works on keyboard focus too |
| Selection | Focusing a card eases the camera's look-at toward that planet over 560ms — the one place scroll is *not* the only camera input |

**The DOM side is unchanged and still complete.** Each project is a `WorldCard` — one `<a>` wrapping designation, name, one-liner, description, stack chips, year, status, live link — exactly as in R1. The planets are a parallel visual expression of records that fully exist in HTML (§25.0).

**Fallbacks, all designed states:**

| Condition | What renders |
|-----------|-------------|
| No WebGL / init failure / lowest tier | `planet-{slug}-still.avif` (800×800) inside the card's hairline frame — a pre-rendered still of that exact planet |
| Mobile | Scene planets at 32 segments, 1024px textures, no atmosphere shader |
| `prefers-reduced-motion` | Planets render but do not rotate; camera cuts rather than eases on focus |
| Images blocked | The R1 procedural CSS sphere (radial-gradient limb + terminator, seeded from the slug) — zero bytes, still identifiable |

**Accessibility:** planets are `aria-hidden` decoration. Identity is always the text name and designation; planet size encodes significance but is *also* stated by `featured` ordering and the "Featured" label, so nothing is size-only. No planet is focusable — the card is.

**Videos:** none. If a demo video is ever added it must be muted, `preload="none"`, poster-backed, click-to-play — never autoplaying.

### 10.7 Loading states

Every route is static HTML and the project visuals are CSS, so there is nothing to load — **no skeletons, no spinners, no image fade-ins in this section at all**. The only image that needs decode handling anywhere is the portrait (§13.3).

### 10.8 Responsive, accessibility, performance

**Responsive.** ≥1280px: featured 7/5 split + 2-col grid. 1024–1279px: featured stacks image over record, grid stays 2-col. 768–1023px: 1-col, sphere shrinks to 72px. <768px: 1-col, sphere inline at 56px beside the designation, stack chips wrap to 2 lines max then truncate with a `+2` chip, buttons full-width stacked.

**Accessibility.** Cards are `<article>` inside a `<ul>`; the anchor's accessible name is `"{name} — {one-liner}"`. Status is text (`LIVE`), never a color-only dot. Stack chips are a `<ul>` with a visually-hidden "Built with" label. `↗` icons are `aria-hidden` with a visually-hidden "(opens in a new tab)". Spheres and gradient plates are decorative and hidden from AT.

**Performance.** Zero JS and **zero image bytes** in the section — hover is CSS, plates are gradients, spheres are gradients. Section budget: ≤12KB of HTML+CSS on every tier. This is now one of the cheapest sections on the site, which is a direct consequence of C2.

---

## 11. The Atlas — Skills

**Narrative purpose.** A star chart of the technologies this observer has actually operated. Constellations group related tools; a star's **magnitude encodes depth of experience** — in astronomy, magnitude is literally how brightly something registers to an observer, which makes this the one place where the space metaphor carries real information rather than decoration (P2).

**User objective.** In ~10 seconds, determine stack overlap and whether depth claims are credible.

### 11.1 Fixing the data model first

The source data was 23 skills with self-assigned percentages. **Percentages are the "React ⭐⭐⭐⭐⭐" problem in a different costume** — nobody believes "TypeScript 88%", and the 7-point gap between 95% and 88% communicates nothing. They are replaced by three honest, named tiers, with the original number retained **only as `sortScore`** and never displayed.

| Tier | Label shown | Source % | Visual magnitude | Count |
|------|------------|----------|-----------------|-------|
| 1 | **CORE** — daily, can debug deeply, would defend design decisions | ≥88 | r=7, strong glow, label always visible | 10 |
| 2 | **WORKING** — shipped production work, comfortable without hand-holding | 78–87 | r=5, soft glow, label on hover/focus + in list | 12 |
| 3 | **FAMILIAR** — used, functional, would need a ramp-up | <78 | r=3, no glow, label in list only | 2 |

**Total: 24 entries.** Final assignment is in `content-pack.md`; summary: **Core** — HTML, CSS, JavaScript, React, Git, Tailwind CSS, Node.js, AI-assisted development, ESLint / Prettier, TypeScript. **Working** — Next.js, Payload CMS, REST APIs, Figma, Gemini / LLM APIs, Astro, Express, Vercel, Playwright, Performance optimisation, Accessibility, SEO. **Familiar** — MongoDB, Docker.

The count is **24, not the source's 23**, because two content corrections were applied:

- **"AI — 90%"** is not a technology. It became **"AI-assisted development"** (Operations), and the concrete evidence behind it — LLM API integration from Gemini Zentauri — was split out as **"Gemini / LLM APIs"** (Substrate). That split is what adds the 24th entry. Owner decision D1 may fold it back to 23; either way **the displayed count is computed from the collection at build time**, so no code changes.
- **"Linting & Formatting — 90%"** is a practice, not a tool. It became **"ESLint / Prettier"** so it sits honestly beside Git and Vercel.

### 11.2 Constellations

Three constellations, each with a codename and a plain label:

| Constellation | Plain label | Members |
|--------------|-------------|---------|
| **INTERFACE** | Frontend | HTML, CSS, JavaScript, TypeScript, React, Next.js, Astro, Tailwind CSS |
| **SUBSTRATE** | Backend & data | Node.js, Express, REST APIs, Payload CMS, MongoDB, Gemini / LLM APIs |
| **OPERATIONS** | Tooling, quality & delivery | Git, Vercel, Docker, Figma, ESLint / Prettier, Playwright, Performance, Accessibility, SEO |

**Star positions are hand-authored, not random.** Each skill carries fixed `{x, y}` coordinates in the data file. A randomly generated constellation looks like noise and changes between reloads, which reads as a bug. Hand-placed stars let related tools sit near each other and let the three constellations occupy visually distinct regions.

**Constellation lines encode real relationships**, not decoration: React→TypeScript, React→Next.js, React→Astro, Next.js→Vercel, Node.js→Express, Express→REST APIs, Payload CMS→MongoDB, Playwright→Accessibility. A visitor tracing a line learns something true about the stack. Lines are 1px, `--hairline`, and never cross constellation boundaries except at one deliberate bridge (Next.js→Vercel) that shows frontend meeting delivery.

### 11.3a The constellation globe (R2)

At scroll 0.26–0.42 the camera is inside a star cluster, and the surrounding stars resolve into a **rotatable 3D constellation globe** — the Atlas's own instrument, rendered in the scene rather than as a flat SVG.

| Aspect | Implementation |
|--------|---------------|
| Layout | The 24 skills are placed on a sphere by converting their hand-authored 2D coordinates (§11.2) to spherical coordinates, so the constellations stay in their authored relative arrangement rather than being re-scattered |
| Stars | Instanced points; radius and emissive intensity from tier (CORE 7 / WORKING 5 / FAMILIAR 3), tinted with the Stellar Blue band |
| Lines | `LineSegments` between real relationships (§11.2), 1px, 18% alpha, brightening to 40% when either endpoint is active |
| Labels | **DOM, not 3D.** CORE labels are HTML positioned by projecting the star's world position to screen space each frame. 3D text would be unreadable, unselectable and untranslatable |
| Rotation | Pointer drag on desktop; slow idle auto-rotation (0.05 rad/s) otherwise. **Touch never rotates it** — a swipe must always scroll the page (P4) |
| Two-way highlight | Hovering a list row highlights the star and its lines; hovering a star highlights the row. Same `data-skill` mechanism as R1's `AtlasLink`, extended to the globe |

**Fallbacks:** below `md`, or with no WebGL, or on the lowest tier, the globe is replaced by R1's **server-rendered SVG constellation map** — which is already specified, already accessible, and already built in Phase 3. Under `prefers-reduced-motion`, the globe renders but does not auto-rotate.

**The list remains the canonical accessible path** (§11.4): the globe adds zero tab stops, and no skill exists only in 3D.

### 11.3 Visual composition — map plus list, both always present

This is the section's key decision: **the star map and a plain grouped list coexist on desktop; the list is the source of truth.** In R2 the "map" is the 3D globe on capable devices and the SVG map everywhere else — the list side is identical either way.

```text
┌───────────────────────── 7 cols ──────────────┬────── 5 cols ────────┐
│  THE ATLAS · 24 ENTRIES · 3 CONSTELLATIONS    │  ○ CORE (10)         │
│                                               │    JavaScript        │
│      ·  ✦ React                               │    React             │
│    ✦ TypeScript    ✦ Next.js                  │    TypeScript   …    │
│         ·      ✦ Tailwind                     │                      │
│   ─── INTERFACE ───                           │  ○ WORKING (12)      │
│                                               │    Next.js           │
│         ✦ Node.js   · Express                 │    Astro        …    │
│   ─── SUBSTRATE ───                           │                      │
│                                               │  ○ FAMILIAR (2)      │
│      ✦ Git    · Playwright                    │    MongoDB           │
│   ─── OPERATIONS ───                          │    Docker            │
└───────────────────────────────────────────────┴──────────────────────┘
```

The map gives shape and memorability; the list gives scannability and is what a recruiter's eye actually uses. Hovering or focusing a star highlights its list row and vice versa — a two-way link that makes the map *useful* rather than ornamental. The list is grouped by tier (not by constellation) because "how deep" is the question a reader has; each row shows its constellation as a small mono suffix.

Section eyebrow: `THE ATLAS · 24 ENTRIES · 3 CONSTELLATIONS` — counts computed from data at build time.

### 11.4 Readable without interaction — the accessibility core

The brief requires that skill visualisation work with no interaction. Guarantees:

1. **Every skill name exists as real text in the DOM at all times** in the grouped list. The SVG map is supplementary.
2. **Core-tier star labels are always rendered** in the map — no hover needed for the 10 most important entries.
3. The SVG is `role="img"` with an `aria-label` summarising it ("Star chart of 24 technologies in 3 groups"), and its interactive stars are excluded from the tab order (`focusable="false"`, `aria-hidden="true"`) because **the list provides the accessible path**. Duplicating 24 tab stops would be hostile; one canonical interactive path is correct.
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

**User objective.** Verify that the experience is real, scoped, and consequential; find the measurable outcomes quickly.

### 12.1 Data model — role-only, by decision (C1)

**No employer names are used** (C1). The section presents one position identified by role and duration: `FRONTEND ENGINEER · 4 YEARS`. This is a deliberate choice, not a gap, and the design leans into it rather than apologising for it — the seven burn events carry all the weight, and they are specific enough (Next.js migration, headless CMS, monorepo, Playwright suite, migrations, JSP) that scope is legible without a logo.

```text
Position
├── role            "Frontend Engineer"        required
├── durationLabel   "4 years"                  required
├── company?        omitted entirely           optional — see below
├── startDate?      endDate?                   optional
├── summary?        technologies[]?            optional
└── achievements[]  the 7 burn events          required
    ├── title
    ├── description
    ├── metric?  { value, unit, label }   e.g. { 14, "×", "faster page delivery" }
    └── technologies[]
```

`company`, `startDate`, and `endDate` are **optional** in the schema (§20.3), and the plan's standing rule applies: an absent field renders nothing at all — no empty label, no "Company Name" placeholder, no date range with a dash and no dates.

**One honest caveat to carry:** a recruiter scanning for employers and dates will not find them, and some ATS-driven screens weight that. The mitigation is that `/dossier` and `Shubham_resume_2026.pdf` are one tap away from every route (§6.1), and the PDF is where employment specifics belong. Do not "solve" this by inventing a company field.

### 12.2 The 14× metric (C5) — verified

Burn event 02 (*Headless CMS & delivery*) carries the section's only metric. The previous "~80% faster publishing" claim was an **understatement**; the verified basis is:

- **Before the CMS:** 2 pages per 14-day sprint ≈ 1 page per 7 days
- **After the CMS:** 2 pages per day ≈ 1 page per 0.5 days
- → **14× throughput**, equivalently a ~93% reduction in time-to-publish per page

Render it as `14×` in ember at `display-l`, captioned `FASTER PAGE DELIVERY`, with the basis stated in one mono line directly beneath: `FROM 2 PAGES PER 14-DAY SPRINT TO 2 PAGES PER DAY`. A big number with its basis attached survives scrutiny; a big number alone invites it. No other burn event gets a metric — a single well-supported number is more credible than seven soft ones.

### 12.3 Visual composition

**Desktop (≥1024px):** a single vertical **spine** at the left of the content column — a 2px line with a subtle ion gradient — carrying a marker per burn event. Each event is a panel to the right of the spine at a consistent offset. The spine is gently curved (an SVG path with a ~40px horizontal drift over the section's height) so it reads as an arc rather than a ruler; markers sit exactly on the path.

Per event: mono index (`BURN 01`), title in `display-m` serif, 1–2 line description, the metric block on event 02 only (§12.2), and technology chips. The single position header sits at the top of the spine on a wider node: `FRONTEND ENGINEER` in `display-m` with `4 YEARS` in mono beside it. No company line, no date range (§12.1).

**Mobile (<768px):** the spine becomes a **straight 1px vertical line inset 16px**, markers become 8px dots, panels become full-width with no offset. No curve, no SVG path — a border-left on a flex column. Identical information, a tenth of the cost.

### 12.4 Motion, and how it works without heavy JS

The only motion is the spine drawing itself as the section scrolls into view, plus the standard §8.1 entrance for each event panel.

Implementation, in preference order:

1. **CSS scroll-driven animation** — `animation-timeline: view()` on `stroke-dashoffset` (desktop) or `scaleY` (mobile). Zero JS, runs off the main thread, correct by construction.
2. **Fallback where unsupported** — the spine renders **fully drawn** and static. Not a JS polyfill; the static state is a designed state (P7).
3. Event panels use the shared `IntersectionObserver` entrance utility already needed by §8.1 — no per-section scroll listener, ever.

**Mobile explicitly gets no scroll-linked animation** — the spine is fully drawn from the start. Rationale: scroll-linked work on low-end Android is the most common source of dropped frames in portfolios like this, and the effect is nearly invisible on a 6-inch screen. Under reduced motion, the spine is static everywhere and panels appear instantly.

### 12.5 Technical, accessibility, performance

**Technical.** `Trajectory.astro` (static) + one shared entrance utility. SVG path is authored in a `viewBox` and scales; markers are positioned with `offset-path` where supported, otherwise absolute percentages computed at build time from the data length.

**Accessibility.** `<ol>` of positions, each containing an `<ol>` of achievements — the DOM order *is* the chronology, so screen readers get the sequence for free. The metric is marked up as `<p><strong>14×</strong> faster page delivery</p>` so the number is never orphaned from its meaning, with the basis line as a following sentence inside the same block. The spine SVG is `aria-hidden`. Headings: position = `h3`, achievement title = `h4`.

**Performance.** Zero JS beyond the shared observer (~1KB, amortised). SVG ≤3KB. Section budget ≤20KB. No images.

---

## 13. Observer's Log — About

**Narrative purpose.** The observer's own field notes. This is the only section allowed to be personal, and the only one written in a human voice rather than an instrument's.

**User objective.** Decide whether this is someone they would want on their team — judged on how the person thinks, not on what they list.

### 13.1 Content model and the anti-generic rules

The source copy failed on specificity: *"I'm a passionate Frontend Engineer… I love turning complex problems into simple, elegant solutions"* and *"When I'm not coding, you can find me exploring new technologies"* could be pasted into ten thousand portfolios. **It has been rewritten in full (C7) — the final copy is in §13.2 below and in `content-pack.md`.** The rules are retained because they are the standard that copy meets and the test any future edit must pass.

**Hard rules for this section's copy:**

1. Ban the words **passionate**, **love what I do**, **turning complex problems into elegant solutions**, **detail-oriented**, **think outside the box**, and **coffee**.
2. Every paragraph must contain at least one **verifiable specific** — a technology, a number, a decision, or a named thing.
3. Include one **opinion** that a reasonable engineer could disagree with. This is what makes a person legible.
4. Include what is being learned **right now** and what they want to work on **next**. Recruiters read this as trajectory, and it dates the page honestly.
5. Maximum 180 words of prose. The section earns interest through density, not length.

**Content model:** `philosophy` (one pull-quote sentence), `prose` (2 short paragraphs, ≤180 words total), `fieldNotes` (5–8 label/value pairs), `openQuestions` (2–4 items — what they want to work on next), `portrait`.

### 13.2 Final copy (C7) — implement verbatim

**Philosophy pull-quote:**

> Most frontend problems are really delivery problems — the interesting work is making the fast path the easy path for everyone who touches the codebase.

**Prose (159 words, two paragraphs):**

> I've spent four years on frontend platforms — the kind where the hard part isn't the component, it's that a lot of people need to ship pages without breaking the build. Most of my work has been migrations and plumbing: moving legacy applications onto Next.js, standing up a headless CMS that took page publishing from two pages a sprint to two a day, and wiring a Playwright suite covering E2E, API, accessibility, and visual regression so releases stopped being a negotiation.
>
> I care more about the second year of a codebase than the first week of it. In practice that means I'd rather add a lint rule than a conventions document, and I'll usually argue for the boring, typed, testable version of a feature. Outside of work I build small things to learn from — an AI content app on Gemini, a blog CMS on Payload — and I write up what breaks at dev.to.

**Open questions:**

> → How far can a design system go before it starts constraining product velocity?
> → What does genuinely accessible rich-text editing look like?
> → Where does AI-assisted development actually pay off in a large codebase — and where does it just add review load?

**Field notes (C8):** `LOCATION India` · `TIMEZONE Asia/Kolkata · UTC+5:30` · `EXPERIENCE 4 years` · `FOCUS Frontend platforms, performance, accessibility` · `CURRENTLY Astro, design systems` · `AVAILABILITY Weekdays` · `WRITES AT dev.to/shubhamtiwari909` · `OPEN TO Frontend / platform roles`

**Why this copy works, so future edits do not undo it:** the prose carries four verifiable specifics (four years, Next.js migration, 2 pages/sprint → 2/day, the Playwright coverage list); the second paragraph states an opinion a reasonable engineer could argue with ("a lint rule over a conventions document", "the boring typed version"), which is what makes a person legible rather than generically competent; the open questions are genuinely open, which both dates the page honestly and hands an interviewer three obvious first questions.

### 13.3 Visual composition

Two columns ≥1024px (5/7). Left: portrait in a hairline frame with corner ticks, and beneath it the **field notes** as a mono `<dl>` — label in `--text-low`, value in `--text-hi`, hairline between rows. It looks like an instrument's metadata panel and gives the section its scientific register.

Right: the **philosophy pull-quote** in Instrument Serif italic at `display-m` with an ion vertical rule to its left; then the two prose paragraphs at `body-l`; then `OPEN QUESTIONS` — 2–4 items as a mono list with `→` markers, each one thing the observer wants to point the telescope at next. The existing tag row (`TypeScript · React · Design systems · A11y · Performance`) becomes small mono chips beneath the prose.

The `OPEN QUESTIONS` block is the section's distinctive move: it converts the usual "I'm always learning" cliché into a specific, dated, forward-looking list — and it gives an interviewer an obvious opening question, which is exactly what a candidate wants.

### 13.4 Interaction, motion, technical, responsive, a11y, performance

**Interaction.** Almost none, deliberately — this is a reading section. Only the dev.to field-note value and the open-question items are links; standard hairline-underline hover.

**Motion.** §8.1 entrance only. The pull-quote's ion rule draws downward over 560ms as a single accent. Nothing else moves. No text-scramble, no typewriter effect (both delay reading and break screen readers).

**Technical.** Fully static `.astro`. Portrait via `astro:assets` → AVIF/WebP at 480w and 720w. **The portrait must live in `src/assets/images/`, not `public/`** — it currently sits at `public/images/hero_profile.png` (864×1184, 249KB) where Astro serves it unprocessed. Moving it is a Phase 1 task and cuts it to well under 60KB. Zero JS.

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

**Chosen: an n-body orbit simulation in WebGL, reusing the site's existing three.js chunk.** ~2,000 bodies (an order of magnitude more than R1's Canvas 2D plan), semi-implicit Euler integration, softened gravity, seeded initial conditions, cursor as an optional attractor, rendered as instanced points with trailing paths.

**Why WebGL here in R2, when R1 chose Canvas 2D.** R1's reasoning was that 200 bodies did not need a GPU and the honest engineering answer was to not reach for one. That logic inverted the moment the spine adopted three.js: the library is **already downloaded and parsed** on this route, so a WebGL simulation costs ~14KB of incremental code while a Canvas 2D one would cost a second renderer plus its own frame loop. Reusing what is already there is now the cheaper *and* more capable choice — and 2,000 gravitationally-interacting bodies is a visibly better demonstration than 200.

The self-reported telemetry is what makes this an engineering exhibit rather than a toy: frame time, body count, DPR and the degradation state are all displayed live beside the canvas.

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

Content (C8 resolved): availability status line, email (`shubhmtiwri00@gmail.com`), copy-to-clipboard control, location and timezone, three professional links (GitHub, LinkedIn, dev.to), and a final résumé CTA. **No response-time claim is made** — the owner did not commit to one, and an unmet "replies within 24h" is worse than silence.

Composition: a centered panel, max-width 720px, with the strongest corner-tick treatment on the site — this is the last thing seen and should feel like the most solid object on the page.

```text
     UPLINK · ASIA/KOLKATA UTC+5:30 · WEEKDAYS

              Let's build something
                    together.

   ● OPEN TO FRONTEND / PLATFORM ROLES · WEEKDAYS

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
| **L0** | **Flight** *(new in R2)* | The scroll-driven camera path, band cross-fade, and everything inside the scene | The single WebGL scene only | ≤16ms/frame desktop, ≤33ms mobile; paused when hidden |
| **L1** | Ambient | Nebula drift, star twinkle, relay-beam pulse — all *within* the scene | Inside L0's canvas; no DOM ambient motion at all | Counted inside L0's frame budget |
| **L2** | Interaction | Hover, focus, active, copy confirmation | Every interactive element | ≤200ms, CSS only |
| **L3** | Navigation | Section entrances, rail active state, spine draw | Section boundaries, nav | ≤560ms, once per element |
| **L4** | Storytelling | Hero reveal, art→scene cross-fade, cross-route View Transitions | Arrival (once per load), route changes | ≤900ms, ≤2 per session |

**L0 is new and it changes the hierarchy's shape.** In R1, ambient motion was a decorative afterthought with a 4ms budget. In R2 the flight *is* the experience, so it gets the largest budget on the site — and in exchange, **all DOM-level ambient motion is banned**. There is no drifting gradient, no pulsing element, no floating card anywhere in the DOM. The scene moves; the interface stays still. That separation is what keeps the composition readable instead of soupy.

**Where each level is allowed.** L0 exists exactly once, site-wide, and only on routes that mount the scene (`/` and `/instruments`). L2 is everywhere and is the only level allowed to respond to input. L3 fires once per element per page load. L4 is reserved for arrival and route changes.

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

**`prefers-reduced-motion: reduce`** — one global rule plus explicit per-level handling:

- **L0: the camera stops interpolating.** This is the critical one. The scene still mounts and still renders all eight compositions, but the camera **cuts** to a section's keyframe when that section becomes active instead of gliding. You get the imagery with zero continuous movement. Nebula drift, twinkle and beam pulses all stop; the scene becomes, in effect, eight beautiful stills.
- L1: off (folded into L0 above).
- L2: retained, reduced to 120ms opacity/colour changes. Feedback must survive — removing it harms usability.
- L3: a single 200ms opacity fade, no transform, no stagger. Spine renders fully drawn.
- L4: off. Hero renders final-state immediately; the art→scene cross-fade becomes an instant swap; View Transitions disabled.
- Band cross-fades become instant switches at section boundaries.
- Smooth anchor scrolling off (instant jumps).
- Orbit does not auto-start: poster plus a `START SIMULATION` button.

> **Why the scene still mounts under reduced motion.** Removing it entirely would be easier, but `prefers-reduced-motion` means *reduce motion*, not *remove imagery* — and users who set it for vestibular reasons still deserve the designed experience. A static camera has no vestibular cost. On the lowest device tier, however, reduced-motion **does** skip the scene and keep the art layer, because there the win is battery and heat rather than motion.

**Device tier ladder** (evaluated once at scene mount, in `useSceneTier`):

```text
if (!webglSupported)                          → art layer only, no canvas
else if (reducedMotion && tier === 'low')     → art layer only, no canvas
else if (reducedMotion)                       → scene mounts, camera CUTS, no ambient motion
else if (hardwareConcurrency <= 4
         || deviceMemory <= 4
         || saveData)                         → LOW:  3,000 stars, DPR 1.0, no bloom, 30fps cap
else if (viewport < 768px)                    → LOW:  same as above (mobile default)
else if (viewport < 1024px)                   → MID:  6,000 stars, DPR 1.5, no bloom
else                                          → HIGH: 12,000 stars, DPR 1.75, bloom 0.9
```

`navigator.connection.saveData` is respected: a visitor asking for less data does not get a 230KB scene chunk — they get the art layer.

**Runtime degradation, one-way per session (never oscillate):**

| Trigger | Action |
|---------|--------|
| Rolling mean frame time > 20ms for 2s | Halve star count, drop one nebula layer |
| Still > 20ms for 2s | Disable bloom, cap DPR at 1.0 |
| Still > 26ms for 2s | Freeze the camera, keep the last frame rendered |
| `webglcontextlost` | Fade the canvas out, reveal the art layer, do not attempt recovery |

Every degradation step is logged once to the console in development so the tier ladder is debuggable, and never logged in production.

---

## 17. Visual System

### 17.1 The backdrop stack

One system, mounted once in `BaseLayout`, fixed, behind everything, persisting across routes via `transition:persist`. Four layers:

| Layer | z | Implementation | Cost | Mobile |
|-------|---|---------------|------|--------|
| Void | `--z-void` | `background: var(--color-void)` on `<body>` | 0 | Same |
| **AI art** | `--z-art` | The band's backdrop still (§3.4), `object-fit: cover`, cross-faded between bands on scroll. A 32×18 LQIP data-URI paints instantly. **Always mounted, never removed.** | ≤180KB per plate, AVIF, lazy after the first | Half-res variants |
| **WebGL scene** | `--z-scene` | The single `<Canvas>` (§19.2a). Opacity 0 → 1 over 600ms once ready. | ≤230KB gz, ≤16ms/frame | Reduced fidelity, still present |
| Grain | `--z-grain` | 128×128 tiling PNG (~2KB) at 3% opacity, `pointer-events: none` | ~2KB | Same |

**The art layer is the load-bearing part of this design, not a nicety.** It is why the spine is safe to ship:

- It paints before any JavaScript, so the page is never black while three.js downloads.
- It is the complete no-WebGL experience — for blocked WebGL, a failed context, `prefers-reduced-motion` on a low tier, or an init error.
- It survives **context loss**. A suspended mobile tab or a GPU reset kills the canvas; because the art never unmounts, the visitor sees a still instead of a void. Handle `webglcontextlost` by fading the canvas out, not by unmounting anything.
- The grain sits *above* the canvas deliberately: it unifies rendered pixels and generated art into one image, so the handover between them is imperceptible.

**Bloom is the only post-processing** (§3.2), desktop-only and dynamically imported. Applied to bright emitters — stars, planet limbs, the probe trail — at fixed intensity with band-tinted hue. Never near text.

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
COLOR — void & surfaces  (unchanged in R2)
--color-void          #04060D    page ground
--color-surface-0     #080C16    lowest panel
--color-surface-1     #0D1322    default panel
--color-surface-2     #141C2E    raised / hover panel

COLOR — ink  (NEVER band-tinted: reading must not get harder as you travel)
--color-ink-hi        #EAF0FA    headings, key values      (~16.4:1 on void)
--color-ink-mid       #9BA8C2    body copy                 (~7.3:1 on surface-0)
--color-ink-low       #7C89A5    labels, captions          (~4.9:1 on surface-0)

COLOR — the eight spectral bands (§3.3)
--band-ion            #7DE2FF    First Light, Uplink   O III / starlight   (~13:1)
--band-magenta        #FF5FA2    Observer's Log        H-alpha             (~7.4:1)
--band-blue           #8FB8FF    The Atlas             O/B-type stars      (~9.8:1)
--band-ember          #FFB454    Trajectory            G-type / ion engine (~10.9:1)
--band-violet         #A78BFA    Catalogued Worlds     reflection nebula   (~7.9:1)
--band-aurora         #5BE9B9    Instrument Bay        O III aurora        (~11.6:1)
--band-gold           #FFD76E    Transmissions         sodium line         (~13.1:1)
--color-danger        #FF8080    errors only — not a band, never travels

COLOR — the live band (the mechanism)
--band                the active band hue. Set on <body> per section and
                      cross-faded by the scroll controller. EVERY accent in the
                      DOM resolves through this, so one write re-tints the page.
--band-rgb            "125 226 255" — same value, space-separated channels, so
                      the scene can read it as a uniform without re-parsing hex.

COLOR — derived (all band-relative)
--color-hairline      color-mix(in oklab, var(--band) 12%, transparent)
--color-hairline-hi   color-mix(in oklab, var(--band) 24%, transparent)
--color-accent        var(--band)                     links, active, focus
--color-accent-dim    color-mix(in oklab, var(--band) 60%, var(--color-ink-mid))

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
--z-void 0   --z-art 1   --z-scene 2   --z-grain 3
--z-content 10   --z-rail 40   --z-nav 45   --z-overlay 60   --z-skip 90
   art   = AI-art still + LQIP  (the no-WebGL fallback, always present)
   scene = the single WebGL canvas, cross-faded over the art

SCENE (read by the R3F layer, not by CSS)
--scene-dpr-max       1.75 desktop / 1.0 mobile   device pixel ratio ceiling
--scene-stars         12000 desktop / 3000 mobile particle count
--scene-bloom         0.9 desktop / 0 mobile      post-processing intensity
--scene-camera-lag    140ms                       camera inertia behind scroll

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

### 19.2 React 19 — the interactive layer

**Why.** The owner asked for React to own interactivity and complex components, and R2's centrepiece — a scroll-driven scene graph — is exactly the case where React's declarative model pays for itself: R3F lets the scene be described as components with props instead of imperative `scene.add()` bookkeeping, which is the difference between a maintainable scene and a 600-line `init()`.
**Where.** The scene graph and every island in §20.2: the scene, planets, the skills globe, the simulation, the nav, and the small controls.
**Where not.** Still never for static text, headings, prose, records, or lists. Content is `.astro` and lands in the HTML — that is what keeps P1 true. A React component with no state, no effects and no 3D must be an `.astro` component.
**Cost.** ~11KB gz for react + react-dom/client, shared across all islands on the route.
**Mobile.** Mobile now hydrates the scene too (owner's decision), at reduced fidelity — see §24.2.
**Fallback.** Every island's server-rendered HTML is the fallback and must be independently correct.

### 19.2a three.js + React Three Fiber — the spine

**This reverses Revision 1's rejection of WebGL.** R1 argued Canvas 2D could cover the effects and that ~150KB was unjustified. That was correct for R1's brief and wrong for R2's: a *continuous camera path through a volumetric scene with depth-sorted particles, real perspective and post-processed bloom* has no cheaper medium. Canvas 2D cannot do perspective projection of 12,000 depth-sorted points at 60fps, and faking it in CSS transforms collapses the moment the camera rotates.

| | |
|---|---|
| **Why** | The spine (§4.1) is the product. No other technology delivers it. |
| **Where** | Exactly one `<Canvas>`, mounted once in `BaseLayout`, persisting across routes via `transition:persist`. Plus the Orbit simulation on `/instruments`. |
| **Where NOT** | Never for text, UI, layout, navigation, or anything a visitor must read or click. Never a second canvas (P5). Never a per-section scene. |
| **Cost** | three.js ~150KB gz + R3F ~40KB gz + a hand-picked drei subset ~20KB gz. This is the single largest line in the budget and is accepted deliberately. |
| **Mobile** | Loads, at reduced fidelity: 3,000 particles, DPR 1.0, no bloom, half-res textures (§24.2). |
| **Fallback** | The AI-art still layer beneath it, which is always rendered and never removed. |

**Import discipline — this is how the budget is actually held.** Never `import * from 'three'` and never `import { ... } from '@react-three/drei'` wholesale; both defeat tree-shaking and can double the bundle.

- Import named three.js modules only (`Vector3`, `CatmullRomCurve3`, `Points`, `ShaderMaterial`, …).
- Cherry-pick drei by deep path (`@react-three/drei/core/Points`), and hold the allowed list to: `Points`, `PointMaterial`, `useTexture`, `Preload`. Anything beyond that needs a Decision log entry.
- Post-processing (`@react-three/postprocessing`) is desktop-only and dynamically imported, so mobile never downloads the bloom pass.
- The whole scene is one lazy chunk, imported after first paint. It must never appear in the initial JS.
- CI asserts the scene chunk's gzipped size (§26.4). A three.js bundle grows silently otherwise.

### 19.2b Scroll driver — CSS-first, JS where it must be

Scroll progress is needed by both the DOM (band tinting, section state) and the scene (camera position). One source of truth: a single `requestAnimationFrame` loop that reads `window.scrollY` **once per frame** (never per listener) and writes both a CSS custom property and a shared ref the scene reads. No scroll library — no Lenis, no GSAP ScrollTrigger, no smooth-scroll hijack (P4, and §19.8 still rejects them).

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
- **View Transitions** (Astro's `<ClientRouter />`) with `transition:persist` on the cosmos, so the sky survives navigation between the four real routes. ~4KB. Disabled under reduced motion.
- **`color-mix()`, `oklab`** for all alpha derivations, so accents stay perceptually consistent.
- **`@supports`, `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`** as first-class branches, not afterthoughts.

### 19.6 SVG — the default for data visuals

**Why.** Crawlable, accessible, scalable, stylable by tokens, zero runtime.
**Where.** Skills constellation, trajectory spine, project spheres (gradient-based), architecture diagrams, icon sprite, corner-tick-adjacent flourishes.
**Where not.** Anything with more than ~300 animated nodes (DOM cost) — that is Canvas's job.
**Mobile.** Constellation SVG is dropped for the list; the spine SVG is replaced by a CSS border.
**Fallback.** Inline SVG needs none; `<img>`-referenced SVG would, so all SVG is inlined.

### 19.7 Canvas 2D — no longer used

R1 made Canvas 2D the imperative renderer for the star field and the Orbit simulation. **R2 has no Canvas 2D at all:** both moved into WebGL, because three.js is loaded anyway and a second renderer with its own frame loop would be pure duplication (§14.3).

This is worth recording rather than silently dropping, because it is the one place where adopting a *heavier* library made the codebase *simpler* — one renderer, one frame loop, one set of tier and degradation rules, instead of two of each.

**If the spine is ever cut,** Canvas 2D becomes the right answer again for both, and R1's specification for them is recoverable from this document's git history.

### 19.8 Explicitly rejected dependencies

| Technology | Verdict | Reasoning |
|-----------|---------|-----------|
| **Framer Motion / Motion One** | **Do not add** | Every DOM animation in §16.3 is expressible in CSS keyframes, transitions, or scroll-driven animations, and scene animation belongs to R3F's own frame loop. A 15–40KB DOM animation runtime would duplicate both. *Sole exception:* the owner's own component-library demos on `/instruments`, since demonstrating that library is the point — and it loads only on that route. |
| ~~Three.js / React Three Fiber~~ | **ADOPTED in R2 — see §19.2a** | R1 rejected this. R2's brief makes the scene the product, and no cheaper medium produces a continuous camera path through a volumetric scene. |
| **GSAP + ScrollTrigger** | Rejected | The §19.2b driver is ~30 lines and one rAF loop. A scroll library would add weight and take ownership of scroll away from the browser (P4). |
| **Post-processing beyond bloom** | Rejected | Depth-of-field, god rays and chromatic aberration each cost a full-screen pass for effects that read as "shader demo". Bloom only (§17.1). |
| **Physics engines (rapier, cannon)** | Rejected | The Orbit simulation is ~30 lines of semi-implicit Euler. A physics engine is 100KB+ to avoid writing them. |
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
| 1 | **`DeepFieldScene`** — the spine: camera rig, starfield, nebula volumes, planets, station, all of it | all | `client:idle` | **≤230KB** (three + R3F + drei subset + scene code, one lazy chunk) | AI-art still layer, always rendered beneath (§17.1) |
| 2 | `ScrollDriver` — one rAF loop; writes `--scroll` + band, feeds the scene | all | `client:load` | ≤2KB | Bands render server-side per section; no cross-fade without it |
| 3 | `SectionRail` — scroll-spy + progress + flight-path marker | `/` | `client:idle` | ≤4KB | Plain anchor list, fully functional |
| 4 | `WorldViewer` — planet focus/inspect interactions, feeds selection into the scene | `/` | `client:visible` | ≤6KB | Static cards with AI-art planet stills |
| 5 | `SkillsGlobe` — pointer-rotatable constellation globe (in-scene) | `/` | `client:visible` | ≤8KB | Server-rendered SVG map + grouped list |
| 6 | `AtlasLink` — two-way star↔row highlight | `/` | `client:visible` | ≤3KB | SVG + list, both complete |
| 7 | `CopyEmail` | `/`, `/dossier` | `client:visible` | ≤1.5KB | `mailto:` link |
| 8 | `MobileNav` | all (<md) | `client:idle` | ≤2KB | Static bottom bar |
| 9 | `Orbit` — WebGL n-body simulation with telemetry | `/instruments` | `client:visible` | ≤14KB (reuses the shared three chunk) | Static poster + description |

**Directive rationale.** `ScrollDriver` is the only `client:load` on the site — it is ~2KB and everything visual downstream reads from it, so deferring it would cause a visible band/camera pop. The scene is `client:idle` so it cannot compete with LCP; it cross-fades in over the art still when ready. Everything below the fold is `client:visible`.

**`client:media` is no longer used to gate the scene.** R1 kept WebGL off mobile entirely; R2 ships it everywhere at reduced fidelity (owner's decision), so fidelity is chosen *at runtime* from the device tier (§16.4) rather than at build time by media query. `client:media` survives only for the desktop-only post-processing import.

**Hydration-gap rules (stricter in R2):**

1. **The scene must never cause layout shift.** The canvas is `position: fixed` and outside flow, so it structurally cannot — do not ever place it in flow "temporarily".
2. **The art→scene handover is a 600ms opacity cross-fade**, with the art layer staying mounted underneath forever. Never unmount the fallback: a lost WebGL context (tab suspend, GPU reset) must reveal the still, not a black hole.
3. `WorldViewer` and `SkillsGlobe` enhance already-rendered DOM. Their server output is the real content; hydration adds only interaction.
4. If `DeepFieldScene` throws during init, it must catch, log once, and leave the art layer visible. An error boundary wraps the canvas and renders `null` on failure — never an error message over the design.

### 20.3 Content collections

`src/content/` with Zod schemas. Schemas are the contract; a missing required field fails the build, which is exactly the guardrail that prevents placeholder content shipping.

| Collection | Type | Required | Optional |
|-----------|------|----------|----------|
| `projects` | data | `id` (`SHB-1b`), `slug`, `name`, `oneLiner`, `description`, `stack[]`, `status`, `year`, `liveUrl`, `featured` | `repoUrl`, `gradientSeed` (defaults to a hash of `slug`) |
| `experience` | data | `role`, `durationLabel`, `achievements[]` | `company`\*, `startDate`, `endDate`, `location`, `mode`, `summary`, `technologies[]`; per achievement: `metric{value,unit,label}` |
| `skills` | data | `name`, `tier`, `constellation`, `x`, `y`, `sortScore` | `connections[]`, `url` |
| `articles` | data | `title`, `url`, `publishedAt`, `source` | `excerpt`, `readingMinutes`, `coverImage`, `tags[]` |
| `instruments` | data | `id` (`I-01`), `name`, `claim`, `body` | `demo`, `diagram`, `codeExcerpt`, `links[]` |
| `profile` | data (single) | `name`, `role`, `location`, `timezone`, `email`, `socials[]`, `yearsExperience`, `availability` | `philosophy`, `prose[]`, `fieldNotes[]`, `openQuestions[]`, `resumePdf` |

\* `company` is **optional by decision** (C1) — no employer names are used. `liveUrl` moved to required because all three projects now have one, so a project without a link should fail the build rather than render a dead card. The `problem`/`approach`/`impact`/`screenshots` fields are gone entirely (C2, C3): unused schema fields invite an agent to fill them.

`projects.status` is a union of `LIVE | ARCHIVED | PRIVATE`; `experience.achievements[].metric` is present on exactly one entry (§12.2). `skills.tier` is a union of `CORE | WORKING | FAMILIAR` and `constellation` of `INTERFACE | SUBSTRATE | OPERATIONS`, so a typo fails the build instead of silently dropping a star.

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
│   │   ├── Cosmos.astro          composes the 4 backdrop layers (§17.1)
│   │   ├── ArtBackdrop.astro     AI-art still + inlined LQIP — the permanent fallback
│   │   ├── Grain.astro
│   │   └── scene/                ── THE SPINE (§19.2a) ──
│   │       ├── DeepFieldScene.tsx    ISLAND ROOT — <Canvas>, error boundary, tier select
│   │       ├── CameraRig.tsx         spline path + look-at + inertia (§4.1)
│   │       ├── flightPath.ts         the 8 keyframes; single source of truth
│   │       ├── StarField.tsx         instanced points, depth-sorted, tier-scaled
│   │       ├── NebulaVolume.tsx      layered billboards, band-tinted shader
│   │       ├── GalaxySprites.tsx     distant galaxies (First Light beat)
│   │       ├── ConstellationGlobe.tsx  the Atlas instrument, in-scene
│   │       ├── ProbeTrail.tsx        Trajectory ion-trail + burn markers
│   │       ├── PlanetSystem.tsx      three planets from the projects collection
│   │       ├── Planet.tsx            one textured sphere + limb light + ring
│   │       ├── Station.tsx           Instrument Bay wireframe structure
│   │       ├── RelayBeams.tsx        Transmissions signal beams
│   │       ├── Bloom.tsx             desktop-only, dynamically imported
│   │       └── useSceneTier.ts       particle count / DPR / bloom from device tier
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
│   │   ├── WorldStill.astro      planet still fallback, no-WebGL/mobile (§10.6)
│   │   └── WorldRecord.astro     the data table (id, status, stack, year)
│   │   ── no case-study/ group — those routes are not built (§10.3)
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
│   ├── scrollProgress.ts         the ONE rAF loop (§19.2b); publishes --scroll + band
│   ├── bands.ts                  the 8 spectral bands; hex + rgb triplet per band
│   ├── prefersReducedMotion.ts
│   ├── deviceTier.ts             the §16.4 capability ladder (now feeds the scene)
│   ├── webglSupport.ts           context probe; decides whether to mount the scene at all
│   ├── analytics.ts              thin typed event wrapper
│   └── seo.ts                    metadata + JSON-LD builders
├── pages/
│   ├── index.astro
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
    └── images/                   portrait + Orbit poster (processed by astro:assets)
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
| `WorldStill` | Planet still fallback for no-WebGL / mobile / low tier | `slug`, `featured?` | none | Server |
| `Orbit` | n-body sim + telemetry + degradation + start control | `bodyCount?` | local: sim state, running, fps | Island |
| `CopyEmail` | Clipboard + confirmation + live region | `email` | local: `copied` | Island |

**Reusable primitives** are exactly: `Section`, `Panel`, `Button`, `Chip`, `StatusDot`, `DataList`, `MetricBlock`, `Icon`, `ExternalLink`. Everything else is a composition. Do not create additional primitives without a third use case — two uses is a coincidence, three is a pattern.

**Animation boundary rule.** Entrance animation is applied by `Section` via a `data-observe` attribute consumed by one shared utility. Individual components never register their own scroll listeners or observers.

---

## 22. State Management

**Still no state library** — but R2 introduces exactly one piece of genuinely shared state, and pretending otherwise would produce the classic mess of three islands each running their own scroll listener.

**Scroll progress is shared; everything else stays local.**

`lib/scrollProgress.ts` owns one rAF loop, reads `window.scrollY` once per frame, and publishes:

- `--scroll` (0→1) and `--band` / `--band-rgb` as CSS custom properties on `<body>` — consumed by the DOM with zero JS involvement;
- a mutable ref (`{ progress, band, velocity }`) that the scene's `useFrame` reads directly, **never through React state** — setting React state 60×/second would re-render the tree every frame and destroy the frame budget.

That is a module-scoped singleton, not a store library: ~30 lines, one subscriber list, no dependency. Islands import it; they never talk to each other.

| State | Owner | Scope | Persistence |
|-------|-------|-------|-------------|
| **Scroll progress + active band + velocity** | `lib/scrollProgress.ts` singleton | **shared** — read via CSS vars (DOM) and a ref (scene) | none |
| Camera position / look-at | `CameraRig`, derived from scroll ref inside `useFrame` | local, non-reactive | none |
| Active section id | `SectionRail` island (IntersectionObserver) | local | none |
| Selected / focused planet | `WorldViewer` island; passed into the scene as a prop | local | none |
| Globe rotation | `SkillsGlobe` island, in a ref | local, non-reactive | none |
| Hovered skill | `AtlasLink` island | local | none |
| Copied confirmation | `CopyEmail` island | local, 2s | none |
| Mobile nav sheet + bar visibility | `MobileNav` island | local | none |
| Scene tier (particles, DPR, bloom) + degraded flag | `useSceneTier`, computed once at mount, one-way downgrade | local | none |
| Orbit sim state | `Orbit` island, typed arrays in refs | local | none |
| WebGL availability | `webglSupport.ts`, probed once | read-only | none |
| Reduced-motion preference | CSS media query; `prefersReducedMotion.ts` where JS must branch | read-only | OS-level |
| Theme | **none — the site is dark-only** | — | — |

**Frame-loop rules (new in R2, and the difference between 60fps and 20fps):**

1. Nothing that changes per frame may live in React state. Refs only.
2. One `useFrame` per scene concern, and none of them allocate — pre-allocate every `Vector3`/`Color` at module or mount scope and mutate in place.
3. Islands never read each other's state. The scroll singleton is the only shared channel.
4. No `useEffect` that runs on scroll. Scroll reaches components exclusively through the singleton.

**Why dark-only:** the entire concept is a night sky. A light mode would require a second complete visual system (the cosmos, glows, and hairlines have no light-mode analogue) for a use case that does not exist here. `color-scheme: dark` is declared so form controls and scrollbars match. This is a deliberate, recorded decision — not an oversight.

**Rules.** No island reads another island's state. No `window` globals. No custom events between islands. No URL state (no filters, no tabs, no modals — by design). If a future feature seems to need cross-island state, the correct first move is to move that UI into a single island or onto its own route.

---

## 23. Routing

Astro file-based routing, `output: 'static'`, `trailingSlash: 'never'`, `site: 'https://<production-domain>'` (required for sitemap and absolute OG URLs).

| Route | File | Generation | Notes |
|-------|------|-----------|-------|
| `/` | `pages/index.astro` | static | The survey; 8 anchor sections. Project records live here in full |
| `/instruments` | `pages/instruments.astro` | static | Heaviest route; holds Orbit |
| `/transmissions` | `pages/transmissions.astro` | static | Full article index |
| `/dossier` | `pages/dossier.astro` | static | HTML résumé + PDF link |
| `/404` | `pages/404.astro` | static | Lost signal |
| `/rss.xml` | `pages/rss.xml.ts` | build | Articles feed |
| `/sitemap-index.xml` | `@astrojs/sitemap` | build | — |
| `/og/*.png` | `pages/og/[...route].ts` | build | One image per route (no per-project images — there are no project routes) |

**No `/worlds/[slug]` routes** (§10.3, C3).

**Redirects:** `/projects → /#worlds`, `/blog → /transmissions`, `/resume → /dossier`, `/lab → /instruments`. Rationale: the codenames are the site's own vocabulary, but visitors and old links will use the conventional words. Configured in `astro.config.mjs` `redirects` (emitted as static redirect pages) and/or at the host.

**Anchors are part of the API.** `#first-light`, `#log`, `#atlas`, `#trajectory`, `#worlds`, `#instruments`, `#transmissions`, `#uplink` are stable and linkable. Do not rename them once published.

**View Transitions:** `<ClientRouter />` in `BaseLayout`, with `transition:persist` on the `Cosmos` layer so the sky does not flash when moving between `/`, `/instruments`, `/transmissions`, and `/dossier`. That persistence is the whole justification now that the card→case-study pair is gone (§10.5) — and it is enough on its own, since a flashing background would break the illusion of one continuous space. Disabled entirely under `prefers-reduced-motion`.

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

**Mobile keeps the 3D** (owner's decision) at aggressively reduced fidelity. Fidelity is selected at runtime from the device tier, not by media query, so a high-end phone gets more than a low-end laptop.

| Effect | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| AI-art backdrop + LQIP | **Preserved** (half-res) | Preserved | Preserved (full-res) |
| **WebGL scene + camera flight** | **Preserved, reduced** | Reduced | **Full** |
| ↳ star particles | 3,000 | 6,000 | 12,000 |
| ↳ device pixel ratio | capped **1.0** | 1.5 | 1.75 |
| ↳ bloom post-processing | **Removed** (not downloaded) | Removed | Full (0.9) |
| ↳ nebula volume layers | 3 | 5 | 8 |
| ↳ planet textures | 1024px | 1024px | 2048px |
| ↳ planet count in view | 3 (low-poly, 32seg) | 3 (48seg) | 3 (64seg + rings) |
| Constellation globe | **Replaced** by SVG map + list | In-scene, no rotation | In-scene, pointer-rotatable |
| Probe trail + burn markers | Simplified (no trail particles) | Full | Full |
| Relay beams | **Removed** | Full | Full |
| Trajectory DOM spine | **Replaced** by CSS border-left | Straight SVG, static | Curved SVG, scroll-drawn |
| Orbit experiment (`/instruments`) | **Removed** (poster) | **Removed** (poster) | Full |
| Section entrances | Simplified (320ms, 40ms stagger) | Full | Full |
| Band cross-fade | Preserved (it is one CSS var) | Preserved | Preserved |
| Backdrop-blur panels | Simplified (opaque — blur over a live scene is the most expensive thing on a mobile GPU) | Full | Full |
| Hover states | **Replaced** by `:active` feedback | Full | Full |

**Mobile-specific scene rules:**

1. **Opaque panels, not blurred.** `backdrop-filter` compositing over a live WebGL canvas is the single biggest mobile frame cost. Below `md`, panels are solid `--color-surface-1`.
2. **Pause when not visible.** The scene's rAF stops on `visibilitychange` and when the canvas leaves the viewport — which on mobile happens whenever the address bar collapses over it.
3. **Never render during scroll momentum on low tier.** On the lowest tier, the scene renders at 30fps cap and skips frames while `velocity` is high; a blurry-fast camera move is invisible anyway.
4. **Touch never rotates the globe by accident.** `SkillsGlobe` rotation is desktop-pointer only; on touch, the section falls back to the SVG map so a swipe always scrolls the page (P4).

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

**This chapter got stricter in Revision 2, not looser.** Performance budgets moved because the owner chose spectacle; accessibility did not move because no one benefits from an inaccessible portfolio. A scroll-driven WebGL site is precisely the architecture that tends to eat its own content, so R2 adds four hard rules on top of everything already here.

### 25.0 The parallel-DOM contract (new in R2)

The scene is decorative in the strict WCAG sense: **it conveys no information that is not already in the DOM as text.** That is a design constraint on the scene, not a claim about it — if the scene ever becomes the only place something is expressed, the content is wrong, not the markup.

| Scene element | The information it decorates | Where that information actually lives |
|---------------|------------------------------|--------------------------------------|
| Camera position on the flight path | "how far through the site you are" | `SectionRail` with `aria-current`, plus normal document order |
| Nebula / band hue | "which section you are in" | The section's own `<h2>` and mono codename label |
| The three planets | project identity and relative significance | `WorldCard` records: name, designation, description, stack, live link |
| Constellation globe | skills, tiers, relationships | The tier-grouped `<ul>` — the canonical, sole tab path |
| Probe trail + burn markers | career milestones | The `<ol>` of positions and achievements |
| Station, relay beams, galaxies | atmosphere only | Nothing — pure decoration, correctly |

**The four R2 rules:**

1. **`<canvas>` is `aria-hidden="true"` + `role="presentation"`, and contains zero focusable elements.** No object in the scene is ever a tab stop. Every 3D interaction has a DOM control that does the same thing.
2. **Delete-the-canvas test is a CI gate**, not a manual check: a Playwright run removes the canvas element and asserts the §27.4 content set is still present and the keyboard order is unchanged (§34.3).
3. **`prefers-reduced-motion` disables continuous camera motion entirely** — the camera cuts between the eight keyframes on section entry rather than interpolating (§16.4). Vestibular safety is not negotiable for a site whose main feature is a moving camera.
4. **Text legibility must not depend on the camera.** The §17.1 panel legibility contract (≥68% surface opacity + vignette) exists so that body copy never has to compete with whatever is behind it, and it is verified by screenshotting each section at three scroll offsets (§34.2).

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
| `hairline` (band 12%) | `surface-1` | <3:1 | **Decorative only** — never the sole indicator of a boundary or state | n/a |

**All eight bands, on `void` — every one must clear 4.5:1, because any of them can be the link colour:**

| Band | Hex | Ratio on void | Status |
|------|-----|--------------|--------|
| Ion Cyan | #7DE2FF | ~13.0:1 | ✓ |
| Nebula Magenta | #FF5FA2 | ~7.4:1 | ✓ |
| Stellar Blue | #8FB8FF | ~9.8:1 | ✓ |
| Solar Ember | #FFB454 | ~10.9:1 | ✓ |
| Plasma Violet | #A78BFA | ~7.9:1 | ✓ |
| Aurora Green | #5BE9B9 | ~11.6:1 | ✓ |
| Signal Gold | #FFD76E | ~13.1:1 | ✓ |

This is *why* the bands are all light, high-value hues rather than the saturated mid-tones a "space palette" usually reaches for: a deep nebula purple would look right and fail contrast. **Magenta (7.4:1) and Violet (7.9:1) have the least headroom** — they are the first two to re-verify if any token changes, and neither may be used on `surface-2` at label sizes without re-measuring.

`ink-low` has the least headroom of the inks: never below 12px, never for body copy, never on `surface-2`.

**Additional R2 verification:** every band must also be checked against the *rendered scene* behind a panel, not just against the flat token. That is what the §17.1 legibility contract and the three-offset screenshot test (§34.2) are for — a nominal 7.4:1 means nothing if the panel is 40% transparent over a bright nebula.

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

Automated: `axe-core` via Playwright on all five route types (`/`, `/instruments`, `/transmissions`, `/dossier`, `/404`), plus `@axe-core/cli` in CI — zero violations required. Manual: full keyboard pass per route; VoiceOver (macOS Safari) and NVDA (Windows Firefox) pass on `/` and `/instruments`; 200% zoom; 320px reflow; forced-colors mode; reduced-motion pass; JS-disabled pass.

---

## 26. Performance

### 26.1 Targets — Definition of Done gates

Measured on the deployed production URL. Mobile = Moto G Power class, Slow 4G, via Lighthouse mobile preset.

**These targets are lower than Revision 1's and that is the deliberate price of the spine.** They are still targets, not hopes: CI asserts them (§26.4), and missing one means cutting scene scope, never raising the number.

| Metric | Mobile target | Desktop target | R1 was |
|--------|--------------|----------------|--------|
| Lighthouse Performance | **≥78** (`/`); ≥85 (`/transmissions`, `/dossier`); ≥72 (`/instruments`) | ≥90 | ≥95 mobile |
| **Lighthouse Accessibility** | **100 — all routes, unchanged** | **100** | 100 |
| Lighthouse Best Practices / SEO | ≥95 / 100 | ≥95 / 100 | same |
| LCP | **≤3.0s** | ≤2.2s | ≤1.8s / ≤1.2s |
| CLS | **≤0.02 — unchanged** | ≤0.02 | same |
| INP | **≤200ms** | ≤120ms | ≤150ms / ≤100ms |
| TBT | ≤600ms | ≤300ms | ≤150ms |
| TTFB (static CDN) | ≤200ms | ≤200ms | same |
| **Sustained frame rate** | **≥30fps floor** | **≥58fps** | n/a |
| **Scene init → first render** | ≤1.2s after idle | ≤600ms after idle | n/a |

**Two targets did not move, and they are the ones that matter most for credibility:**

- **CLS ≤0.02.** The scene is `position: fixed` and outside flow, so it cannot shift layout. If CLS regresses, something was put in flow that should not have been.
- **LCP is still a text element.** The hero heading paints from static HTML before any JS. If a profiler ever names the canvas or a backdrop image as the LCP element, that is a bug — not a consequence of the ambition.

**Frame rate is a first-class metric now (P9).** A site whose selling point is a 3D scene must not stutter. 58fps desktop and a 30fps floor on mobile are verified under 4× CPU throttle, not on the dev machine.

### 26.2 Budgets — per route, gzipped

| Resource | `/` mobile | `/` desktop | `/transmissions` | `/dossier` | `/instruments` |
|----------|-----------|------------|------------------|-----------|---------------|
| HTML | ≤40KB | ≤40KB | ≤25KB | ≤25KB | ≤45KB |
| CSS | ≤34KB | ≤34KB | ≤32KB | ≤32KB | ≤36KB |
| JS — critical path | **≤16KB** | **≤16KB** | ≤14KB | ≤16KB | ≤16KB |
| JS — scene chunk (lazy, post-idle) | **≤175KB** | **≤230KB** | not loaded | not loaded | ≤190KB |
| JS — other islands (lazy) | ≤14KB | ≤24KB | ≤2KB | ≤4KB | ≤18KB |
| **JS total** | **≤190KB** | **≤340KB** | ≤16KB | ≤20KB | ≤215KB |
| Fonts | ≤110KB | ≤110KB | ≤110KB | ≤110KB | ≤110KB |
| Images (AI art + textures, AVIF) | **≤600KB** | **≤1.6MB** | ≤40KB | ≤60KB | ≤500KB |
| **Total transfer** | **≤950KB** | **≤2.1MB** | ≤200KB | ≤230KB | ≤850KB |
| Requests | ≤28 | ≤34 | ≤16 | ≤16 | ≤32 |

**Read the JS rows carefully — the split is the whole strategy.** The critical path stays at **≤16KB on every route**, which is why LCP survives at all: the hero paints from HTML with only `ScrollDriver` (~2KB) hydrated. The 230KB scene is a separate lazy chunk fetched *after* idle, so it competes with nothing. A budget check that only measured "total JS" would tell you this site is slow; it is not, because none of that weight is on the critical path.

**Where the desktop scene chunk goes**, and why it cannot be much smaller:

| Piece | gz | Notes |
|-------|-----|-------|
| three.js (named imports only) | ~150KB | Irreducible. Wholesale import would be ~250KB+ |
| @react-three/fiber | ~40KB | The reconciler |
| drei subset (4 modules, deep-imported) | ~20KB | Wholesale import would be ~120KB |
| Post-processing (bloom) | ~14KB | **Desktop only**, dynamically imported |
| Scene code (all of `scene/`) | ~20KB | Our own components and shaders |

Mobile omits the bloom pass and loads at reduced fidelity, landing ~175KB.

**Image budgets** cover the AI-art backdrops and planet textures from §3.4. Mobile receives half-resolution variants (≤600KB total); textures are `srcset`-selected, not downscaled client-side. `/transmissions` and `/dossier` deliberately do **not** mount the scene — they are reading routes, they keep R1-era budgets, and that contrast is intentional.

**If a budget is exceeded, cut scope in this order:** particle count → texture resolution → bloom → a scene beat (drop `RelayBeams` before dropping `PlanetSystem`). Never raise the number, and never move weight onto the critical path.

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

- **Lighthouse CI** on every PR against `/`, `/instruments`, `/transmissions`; the targets in §26.1 are assertions, and a regression **fails the build**.
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
| `/` | `Person` (name, jobTitle, address, email, sameAs[GitHub, LinkedIn, dev.to, Instagram], knowsAbout[skills]) + `WebSite` + an `ItemList` of the three projects as `SoftwareApplication`/`CreativeWork` with their live URLs — since the projects have no routes of their own, their structured data lives on the home page |
| `/transmissions` | `ItemList` of `BlogPosting`, each with `url` pointing at dev.to |
| `/dossier` | `Person` + `ProfilePage` |
| `/instruments` | `WebPage` (no per-instrument entities — they are not separate works) |

### 27.3 Duplicate-content rule for articles

Articles live on dev.to. The site shows **title, date, and a ≤160-character excerpt, then links out**. It must not mirror full post bodies. If full mirroring is ever added, every mirrored page must carry `<link rel="canonical" href="{devto-url}">`. Getting this wrong would have the portfolio compete with the owner's own dev.to ranking — a real, avoidable harm.

### 27.4 Content-in-HTML guarantee

An SEO smoke test (Playwright, `javaScriptEnabled: false`) asserts that the following exist in raw HTML on `/`: the `h1` with the full name, the role string, every skill name (assert against the collection length, not a hardcoded count), every project name, description, and live URL, every article title, and the email address. If any of that ever moves inside canvas or a client-only island, this test fails. The project assertions matter more than before: with no case-study routes, the home page is the *only* place that content exists.

---

## 28. Analytics

**Provider: Vercel Analytics** if deploying on Vercel, otherwise **Plausible**. Both are cookieless and collect no PII, so **no consent banner is required** — which matters, because a cookie banner would be the first thing a visitor sees and would wreck the arrival experience.

### 28.1 Event set — closed list of 7

| Event | Trigger | Properties |
|-------|---------|-----------|
| `dossier_download` | Résumé PDF click (any location) | `location: hero \| topbar \| uplink \| dossier` |
| `world_link_click` | Project live-site click | `slug` |
| `uplink_copy_email` | Copy button success | — |
| `uplink_social_click` | Social link click | `network` |
| `transmission_click` | Article click | `slug` |
| `instrument_interact` | Orbit started, or a component demo used | `instrument: I-01…I-04` |
| `section_reach` | Section first becomes 50% visible | `section` (fires once per section per session) |

Rules: no scroll-depth percentages, no mouse heatmaps, no session recording, no third-party pixels, no PII, no cross-site identifiers. `section_reach` is throttled to one fire per section per session and rides the existing shared IntersectionObserver — it adds no new listener. All events go through `lib/analytics.ts`, which is a no-op when the provider is absent, so local development is silent and event names stay typed.

**Web Vitals** are collected by the provider's built-in RUM (INP/LCP/CLS from real visitors) and reviewed against §26.1 after launch.

---

## 29. Asset Strategy

**R2 principle: generate deliberately, then optimise ruthlessly.** R1's asset strategy was "almost zero raster". R2 adds an AI-art pipeline (§3.4) plus planet textures, and the discipline moves from *avoiding* images to *controlling* them: every asset has a prompt contract, a target size, an AVIF budget, a mobile variant, and an LQIP.

**The R2 asset rules:**

1. **AVIF only** for art and textures, with a WebP fallback emitted by `astro:assets`. No PNG or JPEG ships.
2. **Every backdrop has a 32×18 LQIP inlined as a data URI** — the fallback layer must paint with zero requests.
3. **Two resolutions per asset**, selected by `srcset`/tier: full for desktop, half for mobile. Never downscale client-side.
4. **Textures are power-of-two** and equirectangular 2:1 for planets, so three.js can mipmap without resampling.
5. **One backdrop is `fetchpriority="high"`** (the hero plate). Every other plate is lazy.
6. **Total raster is budgeted per route** (§26.2: ≤1.6MB desktop, ≤600KB mobile) and asserted in CI.
7. **Regenerate rather than accept.** If a plate reads as generic AI space art, it fails the §3.4 contract — tighten the prompt, do not ship it.

| Asset | Method | Source | Budget |
|-------|--------|--------|--------|
| Star field (live) | **Procedural** — instanced points, seeded PRNG, in-scene | Code | 0 bytes |
| Nebula volumes | **Procedural** — layered billboards + band-tinted shader, using `nebula-magenta.avif` as the volume texture | Code + 1 plate | shared with plate |
| **AI-art backdrops ×6** | **Generated** to the §3.4 contract | AI, per prompt contract | ≤180KB each, ≤940KB total |
| **Planet textures ×3** | **Generated** equirectangular 2:1 | AI | ≤120KB each |
| **Planet stills ×3** | **Generated** / rendered from the scene | AI or scene screenshot | ≤60KB each |
| **LQIP ×6** | 32×18 inline data URI per backdrop | Downsampled from each plate | ~1KB each, inlined |
| Grain overlay | Raster, 128×128 tiling PNG | Generated once | ~2KB |
| Project spheres (image-blocked fallback) | **CSS/SVG** — radial gradients seeded by slug hash | Code | 0 bytes |
| Constellation SVG map (non-WebGL fallback) | **SVG**, server-rendered from the skills collection | Code + data | ~2KB gz |
| Constellation map | **SVG**, server-rendered from `skills.ts` | Code + data | ~2KB gz |
| Trajectory spine | **SVG** path / CSS border | Code | <1KB |
| Icons (~16) | **Inline SVG sprite**, 1.5px stroke, 24px grid | Hand-authored or Lucide paths, inlined | ≤4KB gz |
| Portrait | Raster, AVIF + WebP at 480w/720w | `public/images/hero_profile.png` (864×1184, 249KB) — **move to `src/assets/images/`** and re-export | ≤60KB |
| Project screenshots | **None — eliminated (C2)** | n/a | 0 bytes |
| Architecture diagram | **Inline SVG**, hand-authored, token-colored | One, for instrument I-03 | ≤8KB |
| Orbit poster | Raster, AVIF, 1200×700 | Screenshot of the running sim | ≤80KB |
| OG images | **Generated at build** (Satori) | Code + content | ≤80KB each, not on critical path |
| Fonts | Self-hosted woff2, latin subset | Google Fonts source files | ≤110KB total |
| Résumé PDF | External file | **Added:** `public/Shubham_resume_2026.pdf` (59KB) | Well inside budget, not on critical path |

**Total raster inventory for the whole site: four files** — the portrait, the Orbit poster, the grain tile, and the build-generated OG images. Everything else is CSS, SVG, or Canvas. If a fifth raster asset is ever proposed, it needs a Decision log entry.

**Explicitly forbidden:** stock space photography, video backgrounds, Lottie files, icon fonts, HDR/EXR environment maps (an `.hdr` skybox is typically 2–8MB — the AI plates do this job at 180KB), 4K textures, uncompressed PNG textures, and any single image over 200KB after encode.

**Total raster inventory for R2:** 6 backdrops + 3 planet textures + 3 planet stills + portrait + Orbit poster + grain tile + build-generated OG images. Every one is listed above with a budget. A fourteenth raster asset needs a Decision log entry.

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

## Phase 0 — Discovery & Creative Direction ✅ COMPLETE

### Goal
Lock the creative direction and remove every content blocker, so that no later phase has to invent facts or design decisions.

### Why this phase exists
Most portfolio builds stall in the content phase, discover they lack employer names and screenshots, and fill the gap with placeholders that ship. This phase made those gaps explicit and closed them before any component depended on them.

### Status — done
- **Creative direction locked:** DEEP FIELD, eight codenames, plain labels (§4).
- **All eight content gaps resolved** — see §"Content readiness — RESOLVED". Three of them changed the architecture: no case-study routes (C3), no raster project imagery (C2), and a role-only experience section (C1).
- **Final copy written** for the hero lede, About philosophy, prose, open questions, and field notes (§13.2).
- **Assets in place:** `public/Shubham_resume_2026.pdf` (59KB), `public/images/hero_profile.png` (864×1184).
- **Authoritative content source:** `content-pack.md`.

### Remaining Phase 0 items (do not block Phase 1)
1. Verify and record font licensing for Instrument Serif, Inter, and JetBrains Mono, self-hosted (all three are OFL — confirm and note it).
2. Validate the §18 palette with a contrast checker and record measured values in the §25.2 table; adjust `ink-low` first if anything falls short.
3. Decide D1: keep `Gemini / LLM APIs` as a separate skill (24 total, the default) or fold it back (23). **Low stakes — the counts are computed at build time either way.**
4. Decide D2/D3: production domain and analytics provider.

### Files / Areas Affected
`content-pack.md` (created), `public/*` (assets added), this document (updated throughout), the Decision log.

### Components / Data / State / Animation
None — this phase produced content and decisions, not code.

### Responsive Behavior / Performance
n/a — no assets requiring responsive treatment were produced, since screenshots were eliminated (C2).

### Accessibility
Palette contrast to be verified with a checker (item 2 above) before Phase 1 exits.

### Testing
Manual review, complete: every required field in every §20.3 schema is fillable from `content-pack.md` without invention.

### Acceptance Criteria
- [x] C1–C8 resolved, with each consequence traced into the plan.
- [x] Hero lede and About copy pass the §13.1 anti-generic rules.
- [x] Résumé PDF and portrait present in `public/`.
- [ ] Contrast table verified with measured values *(carry into Phase 1)*.
- [ ] Font licensing recorded *(carry into Phase 1)*.

### Definition of Done
A content pack exists that fills every required schema field without invention, and no open creative question remains. **Met** — the four remaining items are confirmations and two low-stakes preferences, none of which block foundation work.

### AI Implementation Notes
This phase needed the owner's facts, and it has them. **Do not re-open resolved decisions** — in particular, do not add case-study routes, do not add project screenshots, and do not add a company field. If a later phase seems to need one of those, re-read §10.3, §10.6, and §12.1 before acting.

### Things NOT to implement yet
No code. No tokens in CSS. No components. No package installs.

### Expected output
`content-pack.md` + assets in `public/` + an updated plan + a Decision log recording every resolution. **Delivered.**

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
7. Define content collections and Zod schemas per §20.3 in `src/content/config.ts`. Seed every collection from `content-pack.md`.
8. Create `src/data/skills.ts` with hand-authored coordinates, tiers, constellations, and connections for every skill (§11.1–11.2 and `content-pack.md`), and `src/data/seed.ts` with the seeded PRNG used by both the star field and the world plates.
9. **Move `public/images/hero_profile.png` to `src/assets/images/`** so `astro:assets` optimises it. Leave `Shubham_resume_2026.pdf` in `public/` — it is served as-is by design.
10. Create route files as styled placeholders: `/`, `/instruments`, `/transmissions`, `/dossier`, `/404`. Each renders `BaseLayout` + a `Section` with its real title. **No `/worlds/[slug]`** (§10.3).
11. Configure `astro.config.mjs`: `site`, `output: 'static'`, `trailingSlash: 'never'`, `@astrojs/sitemap`, the §23 redirects.
12. Add a **token lint guard**: a CI grep that fails on hex colors, `ms`/`s` duration literals, and `px` spacing values inside `src/components/**` (allowing `1px` hairlines, `viewBox` numbers, and the data files).
13. Build a `/dev/tokens` page (excluded from the sitemap and from production output) rendering every token and every primitive state. This is the visual regression baseline for later phases.

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
Build succeeds. Token lint passes. `/dev/tokens` renders every state. Playwright smoke test: all five routes return 200 and contain their `h1`/`h2`. `axe-core` zero violations. JS-disabled pass.

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
The arrival experience and the spatial frame: the **art backdrop stack**, the **band system and scroll driver**, navigation with scroll-spy, the hero, and the shared section entrance architecture. **No WebGL in this phase.**

### Why this phase exists
This is the phase that makes the site feel like the concept — and in R2 it is also the phase that builds the *entire fallback experience*. Everything constructed here is what a visitor sees when WebGL is unavailable, and it must be good enough to ship on its own (P7). Building the fallback first, before the scene exists, is the only way to guarantee it is a designed state rather than an afterthought.

It is also where the performance ceiling gets set: the backdrop and hero determine LCP for every route.

### Prerequisites
Phase 1 done, plus the R2 token addendum: the eight `--band-*` values, the live `--band` / `--band-rgb` mechanism, and the `--z-art` / `--z-scene` layers (§18.2). Phase 1 shipped R1's three-accent palette, so this is a small additive change to `global.css` — do it as task 0.

### Tasks
0. **Token addendum:** add the eight bands, `--band`/`--band-rgb`, the band-derived hairline/accent tokens, and the revised z-index scale to `global.css`. Update `/dev/tokens` to render all eight bands with their measured contrast ratios. Extend the token lint to reject a raw band hex outside `global.css`.
1. Build the `cosmos/` backdrop stack (§17.1): `Cosmos.astro` composing void, `ArtBackdrop.astro` (band plate + inlined LQIP, cross-faded on band change), and `Grain.astro`. Mount once in `BaseLayout` with `transition:persist`. **CSS and images only — the `<Canvas>` arrives in Phase 4.** Reserve `--z-scene` as an empty layer now so nothing needs re-stacking later.
2. Build `lib/bands.ts` and `lib/scrollProgress.ts` (§19.2b): one rAF loop, one `scrollY` read per frame, publishing `--scroll`, `--band` and `--band-rgb` on `<body>` plus a mutable ref for later consumers. Ship it as the `ScrollDriver` island (`client:load`, ≤2KB). Verify the band cross-fades smoothly across all eight sections with zero jank and no scroll listeners anywhere else in the codebase.
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
`Cosmos`, `ArtBackdrop`, `Grain`, `Hero`, `HeroPortrait`, `StatStrip`, `ScrollHint`, `ScrollDriver` (island), `SectionRail` (island), `MobileNav` (island).

### Data
`profile` collection; computed counts for the stat strip (**derived from collections, never hardcoded**); `lib/bands.ts` as the band source of truth; the six AI-art plates from §3.4 with their LQIPs.

### State
Shared: `lib/scrollProgress.ts` (progress, band, velocity). Local: `SectionRail` (`activeId`), `MobileNav` (`sheetOpen`, `barVisible`). Nothing else.

### Animation
First-light reveal (700ms + 60ms stagger, CSS, on load). Section entrance via the shared observer (560ms, once). Band cross-fade driven by `--band`. Rail active transition (320ms). **No DOM ambient motion** (§16.2 L1 ban) — the art plates are static; only the band tint changes. All L3/L4 motion removed under `prefers-reduced-motion`.

### Responsive Behavior
Hero per §9.6. Rail ≥1024px, labels ≥1280px. Bottom bar <768px. Half-resolution art plates below `md`. `svh`/`dvh` only.

### Accessibility
`<h1>` accessible name is the full "Hi, I'm Shubham Tiwari — Frontend Engineer". Backdrop layers `aria-hidden` with empty `alt`. Nav is `<nav aria-label="Sections">` with real anchors that work with JS off. `aria-current` on active. Skip link lands on `<main>`. Stat strip is a `<dl>`. **Verify every one of the eight bands against §25.2 in situ**, over the actual art plate, not just against the flat token. `axe-core` clean.

### Performance
LCP element is the `h1` text. **Critical-path JS ≤16KB gz** (ScrollDriver + rail + mobile nav + React runtime). Hero art plate `fetchpriority="high"`, ≤180KB; every other plate lazy. LCP ≤2.2s desktop / ≤3.0s mobile on a deployed preview. CLS ≤0.02. Lighthouse ≥90 mobile at this stage — the scene is not here yet, so this is the *high-water mark* to measure Phase 4's cost against. **Record it in `PERF.md`; Phase 4 is judged against this number.**

### Testing
Playwright: hero content present with JS disabled; rail anchors navigate with JS disabled; `aria-current` updates on scroll; band custom property changes across sections; reduced-motion emulation shows no transforms. Confirm **exactly one** scroll listener exists in the whole bundle. Lighthouse on the deployed preview. `axe-core` on `/`. Visual check at 320/390/768/1280/1920.

### Acceptance Criteria
- Hero is fully readable at first paint with JS disabled and with CSS animations disabled.
- No preloader, no splash, no entry gate anywhere.
- **The full site backdrop works with zero WebGL** — this phase's output *is* the no-WebGL experience, and it must already look intentional.
- Exactly **one** `IntersectionObserver` for entrances and exactly **one** rAF scroll loop, site-wide.
- All eight bands verified for contrast over their own art plate.
- `--z-scene` exists as an empty reserved layer.
- Rail and bottom bar fully usable by keyboard and with JS off.

### Definition of Done
Arrival feels like the concept; the band system travels correctly across all eight sections; and the complete fallback experience is built and shippable before any WebGL exists.

### AI Implementation Notes
Build the reveal with CSS keyframes — no JS orchestrator. The band mechanism must be **one** custom property written by **one** loop; if you find yourself adding a second scroll listener, stop and reuse the singleton. Resist building any part of the scene here: the point of this phase is that the fallback is a designed artefact, and it cannot be if the scene exists to hide behind.

### Things NOT to implement yet
**No `<Canvas>`, no three.js, no R3F** (Phase 4). No section content (Phase 3). No planets, globe, probe trail, station or beams (Phase 4b). No Instrument Bay content or Orbit (Phase 5). No OG images. No analytics events. No `/worlds/[slug]` route — not in this phase, not in any phase (§10.3).

### Expected output
A home route with a cinematic hero over a band-tinted AI-art backdrop, a working band/scroll system, navigation with active-section tracking, eight empty anchor sections, ≤16KB critical JS, and a recorded Lighthouse high-water mark.

---

## Phase 3 — Portfolio Content

### Goal
Fill every section with real content: Observer's Log, The Atlas, Trajectory, Catalogued Worlds, Transmissions, Uplink, and the Dossier route.

### Why this phase exists
This is the phase that makes the site useful. Everything before it was frame; everything after it is enhancement. **At the end of this phase the portfolio must be shippable** — if Phases 4–5 never happened, this would still be a strong portfolio.

### Prerequisites
Phases 1–2 done. Content pack from Phase 0 (C1–C8 resolved or consciously deferred).

### Tasks
1. **Observer's Log** (§13): portrait, field-notes `<dl>`, philosophy `<blockquote>`, prose, open questions, tag chips.
2. **The Atlas** (§11): `ConstellationMap.astro` — server-rendered SVG from `skills.ts` with hand-authored coordinates, tier-based radii, always-visible Core labels, and relationship lines. `SkillList.astro` — tier-grouped list, the source of truth. Both rendered; mobile shows the list only. **No interactivity in this phase.**
3. **Trajectory** (§12): positions and burn events from the `experience` collection; `MetricBlock` for metrics; spine renders **fully drawn and static** (scroll-draw is Phase 4). Mobile spine is a CSS border.
4. **Catalogued Worlds** (§10): `FeaturedWorld` for `SHB-1b`, `WorldCard` for `SHB-2b` and `SHB-3b`, `WorldStill` for the fallback planet image, `WorldSphere` (seeded CSS sphere, the images-blocked fallback), `WorldRecord` data table. Cards are single anchors linking to the live sites. Hover states are CSS only. **No screenshots, no case-study routes. The 3D planets arrive in Phase 4b** — this phase builds the complete non-3D version of the section.
5. **Transmissions** (§8.2): hairline row list from the `articles` collection. Implement the build-time dev.to fetch with the committed fallback per §20.4.
6. **Uplink** (§15): availability status, email row, `CopyEmail.tsx` island (`client:visible`), social links, résumé CTA. Reserve the copy button's space in the server render.
7. **Instrument Bay teaser** (§14.4): four mono rows + link to `/instruments`. Zero JS.
8. **Dossier** (§8.3): HTML résumé from the `profile` collection + PDF download + print stylesheet.
9. **404** (§8.3): lost-signal page with three real links.
10. Wire the `world_link_click`, `dossier_download`, `uplink_copy_email`, `transmission_click`, and `uplink_social_click` call sites through `lib/analytics.ts` as **no-ops** (the provider is connected in Phase 8). The `world_open` event is dropped — with no case-study routes there is no internal project navigation to track.

### Files / Areas Affected
`src/components/about/*`, `atlas/*`, `trajectory/*`, `worlds/*`, `transmissions/*`, `uplink/*`, `instruments/InstrumentTeaser.astro`, `src/pages/index.astro`, `transmissions.astro`, `dossier.astro`, `404.astro`, `src/content/**`, `src/lib/analytics.ts`.

### Components
All `about/`, `atlas/`, `trajectory/`, `worlds/`, `transmissions/`, `uplink/` components, plus `InstrumentTeaser` and `CapabilityIndex`.

### Data
All six collections fully populated. Article fetch with fallback working. Counts and designations computed at build. **If `company` is unavailable, use the explicit disclosed-alternative string from §20.3 — never an empty label.**

### State
`CopyEmail`: `copied` (2s). Nothing else. The Atlas is static in this phase.

### Animation
Section entrances via the shared observer only. CSS hover/focus on cards and rows. Philosophy ion rule draws once (560ms). **No scroll-linked animation, no canvas, no constellation interactivity.**

### Responsive Behavior
Per-section responsive specs in §10.8, §11.5, §12.2, §13.3, §8.2. Verify at 320/360/390/768/1024/1280/1920. Atlas map is absent below 768px. Case-study galleries reflow to one column. Code and tables scroll inside their own containers.

### Accessibility
Every §25.3 accessible equivalent implemented. Heading outline correct on all routes (h1 → h2 → h3 → h4, no skips). `<ol>` for chronology, `<dl>` for data pairs, `<time datetime>` on every date. Skill names all present as text. Status as text. Card accessible names are `"{name} — {one-liner}"`. Gradient plates and spheres `aria-hidden`. Copy confirmation via a polite live region. `axe-core` zero violations on all five route types. Full keyboard and VoiceOver pass on `/` and `/dossier`.

### Performance
Home at end of Phase 3 (no scene yet): mobile total ≤700KB, critical-path JS ≤16KB gz; desktop total ≤900KB. All images AVIF with explicit dimensions; only the hero art plate is eager. **Lighthouse ≥90 mobile — this is the high-water mark Phase 4 is measured against, and it must be recorded in `PERF.md`.** CLS ≤0.02.

### Testing
Playwright: the §27.4 content-in-HTML assertion (JS disabled — `h1`, role, every skill name, every project name, description and live URL, every article title, the email address all present in raw HTML); every external link has `rel="noopener noreferrer"`; all three project cards link to their live sites and none is a dead link; article fallback path works with the network stubbed to fail. `axe-core` all routes. Lighthouse CI. Visual pass at all viewports.

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
This is the highest-value phase — spend effort on content fidelity, not effects. Keep the Atlas SVG server-rendered from data so Phase 4 only adds a listener. Build the sphere and plate as gradients seeded by a slug hash (`src/data/seed.ts`) — **never as images, and never request screenshots** (§10.6). Because there are no case-study routes, the project card is the only place the work is described: give card copy the effort a case study would have received. Register analytics call sites now so Phase 8 is configuration only.

### Things NOT to implement yet
No star-field canvas. No constellation hover/highlight interactivity. No scroll-drawn spine. No View Transition `transition:name` pairs on cards (Phase 4). No `/instruments` content beyond the teaser. No Orbit. No OG image generation. No analytics provider. No filtering (§10.4 — deferred indefinitely).

### Expected output
A shippable portfolio: eight populated sections on the home route, a writing index, a Dossier route, a 404, ≤16KB critical-path JS, Lighthouse ≥90 mobile, zero axe violations — and a recorded baseline for Phase 4 to be judged against.

---

## Phase 4 — The Spine

### Goal
Stand up the single persistent WebGL scene and the scroll-driven camera flight path — the star field, the nebula volumes, and the eight-keyframe camera. **Environment only; no set pieces.**

### Why this phase exists
This is the centrepiece of Revision 2 and the largest single risk in the project. It is split from its set pieces (Phase 4b) deliberately: the camera path, tier ladder, degradation, frame budget and fallback handover are *infrastructure*, and they must be proven correct against a nearly-empty scene before anyone adds planets to it. Debugging a dropped frame is tractable with a star field and impossible with eight objects in flight.

By this point the site is already complete and shippable (Phase 3) and its no-WebGL backdrop is already designed (Phase 2). That is what makes it safe to attempt this at all.

### Prerequisites
Phase 3 done and its performance targets met, with numbers recorded in `PERF.md`. **Do not start if Phase 3 is below target** — the scene's cost can only be measured against a known-good baseline. Phase 2's band system and art layer must be working, since the scene reads the band and hands over from the art.

### Tasks
1. Install `three`, `@react-three/fiber`, and the four allowed `drei` modules. Configure the build so the scene resolves to **one lazy chunk** and assert its gzipped size in CI (§26.4) — a three.js bundle grows silently otherwise.
2. Build `lib/webglSupport.ts` (context probe) and `scene/useSceneTier.ts` implementing the §16.4 ladder: `saveData` and no-WebGL bail to the art layer; low/mid/high set particle count, DPR and bloom.
3. Build `DeepFieldScene.tsx`: the single `<Canvas>`, `position: fixed` at `--z-scene`, `aria-hidden="true"`, `role="presentation"`, zero focusable children. Wrap it in an error boundary that renders `null` on failure. Mount once in `BaseLayout` with `transition:persist`.
4. Implement the art→scene handover: warm one frame off-screen, then cross-fade the canvas in over 600ms. **The art layer stays mounted forever.** Handle `webglcontextlost` by fading the canvas out to reveal it.
5. Build `scene/flightPath.ts`: the eight keyframes from §4.1 as position and look-at `CatmullRomCurve3`s. This file is the single source of truth for the flight and must contain no rendering code.
6. Build `CameraRig.tsx`: sample both curves by eased scroll progress read from the `scrollProgress` singleton **inside `useFrame`, via a ref, never React state**. Apply ~140ms inertia. Fixed FOV. Under `prefers-reduced-motion`, cut to the active section's keyframe instead of interpolating.
7. Build `StarField.tsx` (in-scene): instanced points from a seeded PRNG, tier-scaled count (12k/6k/3k), depth-sorted, pre-allocated typed arrays, subtle twinkle via a shader rather than per-frame JS.
8. Build `NebulaVolume.tsx`: 3–8 layered billboards using `nebula-magenta.avif`, tinted by a `--band-rgb`-derived uniform so the scene's colour tracks the DOM's band exactly.
9. Build `GalaxySprites.tsx` for the First Light beat — distant, nearly static, the thing that makes the opening read as intergalactic rather than merely dark.
10. Add `Bloom.tsx`, desktop/high-tier only, **dynamically imported** so mobile never downloads the post-processing pass.
11. Implement runtime degradation exactly as tabled in §16.4 — one-way per session, never oscillating, logged once in development only.
12. Pause the frame loop on `visibilitychange` and when the canvas is off-screen. Verify with a CPU profile that a hidden tab does **zero** work.
13. Re-measure everything against the Phase 3 baseline and record the delta in `PERF.md`.

### Files / Areas Affected
`src/components/cosmos/scene/*` (new), `src/components/cosmos/Cosmos.astro`, `src/lib/webglSupport.ts`, `src/lib/deviceTier.ts`, `src/layouts/BaseLayout.astro`, `astro.config.mjs` (chunking), CI budget config.

### Components
`DeepFieldScene`, `CameraRig`, `StarField`, `NebulaVolume`, `GalaxySprites`, `Bloom`, `useSceneTier`, `flightPath`.

### Data
`flightPath.ts` keyframes; `bands.ts` for scene tint; the nebula volume texture. **No content collection data reaches the scene in this phase** — planets arrive in 4b.

### State
Scene tier and degraded flag (local, one-way). Camera position (derived per frame from the scroll ref — never state). Nothing shared beyond the existing `scrollProgress` singleton.

### Animation
L0 in full: the camera flight, nebula drift, star twinkle. All inside one frame loop, all inside the §26.1 frame budget. No new DOM motion whatsoever.

### Responsive Behavior
Per §24.2: mobile 3,000 particles / DPR 1.0 / no bloom / 3 nebula layers; tablet 6,000 / 1.5 / no bloom / 5 layers; desktop 12,000 / 1.75 / bloom / 8 layers. **Opaque panels below `md`** — blurred panels over a live canvas is the most expensive thing on a mobile GPU. Skip rendering during high scroll velocity on the lowest tier.

### Accessibility
The §25.0 parallel-DOM contract in full: canvas `aria-hidden` + `role="presentation"`, zero focusable children, no information expressed only in 3D. **The delete-the-canvas CI gate lands in this phase** (§34.3): remove the canvas element, assert the §27.4 content set is intact and keyboard order is unchanged. Reduced-motion camera cuts verified manually. `axe-core` still zero violations on every route.

### Performance
Critical-path JS **unchanged from Phase 3** (≤16KB) — the scene must add nothing to it. Scene chunk ≤230KB gz desktop / ≤175KB mobile. Frame time ≤16ms desktop, ≤33ms mobile, verified under 4× CPU throttle. Hidden tab: 0% CPU. Scene init → first render ≤600ms desktop / ≤1.2s mobile after idle. LCP, CLS and INP must not regress against the recorded Phase 3 numbers.

### Testing
Playwright: canvas absent with JS disabled and site fully functional; canvas present and rendering at 1280px; reduced-motion emulation shows no camera interpolation; `saveData` emulation skips the scene entirely; delete-the-canvas gate passes. Manual: 60s frame profile at each tier; 4× CPU throttle triggers degradation exactly once and never oscillates; hidden-tab profile; 5-minute soak with heap snapshots for leaks; forced `webglcontextlost` reveals the art layer cleanly. Lighthouse CI against the Phase 3 baseline.

### Acceptance Criteria
- **Delete the canvas element and the site is complete and unchanged** — same content, same reading order, same keyboard path. Enforced in CI.
- Critical-path JS is byte-for-byte unchanged from Phase 3.
- The scene chunk is a single lazy chunk within budget, asserted in CI.
- 58fps+ desktop and a 30fps floor on mobile, under throttle.
- Hidden tab does zero work; a 5-minute soak shows flat memory.
- Context loss reveals the art layer with no visual break.
- Reduced motion produces eight static compositions with zero continuous movement.
- No Lighthouse or Web Vitals regression beyond the §26.1 R2 targets.
- Exactly one `<canvas>` on the home route.

### Definition of Done
The flight works, it holds its frame budget on a mid-range phone, and it can be deleted without the portfolio noticing.

### AI Implementation Notes
The three rules that decide whether this phase succeeds:

1. **Never put per-frame values in React state.** Read the scroll ref inside `useFrame`. A single `setState` in a frame loop re-renders the tree 60×/second and will cost more than every optimisation elsewhere combined.
2. **Allocate nothing per frame.** Pre-allocate every `Vector3`, `Color` and `Quaternion` at module or mount scope and mutate in place. Per-frame allocation is the classic cause of GC sawtooth in R3F scenes.
3. **Import narrowly.** Named three.js imports; deep-path drei imports; the allowed list is `Points`, `PointMaterial`, `useTexture`, `Preload`. `import * from 'three'` or a wholesale drei import will roughly double the chunk and CI will fail you.

Build and verify the tier ladder *before* making the scene pretty — a beautiful scene that only runs on your machine is a failed phase. Test on a real mid-range Android before declaring done.

### Things NOT to implement yet
No planets, no constellation globe, no probe trail, no station, no relay beams (all Phase 4b). No Orbit simulation (Phase 5). No camera control from anything other than scroll. No post-processing beyond bloom. No scene interactivity of any kind — nothing in the scene responds to pointer input in this phase.

### Expected output
A single persistent WebGL environment behind the whole site: a scroll-driven eight-keyframe camera flight through a band-tinted volumetric star field, holding 58fps desktop and 30fps mobile, deletable without consequence, with the cost measured against Phase 3 and recorded.

---

## Phase 4b — Scene Set Pieces

### Goal
Populate the flight path with the objects that make each beat mean something: the three project planets, the constellation globe, the probe trail, the station, and the relay beams.

### Why this phase exists
Phase 4 proved the infrastructure; this phase spends its budget. Separating them means each set piece can be individually cut if it does not fit the frame budget (§26.2's cut order), and none of them can destabilise the camera work they sit on top of. This is also the phase where P2 is enforced hardest: every object here must encode something real, or it does not ship.

### Prerequisites
Phase 4 done and holding its frame budget on a real mid-range phone. Phase 3's DOM records must exist, since every set piece is a parallel expression of content that already ships in HTML.

### Tasks
1. **`PlanetSystem.tsx` + `Planet.tsx`** (§10.6): three spheres from the `projects` collection, AI-generated equirectangular textures, key + limb lighting, fresnel atmosphere, ring on the featured world only, desynchronised idle rotation, spatial scale by significance.
2. **`WorldViewer.tsx`** island: card hover/focus drives planet emphasis, and focusing a card eases the camera's look-at toward that planet over 560ms. Must work from **keyboard focus**, not just pointer hover.
3. **`ConstellationGlobe.tsx`** (§11.3a): the 24 skills mapped from their authored 2D coordinates onto a sphere, instanced stars sized by tier, relationship lines, **DOM labels projected to screen space** (never 3D text), pointer-drag rotation on desktop only.
4. Extend `AtlasLink` to bridge globe ↔ list highlighting in both directions, adding zero tab stops.
5. **`ProbeTrail.tsx`**: the Trajectory ion-trail with a burn marker per achievement, drawn along a curve, ember-tinted.
6. **`Station.tsx`**: the Instrument Bay structure — wireframe/low-poly, aurora rim-light. Deliberately the cheapest set piece.
7. **`RelayBeams.tsx`**: Transmissions signal beams. **First on the chopping block** if the frame budget is tight (§26.2).
8. Generate the three planet textures, three planet stills and remaining art plates to the §3.4 contract; encode to AVIF within budget; wire mobile half-res variants via `srcset`.
9. Verify every set piece's fallback: planet stills in cards, SVG map for the globe, CSS border spine, static poster — each already specified, each now actually exercised.
10. Re-measure frame time and bundle at every tier; cut scope per §26.2 rather than raising a budget.

### Files / Areas Affected
`src/components/cosmos/scene/*`, `src/components/worlds/*`, `src/components/atlas/*`, `src/components/trajectory/*`, `src/assets/images/*` (generated art), `src/content/projects.json` (texture references).

### Components
`PlanetSystem`, `Planet`, `WorldViewer` (island), `ConstellationGlobe`, `SkillsGlobe` (island wrapper), `ProbeTrail`, `Station`, `RelayBeams`.

### Data
`projects` (planet textures, order, featured), `skills` (globe positions, tiers, connections), `experience` (burn marker count). All already validated in Phase 1 — no schema changes.

### State
`WorldViewer`: selected/focused planet (local, passed into the scene as a prop). `SkillsGlobe`: rotation in a ref. Nothing new is shared.

### Animation
Planet idle rotation, camera look-at easing on card focus, globe rotation and idle spin, trail draw, beam pulses. All inside L0's existing frame budget — the budget does not grow because set pieces were added.

### Responsive Behavior
Per §24.2: 32-segment planets and 1024px textures on mobile with no atmosphere shader; globe replaced by the SVG map below `md`; relay beams removed on mobile; trail simplified. Touch never rotates the globe (P4).

### Accessibility
Every set piece is `aria-hidden` decoration with a DOM counterpart per the §25.0 table. Zero new tab stops. Planet size encodes significance but significance is *also* text (`featured` label), so nothing is size-only. Camera easing on focus must not fight the browser's own focus scrolling. Re-run the delete-the-canvas gate — with set pieces present it is a much stronger test than in Phase 4.

### Performance
Scene chunk ≤230KB gz desktop / ≤175KB mobile — **unchanged from Phase 4**; set pieces come out of the scene-code allowance, not a new budget. Images: ≤1.6MB desktop / ≤600KB mobile total. Frame time still ≤16ms desktop / ≤33ms mobile under throttle, with all set pieces in frame simultaneously (the Worlds beat is the worst case — measure there).

### Testing
Playwright: planet stills render in cards with WebGL disabled; SVG map renders below `md`; keyboard focus on a card triggers the same emphasis as hover; delete-the-canvas gate passes with set pieces present; no new tab stops (keyboard-order snapshot unchanged from Phase 3). Manual: frame profile during the Worlds beat at each tier; touch swipe over the globe scrolls the page rather than rotating it; 5-minute soak.

### Acceptance Criteria
- Every set piece has a working, designed fallback that has actually been viewed — not merely specified.
- Keyboard-order snapshot is identical to Phase 3: the scene added zero tab stops.
- Frame budget holds with all set pieces in frame, under 4× CPU throttle.
- Image budgets met at both resolutions.
- Every object in the scene maps to a row in the §25.0 table. Anything that does not is deleted, not documented.
- Touch swipe never rotates the globe.

### Definition of Done
Each beat of the flight path is populated with something that encodes real content, every fallback has been seen with human eyes, and the frame and byte budgets are unchanged from Phase 4.

### AI Implementation Notes
Enforce P2 ruthlessly here — this is the phase where "wouldn't it be cool if" produces 40KB of shader for something that tells the visitor nothing. Before adding any object, name the DOM content it decorates; if you cannot, do not build it.

Textures dominate the image budget: generate at 2× and downsample, always AVIF, always power-of-two, and check the encoded size before wiring it in. Reuse one `SphereGeometry` across all three planets via instancing or a shared geometry ref rather than three separate allocations.

`RelayBeams` is explicitly expendable. If the Transmissions beat costs frames, cut it and let the band tint plus the art plate carry that section — nobody will know it was planned.

### Things NOT to implement yet
No Orbit simulation (Phase 5). No `/instruments` scene content. No additional beats beyond the eight in §4.1. No pointer-driven camera control beyond the specified card-focus look-at ease. No second experiment anywhere.

### Expected output
A populated flight path: three textured planets sized by significance, a rotatable skills globe with DOM labels, an ember probe trail with burn markers, a station, optional relay beams — every one with a verified fallback, no new tab stops, and no budget growth.

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
5. **`Orbit.tsx`** (§14.3): WebGL n-body sim reusing the site's existing three.js chunk — ≤2,000 bodies, semi-implicit Euler, softened gravity, seeded initial conditions, optional cursor attractor, instanced points with trailing paths. `client:visible` + `client:media="(min-width: 1024px)"`.
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
Exactly **one** experiment. Orbit now shares the spine's three.js chunk (§14.3), so reuse the existing renderer and tier ladder rather than standing up anything new — and if it becomes hard, simplify the physics rather than adding a dependency. Pre-allocate all body arrays; no per-frame allocation. Keep the poster in sync with the real sim's look, since it is what most visitors see. Author code excerpts as content entries so they can be updated without touching components.

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
3. Full keyboard pass on all five route types: order, visibility, no traps, skip link, anchor `scroll-margin`, rail and bottom bar operability.
4. Screen-reader pass: VoiceOver + Safari (macOS and iOS) and NVDA + Firefox on `/`, `/instruments`, and `/dossier`. Verify heading outlines, list semantics, `<dl>` pairs, dates, link names, live regions, and that no decorative layer (cosmos, spheres, plates, spine) is announced.
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
- Zero `axe-core` violations on all five route types, enforced in CI.
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
- Lighthouse mobile: Performance ≥78 (`/`), ≥85 (`/transmissions`, `/dossier`), ≥72 (`/instruments`); **Accessibility 100 everywhere**.
- LCP ≤3.0s mobile / ≤2.2s desktop; CLS ≤0.02; INP ≤200ms mobile.
- **Critical-path JS ≤16KB gz on every route** — asserted separately from total JS.
- Scene chunk ≤230KB gz desktop / ≤175KB mobile.
- Fonts ≤110KB; CSS ≤34KB gz; mobile home total ≤950KB.
- 58fps desktop / 30fps floor mobile under 4× CPU throttle.
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
3. JSON-LD per §27.2: `Person` + `WebSite` + an `ItemList` of the three projects on `/`, `ItemList` of `BlogPosting` on `/transmissions`, `Person` + `ProfilePage` on `/dossier`, `WebPage` on `/instruments`. Validate with Google's Rich Results Test.
4. `@astrojs/sitemap`, `robots.txt`, `/rss.xml`. Exclude `/dev/tokens` from both the sitemap and production output.
5. Enforce the §27.3 canonical rule for articles: excerpt-only, links out to dev.to.
6. Add the §27.4 content-in-HTML SEO smoke test to CI.
7. Connect the analytics provider (§28) and switch the seven call sites from no-op to live. Verify each fires exactly once per intended action and that no PII is sent.
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
- All seven analytics events fire exactly once per action, with no PII and no consent banner required.
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
8. Empty/edge-state review: what Transmissions looks like if the article fetch falls back; what the Atlas looks like if a skill has no connections; what Trajectory looks like with `company` and dates absent (the normal case, §12.1); what a `WorldCard` looks like with the longest stack list wrapping.
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
Phase 0  Discovery & Creative Direction              ✅ COMPLETE
   │  (content pack, locked direction)
   ▼
Phase 1  Foundation — tokens, primitives, collections, routes   ✅ COMPLETE
   │
   ▼
Phase 2  Core Experience — art backdrop, bands, scroll driver, nav, hero
   │        ◄──── THE COMPLETE NO-WEBGL EXPERIENCE IS BUILT HERE
   ▼
Phase 3  Portfolio Content ◄──── SHIPPABLE MILESTONE
   │        (site is complete and launchable; no 3D exists yet)
   ├────────────────────────────────┐
   ▼                                ▼
Phase 4  The Spine               Phase 5  Engineering Showcase
   │     canvas, camera, flight     │      (/instruments route)
   │     path, starfield, nebula    │
   ▼                                │
Phase 4b Scene Set Pieces           │
   │     planets, globe, trail,     │
   │     station, beams             │
   └────────────┬───────────────────┘
                ▼
Phase 6  Responsive & Accessibility Hardening
                ▼
Phase 7  Performance
                ▼
Phase 8  SEO & Production
                ▼
Phase 9  QA & Polish
```

**Revision 2 reshaped this graph in one important way:** the 3D work is now two phases (4 and 4b) sitting *downstream of a shippable site*, and Phase 2 explicitly builds the entire fallback before any WebGL exists. Both changes exist so that the ambitious part can be abandoned, cut down, or deferred at any point without leaving a hole.

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
| R1 | ~~Content gaps never close~~ — **CLOSED.** All of C1–C8 resolved in Phase 0 | — | — | n/a | n/a |
| R1b | **No employer names or dates** in Trajectory (the chosen design, C1) reduces credibility for ATS-driven or employer-focused screens | Medium | Medium | Burn events are specific enough to convey scope; `/dossier` and the résumé PDF are ≤1 tap from every route and carry employment specifics (§12.1) | If it proves to cost opportunities, add role dates only (no company) — the schema already accepts them |
| R2 | **Theme overpowers content** — visitors remember the sky, not the work | Medium | High | P1/P2/P8 as review tie-breakers; one background system only; density-over-spectacle in Worlds and Trajectory | Reduce star count and glow tiers; increase panel opacity; the content layout is independent of the effects |
| R3 | ~~Poor mobile performance~~ — **superseded by R18**, which is the R2 form of this risk and rated High | — | — | See §33.1 | See §33.1 |
| R4 | ~~Scope creep into a WebGL project~~ — **accepted deliberately in R2.** The replacement risks are R17–R21 below | — | — | The spine is the product now | n/a |
| R5 | **Over-engineering** — abstractions, state libraries, animation frameworks | Medium | Medium | Closed island list (§20.2); no state library (§22); primitives require a third use case; §37-style "avoid overengineering" rule | Delete the abstraction; the plan's components are intentionally shallow |
| R6 | **Accessibility regressions from visual work** | Medium | High | a11y is a gate in every phase; `axe-core` in CI; the list (not the map) is the Atlas's canonical tab path; every visual has a text equivalent (§25.3) | Remove the offending effect — every effect is individually removable by design |
| R7 | **`animation-timeline` / `color-mix` / `backdrop-filter` support gaps** | Medium | Low | All three are used inside `@supports` with designed static fallbacks; Phase 9 verifies each fallback by disabling the feature | Static spine, solid surfaces, plain colors — all already designed |
| R8 | **Canvas memory leak or GC sawtooth** | Low | Medium | Pre-allocated typed arrays, no per-frame allocation, pause on hidden/off-screen, 5-minute soak test with heap snapshots | One-way runtime degradation stops the loop and keeps the last frame |
| R9 | **Font weight blows the budget** (3 families) | Medium | Medium | Latin-only subsets, mono subset to used glyphs, only 2 faces preloaded, ≤110KB total verified in Phase 7 | Drop Instrument Serif and use the body face at display sizes with tighter tracking |
| R10 | **dev.to API changes or fails at build** | Low | Low | Build-time fetch with a committed fallback file that is refreshed on every successful build; failure warns, never breaks | The committed fallback (six posts) ships |
| R11 | ~~Long initial load from case-study images~~ — **largely eliminated** by C2/C3: the only images left site-wide are the portrait, Orbit poster, grain tile, and OG images | Low | Low | Portrait via `astro:assets` at 480w/720w; §26.2 image budgets cut to ≤60KB per route | Drop the portrait below 480px (already specified in §9.6) |
| R15 | **Projects section reads as thin** — three cards, no case studies, no screenshots | Medium | Medium | Card copy gets case-study-level effort (Phase 3 notes); the record is data-dense (designation, stack, year, status); Instrument Bay carries the engineering depth that case studies would have | Add case-study routes from §37 once there is real depth to publish |
| R16 | **`SHB-3b` confuses visitors** — the previous portfolio listed as a project on the current portfolio | Medium | Low | Named "Portfolio v1" so the lineage is explicit (§10); legacy domain kept live and un-redirected (§35) | Drop it and show two projects rather than one confusing three |

### 33.1 Revision 2 risks — the spine

Adopting a WebGL spine trades R1's risk profile for a new one. These five are the real exposure, and every mitigation is already specified somewhere in this document rather than being aspirational.

| # | Risk | Prob. | Impact | Mitigation | Fallback |
|---|------|-------|--------|-----------|----------|
| R17 | **The scene eats the content.** The classic failure: the 3D becomes the interface, and the text becomes a caption on it. | **High** | **Critical** — costs the portfolio its actual job | The §25.0 parallel-DOM contract; the canvas is a layer not a container (R2 preamble); **the delete-the-canvas CI gate** (§34.3), which is an automated test rather than a good intention; §9.1 explicitly forbids scene-as-navigation | The site is complete at Phase 3 before the scene exists. Deleting the canvas is a supported operation, not a disaster |
| R18 | **Mobile performance is unacceptable.** Owner chose 3D on mobile; low-end Android is where this breaks. | **High** | High | Tier ladder caps particles/DPR/bloom (§16.4); opaque panels below `md`; one-way runtime degradation; 30fps floor asserted under 4× throttle; `saveData` skips the scene entirely | Ship the Phase 2 art backdrop on the lowest tier — it is a designed, complete experience, not a degraded one |
| R19 | **three.js bundle grows silently.** One careless `import * from 'three'` or a wholesale drei import roughly doubles the chunk. | **High** | Medium | Named/deep imports only with a 4-module drei allowlist (§19.2a); **CI asserts the scene chunk's gzipped size** (§26.4); dependency admission rule | Cut scope in the §26.2 order: particles → textures → bloom → a beat |
| R20 | **Motion sickness.** A scroll-driven camera is a genuine vestibular trigger for a real fraction of visitors. | Medium | High | `prefers-reduced-motion` **cuts** the camera rather than merely slowing it (§16.4); fixed FOV — no FOV animation, which is the worst offender; inertia trails scroll rather than amplifying it; no roll on the camera | Reduced-motion path yields eight static compositions, which is a complete experience |
| R21 | **AI art reads as generic.** Some engineers recognise and discount it, and generic space art would undercut the craft claim. | Medium | Medium | The §3.4 prompt contract — one dominant band hue, astrophotography realism, no text/flares, generated at 2× and downsampled; art is backdrop only and never captioned as real astronomy; regenerate rather than accept | Swap to real NASA/ESA public-domain plates, which was the rejected option and remains available at the cost of an attribution line |
| R22 | **WebGL context loss** on mobile tab suspend or GPU reset leaves a black hole where the site was. | Medium | Medium | The art layer never unmounts (§17.1); `webglcontextlost` fades the canvas out rather than attempting recovery; error boundary renders `null` on init failure | The art still is already underneath — the visitor may not notice at all |
| R12 | **Duplicate content vs dev.to** harming the owner's own rankings | Low | Medium | §27.3: excerpt-only, always link out; canonical rule if mirroring is ever added | Remove excerpts; keep title + date + link |
| R13 | **Fake-terminal / preloader nostalgia** — reintroducing the old site's boot splash | Low | Medium | Explicitly forbidden in §1, §9.3, and Phase 2's NOT-yet list | n/a — it is simply not built |
| R14 | **Anchor renaming after launch** breaks shared links | Low | Medium | Anchors frozen at Phase 2 (§23) and treated as a public API | Add redirects for old anchors via a tiny client-side hash map (last resort) |

---

## 34. Testing Strategy

### 34.1 Functional

| Area | Coverage | Tool |
|------|----------|------|
| Routes | All five route types return 200 and render their heading | Playwright |
| Navigation | Rail and bottom bar anchors scroll to the right sections, with and without JS | Playwright |
| Links | Every internal and external link resolves; external links have `rel="noopener noreferrer"` | Playwright + link-check in CI |
| Projects | All three cards link to a live, reachable site — including `shubham-portfolio-modern.vercel.app`, which must **not** be redirected (§35) | Playwright + link-check in CI |
| Résumé | PDF downloads on desktop and on iOS Safari (manual for iOS) | Playwright + manual |
| Copy email | Clipboard success path, failure path, and confirmation announcement | Playwright |
| Article fallback | Build succeeds and renders six posts with the network stubbed to fail | Build test |
| Redirects | All §23 redirects resolve on the production host | Manual + CI |

**No contact form exists (§15.1), so there is no form validation surface to test.**

### 34.2 Visual

Playwright screenshot comparison at 320, 390, 768, 1280, 1920 for `/`, `/instruments`, and `/dossier`. Baselines updated deliberately, never automatically. `/dev/tokens` is the primitive-level baseline. Manual optical pass at 1440 and 390 in Phase 9.

### 34.3 Accessibility

`axe-core` via Playwright on all five route types — **zero violations, enforced in CI**. Keyboard-order snapshot test for `/`. Manual per §25.4: VoiceOver (macOS + iOS Safari), NVDA (Windows Firefox), 200% zoom, 400% reflow, forced-colors, `prefers-contrast: more`, reduced-motion, JS-disabled.

**The delete-the-canvas gate (R2, CI-enforced).** The single most important test in this project, because it converts the §25.0 contract from a promise into a check:

```text
1. Load /, wait for the scene to mount.
2. Snapshot: the §27.4 content set + the full keyboard tab order.
3. Remove the <canvas> element from the DOM.
4. Re-snapshot both.
5. ASSERT: content set identical, tab order identical, zero axe violations,
   no layout shift (CLS delta = 0).
```

It runs on every PR from Phase 4 onward and is far stronger once Phase 4b's set pieces exist. If it ever fails, the correct fix is to move content out of the scene — never to relax the assertion.

**Two further R2 gates:**

- **Tier matrix:** the scene is loaded at each tier (`saveData`, no-WebGL, low, mid, high) and asserted to mount or skip correctly, with the art layer visible whenever the canvas is absent.
- **Reduced-motion camera:** with `prefers-reduced-motion` emulated, assert the camera's position is *discrete* across a scroll sweep — it must occupy only the eight keyframe positions, never an interpolated value.

### 34.4 Performance

Lighthouse CI on `/`, `/instruments`, `/transmissions` (mobile + desktop) with §26.1 as failing assertions. Bundle-size budget check against §26.2. Manual: 4× CPU + Slow 4G pass; 60s ambient CPU profile (≤4ms/frame); hidden-tab profile (zero work); 5-minute Orbit soak with heap snapshots; real-user vitals reviewed 48h after launch.

### 34.5 Browser compatibility

Must be tested, not assumed: Chrome, Safari, Firefox, Edge (two latest majors each) on desktop; iOS Safari and Android Chrome (two latest majors) on mobile. Per browser: layout integrity, `@supports` fallback behaviour, canvas rendering, View Transitions, clipboard, PDF download, focus visibility, and console cleanliness.

### 34.6 Content and SEO

The §27.4 content-in-HTML assertion (JS disabled) in CI. Structured-data validation via Google's Rich Results Test. Social-preview verification on three platforms. Banned-words check for §13.1. Technology-name casing check in Phase 9.

### 34.7 CI gates — a PR cannot merge if any fail

1. `pnpm build` clean (zero warnings)
2. TypeScript clean
3. Token lint (no hardcoded design values, no raw band hex outside `global.css`)
4. `axe-core` zero violations, all routes
5. Lighthouse CI assertions met
6. Bundle budgets met — **including the scene chunk's gzipped size, asserted separately** (§26.2)
7. Content-in-HTML test passes
8. Link check clean
9. Visual regression reviewed (not auto-approved)
10. **Delete-the-canvas gate passes** (§34.3) — from Phase 4 onward
11. **Critical-path JS ≤16KB** — asserted independently of total JS, since the whole performance story depends on the split (§26.2)

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
| Legacy site | **Do NOT redirect** `shubham-portfolio-modern.vercel.app`. It must stay deployed and reachable: it is now project `SHB-3b` "Portfolio v1" (§10), and redirecting it would break that card's only link. This cancels the original recommendation to consolidate link equity — the exhibit is worth more than the link equity, and the two are mutually exclusive |
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
| **Case-study routes** (`/worlds/[slug]`) | Removed in Phase 0 (C3). Revisit only when there is real depth to publish — a problem/approach/impact story worth 300+ words. The original 9-block structure is in this document's git history (§10.3). Never ship a thin one |
| **Project screenshots** | Removed (C2) in favour of gradient plates. Revisit only if a project's UI is itself the selling point, and then only with real device-framed captures, not raw crops |
| Project filtering / tag pages | At ≥6 projects (§10.4), implemented as static filtered routes |
| Contact form | Only if email volume proves insufficient; needs an endpoint, spam protection, and monitoring (§15.1) |
| Full article mirroring from dev.to | Only with `rel="canonical"` to dev.to on every mirrored page (§27.3) |
| Light mode | Only if a real need appears; requires a complete second visual system (§22) |
| A second scene beat or experiment | Only if the first holds its frame budget with room to spare, and only if it encodes real content (P2) |
| A second experiment in the Instrument Bay | Only if the first is proven to hold engagement without hurting the route's budget |
| Case-study reading progress / TOC | Only if case studies are revived *and* exceed ~1,500 words |
| i18n | Only for a concrete audience need; the fluid type scale and token system already accommodate it |
| Live GitHub stats | Build-time fetch only, with a committed fallback — never a runtime API call |
| MDX-authored case studies | Only alongside a case-study revival, if layouts need per-project custom blocks |
| View-source / "how this was built" page | A natural extension of `/instruments`; high appeal to the peer-engineer journey (§6.3) |
| Print stylesheet beyond `/dossier` | Low cost; `/dossier` already has one (§8.3) |

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
- [x] C1–C8 resolved and recorded (Phase 0 complete; see Content readiness)
- [ ] No employer field, screenshot, or case-study route was reintroduced
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
- [ ] Only `transform`/`opacity` animated in the DOM (plus the two sanctioned exceptions)
- [ ] Entrances fire once and never replay
- [ ] Exactly one `IntersectionObserver` and exactly one rAF scroll loop, site-wide
- [ ] **No DOM-level ambient motion anywhere** (§16.2 L1 ban)
- [ ] Reduced motion suppresses L0/L3/L4 and looks deliberate

**The 3D spine (R2)**
- [ ] **Delete-the-canvas gate passes in CI** — content, tab order and CLS all unchanged
- [ ] Exactly one `<canvas>` on the home route
- [ ] Canvas is `aria-hidden` + `role="presentation"` with zero focusable children
- [ ] Every scene object maps to a row in the §25.0 parallel-DOM table
- [ ] Critical-path JS unchanged by the scene's existence
- [ ] Named three.js imports and deep-path drei imports only; allowlist respected
- [ ] Tier ladder verified at all five tiers (`saveData`, no-WebGL, low, mid, high)
- [ ] `prefers-reduced-motion` produces discrete camera positions, never interpolated
- [ ] `webglcontextlost` reveals the art layer with no visual break
- [ ] Every set piece's fallback has been viewed with human eyes, not just specified
- [ ] Verified on a real mid-range Android, not only in devtools throttling

**Colour & art (R2)**
- [ ] All eight bands verified ≥4.5:1 on void **and** in situ over their own art plate
- [ ] `--color-ink-*` never band-tinted
- [ ] One dominant band per viewport; cross-fades never cut
- [ ] Every AI asset meets the §3.4 prompt contract; none reads as generic
- [ ] Every backdrop ships an inlined LQIP
- [ ] No asset over 200KB after encode; total raster inventory is the 14 listed in §29

**Responsive**
- [ ] §24.2 effect matrix verified line by line on real devices
- [ ] Zero horizontal page scroll at 320px on every route
- [ ] All targets ≥44×44px with ≥8px separation
- [ ] `svh`/`dvh` used everywhere; no `100vh`
- [ ] Mobile is the smallest bundle by a wide margin

**Accessibility**
- [ ] Zero `axe-core` violations on all five route types, enforced in CI
- [ ] WCAG 2.2 AA conformance verified
- [ ] Full keyboard operability with a visible focus indicator
- [ ] VoiceOver and NVDA passes recorded
- [ ] Every §25.3 accessible equivalent implemented
- [ ] Contrast table (§25.2) verified with measured values
- [ ] JS-disabled pass complete on every route

**Performance**
- [ ] Lighthouse mobile ≥78 (`/`), ≥85 (`/transmissions`, `/dossier`), ≥72 (`/instruments`); **Accessibility 100**
- [ ] LCP ≤3.0s mobile / ≤2.2s desktop; CLS ≤0.02; INP ≤200ms mobile
- [ ] **Critical-path JS ≤16KB gz on every route**, asserted separately from total
- [ ] Scene chunk ≤230KB gz desktop / ≤175KB mobile, asserted in CI
- [ ] Fonts ≤110KB; CSS ≤34KB gz; mobile home total ≤950KB
- [ ] Images ≤1.6MB desktop / ≤600KB mobile, all AVIF
- [ ] **58fps desktop / 30fps floor mobile under 4× CPU throttle**
- [ ] Degradation fires once under load and never oscillates
- [ ] Hidden tab does zero rAF work; 5-minute soak shows flat memory
- [ ] CI fails on any budget or Lighthouse regression
- [ ] Every byte of JS attributable to a listed island (§20.2)

**SEO**
- [ ] Unique title, description, canonical, and OG image per route
- [ ] Structured data validates with zero errors
- [ ] Sitemap, robots, and RSS correct; `/dev/tokens` excluded from production
- [ ] Articles are excerpt-only and link out to dev.to
- [ ] Content-in-HTML test passes with JS disabled

**Analytics**
- [ ] Exactly the seven §28.1 events, each firing once per action
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
| 16 | Analytics limited to the seven defined events, no PII | Provider dashboard |
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
| 2026-09-04 | 0 | Hero lede rewritten from the source copy | The original is generic and could describe anyone (§9.2, C7) |
| 2026-09-04 | 0 | "UI Showcase" reframed as **Instrument Bay** with four evidenced instruments | Nine icon chips were unevidenced claims — the weakest content on the old site (§14.1) |
| 2026-09-04 | 0 | **Experience is role-only: `FRONTEND ENGINEER · 4 YEARS`.** No employer names; `company` and dates are optional schema fields | Owner decision (C1). Design leans into it rather than apologising — the seven burn events carry the scope. Employment specifics live in the résumé PDF. Years corrected from "3+" to **4** everywhere |
| 2026-09-04 | 0 | **No project screenshots anywhere.** Replaced by procedural gradient plates seeded per slug | Owner decision (C2): screenshots looked wrong in the layout. Dense-UI thumbnails become grey mush at card size, date instantly, and fight the site's visual language. Project image budget → **0 bytes**; §26.2 mobile total cut 320KB → 260KB (§10.6, §29) |
| 2026-09-04 | 0 | **`/worlds/[slug]` case-study routes removed entirely** | Owner decision (C3): detailed write-ups not wanted. Three compact projects would have produced three thin pages, which this plan already forbade. The card is now the whole record, so card copy inherits case-study-level effort (§10.3) |
| 2026-09-04 | 0 | `SHB-3b` is **Portfolio v1** — the previous portfolio — replacing "Static Websites" | Owner decision (C3/C4). Named "v1" so the self-reference reads as iteration rather than a duplicate (§10) |
| 2026-09-04 | 0 | **Legacy-domain redirect cancelled** — `shubham-portfolio-modern.vercel.app` stays live and un-redirected | It is now project `SHB-3b`'s only link. Redirecting it for link equity would break the exhibit; the two are mutually exclusive and the exhibit wins (§35) |
| 2026-09-04 | 0 | Headline metric is **14× faster page delivery**, with its basis stated inline | C5 verified: 2 pages per 14-day sprint → 2 pages per day. The old "~80% faster" claim *understated* the result. Only one burn event carries a metric — one supported number beats seven soft ones (§12.2) |
| 2026-09-04 | 0 | About section copy **written in full** and locked in §13.2 | C7. Meets its own anti-generic rules: four verifiable specifics, one arguable opinion, three genuinely open questions |
| 2026-09-04 | 0 | Contact shows location, timezone (Asia/Kolkata), and weekday availability, but **no response-time claim** | C8. The owner did not commit to a response time, and an unmet "replies within 24h" is worse than silence (§15.2) |
| 2026-09-04 | 0 | Analytics event set reduced from 8 to **7** | `world_open` tracked case-study navigation, which no longer exists (§28.1) |
| 2026-09-04 | 0 | Portrait must move from `public/images/` to `src/assets/images/` | Files in `public/` bypass `astro:assets`, so the 249KB PNG would ship unoptimised (Phase 1 task 9) |
| 2026-09-04 | 1 | **Fonts use Astro 7's stable Fonts API** (`fonts` in `astro.config.mjs`) instead of hand-rolled `@font-face` in `src/assets/fonts/` | It self-hosts, subsets to latin, emits woff2 with `display: swap`, and generates metric-override fallbacks automatically — every requirement §26.3 listed, without hand-maintained CSS. Measured 107.9KB total, inside the ≤110KB budget. Astro owns `--ff-*`; `@theme` maps `--font-*` onto them to avoid a namespace collision |
| 2026-09-04 | 1 | `zod` added as a direct dependency (pinned to Astro's own 4.5.x) | `astro:content`'s `z` re-export is deprecated in Astro 7 and emitted ~60 warnings. Also migrated to Zod v4 top-level formats (`z.url()`, `z.email()`, `z.iso.date()`) |
| 2026-09-04 | 1 | `typescript` pinned to **6.x**, not 7.x | `astro check` cannot run on TS 7: the native compiler does not yet expose the programmatic API the language server needs. Revisit when withastro/roadmap#1321 lands |
| 2026-09-04 | 1 | Components annotate `Astro.props` explicitly (`}: Props = Astro.props`) | Implicit `Props` inference is not applied under `astro check`, which left prop types as `any` and produced both an error and "Props declared but never used" warnings |
| 2026-09-04 | 1 | `skills` is a **content collection** (`src/content/skills.json`), not `src/data/skills.ts` | §20.3 (collection) and §21.1 (data module) disagreed. The collection wins: it gets the same build-time Zod validation as every other content type, so a bad coordinate or a typo'd tier fails the build. `src/data/` keeps only the PRNG (`seed.ts`) |
| 2026-09-04 | 1 | Corner ticks are a Tailwind `@utility ticks` driven by `--tick-color`/`--tick-size` | One utility covers all three §17.2 intensities; verified compiling and rendering. A functional utility (`ticks-*`) was tried first and abandoned as unnecessarily clever |

### Revision 2 — the maximalist turn

Owner directive: *"space/universe images, 3D components, something unique, React for interactivity and complex components, multiple space colours."* Each row below reverses an R1 decision, deliberately.

| Date | Phase | Decision / Deviation | Reason |
|------|-------|---------------------|--------|
| 2026-09-04 | R2 | **A single persistent WebGL scene spans the site**, with scroll driving a camera along an eight-keyframe flight path | R1 rejected WebGL as unjustified — correct for R1's brief, wrong for R2's. No cheaper medium produces a continuous camera path through a volumetric scene. The scene is now the product (§4.1, §19.2a) |
| 2026-09-04 | R2 | **three.js + React Three Fiber adopted**, with a 4-module drei allowlist and deep imports only | Owner asked React to own the complex/interactive parts, and R3F's declarative scene graph is the maintainable way to express one. ~210KB gz, accepted, held by a CI size assertion (§19.2a) |
| 2026-09-04 | R2 | **The canvas is a layer, never a container.** DOM scrolls over a fixed backdrop | The one rule that makes a 3D spine survivable: content stays selectable/crawlable, LCP stays text, and deleting the canvas is a supported operation. Enforced by a CI gate, not a promise (§25.0, §34.3) |
| 2026-09-04 | R2 | **Eight spectral bands** replace three fixed accents; hue travels with the visitor and drives both DOM accents and scene lighting | "Multiple space colours" done systematically rather than as a swatch dump. Hues are real emission lines (H-alpha, O III, sodium), which is why colourful reads as expensive here. All eight verified ≥7:1 on void (§3.3, §25.2) |
| 2026-09-04 | R2 | **AI-generated space art** for backdrops, planet textures and fallbacks — under a written prompt contract | Owner's choice over real NASA/ESA imagery: perfect palette consistency and no attribution burden. Held to a contract because inconsistent generated art is worse than none (§3.4). Honest caveat recorded: some engineers discount AI imagery |
| 2026-09-04 | R2 | **Mobile keeps the 3D** at reduced fidelity, rather than R1's "no canvas on mobile" | Owner's choice. Costs mobile Lighthouse (~78 vs ≥95) and is the project's second-largest risk (R18); mitigated by the tier ladder, opaque panels, one-way degradation and a `saveData` bail-out (§24.2) |
| 2026-09-04 | R2 | **Performance budgets raised substantially and explicitly** — desktop JS 60KB → 340KB, mobile 20KB → 190KB, mobile Lighthouse ≥95 → ≥78 | The honest price of the spine. Stated as targets with CI assertions rather than quietly abandoned. **Critical-path JS stays ≤16KB**, which is why LCP survives (§26.1, §26.2) |
| 2026-09-04 | R2 | **Accessibility targets unchanged; §25 made stricter** — added the parallel-DOM contract and the delete-the-canvas CI gate | Everything else was negotiable; this was not. A WebGL spine is precisely the architecture that eats its own content, so the contract became a test (§25.0) |
| 2026-09-04 | R2 | **All DOM-level ambient motion banned**; a new motion level L0 owns the scene | The scene moves so the interface can stay still. Two competing sources of ambient motion is what makes maximalist sites feel soupy (§16.2) |
| 2026-09-04 | R2 | **Canvas 2D removed entirely**; the star field and Orbit both moved into WebGL | three.js is loaded anyway, so a second renderer with its own frame loop was pure duplication. Orbit gains an order of magnitude more bodies (200 → 2,000) for ~14KB. The one case where a heavier library simplified the codebase (§14.3, §19.7) |
| 2026-09-04 | R2 | **Phase 4 split into Phase 4 (spine) and Phase 4b (set pieces)**; Phase 2 now builds the complete no-WebGL experience first | Infrastructure must be proven against a nearly-empty scene before objects are added, and the fallback must be a designed artefact rather than an afterthought. Phase 3 remains the shippable milestone, before any 3D exists (§31) |
| 2026-09-04 | R2 | Phases were **not renumbered** despite inserting 4b | ~39 in-document phase cross-references would have needed rewriting, with real risk of corrupting them. The `b` suffix matches the document's existing convention |

