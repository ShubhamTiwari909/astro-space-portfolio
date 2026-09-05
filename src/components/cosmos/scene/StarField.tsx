import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	ShaderMaterial,
} from 'three';
import { SKY_SEED, mulberry32 } from '../../../data/seed';

/**
 * The star field — master plan §17.1, §19.2a.
 *
 * Points with a custom shader rather than per-frame JS: twinkle is a
 * function of time and a per-star phase, computed on the GPU, so the cost is
 * flat regardless of star count. Positions are generated once from a seeded
 * PRNG — a sky that changes between reloads reads as a bug (§9.7).
 *
 * Buffers are pre-allocated typed arrays and never reallocated. Per-frame
 * allocation is the classic cause of GC sawtooth in R3F scenes.
 */

import {
	LENS_FAR,
	LENS_NEAR,
	LENS_POSITION,
	LENS_STRENGTH,
} from './lensing';

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aTint;

  uniform float uTime;
  uniform float uPixelRatio;

  /* The black hole (see blackHole.ts). */
  uniform vec3  uLensPos;
  uniform float uLensStrength;
  uniform float uLensNear;
  uniform float uLensFar;

  varying float vAlpha;
  varying vec3 vTint;

  void main() {
    vTint = aTint;

    // Twinkle: a slow sine per star, offset by its own phase so the field
    // never pulses in unison.
    float twinkle = 0.72 + 0.28 * sin(uTime * 0.7 + aPhase * 6.2831853);
    vAlpha = twinkle;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mv;

    /*
     * ── Gravitational lensing ────────────────────────────────────────────
     *
     * Done here, on stars we already draw, rather than as a screen-space
     * post-process. A post-process needs a render target and a second pass,
     * which is the machinery cut in Phase 4 when bloom did not fit the
     * budget — and this produces the actual phenomenon rather than a
     * distortion of the whole frame.
     *
     * Two properties of real lensing are reproduced:
     *   - the apparent position of a background source moves AWAY from the
     *     mass, which is why an Einstein ring is a ring and not a blob;
     *   - deflection falls off with the impact parameter, so the effect is
     *     violent close in and negligible far out.
     *
     * Only sources BEHIND the mass are bent. A star in front of a black
     * hole is not lensed by it, and skipping them is both correct and the
     * cheaper branch.
     */
    vec4 lensView = viewMatrix * vec4(uLensPos, 1.0);
    float lensDistance = length(lensView.xyz);
    float proximity = 1.0 - smoothstep(uLensNear, uLensFar, lensDistance);

    if (proximity > 0.001 && lensView.z > mv.z && clip.w > 0.0) {
      vec4 lensClip = projectionMatrix * lensView;
      if (lensClip.w > 0.0) {
        vec2 star = clip.xy / clip.w;
        vec2 lens = lensClip.xy / lensClip.w;
        vec2 offset = star - lens;
        float impact = max(length(offset), 0.0015);

        // Outward, and inversely proportional to the impact parameter.
        float deflection = uLensStrength * proximity / impact;
        // Capped, or a star crossing the exact centre would be flung off
        // screen and pop back — a division by nearly zero made visible.
        deflection = min(deflection, 0.55);

        star += normalize(offset) * deflection;
        clip.xy = star * clip.w;
      }
    }

    gl_Position = clip;

    // Perspective sizing: distant stars shrink, which is what reads as depth.
    gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying vec3 vTint;

  void main() {
    // Round, soft-edged point. gl_PointCoord is 0..1 across the sprite.
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d) * 2.0;
    float falloff = 1.0 - smoothstep(0.0, 1.0, r);
    falloff *= falloff;
    if (falloff < 0.01) discard;

    gl_FragColor = vec4(vTint, falloff * vAlpha);
  }
`;

interface Props {
	count: number;
	pixelRatio: number;
}

export default function StarField({ count, pixelRatio }: Props) {
	// Built once per count change; mutated never.
	const geometry = useMemo(() => {
		const rand = mulberry32(SKY_SEED);
		const positions = new Float32Array(count * 3);
		const sizes = new Float32Array(count);
		const phases = new Float32Array(count);
		const tints = new Float32Array(count * 3);

		for (let i = 0; i < count; i++) {
			// A long box around the whole flight path so stars are always in
			// frame, from z +160 (deep field) to -160 (past the station).
			positions[i * 3] = (rand() - 0.5) * 420;
			positions[i * 3 + 1] = (rand() - 0.5) * 260;
			positions[i * 3 + 2] = (rand() - 0.5) * 420 - 20;

			// Magnitude distribution: mostly faint, a few bright.
			const mag = rand() ** 3.1;
			sizes[i] = 0.6 + mag * 3.4;
			phases[i] = rand();

			// Stellar colour: blue-white through to warm, weighted white.
			const warm = rand();
			tints[i * 3] = 0.82 + warm * 0.18;
			tints[i * 3 + 1] = 0.86 + (1 - Math.abs(warm - 0.5)) * 0.12;
			tints[i * 3 + 2] = 1.0 - warm * 0.22;
		}

		const g = new BufferGeometry();
		g.setAttribute('position', new BufferAttribute(positions, 3));
		g.setAttribute('aSize', new BufferAttribute(sizes, 1));
		g.setAttribute('aPhase', new BufferAttribute(phases, 1));
		g.setAttribute('aTint', new BufferAttribute(tints, 3));
		return g;
	}, [count]);

	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: {
					uTime: { value: 0 },
					uPixelRatio: { value: pixelRatio },
					uLensPos: { value: LENS_POSITION },
					uLensStrength: { value: LENS_STRENGTH },
					uLensNear: { value: LENS_NEAR },
					uLensFar: { value: LENS_FAR },
				},
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
			}),
		[pixelRatio],
	);

	useFrame((state) => {
		// One uniform write per frame. No allocation, no state.
		material.uniforms.uTime.value = state.clock.elapsedTime;
	});

	return <points geometry={geometry} material={material} />;
}
