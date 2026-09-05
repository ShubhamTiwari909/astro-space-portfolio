import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	ShaderMaterial,
	Vector3,
	type Points,
} from 'three';
import { mulberry32 } from '../../../data/seed';
import { bandForSection } from '../../../lib/bands';

/**
 * Transients — master plan §4.1.
 *
 * Meteors that cross the view occasionally and are gone. Not a set piece:
 * an *event*, and the rarity is the design. §4.1 asks the opening beat to
 * be "nearly still", which is right, but nearly still is not the same as
 * dead — a sky where nothing ever happens stops being looked at. One streak
 * every ten or twenty seconds keeps it alive without adding a permanent
 * object competing for attention, and 95% of the time there is nothing on
 * screen at all.
 *
 * ── Cost ─────────────────────────────────────────────────────────────────
 * Three streaks of eight points each: 24 points, one draw call, one small
 * buffer rewritten only while something is actually flying. An idle
 * transient writes nothing.
 *
 * Seeded, so the sequence is identical on every load and every device —
 * a screenshot test can rely on it, and two visitors on the same scroll
 * position see the same sky.
 *
 * Ambient motion, so `prefers-reduced-motion` removes it entirely (§16.4):
 * a streak crossing the periphery is exactly the kind of unrequested
 * movement that setting exists to stop.
 */

const VERTEX = /* glsl */ `
  precision mediump float;

  attribute float aTail;

  uniform float uPixelRatio;

  varying float vTail;

  void main() {
    vTail = aTail;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // Head large, tail fine — the taper is what reads as direction.
    gl_PointSize = uPixelRatio * mix(3.4, 0.7, aTail) * (150.0 / max(-mv.z, 1.0));
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vTail;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float falloff = 1.0 - smoothstep(0.0, 1.0, d);
    // The tail fades along its length as well as tapering.
    float alpha = falloff * falloff * (1.0 - vTail) * uOpacity;
    if (alpha < 0.004) discard;
    // The head burns toward white; the tail keeps the band's hue.
    vec3 color = mix(vec3(1.0), uColor, smoothstep(0.0, 0.45, vTail));
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Streaks in the pool. Three is enough that two can overlap, rarely. */
const POOL = 3;
/** Points per streak. The tail is sampled, not swept. */
const SEGMENTS = 8;
/** Seconds a streak takes to cross. */
const LIFETIME = 1.35;
/** Idle range between appearances, per streak. */
const GAP_MIN = 7;
const GAP_MAX = 22;
/** How far ahead of the camera a streak is born. */
const AHEAD = 90;
const SPREAD = 150;
/** World length of the tail. */
const TAIL = 26;

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	return [
		Number.parseInt(h.slice(0, 2), 16) / 255,
		Number.parseInt(h.slice(2, 4), 16) / 255,
		Number.parseInt(h.slice(4, 6), 16) / 255,
	];
}

interface Streak {
	/** Seconds until this streak next appears; counts down while idle. */
	wait: number;
	/** Seconds remaining in the crossing; 0 when idle. */
	life: number;
	origin: Vector3;
	direction: Vector3;
	speed: number;
}

interface Props {
	pixelRatio: number;
	/** Reduced motion removes transients entirely. */
	enabled: boolean;
}

export default function Transients({ pixelRatio, enabled }: Props) {
	const ref = useRef<Points>(null);

	const geometry = useMemo(() => {
		const g = new BufferGeometry();
		const count = POOL * SEGMENTS;
		// Parked far behind the camera until a streak is actually alive, so
		// an idle pool draws nothing anyone can see.
		const positions = new Float32Array(count * 3).fill(1e5);
		const tail = new Float32Array(count);
		for (let s = 0; s < POOL; s++) {
			for (let i = 0; i < SEGMENTS; i++) {
				tail[s * SEGMENTS + i] = i / (SEGMENTS - 1);
			}
		}
		g.setAttribute('position', new BufferAttribute(positions, 3));
		g.setAttribute('aTail', new BufferAttribute(tail, 1));
		g.boundingSphere = null;
		return g;
	}, []);

	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: {
					uPixelRatio: { value: pixelRatio },
					uOpacity: { value: 0.9 },
					uColor: { value: hexToRgb(bandForSection('trajectory').hex) },
				},
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
			}),
		[pixelRatio],
	);

	const rand = useMemo(() => mulberry32(0x0_5731_4ea7), []);

	const streaks = useMemo<Streak[]>(
		() =>
			Array.from({ length: POOL }, (_, i) => ({
				// Staggered, so the first three do not arrive together.
				wait: 3 + i * 6,
				life: 0,
				origin: new Vector3(),
				direction: new Vector3(),
				speed: 0,
			})),
		[],
	);

	useFrame((state, delta) => {
		if (!ref.current || !enabled) return;
		// A stall is not elapsed time; advancing by it would fire every
		// streak at once on the frame a hidden tab comes back.
		const dt = delta > 0.1 ? 0 : delta;
		if (dt === 0) return;

		const attribute = geometry.getAttribute('position');
		const array = attribute.array as Float32Array;
		const cam = state.camera.position;
		let dirty = false;

		for (let s = 0; s < POOL; s++) {
			const streak = streaks[s];

			if (streak.life <= 0) {
				streak.wait -= dt;
				if (streak.wait > 0) continue;

				// Born ahead of the camera, crossing laterally rather than
				// toward it — a meteor heading at you is a stationary dot.
				streak.origin.set(
					cam.x + (rand() - 0.5) * SPREAD,
					cam.y + (rand() - 0.5) * SPREAD * 0.6,
					cam.z - AHEAD - rand() * 60,
				);
				streak.direction
					.set(rand() - 0.5, rand() - 0.5, rand() * 0.35 - 0.1)
					.normalize();
				streak.speed = 60 + rand() * 70;
				streak.life = LIFETIME;
			}

			streak.life -= dt;
			const elapsed = LIFETIME - streak.life;

			if (streak.life <= 0) {
				// Park it out of sight and schedule the next appearance.
				for (let i = 0; i < SEGMENTS; i++) {
					const v = (s * SEGMENTS + i) * 3;
					array[v] = 1e5;
					array[v + 1] = 1e5;
					array[v + 2] = 1e5;
				}
				streak.wait = GAP_MIN + rand() * (GAP_MAX - GAP_MIN);
				dirty = true;
				continue;
			}

			const headDistance = streak.speed * elapsed;
			for (let i = 0; i < SEGMENTS; i++) {
				const back = (i / (SEGMENTS - 1)) * TAIL;
				const along = Math.max(0, headDistance - back);
				const v = (s * SEGMENTS + i) * 3;
				array[v] = streak.origin.x + streak.direction.x * along;
				array[v + 1] = streak.origin.y + streak.direction.y * along;
				array[v + 2] = streak.origin.z + streak.direction.z * along;
			}
			dirty = true;
		}

		if (dirty) attribute.needsUpdate = true;
	});

	if (!enabled) return null;
	return (
		<points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
	);
}
