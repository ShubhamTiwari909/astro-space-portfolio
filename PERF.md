# Measured performance

Actual numbers at each phase exit, newest first. Where a measurement
disproved an estimate in `space-portfolio-master-plan.md`, the correction is
recorded here and in that document's Decision log — the plan is not edited
to match reality silently.



## Post-deployment — the local harness was grading itself

Prompted by a complaint about the page-speed score. The site was already
deployed, so it was measured directly.

### The measurement was wrong before the site was

`pnpm test:lighthouse` reported **56** on `/` with a TBT of 4502ms. The same
build, deployed, scored **99 / 93 / 100** over three runs. The local suite was
not measuring the site; it was measuring `tests/lib/serve.mjs`, which sent no
`content-encoding` while its own doc comment claimed it served "exactly the
bytes a CDN would". Vercel serves brotli.

The tell was one number appearing twice: the scene chunk measured **880623
bytes locally and 237731 deployed**. Lighthouse's simulated throttling derives
its timings from *observed transfer sizes*, so every byte-sensitive metric was
inflated ~3.7x.

Fixing the server to negotiate brotli/gzip moved `/` from a median of 81 to a
median of 97 with no change to the site at all. Same class of error as the
Phase 4b budget test that silently stopped measuring three.js: the instrument
agreed with itself and was wrong.

### Then the real work, measured honestly

Median of 6 runs on `/`, corrected harness throughout:

| | Before | After |
|---|---|---|
| Performance (median) | 97 | **99** |
| Performance (worst of 6) | 84 | **93** |
| FCP | 1502–2329ms (bimodal) | 1209–1579ms |
| LCP | 2402ms | **1953ms** |
| First-wave critical path | ~150KB | **~89KB** |
| Document (brotli) | 24803B | **17956B** |
| Best practices | 96 | **100** |

All four routes now score 100 on accessibility, best practices and SEO, and
98–100 on performance.

### What actually moved it

