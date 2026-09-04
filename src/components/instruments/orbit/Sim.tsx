import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	ShaderMaterial,
	type Points,
} from 'three';
import {
	HISTORY,
	MASS_COUNT,
	MAX_PARTICLES,
	createState,
	step,
} from './physics';
import { DEGRADE_AFTER, DEGRADE_MS, STALL_S, STOP_MS } from './thresholds.ts';

/**
 * The rendered simulation — master plan §14.3.
 *
 * Trails are drawn as history *points* rather than a feedback buffer. The
 * usual trick (disable auto-clear, blend a dark quad over the previous
 * frame) fights R3F's render loop and leaves streaks whose length depends
 * on frame rate — so a slow device gets longer trails, which is precisely
 * backwards. Here every particle owns `HISTORY` vertices; age comes from a
 * *static* attribute compared against a uniform, so trail length is fixed
 * in simulation steps and identical on every device, and the per-frame cost
 * of ageing is zero.
 */

const VERTEX = /* glsl */ `
  precision mediump float;

  attribute float aHistory;
  attribute float aSpeed;

  uniform float uSlot;
  uniform float uHistory;
  uniform float uScale;

  varying float vAge;
  varying float vSpeed;

  void main() {
    // Age in simulation steps: how long ago this vertex was the head.
    vAge = mod(uSlot - aHistory + uHistory, uHistory) / uHistory;
    vSpeed = aSpeed;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // The head is largest; the tail tapers.
    gl_PointSize = uScale * mix(2.6, 0.7, vAge);
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;

  varying float vAge;
  varying float vSpeed;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(
      abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
      0.0, 1.0
    );
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    // Round points: discard outside the unit disc.
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d);
    if (r > 0.25) discard;

    /*
     * Colour encodes speed, which is the one thing a still image of an
     * n-body system cannot show: slow particles on wide orbits read blue,
     * fast ones whipping past an attractor read gold. The divisor is the
     * measured p99 speed of the settled system, not a guess — at the first
     * value (46) the ramp never left its blue end.
     */
    float v = clamp(vSpeed / 20.0, 0.0, 1.0);
    float hue = mix(0.72, 0.11, v);
    vec3 color = hsl2rgb(vec3(hue, 0.85, 0.52 + v * 0.26));

    float alpha = (1.0 - vAge) * 0.85 * smoothstep(0.25, 0.0, r);
    gl_FragColor = vec4(color, alpha);
  }
`;

/** The attractors themselves, drawn larger and brighter than the particles. */
const MASS_FRAGMENT = /* glsl */ `
  precision mediump float;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    // Bright core with a soft corona, so a mass reads as a source rather
    // than as a big particle.
    float core = smoothstep(0.22, 0.0, r);
    float halo = smoothstep(0.5, 0.12, r);
    vec3 color = mix(vec3(1.0, 0.78, 0.42), vec3(1.0), core);
    gl_FragColor = vec4(color, halo * 0.5 + core * 0.6);
  }
`;

const MASS_VERTEX = /* glsl */ `
  precision mediump float;
  uniform float uScale;
  attribute float aMass;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uScale * (3.0 + aMass * 0.55);
  }
`;

export interface Stats {
	fps: number;
	/**
	 * Frame *interval* — the gap between frames. On a healthy machine this
	 * pins to the display's refresh (16.7ms at 60Hz) and says nothing about
	 * how hard the simulation is working; it is the number the governor
	 * watches, because it is what rises when a device cannot keep up.
	 */
	intervalMs: number;
	/**
	 * CPU time this simulation spends per frame: integration plus the
	 * buffer uploads. Reported separately because conflating the two would
	 * make the panel claim 16.7ms of work when it does about a tenth of
	 * that — and an instrument that misreports itself is worse than none.
	 */
	simMs: number;
	particles: number;
	dpr: number;
	degraded: boolean;
}

interface Props {
	/** Mutable cursor target in world units. */
	cursor: { x: number; y: number; active: boolean };
	/** Written every frame; the parent samples it on a timer. */
	statsRef: { current: Stats };
	/** Called once when the sim gives up (§14.3's second stage). */
	onStop: () => void;
	/** Half-height of the visible world, used to fit the camera. */
	halfHeight: number;
	seed: number;
}


