/**
 * WebGL capability probe — master plan §16.4, §19.2a.
 *
 * Decides whether the scene mounts at all. Probed once, cached: creating a
 * context is not free, and the answer cannot change within a page life.
 *
 * A `false` here is not a degraded state — it means the art layer (§17.1)
 * is the whole experience, which is a designed outcome.
 */

let cached: boolean | null = null;

export function hasWebGL(): boolean {
	if (cached !== null) return cached;
	if (typeof window === 'undefined') return (cached = false);

	try {
		const canvas = document.createElement('canvas');
		const gl =
			canvas.getContext('webgl2') ??
			canvas.getContext('webgl') ??
			canvas.getContext('experimental-webgl');
		// Release the probe context immediately; browsers cap how many exist.
		const lose = (gl as WebGLRenderingContext | null)?.getExtension(
			'WEBGL_lose_context',
		) as { loseContext?: () => void } | null;
		lose?.loseContext?.();
		cached = Boolean(gl);
	} catch {
		cached = false;
	}
	return cached;
}

/** Respects a visitor asking for less data: they do not get a 200KB chunk. */
export function prefersLessData(): boolean {
	if (typeof navigator === 'undefined') return false;
	const conn = (
		navigator as Navigator & { connection?: { saveData?: boolean } }
	).connection;
	return conn?.saveData === true;
}

export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
