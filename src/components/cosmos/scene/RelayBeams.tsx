import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { AdditiveBlending, ShaderMaterial } from 'three';
import { bandUniform } from '../../../lib/bands';

/**
 * Relay beams — master plan §4.1 (the Transmissions beat).
 *
 * Atmosphere only (§25.0), and explicitly the FIRST thing on §26.2's cut
 * list. It survives this phase because the whole set-piece batch came in
 * ~9KB under the remaining budget; if 4b had been tight this would have gone
 * and the band tint plus the art plate would have carried the beat.
 *
 * Kept deliberately cheap: three cones with a one-uniform shader.
 */

const VERTEX = /* glsl */ `
  varying float vY;
  void main() {
    // uv.y runs 0 at the cone base to 1 at the tip.
    vY = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3  uColor;
  uniform float uTime;
  uniform float uPhase;
  varying float vY;

  void main() {
    // A pulse travelling along the beam, plus a fade toward the tip.
    float travel = fract(uTime * 0.28 + uPhase);
    float pulse = exp(-24.0 * abs(vY - travel));
    float taper = pow(1.0 - vY, 1.7);
    float a = taper * 0.16 + pulse * 0.5;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** Signal Gold, read from the band source of truth (§3.3). */
const GOLD = bandUniform('transmissions');

const BEAMS = [
	{ position: [10, -2, -104] as const, rotation: [0.5, 0.3, -0.6] as const, phase: 0 },
	{ position: [-4, 3, -112] as const, rotation: [-0.35, -0.2, 0.5] as const, phase: 0.37 },
	{ position: [2, -7, -118] as const, rotation: [1.1, 0.6, 0.2] as const, phase: 0.71 },
];

export default function RelayBeams() {
	const materials = useMemo(
		() =>
			BEAMS.map(
				(beam) =>
					new ShaderMaterial({
						vertexShader: VERTEX,
						fragmentShader: FRAGMENT,
						uniforms: {
							uColor: { value: GOLD },
							uTime: { value: 0 },
							uPhase: { value: beam.phase },
						},
						transparent: true,
						depthWrite: false,
						blending: AdditiveBlending,
						side: 2, // DoubleSide — beams are seen from inside too
					}),
			),
		[],
	);

	useFrame((state) => {
		const t = state.clock.elapsedTime;
		for (const m of materials) m.uniforms.uTime.value = t;
	});

	return (
		<group>
			{BEAMS.map((beam, i) => (
				<mesh
					key={i}
					position={beam.position}
					rotation={beam.rotation}
					material={materials[i]}
				>
					<coneGeometry args={[2.2, 34, 12, 1, true]} />
				</mesh>
			))}
		</group>
	);
}
