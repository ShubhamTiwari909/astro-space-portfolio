import { useMemo } from 'react';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	ShaderMaterial,
} from 'three';
import { mulberry32 } from '../../../data/seed';

/**
 * Distant galaxies — master plan §4.1 (the First Light beat).
 *
 * These are what make the opening read as *intergalactic* rather than
 * merely dark: a handful of faint, resolvably-elliptical smudges far beyond
 * the star field. Nearly static by design — the camera barely moves at the
 * start, and anything lively here would pull focus from the hero sentence.
 */

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aAngle;
  varying float vAngle;

  void main() {
    vAngle = aAngle;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (260.0 / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAngle;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);

    // Rotate, then squash one axis: an ellipse reads as a galaxy where a
    // circle reads as an out-of-focus star.
    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 r = vec2(d.x * c - d.y * s, d.x * s + d.y * c);
    r.y *= 2.6;

    float dist = length(r) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.55, dist);
    float halo = (1.0 - smoothstep(0.0, 1.0, dist)) * 0.5;
    float a = core * 0.7 + halo;
    if (a < 0.01) discard;

    gl_FragColor = vec4(uColor, a * 0.5);
  }
`;

interface Props {
	count?: number;
}

export default function GalaxySprites({ count = 26 }: Props) {
	const geometry = useMemo(() => {
		const rand = mulberry32(0x6a_61_6c_78);
		const positions = new Float32Array(count * 3);
		const sizes = new Float32Array(count);
		const angles = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			// Far side of the field only: they belong to the opening beat.
			positions[i * 3] = (rand() - 0.5) * 320;
			positions[i * 3 + 1] = (rand() - 0.5) * 200;
			positions[i * 3 + 2] = 130 + rand() * 120;
			sizes[i] = 5 + rand() * 11;
			angles[i] = rand() * Math.PI;
		}

		const g = new BufferGeometry();
		g.setAttribute('position', new BufferAttribute(positions, 3));
		g.setAttribute('aSize', new BufferAttribute(sizes, 1));
		g.setAttribute('aAngle', new BufferAttribute(angles, 1));
		return g;
	}, [count]);

	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: { uColor: { value: [0.78, 0.82, 0.95] } },
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
			}),
		[],
	);

	return <points geometry={geometry} material={material} />;
}