export default function Sim({
	cursor,
	statsRef,
	onStop,
	halfHeight,
	seed,
}: Props) {
	const pointsRef = useRef<Points>(null);
	const state = useMemo(() => createState(seed), [seed]);
	const camera = useThree((s) => s.camera);
	const size = useThree((s) => s.size);
	const viewportDpr = useThree((s) => s.viewport.dpr);

	const geometry = useMemo(() => {
		const g = new BufferGeometry();
		const count = MAX_PARTICLES * HISTORY;

		g.setAttribute('position', new BufferAttribute(state.trail, 3));
		g.setAttribute('aSpeed', new BufferAttribute(state.speed, 1));

		// Which history slot each vertex is. Static for the life of the
		// geometry, which is what makes ageing free.
		const history = new Float32Array(count);
		for (let i = 0; i < MAX_PARTICLES; i++) {
			for (let h = 0; h < HISTORY; h++) history[i * HISTORY + h] = h;
		}
		g.setAttribute('aHistory', new BufferAttribute(history, 1));
		g.setDrawRange(0, count);
		return g;
	}, [state]);

	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: VERTEX,
				fragmentShader: FRAGMENT,
				uniforms: {
					uSlot: { value: 0 },
					uHistory: { value: HISTORY },
					uScale: { value: 1 },
				},
				transparent: true,
				depthWrite: false,
				depthTest: false,
				blending: AdditiveBlending,
			}),
		[],
	);

	/** Attractor geometry: four vertices, rewritten each frame. */
	const massGeometry = useMemo(() => {
		const g = new BufferGeometry();
		const positions = new Float32Array(MASS_COUNT * 3);
		for (let i = 0; i < MASS_COUNT; i++) {
			positions[i * 3] = state.mx[i * 2];
			positions[i * 3 + 1] = state.mx[i * 2 + 1];
		}
		g.setAttribute('position', new BufferAttribute(positions, 3));
		g.setAttribute('aMass', new BufferAttribute(new Float32Array(state.mass), 1));
		return g;
	}, [state]);

	const massMaterial = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: MASS_VERTEX,
				fragmentShader: MASS_FRAGMENT,
				uniforms: { uScale: { value: 1 } },
				transparent: true,
				depthWrite: false,
				depthTest: false,
				blending: AdditiveBlending,
			}),
		[],
	);

	useEffect(
		() => () => {
			geometry.dispose();
			material.dispose();
			massGeometry.dispose();
			massMaterial.dispose();
		},
		[geometry, material, massGeometry, massMaterial],
	);

	/*
	 * Fit the orthographic camera to a fixed world half-height, so the
	 * simulation is framed identically at every window size and the
	 * pointer→world mapping in the parent stays a single divide.
	 */
	useEffect(() => {
		const ortho = camera as typeof camera & { zoom: number };
		ortho.zoom = size.height / (2 * halfHeight);
		camera.updateProjectionMatrix();
		// Point size is in device pixels, so it has to track zoom and DPR.
		material.uniforms.uScale.value = ortho.zoom * viewportDpr * 0.5;
		massMaterial.uniforms.uScale.value = ortho.zoom * viewportDpr * 0.5;
	}, [camera, size.height, halfHeight, material, massMaterial, viewportDpr]);

	// ---- frame governor (§14.3) ----
	const samples = useRef<number[]>([]);
	const overSince = useRef(0);
	const halved = useRef(false);
	const stopped = useRef(false);
	const fpsWindow = useRef({ frames: 0, since: 0 });

	useFrame((_, delta) => {
		if (stopped.current) return;
		const workStart = performance.now();

		/*
		 * Clamp before integrating. A backgrounded tab, a long GC pause or a
		 * breakpoint all produce multi-second deltas; feeding one to the
		 * integrator throws every particle to infinity. Clamping also means
		 * the simulation slows down rather than exploding on a slow device.
		 */
		const dt = Math.min(delta, 1 / 30);
		step(state, dt, cursor);

		const pos = geometry.getAttribute('position');
		const spd = geometry.getAttribute('aSpeed');
		pos.needsUpdate = true;
		spd.needsUpdate = true;
		material.uniforms.uSlot.value = state.slot;

		const massPos = massGeometry.getAttribute('position');
		const massArray = massPos.array as Float32Array;
		for (let i = 0; i < MASS_COUNT; i++) {
			massArray[i * 3] = state.mx[i * 2];
			massArray[i * 3 + 1] = state.mx[i * 2 + 1];
		}
		massPos.needsUpdate = true;

		// ---- telemetry ----
		const now = performance.now();
		const window_ = fpsWindow.current;
		window_.frames += 1;
		if (window_.since === 0) window_.since = now;
		const elapsed = now - window_.since;
		if (elapsed >= 500) {
			statsRef.current.fps = Math.round((window_.frames * 1000) / elapsed);
			window_.frames = 0;
			window_.since = now;
		}
		statsRef.current.intervalMs = delta * 1000;
		statsRef.current.particles = state.active;
		statsRef.current.dpr = viewportDpr;

		// Rolling mean of our own cost, so a single slow frame does not make
		// the readout jump around while someone is reading it.
		const work = performance.now() - workStart;
		statsRef.current.simMs = statsRef.current.simMs
			? statsRef.current.simMs * 0.9 + work * 0.1
			: work;

		// Stalls must not count toward degradation — see thresholds.ts.
		if (delta > STALL_S) {
			samples.current.length = 0;
			overSince.current = 0;
			return;
		}

		samples.current.push(delta * 1000);
		if (samples.current.length > 90) samples.current.shift();
		if (samples.current.length < 30) return;

		const mean =
			samples.current.reduce((a, b) => a + b, 0) / samples.current.length;
		const threshold = halved.current ? STOP_MS : DEGRADE_MS;

		if (mean <= threshold) {
			overSince.current = 0;
			return;
		}

		if (overSince.current === 0) {
			overSince.current = now;
			return;
		}
		if ((now - overSince.current) / 1000 < DEGRADE_AFTER) return;

		overSince.current = 0;
		samples.current.length = 0;

		if (!halved.current) {
			halved.current = true;
			state.active = Math.floor(state.active / 2);
			geometry.setDrawRange(0, state.active * HISTORY);
			statsRef.current.degraded = true;
			statsRef.current.particles = state.active;
		} else {
			stopped.current = true;
			onStop();
		}
	});

	return (
		<>
			<points
				ref={pointsRef}
				geometry={geometry}
				material={material}
				frustumCulled={false}
			/>
			<points
				geometry={massGeometry}
				material={massMaterial}
				frustumCulled={false}
			/>
		</>
	);
}

export { MASS_COUNT, MAX_PARTICLES };
