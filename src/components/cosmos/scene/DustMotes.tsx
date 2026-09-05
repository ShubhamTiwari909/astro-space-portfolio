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
import { KEYFRAMES } from './flightPath';

/**
 * Near-field dust — master plan §4.1, §17.1.
 *
 * Everything else in this scene is far away: stars at hundreds of units,
 * nebula billboards at ninety, planets at sixty. That is why the flight
 * reads as stately even where it is meant to feel fast — with nothing close
 * to the camera there is no parallax to measure motion against, and the eye
 * cannot tell 2 units per second from 20.
 *
 * These motes are the only thing in the scene within arm's reach, which is
 * what makes the camera feel like it is moving rather than the sky like it
 * is drifting.
 *
 * ── Why they wrap rather than being placed along the path ────────────────
 * Dust spread across the whole flight would need tens of thousands of
 * points to hold this density, and all but a handful would be off-screen at
 * any moment. Instead a few hundred live in a box around the camera: a mote
 * that falls more than half a box away on any axis is teleported one box
 * length back, which puts it in front again at the same lateral offset.
 *
 * Between wraps each mote is a genuine fixed point in world space that the
 * camera moves past — the parallax is real, not simulated. Infinite dust
 * for a fixed cost.
 *
 * Decorative: inside the canvas, so §25.0 keeps it out of the a11y tree.
 */

const VERTEX = /* glsl */ `
  precision mediump float;

  attribute float aSize;

  uniform float uPixelRatio;
  uniform float uSpeed;

  varying float vFade;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;

    /*
     * Fade at both ends. A mote that wrapped in close would otherwise pop
     * into existence as a large blur, and distant ones would fight the star
     * field for the same pixels.
     */
    float near = smoothstep(1.5, 7.0, dist);
    float far = 1.0 - smoothstep(26.0, 46.0, dist);
    vFade = near * far;

    // Brighter while the camera moves: dust you notice only in motion,
    // which is exactly when it is doing its job.
    vFade *= 0.28 + uSpeed * 0.72;

    gl_Position = projectionMatrix * mv;
    // Perspective sizing, so a mote two units away is genuinely bigger.
    gl_PointSize = aSize * uPixelRatio * (14.0 / max(dist, 1.0));
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float falloff = 1.0 - smoothstep(0.0, 1.0, d);
    float alpha = falloff * falloff * vFade * 0.5;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/** Edge length of the wrap box, in world units. */
const BOX = 52;
const HALF = BOX / 2;
/** Camera travel per second that counts as "full speed" for brightness. */
const FULL_SPEED = 30;

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	return [
		Number.parseInt(h.slice(0, 2), 16) / 255,
		Number.parseInt(h.slice(2, 4), 16) / 255,
		Number.parseInt(h.slice(4, 6), 16) / 255,
	];
}

interface Props {
	count: number;
	pixelRatio: number;
}

export default function DustMotes({ count, pixelRatio }: Props) {
	const ref = useRef<Points>(null);

	const geometry = useMemo(() => {
		const rand = mulberry32(0x0_d05_7);
		const g = new BufferGeometry();

		// Seeded around the opening camera position, so no mote has to wrap
		// its way across 120 units on the first frame.
		const [sx, sy, sz] = KEYFRAMES[0].position;
		const positions = new Float32Array(count * 3);
		const sizes = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			positions[i * 3] = sx + (rand() - 0.5) * BOX;
			positions[i * 3 + 1] = sy + (rand() - 0.5) * BOX;
			positions[i * 3 + 2] = sz + (rand() - 0.5) * BOX;
			// Weighted small: a handful of motes carry the effect, and a
			// field of uniformly large ones reads as snow.
			sizes[i] = 0.35 + rand() * rand() * 1.5;
		}

		g.setAttribute('position', new BufferAttribute(positions, 3));
		g.setAttribute('aSize', new BufferAttribute(sizes, 1));
		// The field follows the camera, so any bounding sphere would be
		// stale every frame and culling would flicker it in and out.
		g.boundingSphere = null;
		return g;
	}, [count]);

	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: {
					uPixelRatio: { value: pixelRatio },
					uSpeed: { value: 0 },
					uColor: { value: hexToRgb(bandForSection('first-light').hex) },
				},
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
			}),
		[pixelRatio],
	);

	const previous = useRef(new Vector3());
	const started = useRef(false);
	const speed = useRef(0);

	useFrame((state, delta) => {
		if (!ref.current) return;
		const cam = state.camera.position;

		if (!started.current) {
			started.current = true;
			previous.current.copy(cam);
		}

		/*
		 * Smoothed, because a raw frame-to-frame camera delta is noisy
		 * enough to make the whole field flicker. Deltas above 100ms are
		 * stalls, not motion — the same rule the frame governors use.
		 */
		const travelled = delta > 0.1 ? 0 : cam.distanceTo(previous.current);
		previous.current.copy(cam);
		const instant = Math.min(1, travelled / Math.max(delta * FULL_SPEED, 1e-6));
		speed.current += (instant - speed.current) * 0.08;
		material.uniforms.uSpeed.value = speed.current;

		// Fold every mote back into the box centred on the camera. `while`
		// rather than `if` so a large jump — a hash link, a restored scroll
		// position — resolves in one frame instead of drifting for many.
		const attribute = geometry.getAttribute('position');
		const array = attribute.array as Float32Array;
		const centre = [cam.x, cam.y, cam.z];
		let moved = false;

		for (let i = 0; i < array.length; i += 3) {
			for (let axis = 0; axis < 3; axis++) {
				const index = i + axis;
				let offset = array[index] - centre[axis];
				while (offset > HALF) {
					array[index] -= BOX;
					offset -= BOX;
					moved = true;
				}
				while (offset < -HALF) {
					array[index] += BOX;
					offset += BOX;
					moved = true;
				}
			}
		}
		if (moved) attribute.needsUpdate = true;
	});

	return (
		<points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
	);
}
