/**
 * The device-tier ladder — master plan §16.4.
 *
 * Evaluated ONCE at mount. Fidelity is chosen at runtime rather than by
 * media query, so a high-end phone can get more than a low-end laptop —
 * which is the whole reason R2 ships 3D to mobile at all.
 *
 * Degradation is one-way per session: never oscillate. A scene that
 * repeatedly drops and restores quality looks broken in a way a
 * consistently lower quality does not.
 */

import { useMemo, useRef } from 'react';
import {
	hasWebGL,
	prefersLessData,
	prefersReducedMotion,
} from '../../../lib/webglSupport';

export type TierName = 'none' | 'low' | 'mid' | 'high';

export interface SceneTier {
	name: TierName;
	/** Star count. */
	stars: number;
	/** Device pixel ratio ceiling. */
	dpr: number;
	/** Nebula billboard layers. */
	nebulaLayers: number;
	/** Sphere subdivision for planets (§24.2: 64 / 48 / 32). */
	planetSegments: number;
	/** Frame cap. 30 on low tier saves battery and heat. */
	fps: number;
	/** Reduced motion: the camera CUTS between keyframes (§16.4). */
	staticCamera: boolean;
}

const TIERS: Record<
	Exclude<TierName, 'none'>,
	Omit<SceneTier, 'name' | 'staticCamera'>
> = {
	low: { stars: 3000, dpr: 1, nebulaLayers: 3, planetSegments: 32, fps: 30 },
	mid: { stars: 6000, dpr: 1.5, nebulaLayers: 5, planetSegments: 48, fps: 60 },
	high: { stars: 12000, dpr: 1.75, nebulaLayers: 8, planetSegments: 64, fps: 60 },
};

/*
 * NO BLOOM. The plan budgeted 230KB gz for the scene including a bloom pass
 * (§26.2), but three + R3F alone measured 228.9KB — R3F's reconciler
 * references most of three's namespace, so three does not tree-shake the way
 * the estimate assumed. Bloom is third on the plan's own cut list, so it is
 * cut rather than the budget raised (§26.2). Additive blending on the stars
 * and nebula already reads as glow; the loss is small and the honesty is not.
 */

/**
 * Viewport width, defensively.
 *
 * `window.innerWidth` is 0 in a background or prerendering tab, and in a
 * display:none iframe. Detection is cached for the page's life, so trusting
 * a zero there would pin a visitor who opened the site in a background tab
 * to the low tier permanently — one-way degradation means that is not
 * recoverable.
 *
 * So: take the largest of three sources, and treat 0 as *unknown* rather
 * than tiny. A wrong optimistic guess is safe, because the frame governor
 * measures actual performance and downgrades if the device cannot cope.
 */
function viewportWidth(): number {
	if (typeof window === 'undefined') return 0;
	return Math.max(
		window.innerWidth || 0,
		document.documentElement?.clientWidth || 0,
		window.screen?.width || 0,
	);
}

function detect(): SceneTier {
	const reduced = prefersReducedMotion();

	// No WebGL, or a visitor asking for less data: the art layer is the
	// entire experience and no chunk is fetched.
	if (!hasWebGL() || prefersLessData()) {
		return { name: 'none', ...TIERS.low, staticCamera: true };
	}

	const cores = navigator.hardwareConcurrency ?? 4;
	const memory =
		(navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
	const width = viewportWidth();

	let name: Exclude<TierName, 'none'>;
	if (cores <= 4 || memory <= 4) name = 'low';
	// width === 0 means "not measurable yet", not "tiny screen" — see
	// viewportWidth(). An unknown width must never downgrade.
	else if (width > 0 && width < 768) name = 'low';
	else if (width > 0 && width < 1024) name = 'mid';
	else name = 'high';

	// Reduced motion on the lowest tier: skip the scene. There the win is
	// battery and heat, not motion (§16.4).
	if (reduced && name === 'low') {
		return { name: 'none', ...TIERS.low, staticCamera: true };
	}

	// The plan asks for the ladder to be debuggable in development (§16.4);
	// without the inputs, a surprising tier is impossible to explain.
	if (import.meta.env.DEV) {
		console.info(
			`[scene] tier=${name} (cores=${cores}, memory=${memory}GB, ` +
				`width=${width}, reducedMotion=${reduced})`,
		);
	}

	return { name, ...TIERS[name], staticCamera: reduced };
}

export function useSceneTier(): SceneTier {
	// Detected once; a ref so a re-render can never re-evaluate it.
	const ref = useRef<SceneTier | null>(null);
	return useMemo(() => (ref.current ??= detect()), []);
}

/**
 * One-way downgrade used by the runtime degradation ladder (§16.4).
 * Returns the same object when there is nothing left to give up.
 */
export function degrade(tier: SceneTier): SceneTier {
	// Cheapest win first: resolution costs more than geometry here.
	if (tier.dpr > 1) return { ...tier, dpr: 1 };
	if (tier.stars > 1500)
		return {
			...tier,
			stars: Math.round(tier.stars / 2),
			nebulaLayers: Math.max(2, tier.nebulaLayers - 2),
		};
	// Last resort: cap the frame rate rather than keep dropping quality.
	if (tier.fps > 30) return { ...tier, fps: 30 };
	return tier;
}
