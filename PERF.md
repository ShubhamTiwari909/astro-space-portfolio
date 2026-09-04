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
