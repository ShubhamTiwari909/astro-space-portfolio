import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Material, Mesh } from 'three';
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

/**
 * Distance fade, in world units.
 *
 * Without it a station is a hairline wireframe at any range, and the
 * Instrument Bay one — 232 units from the opening camera — was drawing a
 * thin streak straight through the hero. It landed on "Tiwari" at 820px and
 * across the lede at 390px, which is precisely what §9.1 forbids: the hero
 * is typography-led, and nothing in the backdrop may compete with the h1.
 *
 * Fading by distance fixes that without moving anything, and it is what the
 * object should do anyway — a station you are 200 units from is not visible
 * as a wireframe, and one you fly past should recede rather than pop.
 */
const FADE_FULL = 110;
const FADE_GONE = 175;

export default function Station() {
	const ref = useRef<Group>(null);
	/** Authored opacities, captured once so the fade scales them. */
	const materials = useRef<{ material: Material; base: number }[]>([]);

	useFrame((state) => {
		const group = ref.current;
		if (!group) return;

		// Very slow yaw: enough to catch the light, not enough to notice.
		group.rotation.y = state.clock.elapsedTime * 0.035;

		if (materials.current.length === 0) {
			group.traverse((object) => {
				const material = (object as Mesh).material as Material | undefined;
				if (material && 'opacity' in material) {
					materials.current.push({ material, base: material.opacity });
				}
			});
		}

		const distance = state.camera.position.distanceTo(group.position);
		// 1 when close, 0 beyond FADE_GONE, smooth in between.
		const t = (distance - FADE_FULL) / (FADE_GONE - FADE_FULL);
		const fade = 1 - Math.min(1, Math.max(0, t));

		// Skipping the draw entirely when invisible is the cheap part.
		group.visible = fade > 0.01;
		if (!group.visible) return;
		for (const { material, base } of materials.current) {
			material.opacity = base * fade;
		}
	});

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
