import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, DoubleSide, ShaderMaterial, type Group } from 'three';
import { bandForSection } from '../../../lib/bands';

/**
 * The satellite itself — geometry and materials, no host.
 *
 * Started life as a set piece in the backdrop, at the Uplink keyframe. As a
 * background object it could only ever be glimpsed: small, off to one side,
 * and gone as soon as you scrolled. Brought into the section it can be
 * looked at, which is what it was worth building.
 *
 * ── Shading, with no lights ──────────────────────────────────────────────
 * §17.1 rules out a lighting rig, so form is faked in the fragment shader
 * from the surface normal against a fixed key direction. `gl_FrontFacing`
 * flips the normal on back faces; without it the inside of the dish shades
 * as though it were the outside, and the bowl reads as a flat disc.
 *
 * ── Rotation ─────────────────────────────────────────────────────────────
 * The pose is owned by the host, which passes a ref rather than a prop: a
 * drag updates it sixty times a second, and a prop would re-render this
 * component on every one of those frames (§19.2b's rule about React state
 * in a frame loop, applied to a much smaller scene).
 */

/** Ion Cyan — the Uplink band, from the source of truth (§3.3). */
const ION = bandForSection('uplink').hex;

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uOpacity;
  /** Solar-cell divisions. 0 on everything that is not an array. */
  uniform float uGrid;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;

    float key = max(dot(n, normalize(vec3(0.42, 0.78, 0.46))), 0.0);
    float shade = 0.24 + 0.76 * key;

    if (uGrid > 0.0) {
      // Cell seams: dark lines across the panel, denser along its length.
      vec2 cell = abs(fract(vUv * vec2(uGrid, uGrid * 0.34)) - 0.5);
      float seam = smoothstep(0.40, 0.5, max(cell.x, cell.y));
      shade *= 1.0 - seam * 0.55;
    }

    gl_FragColor = vec4(uColor * shade, uOpacity);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	return [
		Number.parseInt(h.slice(0, 2), 16) / 255,
		Number.parseInt(h.slice(2, 4), 16) / 255,
		Number.parseInt(h.slice(4, 6), 16) / 255,
	];
}

export interface Pose {
	/** Yaw and pitch in radians, written by the host's drag handler. */
	yaw: number;
	pitch: number;
	/** False once the visitor has taken hold of it. */
	auto: boolean;
}

interface Props {
	pose: Pose;
	/** Reduced motion stops the idle turn; the drag still works (§16.4). */
	spin: boolean;
	onReady: () => void;
}

export default function Model({ pose, spin, onReady }: Props) {
	const ref = useRef<Group>(null);
	const beacon = useRef<Group>(null);
	const announced = useRef(false);

	const materials = useMemo(() => {
		const rgb = hexToRgb(ION);
		/*
		 * `tint` scales the band hue per part. Ion Cyan is a light colour,
		 * and running every surface at full value made the whole craft read
		 * as white plastic — the arrays worst of all, since a photovoltaic
		 * panel is the darkest thing on a real satellite, not the brightest.
		 */
		const make = (
			opacity: number,
			grid: number,
			tint: number,
			doubleSided = false,
		) =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: {
					uColor: { value: rgb.map((c) => c * tint) as [number, number, number] },
					uOpacity: { value: opacity },
					uGrid: { value: grid },
				},
				/*
				 * Transparent, but STILL depth-writing. `depthWrite: false`
				 * is right for the additive layers in the backdrop — light
				 * being added, with no inside — and wrong for a solid object:
				 * without it the bus draws through the dish and the far array
				 * through the near one, and the whole assembly reads as
				 * panes of glass rather than a machine.
				 */
				transparent: true,
				depthWrite: true,
				...(doubleSided ? { side: DoubleSide } : {}),
			});

		return {
			bus: make(0.95, 0, 0.82),
			panel: make(0.92, 10, 0.38),
			dish: make(0.97, 0, 0.86, true),
			boom: make(0.9, 0, 0.6),
		};
	}, []);

	useFrame((state, delta) => {
		const group = ref.current;
		if (!group) return;

		if (!announced.current) {
			announced.current = true;
			onReady();
		}

		// The idle turn only advances while nobody is holding it.
		if (spin && pose.auto) pose.yaw += delta * 0.28;

		group.rotation.y = pose.yaw;
		group.rotation.x = pose.pitch;

		if (beacon.current) {
			// A transmit light, not a decoration: sharp on, slow decay.
			const pulse = Math.pow(
				(Math.sin(state.clock.elapsedTime * 2.1) + 1) * 0.5,
				6,
			);
			beacon.current.scale.setScalar(0.6 + pulse * 1.5);
		}
	});

	return (
		<group ref={ref}>
			{/* Bus — the spacecraft body everything else hangs off. */}
			<mesh material={materials.bus}>
				<boxGeometry args={[2.6, 2.2, 3.4]} />
			</mesh>

			{/* Booms and arrays. Two panels, cell-gridded by the shader. */}
			{[-1, 1].map((side) => (
				<group key={side}>
					<mesh position={[side * 2.6, 0, 0]} material={materials.boom}>
						<boxGeometry args={[2.6, 0.22, 0.22]} />
					</mesh>
					<mesh position={[side * 8.2, 0, 0]} material={materials.panel}>
						<boxGeometry args={[8.6, 0.12, 3.0]} />
					</mesh>
				</group>
			))}

			{/*
			  The high-gain antenna. A spherical cap rather than a cone: a cap
			  is genuinely a bowl, and the shader shades its inside surface
			  differently from its back, which is the whole read of a dish.

			  Canted rather than square-on. Pointed straight down the view
			  axis a paraboloid's silhouette is a circle, and it rendered as
			  a flat shaded disc with no bowl to it at all.
			*/}
			<group position={[0, 0.3, 3.2]} rotation={[-0.38, 0.34, 0]}>
				<mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.dish}>
					<sphereGeometry args={[2.6, 28, 12, 0, Math.PI * 2, 0, 0.85]} />
				</mesh>
				{/* Feed horn at the focus, on its stalk. */}
				<mesh position={[0, 0, 1.15]} material={materials.boom}>
					<coneGeometry args={[0.24, 0.5, 10]} />
				</mesh>
				<mesh position={[0, 0, 0.62]} material={materials.boom}>
					<boxGeometry args={[0.1, 0.1, 1.1]} />
				</mesh>
			</group>

			{/* Transmit beacon. Additive, so it reads as emitted light. */}
			<group ref={beacon} position={[0, 1.25, -1.4]}>
				<mesh>
					<sphereGeometry args={[0.24, 8, 6]} />
					<meshBasicMaterial
						color={ION}
						transparent
						blending={AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			</group>
		</group>
	);
}
