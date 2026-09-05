/**
 * Lensing constants — shared by the black hole and the star field.
 *
 * Two components need to agree on where the mass is: `BlackHole` draws the
 * horizon and the photon ring, and `StarField` bends starlight around it.
 * The object never moves, so this is a module of constants rather than the
 * mutable singleton pattern used for scroll and focus — there is no state
 * here to get out of sync, only agreement.
 *
 * ── Placement ────────────────────────────────────────────────────────────
 * Camera z by beat: 120, 82, 46, 16, -16, -52, -80, -112. Sitting at z -30
 * puts this on the run-in between the Atlas beat (16) and Catalogued Worlds
 * (-16), so the camera approaches and passes it just before the planet
 * system becomes the subject. It is deliberately NOT at the payoff beat:
 * the planets encode real projects and a black hole would win that fight.
 *
 * Offset to the right, following the composition the whole site uses —
 * copy on the left, visuals on the right.
 */
export const LENS_POSITION: readonly [number, number, number] = [22, 7, -30];

/** Event-horizon radius, world units. */
export const LENS_RADIUS = 1.8;

/**
 * Deflection strength, in normalised-device units.
 *
 * Real gravitational lensing deflects light by an angle inversely
 * proportional to the impact parameter, and pushes the apparent position of
 * a background source *away* from the mass. Both properties are reproduced
 * in the star field's vertex shader; this is the constant of
 * proportionality, tuned by eye rather than derived, since the mass here is
 * a design decision rather than a measurement.
 */
export const LENS_STRENGTH = 0.05;

/**
 * Range over which the lensing fades in as the camera approaches.
 *
 * Without it every star in the sky would be permanently displaced, which
 * costs the same and reads as a bug rather than as a nearby mass.
 */
export const LENS_NEAR = 45;
export const LENS_FAR = 120;
