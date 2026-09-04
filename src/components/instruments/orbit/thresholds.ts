/**
 * Orbit's degradation thresholds — master plan §14.3.
 *
 * Their own module, tiny as it is, because both the simulation and its
 * wrapper need them and the wrapper must not import the simulation: `Sim`
 * pulls in three.js, and the whole point of the lazy split is that the
 * poster path — every visitor under `prefers-reduced-motion` — never parses
 * any of it. Importing a constant is not worth 229KB.
 *
 * The wrapper uses them to *describe* what happened; the simulation uses
 * them to decide. One source, so the message cannot drift from the rule.
 */

/** Mean frame interval above this, sustained, halves the particle count. */
export const DEGRADE_MS = 20;

/** A second sustained breach above this stops the simulation entirely. */
export const STOP_MS = 26;

/** Seconds a breach must persist before it counts. */
export const DEGRADE_AFTER = 2;

/**
 * Deltas longer than this are stalls, not slow frames.
 *
 * A backgrounded tab, a long GC pause or a breakpoint all produce deltas of
 * hundreds of milliseconds, indistinguishable from a device that cannot
 * cope. Degradation here is one-way by design, so counting a stall would
 * mean switching tabs for a moment permanently halved the simulation — the
 * exact bug already fixed once in the backdrop's frame governor.
 */
export const STALL_S = 0.1;