| Change | Effect |
|---|---|
| Scene fetch deferred past the `load` event | Removed 212KB from first-paint contention. `requestIdleCallback` measures the **main thread, not the network** — the thread is idle almost immediately here, so the callback fired while the stylesheet, both fonts and the opening plate were still in flight. Lighthouse's dependency tree named it: the longest chain on `/` was `/` → `DeepFieldScene.js` → `react-three-fiber.esm.js`. This is what made FCP bimodal — ~1450ms when the fetch lost the race, ~2290ms when it won |
| `SectionRail` de-Reacted | Removed **react-dom** from the load path: 53KB and a 73ms long task, to add two attributes and one `scale` to markup the server already rendered. The rail is `hidden lg:flex`, so every phone paid in full for a component it cannot display. Now 617B of Astro script |
| Inter: Google variable → Fontsource static 400 | **48.4KB → 23.7KB** on the highest-priority critical-path resource |
| Display italic split to its own family | 15.7KB off the critical path. `<Font preload />` preloads *every face* of a cssVariable, and the italic appears twice on the site, both far below the fold |
| Opening art plate preloaded per breakpoint | **28.5KB off mobile.** One unconditional preload of the 2560px plate meant a phone fetched it at top priority *and* the 1280px variant once `data-band` appeared |
| Seven LQIPs replaced with band-hue gradients | 7.9KB of near-incompressible base64 was 31% of the brotli'd document |
| Scene gated on client mount | Fixed a **hydration mismatch** (React #418). Astro SSRs island markup whatever the directive, so the scene rendered at tier `low` with no `window`, and React discarded the server tree. Best practices 96 → 100 |

### Two things I got wrong on the way, both caught by measurement

**Deduplicating the LQIPs saved 86 bytes, not 8KB.** Each was emitted three
times (base rule, active rule, mobile rule) and I expected a large win.
Brotli collapses identical strings; only the *unique* bytes ever mattered. The
dedup stayed for the 24KB of parser input, not for the wire.

**Externalising the LQIPs as real files traded bytes for requests and broke a
budget.** It took 6.8KB off the document and put the mobile home route at
**34 requests against §26.2's 28**. §26.2 says cut scope, never raise the
number — so the seven became gradients in their own band hue, which cost one
request *fewer* than nothing. Also: a `background-image` in a plate's base
rule is fetched immediately however `opacity:0` it is, whereas a custom
property is not resolved until something *uses* it. That, not the file/data-URI
choice, is what defers the fetch.

**Selecting font weights against Google's provider changed nothing** — it
serves one variable file whatever weights are requested. The provider, not the
weight list, was the lever.

### Per-route transfer, measured over the network (brotli)

| Route | HTML | CSS | JS crit | JS total | Fonts | Images | TOTAL | Reqs |
|-------|------|-----|---------|----------|-------|--------|-------|------|
| `/` mobile | 19.7 | 10.1 | 1.2 | **300.7** | 83.8 | 108.6 | 522.8 | 27/28 |
| `/` desktop | 19.7 | 10.1 | 1.2 | 300.7 | 83.8 | 206.0 | 620.3 | 27/34 |
| `/transmissions` | 10.2 | 10.1 | 0.8 | 3.1 | 68.4 | 35.1 | 126.9 | 11/16 |
| `/dossier` | 6.1 | 10.1 | 0.8 | 3.1 | 83.8 | 0.5 | 103.7 | 10/16 |
| `/instruments` | 16.6 | 10.1 | 0.8 | **305.0** | 68.4 | 82.6 | 482.8 | 21/32 |

Fonts fell **107.9KB → 83.8KB** and the home document **26.1KB → 19.7KB**.
The two JS totals in bold are the deviation pinned in the Phase 7 section
below; nothing here changed the architectural floor.

### Still open

The hero's `h1` is not an LCP candidate: it starts at `opacity: 0` behind the
`motion-safe` first-light reveal, so LCP resolves against the header wordmark
(124x44px) instead. That currently *flatters* the score and the reveal is a
deliberate part of §9.x, so it was left alone — but it means the LCP figure
above is not measuring the hero, and a future Chrome that treats
animated-in text differently would change the number without the site
changing.


## Phase 7 — Performance (local pass)

### Build size

| | Before | After |
|---|---|---|
| Total `dist` | **5.12MB** | **2.64MB** |
| PNG | 2597.8KB (11 files) | 7.6KB (7 files) |

One change: `fallbackFormat="webp"` on the hero `<Picture>`. Astro was
up-converting a 130KB webp source into four PNG fallbacks — 1336KB, 710KB,
362KB, 181KB — with the bare `src` pointing at the largest.

### Per-route transfer, measured over the network (gzipped)

| Route | HTML | CSS | JS crit | JS total | Fonts | Images | TOTAL | Reqs |
|-------|------|-----|---------|----------|-------|--------|-------|------|
| `/` mobile | 26.1 | 9.8 | 0.8 | **298.0** | 107.9 | 151.2 | 592.9 | 28/28 |
| `/` desktop | 26.1 | 9.8 | 1.1 | 298.3 | 107.9 | 205.4 | 647.6 | 28/34 |
| `/transmissions` | 17.4 | 9.8 | 1.1 | **3.0** | 107.9 | 34.5 | 172.6 | 13/16 |
| `/dossier` | 15.4 | 9.8 | 1.1 | **3.0** | 107.9 | 34.5 | 170.6 | 13/16 |
| `/instruments` | 23.4 | 9.8 | 1.1 | **301.8** | 107.9 | 82.1 | 525.3 | 21/32 |

Everything is inside §26.2 except the two JS totals in bold-with-asterisk
below. Critical-path JS is **≤1.1KB on every route**, against a 16KB budget.

The reading routes went **297KB → 3.0KB** of JS: the scene should never have
been mounted there (§26.2 says so explicitly), and `MobileNav` was pulling
54.8KB of react-dom to run 1.3KB of component.

### The JS floor — a deviation, pinned rather than raised

| Piece | gz |
|-------|-----|
| three.js + @react-three/fiber | 227.0KB |
| react-dom | 54.8KB |
| react + scheduler | 4.6KB |
| scene code, islands, runtime | ~11.0KB |
| **Total** | **~297KB** |

§26.2 budgets mobile at 190KB. That assumed a mobile-specific scene bundle
(there is one build and one chunk) and accounted for **no react-dom at all**,
though the scene is a React component. Unreachable since R2 chose R3F.

Not raised, not hidden: `tests/perf-audit.mjs` reports these two rows as
OVER with a ceiling pinned to the measurement, so the gap is visible on
every run and cannot grow. Closing it needs an owner decision — drop the 3D
on mobile (reverses R2), or replace R3F with raw three (~−99KB, a rewrite).

### Lighthouse — local baseline, mobile emulation

| Route | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|-------|------|------|----|-----|-----|-----|-----|
| `/` | 46 | **100** | 96 | 100 | 3.1s | **0.000** | 570ms |
| `/instruments` | 89 | **100** | 96 | 100 | 2.94s | **0.000** | 215ms |
| `/transmissions` | 91 | **100** | 100 | 100 | 2.93s | **0.000** | 171ms |
| `/dossier` | 94 | **100** | 100 | 100 | 2.78s | **0.000** | 46ms |

**Accessibility is 100 everywhere and CLS is 0.000 everywhere** — both hard
gates in CI. CLS 0.000 confirms the Fonts API metric overrides do their job
(task 3) and that every image carries explicit dimensions (task 4).

Performance is **recorded, not asserted**. This machine gives headless
Chrome no GPU, so WebGL rasterises in software; home's score is dominated by
1.3s of script evaluation (three.js parse) and 1.28s of style/layout under
Lighthouse's 4× CPU throttle. Home FCP 2.2s / LCP 3.1s / Speed Index 2.2s
are reasonable; TTI 9.5s is the number to re-measure on real hardware.

### Audits passed

- **Fonts**: 107.9KB of 110KB (98%), four faces, two preloaded. No waste —
  the serif italic is used by the pull-quotes and mono 400/500 by the
  metric blocks. CLS 0.000 on swap.
- **Images**: no over-delivery at any tested viewport; every image AVIF or
  WebP with `sizes` and explicit dimensions; one eager image per route.
- **CSS**: one hashed stylesheet, 9.8KB gz of a 34KB budget, 43.9KB
  inlined, token block declared once.
- **Animation**: 16 transitioned properties in use, all compositor-friendly
  or explicitly sanctioned; no `will-change` left applied; **zero layout
  reads in any of the four frame callbacks**.
- **Canvas**: 14/14 — DPR caps, pause on hidden and off-screen, one-way
  degradation, stall discarding, hard-capped counts, zero per-frame
  allocation, for both StarField and Orbit.
- **Save-data**: zero scene chunks fetched, zero canvases created.

### Still outstanding — needs the deployed site or real hardware

Task 8's authoritative Lighthouse run, task 11's cache-header verification,
and the 4× CPU / Slow 4G and 5-minute Orbit soak passes. Cache policy is
exercised locally by the test server (hashed assets `immutable`, HTML
`must-revalidate`), which proves the intent but not the host.

---

## Phase 6 — Responsive & Accessibility Hardening

`pnpm test:browser` — 80 checks, five routes, on the built output through
`astro preview`. Runs in CI.

| Check | Coverage | Result |
|-------|----------|--------|
| axe-core WCAG 2.2 AA | 5 routes | 0 violations |
| axe-core, reduced motion + forced colors | 3 routes | 0 violations |
| Horizontal overflow | 5 routes × 9 widths (320→1920) | none |
| Tap targets ≥44×44 | 5 routes × 3 widths | all pass |
| 400% reflow (320 CSS px) | 5 routes | no two-axis scrolling |
| Keyboard order, focus, traps | 5 routes, 10–39 stops each | all pass |
| Heading outline, landmarks, decoration | 5 routes | all pass |
| Reduced motion | home | 0 animations, content visible |
| JavaScript disabled | 5 routes | 326–9,953 chars of text, links live |

### Contrast, measured against the shipped CSS

| Colour | Hex | On | Measured | Was documented |
|--------|-----|----|----------|----------------|
| Ion Cyan | #7DE2FF | void | 13.69:1 | ~13.0:1 |
| Nebula Magenta | #FF5FA2 | void | **7.15:1** | ~7.4:1 ← overstated |
| Stellar Blue | #8FB8FF | void | 10.09:1 | ~9.8:1 |
| Solar Ember | #FFB454 | void | 11.48:1 | ~10.9:1 |
| Plasma Violet | #A78BFA | void | **7.44:1** | ~7.9:1 ← overstated |
| Aurora Green | #5BE9B9 | void | 13.31:1 | ~11.6:1 |
| Signal Gold | #FFD76E | void | 14.65:1 | ~13.1:1 |
| ink-hi | #EAF0FA | void | 17.69:1 | ~16.4:1 |
| ink-mid | #9BA8C2 | surface-0 | 8.17:1 | ~7.3:1 |
| ink-low | #7C89A5 | surface-0 | 5.56:1 | ~4.9:1 |
| ink-low | #7C89A5 | surface-2 | 4.84:1 | prohibited pairing |

Nothing ever breached 4.5:1. But the two bands §25.2 itself named as having
the least headroom were the two it **overstated**, which is the direction
that matters. Now measured on every build with a 0.02 tolerance.

### Fixed here

| Problem | Measured | Cause |
|---------|----------|-------|
| No `h1` on 3 routes | h1 × 0 | `Section` always rendered `h2` |
| Forced-colors contrast | 240 axe violations | dark palette did not adapt; `#eaf0fa` on forced `#ffffff` |
| Section readout contrast | <4.5:1 | `opacity-80` on `text-ink-low` |
| Skip link target | 175×**43** | one pixel short of 44 |
| TopBar wordmark | 124×**17** | no vertical padding |
| Copy button | 62×**35** | — |
| Email link | 142×**20** | — |
| Instrument links | 90×**26** | — |
| 320px sideways scroll | min-content **309px** in a 238px column | two unbreakable code tokens; the L8 annotation's `ComponentPropsWithRef<'button'>` alone measured **281px** |

### Tailwind v4 shorthand sweep

55 `utility-[var(--token)]` classes → `utility-(--token)`. Compiled CSS:
**635 declaration blocks before, 635 after**, one intended difference
(`opacity:var(--art-strength,1)` → `opacity:var(--art-strength)`).

### Still outstanding — needs a person and a device

Real iOS Safari and Android Chrome on hardware (task 1), and VoiceOver +
NVDA (task 4). Emulation cannot stand in for either, and neither is claimed
as done.

---

## Phase 5 — Engineering Showcase

| Resource | Measured | Budget |
|----------|---------|--------|
| Critical-path JS | 2.5KB | ≤16KB |
| Scene chunk (lazy, closure) | 240.3KB | ≤250KB |
| CSS | 9.5KB | ≤34KB |
| HTML (`/`) | 25.9KB | ≤40KB |
| HTML (`/instruments`) | 23.2KB | ≤60KB |
| **Orbit island** | **4.8KB** | ≤12KB (§14.3) |
| `/instruments` route JS | 246.7KB | ≤340KB (§26.2) |

### Orbit, measured

| | |
|---|---|
| Physics | **0.104 ms/step** (2,000 particles + 4 masses, node) |
| Simulation work in-browser | **0.23 ms/frame** rolling mean |
| Frame interval | 16.5–17.1 ms (vsync-locked) |
| FPS | 60 |
| DPR | 1.50 (capped 1.5) |
| Particles | 2,000 |

The interval and the simulation's own cost are reported separately, because
conflating them made the panel claim 16.7ms of work when it does about a
fiftieth of that. `Interval` is what the governor watches; `Sim` is what
this code actually costs.

**Frame rate went 51 → 60 by suspending the backdrop while Orbit runs.**
`/instruments` is the only route with two WebGL contexts and they were
sharing a GPU, which cost ~18ms per frame — enough for Orbit to trip its own
20ms degrade threshold because of work it does not do.

### A budget that had stopped measuring anything

Once Orbit imported three.js, the bundler hoisted three into a shared chunk
and `DeepFieldScene.*.js` fell **233KB → 7KB**. The single-file assertion
kept passing, at 3% of budget, while the 229KB it existed to guard moved
next door. Budgets now measure the transitive import closure. The corrected
Phase 4b figure is **240.3KB**, not the 233.0KB recorded at the time.

### Route boundaries, verified rather than asserted

| Width | Orbit JS requested | Canvas in host | Poster requests |
|-------|-------------------|----------------|-----------------|
| 1440px | `Orbit.js` + `Sim.js` | yes | 1 |
| 820px | none | no | 1 |
| 390px | none | no | 1 |

No page-level horizontal scroll at 1440 / 820 / 390. Code excerpts scroll
inside their own containers and every `<pre>` carries `tabindex="0"`.

Mobile fetched the poster **twice** before this phase's fix: Astro
server-renders island markup regardless of the client directive, and Chrome
fetches an `<img>` inside a `display:none` box.

---
# Measured performance

Recorded at each phase exit so a regression is attributable to a specific
phase (master plan §26.4, §32.1). Every number here was measured, not
estimated — the plan's own estimates are called out where reality disagreed.

Enforced automatically by `pnpm verify` → `tests/budgets.mjs`.

---

## Phase 4 — The Spine (current)

### Bundle, gzipped

| Resource | Measured | Budget | |
|----------|---------|--------|---|
| **Critical-path JS** | **2.4KB** | ≤16KB | 15% |
| Scene chunk (lazy, post-idle) | 230.7KB | ≤250KB | 92% |
| CSS | 9.2KB | ≤34KB | 27% |
| HTML (`/`) | 25.8KB | ≤40KB | 64% |
| Art plates, all bands (AVIF) | 438KB | ≤1.6MB | 27% |

**The split is the whole strategy.** Critical-path JS did not move between
Phase 3 (2.4KB) and Phase 4 (2.4KB): adding a 230KB WebGL scene cost the
critical path *nothing*, because it is a separate chunk fetched after idle.
A check that only measured "total JS" would report this site as heavy; it is
not, because none of that weight blocks the first paint.

### Correction to the plan's estimate

§26.2 budgeted **230KB for the scene chunk including a bloom pass**, on the
assumption that named three.js imports tree-shake. They do not:

| | |
|---|---|
| three + R3F, unavoidable | ~229KB gz |
| Our own scene code | ~2KB gz |

R3F imports three wholesale to build its JSX element catalogue, so no import
discipline in our code changes the chunk. A hand-rolled Catmull-Rom sampler
was written specifically to drop three's `Curve` hierarchy and measured
**larger**; it was reverted rather than kept as complexity with no payoff.

Consequences, both recorded as decisions:

- **Bloom is cut.** It is third on the §26.2 cut list and does not fit.
  Additive blending on the stars and nebula already reads as glow.
- **The budget is corrected to 250KB**, which is measured reality plus room
  for Phase 4b's set pieces — not a budget raised to hide a regression. The
  ~229KB vendor floor is not ours to reduce; the ~21KB of headroom is the
  part we actually control, and that is what 4b must fit inside.

The only remaining lever, if this ever has to shrink, is dropping R3F for
raw three (~40KB) — which trades away the declarative scene graph the owner
asked for.

### Scene behaviour

| | Measured |
|---|---|
| Tier on 8-core / 16GB / 1280px desktop | `high` — 12,000 stars, DPR 1.75, 8 nebula layers |
| Canvas backing store | 2240×1260 (DPR 1.75 applied correctly) |
| WebGL context | WebGL 2.0 |
| Focusable elements inside the scene | **0** |
| Scene present in served HTML | **none** — created client-side only |

### Tier ladder, verified across every branch

| Scenario | Tier |
|----------|------|
| Desktop, 8-core / 16GB | `high` |
| Tablet, 800px | `mid` |
| Phone, 375px | `low` |
| Weak device, 2 cores | `low` |
| No WebGL | `none` (art layer only) |
| `saveData` enabled | `none` |
| Reduced motion + weak device | `none` |
| Reduced motion + desktop | `high`, camera cuts between keyframes |
| Unmeasurable viewport width | `high` — falls back optimistically |

### Flight path, verified mathematically

Browsers only paint the top of a document, so scrolled camera states are
awkward to screenshot — but the maths is fully testable
(`tests/flight-path.mjs`):

| Assertion | Result |
|-----------|--------|
| Keyframes match band order | 8 keyframes, exact |
| Spline passes through every keyframe | worst deviation **0.0000** |
| Motion is continuous | max step 1.23u over 400 samples |
| Journey never doubles back | max +Z drift 0.000u |
| Final beat looks back along the path | camera z=−112 → looking at z=+20 |
| Path covers real distance | 232u on Z |

### Not yet measured

Lighthouse, LCP, CLS, INP and sustained frame rate all require a deployed
preview and a real device. They are Phase 7's job (§26.1), and the targets
there are the R2 numbers: mobile Lighthouse ≥78, LCP ≤3.0s, 58fps desktop /
30fps floor mobile under 4× CPU throttle.

Frame rate specifically **cannot be measured in this environment**: the
harness browser pane does not composite while hidden, which starves
requestAnimationFrame. That starvation surfaced two real bugs (below), but
it makes any FPS reading here meaningless.

## Phase 4b — The Set Pieces

| Resource | Measured | Budget |
|----------|---------|--------|
| Critical-path JS | 2.4KB | ≤16KB |
| Scene chunk (lazy) | 233.3KB | ≤250KB |
| CSS | 9.2KB | ≤34KB |
| HTML (`/`) | 25.9KB | ≤40KB |

Four set pieces — planet system, probe trail, station, relay beams — cost
**+2.3KB** over Phase 4's 231.0KB. That is the whole argument for procedural
geometry and shaders: the planets, their atmospheres, the rings, the trail
and the station add no asset bytes at all, and the marginal code is trivial
next to three + R3F's ~229KB floor.

Critical-path JS did not move (2.4KB at Phases 3, 4 and 4b), which is the
number that actually protects LCP.

Cut from the plan: the ConstellationGlobe (~6KB, redundant with the skills
SVG) and three AI-generated planet textures plus three fallback stills
(~120KB each) — replaced by procedural shaders.

Frame rate is still not measured here. The harness browser pane does not
composite while hidden, so rAF is starved; `scripts/shoot-beats.mjs` drives
real Chrome for visual review, but real-device frame rates belong to Phase 7.

---

## Phase 3 — Portfolio Content

| Resource | Measured | Budget |
|----------|---------|--------|
| Critical-path JS | 2.4KB | ≤16KB |
| CSS | 9.0KB | ≤34KB |
| HTML (`/`) | 25.7KB | ≤40KB |

Content-in-HTML: **all 54 facts** present as text with no JavaScript.
dev.to fetch: 30 posts live; with the endpoint sabotaged the build still
succeeded and rendered the six committed fallback posts.

## Phase 2 — Core Experience

| Resource | Measured | Budget |
|----------|---------|--------|
| Critical-path JS | 3.6KB | ≤16KB |
| CSS | 7.8KB | ≤34KB |
| Fonts | 107.9KB | ≤110KB |
| Art plates (AVIF) | 438KB | ≤1.6MB |

## Phase 1 — Foundation

Home route shipped 0KB JS, 118KB total transfer, CSS 6.4KB gz.
