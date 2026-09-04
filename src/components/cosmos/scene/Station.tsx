import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { bandForSection } from '../../../lib/bands';

/**
 * The orbital station — master plan §4.1 (the Instrument Bay beat).
 *
 * Atmosphere only, and §25.0's own table classifies it as such: it decorates
 * nothing and encodes nothing, which is allowed for the *backdrop* under P2.
 * It earns inclusion by being the cheapest set piece here — a handful of
 * boxes and a torus in wireframe, no shader, no texture.
 *
 * Aurora Green rim, matching the Instrument Bay band (§3.3).
 */

/* Taken from the band source of truth, not duplicated (§3.3). */
const AURORA = bandForSection('instruments').hex;

export default function Station() {
	const ref = useRef<Group>(null);

	useFrame((state) => {
		// Very slow yaw: enough to catch the light, not enough to notice.
		if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.035;
	});

	// Far out and well off-axis. At z -86, and again at x -15, its wireframe
	// tangled with the planet system in screen space and read as clutter
	// rather than as a separate object.
	return (
		<group ref={ref} position={[-34, 16, -112]} rotation={[0.2, 0.5, 0.08]}>
			{/* Spine */}
			<mesh>
				<boxGeometry args={[0.6, 0.6, 16]} />
				<meshBasicMaterial color={AURORA} wireframe opacity={0.5} transparent />
			</mesh>

			{/* Habitation ring */}
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[6, 0.5, 6, 28]} />
				<meshBasicMaterial color={AURORA} wireframe opacity={0.42} transparent />
			</mesh>

			{/* Solar arrays: two panels off the spine */}
			{[-1, 1].map((side) => (
				<mesh key={side} position={[side * 7.5, 0, 4]}>
					<boxGeometry args={[9, 0.15, 4]} />
					<meshBasicMaterial
						color={AURORA}
						wireframe
						opacity={0.3}
						transparent
					/>
				</mesh>
			))}

			{/* Docking node at the near end */}
			<mesh position={[0, 0, 9]}>
				<octahedronGeometry args={[1.5, 0]} />
				<meshBasicMaterial color={AURORA} wireframe opacity={0.6} transparent />
			</mesh>
		</group>
	);
}
