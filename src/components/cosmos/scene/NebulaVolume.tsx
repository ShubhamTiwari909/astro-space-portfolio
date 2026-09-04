import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, ShaderMaterial, type Group } from 'three';
import { mulberry32 } from '../../../data/seed';
import { scrollState } from '../../../lib/scrollProgress';
import { BANDS } from '../../../lib/bands';

/**
 * Volumetric nebula — master plan §17.1, §3.3.
 *
 * Layered camera-facing billboards with a procedural shader. Deliberately
 * NOT textured: a shader costs zero asset bytes, scales to any resolution,
 * and can be tinted per band without a second texture — and the band tint
 * is the whole point, because the scene's colour has to track the DOM's
 * (§3.3).
 *
 * Layer count comes from the device tier, so this is where mobile gives up
 * most of its cost (§24.2).
 */

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Cheap value-noise fBm. Four octaves is enough for dust at this scale and
 * keeps the fragment cost low on mobile GPUs, which is where this shader is
 * actually at risk.
 */
const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3  uColor;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Very slow drift, so the cloud is alive without being distracting.
    vec2 p = vUv * 3.0 + vec2(uTime * 0.008, uTime * -0.005);

    // Ridged fBm gives filaments rather than soft blobs — the same trick
    // the art plates use, so render and art read as one image.
    float n = fbm(p);
    n = 1.0 - abs(2.0 * n - 1.0);
    n *= n;

    // Radial falloff so a billboard has no visible edge.
    float d = length(vUv - 0.5) * 2.0;
    float edge = 1.0 - smoothstep(0.25, 1.0, d);

    float alpha = n * edge * uOpacity;
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(uColor * (0.55 + n * 0.75), alpha);
  }
`;

interface LayerSpec {
	position: [number, number, number];
	scale: number;
	opacity: number;
	seed: number;
}

interface Props {
	layers: number;
}

export default function NebulaVolume({ layers }: Props) {
	const groupRef = useRef<Group>(null);
	const bandColor = useMemo(() => new Color(BANDS[0].hex), []);
	const targetColor = useMemo(() => new Color(), []);

	/**
	 * Layers occupy the FIRST HALF of the flight only — the nebula-wall and
	 * cluster beats (§4.1) — and stop short of the planet system.
	 *
	 * This is a correction, not a preference: spanning the whole path put
	 * additive-blended billboards between the camera and the planets, fogging
	 * the Worlds beat, which is the payoff of the entire flight and gets the
	 * longest dwell. Dust belongs where the journey passes through it.
	 */
	const specs = useMemo<LayerSpec[]>(() => {
		const rand = mulberry32(0x4e_45_42_55);
		return Array.from({ length: layers }, (_, i) => {
			const along = i / Math.max(1, layers - 1);
			return {
				position: [
					(rand() - 0.5) * 90,
					(rand() - 0.5) * 50,
					/*
					 * +112 down to +12 only.
					 *
					 * Camera z by beat: 120 → 82 → 46 → 16 → -16 → -52 → -80
					 * → -112. Ending at +12 means the camera passes THROUGH the
					 * dust during the nebula-wall and cluster beats, and every
					 * layer is behind it by the Worlds beat (z -16).
					 *
					 * The first attempt ran to -14, which put a 200-unit
					 * billboard two units in front of the camera at Worlds and
					 * whited out the payoff beat.
					 */
					112 - along * 100 + (rand() - 0.5) * 14,
				],
				scale: 90 + rand() * 130,
				opacity: 0.16 + rand() * 0.2,
				seed: rand() * 100,
			};
		});
	}, [layers]);

	const materials = useMemo(
		() =>
			specs.map(
				(spec) =>
					new ShaderMaterial({
						vertexShader: VERTEX,
						fragmentShader: FRAGMENT,
						uniforms: {
							uColor: { value: bandColor },
							uTime: { value: 0 },
							uOpacity: { value: spec.opacity },
							uSeed: { value: spec.seed },
						},
						transparent: true,
						depthWrite: false,
						blending: AdditiveBlending,
					}),
			),
		[specs, bandColor],
	);

	useFrame((state, delta) => {
		// The band the DOM is showing, read from the same singleton the CSS
		// reads — so page and scene can never disagree on colour (§3.3).
		const band = BANDS[scrollState.bandIndex] ?? BANDS[0];
		targetColor.set(band.hex);
		// Ease rather than cut, matching the DOM's band cross-fade.
		bandColor.lerp(targetColor, 1 - Math.exp(-delta * 2.2));

		const t = state.clock.elapsedTime;
		for (const material of materials) material.uniforms.uTime.value = t;

		// Billboards face the camera; done here rather than with a helper so
		// there is no extra abstraction in the frame loop.
		if (groupRef.current) {
			for (const child of groupRef.current.children) {
				child.quaternion.copy(state.camera.quaternion);
			}
		}
	});

	return (
		<group ref={groupRef}>
			{specs.map((spec, i) => (
				<mesh key={i} position={spec.position} material={materials[i]}>
					<planeGeometry args={[spec.scale, spec.scale]} />
				</mesh>
			))}
		</group>
	);
}
