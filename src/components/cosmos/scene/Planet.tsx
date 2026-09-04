import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, ShaderMaterial, type Mesh } from 'three';
import { worldFocus } from '../../../lib/worldFocus';
import { planetSlot, type PlanetDatum } from './planetLayout';

/**
 * One catalogued world — master plan §10.6.
 *
 * The surface is a procedural shader rather than an AI-generated
 * equirectangular texture, which is a deliberate change from the plan:
 *
 *  - it costs zero image bytes, where the plan budgeted ~120KB per planet
 *    plus a still per planet for the fallback;
 *  - the hue comes from the same `plateHueForIndex` the CSS fallback sphere
 *    uses, so the 3D planet and its DOM counterpart are *the same colour by
 *    construction* — separate textures could drift apart;
 *  - nothing to decode on mobile, which is where this beat is at risk.
 *
 * Decorative: `aria-hidden` by virtue of living in the canvas, and identity
 * is always the card's text name and designation (§25.0).
 */

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Banded fBm in the planet's hue, a single key light, and a fresnel limb.
 * The limb is what makes a sphere read as a *lit world* rather than a disc —
 * it is the cheapest high-value part of this shader.
 */
const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform float uHue;
  uniform float uTime;
  uniform float uEmphasis;
  uniform vec3  uLightDir;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(
      abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
      0.0, 1.0
    );
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    // Latitude bands, warped by noise: reads as weather, not as stripes.
    float band = vUv.y * 9.0 + fbm(vUv * vec2(4.0, 9.0) + uTime * 0.01) * 2.4;
    float detail = fbm(vUv * vec2(10.0, 20.0) + 7.0);
    float shade = 0.42 + 0.30 * sin(band) + detail * 0.20;

    float hue = uHue / 360.0;
    vec3 surface = hsl2rgb(vec3(hue, 0.52, 0.16 + shade * 0.36));

    // Key light: one directional source, no ambient term — space is dark.
    float lambert = max(dot(vNormal, normalize(uLightDir)), 0.0);
    vec3 lit = surface * (0.10 + lambert * 1.05);

    // Fresnel limb, brightened while the matching card is focused.
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.6);
    vec3 limb = hsl2rgb(vec3(hue, 0.85, 0.72)) * fres * (0.55 + uEmphasis * 0.9);

    gl_FragColor = vec4(lit + limb, 1.0);
  }
`;

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Ring material. Separate from the atmosphere shell because a fresnel term
 * needs curvature: on a flat ring every normal points the same way, so the
 * term is constant and the ring renders as an opaque disc that occludes the
 * planets behind it. This shades across the ring's WIDTH instead.
 */
const RING_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uHue;
  varying vec2 vUv;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(
      abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
      0.0, 1.0
    );
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    // RingGeometry's uv.x runs across the ring's width.
    float across = vUv.x;
    // Two bright bands with a Cassini-style gap between them.
    float band = smoothstep(0.0, 0.18, across) * (1.0 - smoothstep(0.82, 1.0, across));
    float gap = 1.0 - exp(-90.0 * pow(across - 0.52, 2.0)) * 0.75;
    float a = band * gap * 0.4;
    if (a < 0.006) discard;
    // Saturated and mid-lightness: additive blending already brightens, and
    // at 0.78 lightness the hue washed out to grey.
    gl_FragColor = vec4(hsl2rgb(vec3(uHue / 360.0, 0.9, 0.58)), a);
  }
`;

const RING_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Back-face shell: the thin bright halo that sells "atmosphere". */
const ATMOSPHERE_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uHue;
  uniform float uEmphasis;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(
      abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
      0.0, 1.0
    );
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.2);
    float a = fres * (0.34 + uEmphasis * 0.5);
    if (a < 0.004) discard;
    gl_FragColor = vec4(hsl2rgb(vec3(uHue / 360.0, 0.8, 0.66)), a);
  }
`;

interface Props {
	datum: PlanetDatum;
	index: number;
	/** Sphere subdivision, from the device tier (§24.2). */
	segments: number;
	/** Atmosphere shell is dropped on the low tier. */
	atmosphere: boolean;
}

export default function Planet({ datum, index, segments, atmosphere }: Props) {
	const slot = planetSlot(index);
	const meshRef = useRef<Mesh>(null);
	const emphasis = useRef(0);

	const surface = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: {
					uHue: { value: datum.hue },
					uTime: { value: 0 },
					uEmphasis: { value: 0 },
					// Lit from the direction the camera arrives from, so the
					// terminator is visible rather than facing away.
					uLightDir: { value: [0.55, 0.35, 0.75] },
				},
			}),
		[datum.hue],
	);

	const shell = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: ATMOSPHERE_VERTEX,
				fragmentShader: ATMOSPHERE_FRAGMENT,
				uniforms: {
					uHue: { value: datum.hue },
					uEmphasis: { value: 0 },
				},
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
				side: 1, // BackSide
			}),
		[datum.hue],
	);

	const ring = useMemo(
		() =>
			datum.featured
				? new ShaderMaterial({
						vertexShader: RING_VERTEX,
						fragmentShader: RING_FRAGMENT,
						uniforms: { uHue: { value: datum.hue } },
						transparent: true,
						depthWrite: false,
						blending: AdditiveBlending,
						side: 2, // DoubleSide — the ring is seen from both faces
					})
				: null,
		[datum.featured, datum.hue],
	);

	useFrame((state, delta) => {
		const t = state.clock.elapsedTime;
		surface.uniforms.uTime.value = t;

		// Idle rotation, desynchronised per planet by its own spin rate.
		if (meshRef.current) meshRef.current.rotation.y = t * slot.spin;

		// Ease toward the focus state rather than snapping, so a pointer
		// skimming across cards does not strobe the scene.
		const target = worldFocus.activeSlug === datum.slug ? 1 : 0;
		emphasis.current += (target - emphasis.current) * (1 - Math.exp(-delta * 6));
		surface.uniforms.uEmphasis.value = emphasis.current;
		shell.uniforms.uEmphasis.value = emphasis.current;
	});

	return (
		<group position={slot.position} rotation={[slot.tilt, 0, 0]}>
			<mesh ref={meshRef} material={surface}>
				<sphereGeometry args={[slot.radius, segments, segments]} />
			</mesh>

			{atmosphere && (
				<mesh material={shell} scale={1.045}>
					<sphereGeometry args={[slot.radius, segments, segments]} />
				</mesh>
			)}

			{/* One thin ring, featured world only. A ring on every planet
			    would flatten the hierarchy the scale is establishing. */}
			{ring && (
				<mesh rotation={[Math.PI / 3, 0, 0.24]} material={ring}>
					<ringGeometry args={[slot.radius * 1.45, slot.radius * 2.05, 96]} />
				</mesh>
			)}
		</group>
	);
}
