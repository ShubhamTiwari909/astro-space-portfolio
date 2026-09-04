import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CatmullRomCurve3,
	ShaderMaterial,
	Vector3,
} from 'three';
import { bandUniform } from '../../../lib/bands';

/**
 * The probe trail — master plan §4.1 (the Trajectory beat), §12.
 *
 * An ion-trail arcing past the camera with one bright marker per burn event.
 * It encodes something real: the marker count IS the achievement count, so
 * the trail lengthens if the experience does (P2).
 *
 * Points rather than a tube: a `Line` cannot vary width across browsers and
 * a `TubeGeometry` would cost far more than this beat is worth.
 */

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aMarker;
  uniform float uTime;
  varying float vMarker;

  void main() {
    vMarker = aMarker;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // Markers pulse gently; trail particles hold steady.
    float pulse = aMarker > 0.5 ? 0.85 + 0.15 * sin(uTime * 1.6) : 1.0;
    gl_PointSize = aSize * pulse * (150.0 / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vMarker;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    float core = 1.0 - smoothstep(0.0, 1.0, d);
    core *= core;
    if (core < 0.01) discard;
    // Markers burn brighter and whiter than the trail they sit on.
    vec3 c = mix(uColor, vec3(1.0), vMarker * 0.55);
    gl_FragColor = vec4(c, core * (0.34 + vMarker * 0.66));
  }
`;

interface Props {
	/** One marker per burn event, so the trail reflects real content. */
	markers: number;
}

export default function ProbeTrail({ markers }: Props) {
	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: {
					uTime: { value: 0 },
					// Solar Ember, read from the band source of truth (§3.3).
					uColor: { value: bandUniform('trajectory') },
				},
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
			}),
		[],
	);

	const geometry = useMemo(() => {
		// Arcs through the Trajectory beat (camera ≈ 28, −7, 16) and recedes.
		const curve = new CatmullRomCurve3([
			new Vector3(46, -16, 44),
			new Vector3(30, -6, 22),
			new Vector3(12, 1, 2),
			new Vector3(-6, 6, -18),
			new Vector3(-26, 9, -40),
		]);

		const TRAIL = 220;
		const total = TRAIL + markers;
		const positions = new Float32Array(total * 3);
		const sizes = new Float32Array(total);
		const flags = new Float32Array(total);
		const point = new Vector3();

		for (let i = 0; i < TRAIL; i++) {
			const t = i / (TRAIL - 1);
			curve.getPoint(t, point);
			// Slight scatter so it reads as exhaust, not a wire.
			positions[i * 3] = point.x + (Math.sin(i * 12.9) * 0.7);
			positions[i * 3 + 1] = point.y + (Math.cos(i * 7.3) * 0.7);
			positions[i * 3 + 2] = point.z + (Math.sin(i * 4.1) * 0.7);
			// Tapers toward the tail.
			sizes[i] = 0.5 + (1 - t) * 1.6;
			flags[i] = 0;
		}

		for (let m = 0; m < markers; m++) {
			const i = TRAIL + m;
			curve.getPoint(markers > 1 ? m / (markers - 1) : 0.5, point);
			positions[i * 3] = point.x;
			positions[i * 3 + 1] = point.y;
			positions[i * 3 + 2] = point.z;
			sizes[i] = 5.2;
			flags[i] = 1;
		}

		const g = new BufferGeometry();
		g.setAttribute('position', new BufferAttribute(positions, 3));
		g.setAttribute('aSize', new BufferAttribute(sizes, 1));
		g.setAttribute('aMarker', new BufferAttribute(flags, 1));
		return g;
	}, [markers]);

	useFrame((state) => {
		material.uniforms.uTime.value = state.clock.elapsedTime;
	});

	return <points geometry={geometry} material={material} />;
}
