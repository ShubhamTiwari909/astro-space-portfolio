import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
	AdditiveBlending,
	MeshBasicMaterial,
	ShaderMaterial,
	type Group,
	type Mesh,
} from 'three';
import { bandForSection } from '../../../lib/bands';
import {
	LENS_FAR,
	LENS_NEAR,
	LENS_POSITION,
	LENS_RADIUS,
} from './lensing';

/**
 * The black hole — a beat on the run-in to Catalogued Worlds.
 *
 * Two meshes and nothing else: an absolutely black disc for the event
 * horizon, and a photon ring around it. The part that sells it is not here
 * at all — it is in `StarField`, which bends starlight around this position
 * in its vertex shader. Drawing a dark circle with a bright ring is the
 * cliché; bending the light behind it is the phenomenon.
 *
 * ── Why the horizon draws over everything ────────────────────────────────
 * The star field is additive and writes no depth, so a black sphere placed
 * in front of it would be drawn *under* the stars and vanish. The horizon
 * therefore ignores depth entirely and draws last: it is the nearest thing
 * in this part of the scene, and the lensing already pushes stars out of
 * the space it occupies, so the result is correct as well as cheap.
 *
 * ── Why it is not at the payoff beat ─────────────────────────────────────
 * The planet system encodes real projects and gets the longest dwell. A
 * black hole beside it would win the eye and turn the exhibit into
 * background, so this sits before it and is passed on the way in.
 *
 * Decorative: inside the canvas, so §25.0 keeps it out of the a11y tree.
 */

/** The photon ring, in the Ember band — the trajectory beat's own hue. */
const EMBER = bandForSection('trajectory').hex;

const RING_VERTEX = /* glsl */ `
  varying vec2 vLocal;
  void main() {
    // The ring's own xy, so the fragment shader can measure a real radius.
    vLocal = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Brightest at the inner edge, where light grazing the horizon piles up,
 * falling away outward.
 *
 * The radius is measured from the vertex position, NOT from uv. Three's
 * `RingGeometry` maps uv over the bounding square rather than radially, so
 * `uv.x` is a horizontal gradient across the whole ring — reading it as
 * "distance across the band" produced a flat tan disc rather than a ring.
 */
const RING_FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uInner;
  uniform float uOuter;

  varying vec2 vLocal;

  void main() {
    float radius = length(vLocal);
    // 0 at the inner edge, 1 at the outer.
    float across = clamp((radius - uInner) / max(uOuter - uInner, 0.001), 0.0, 1.0);

    float glow = pow(1.0 - across, 2.2);
    float alpha = glow * uOpacity;
    if (alpha < 0.004) discard;

    // White where it is hottest, band hue as it cools outward.
    gl_FragColor = vec4(mix(vec3(1.0), uColor, min(1.0, across * 1.6)), alpha);
  }
`;

export default function BlackHole() {
	const ref = useRef<Group>(null);
	const ringRef = useRef<Mesh>(null);

	const horizon = useMemo(
		() =>
			new MeshBasicMaterial({
				// Not a token: an event horizon emits nothing, and this is the
				// one surface in the scene that is genuinely absent of light
				// rather than merely dark.
				color: 0x000000,
				transparent: true,
				depthTest: false,
				depthWrite: false,
			}),
		[],
	);

	const ring = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: RING_VERTEX,
				fragmentShader: RING_FRAGMENT,
				uniforms: {
					uColor: { value: hexToRgb(EMBER) },
					uOpacity: { value: 0 },
					uInner: { value: LENS_RADIUS * 1.06 },
					uOuter: { value: LENS_RADIUS * 1.9 },
				},
				transparent: true,
				depthTest: false,
				depthWrite: false,
				blending: AdditiveBlending,
				side: 2, // DoubleSide — the ring is seen from both faces
			}),
		[],
	);

	useFrame((state) => {
		const group = ref.current;
		if (!group) return;

		/*
		 * Billboarded. The horizon is a flat disc, and the camera passes it
		 * off to one side — left axis-aligned it would foreshorten into an
		 * ellipse, which is the one shape an event horizon never is.
		 */
		group.quaternion.copy(state.camera.quaternion);

		// Roll lives on the ring so it survives the billboard above.
		if (ringRef.current) {
			ringRef.current.rotation.z = state.clock.elapsedTime * 0.05;
		}

		/*
		 * Fade with the same curve the lensing uses, so the object and its
		 * effect on the sky arrive and leave together. Out of range it is
		 * skipped entirely rather than drawn at zero alpha.
		 */
		const distance = state.camera.position.distanceTo(group.position);
		const t = (distance - LENS_NEAR) / (LENS_FAR - LENS_NEAR);
		const approach = 1 - Math.min(1, Math.max(0, t));

		/*
		 * And fade out again on the way past. A flat disc a few units from
		 * the camera fills the entire frame, which is how the first pass
		 * ended up looking like a tan planet rather than a black hole.
		 */
		const departure = Math.min(1, Math.max(0, (distance - 9) / 14));
		const proximity = approach * departure;

		group.visible = proximity > 0.01;
		if (!group.visible) return;
		horizon.opacity = proximity;
		ring.uniforms.uOpacity.value = proximity * 0.8;
	});

	return (
		<group ref={ref} position={[...LENS_POSITION]}>
			{/* The horizon. Drawn last so the additive star field cannot
			    shine through the one thing that emits nothing. */}
			<mesh material={horizon} renderOrder={30}>
				<circleGeometry args={[LENS_RADIUS, 48]} />
			</mesh>

			<mesh ref={ringRef} material={ring} renderOrder={31}>
				<ringGeometry args={[LENS_RADIUS * 1.06, LENS_RADIUS * 1.9, 64]} />
			</mesh>
		</group>
	);
}

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	return [
		Number.parseInt(h.slice(0, 2), 16) / 255,
		Number.parseInt(h.slice(2, 4), 16) / 255,
		Number.parseInt(h.slice(4, 6), 16) / 255,
	];
}
