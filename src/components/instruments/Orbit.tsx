import { Canvas } from '@react-three/fiber';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { track } from '../../lib/analytics';
import { prefersReducedMotion } from '../../lib/webglSupport';
import { holdSceneSuspend } from '../../lib/sceneSuspend';
import type { Stats } from './orbit/Sim';
import { DEGRADE_MS, STOP_MS } from './orbit/thresholds.ts';
import { MASS_COUNT, MAX_PARTICLES } from './orbit/physics';

/**
 * I-04 Orbit — master plan §14.3, Phase 5 tasks 5–8.
 *
 * This island exists only at ≥1024px. It is mounted with `client:media`
 * rather than `client:visible`, which is a deliberate reading of §14.3:
 * Astro allows exactly one client directive per component, and of the two
 * the plan names, `client:media` is the one enforcing the hard boundary
 * ("never downloaded on phones or tablets"). What `client:visible` would
 * have bought — never doing work for a section nobody scrolled to — is
 * reproduced here instead, and more precisely: no WebGL context is created
 * until the container intersects, and the frame loop is suspended whenever
 * the canvas is off-screen or the tab is hidden. Task 7 required that
 * observer regardless, so nothing is lost.
 *
 * Three states, and the visitor can always get back to a still frame:
 *
 *  - `idle`     — the poster, plus START. The initial state under
 *                 `prefers-reduced-motion`, because ambient motion must be
 *                 chosen rather than imposed (§16.4).
 *  - `running`  — canvas live, telemetry updating.
 *  - `stopped`  — the simulation gave up (or was stopped). Poster returns,
 *                 with the reason stated.
 */

// The simulation is a separate chunk so the poster path never parses it.
const Sim = lazy(() => import('./orbit/Sim'));

/** §14.3's hard cap on the drawing surface, in CSS pixels. */
const MAX_W = 1200;
const MAX_H = 700;
/**
 * World half-height the camera is fitted to. Set from the measured particle
 * distribution — radius p50 is ~49 and p90 ~63 once the system settles — so
 * the disc fills the frame while its sparse outer edge crops, rather than
 * sitting small in the middle. The first value (56) predated retuning the
 * initial conditions, when particles were being ejected past 100 units.
 */
const HALF_HEIGHT = 62;
const SEED = 0x0_4b17;

type Phase = 'idle' | 'running' | 'stopped';

interface Props {
	/** Optimised poster, from astro:assets. */
	poster: string;
	posterWidth: number;
	posterHeight: number;
	/** The accessible equivalent of the canvas (§14.5). */
	description: string;
}

const ZERO: Stats = {
	fps: 0,
	intervalMs: 0,
	simMs: 0,
	particles: MAX_PARTICLES,
	dpr: 1,
	degraded: false,
};

export default function Orbit({
	poster,
	posterWidth,
	posterHeight,
	description,
}: Props) {
	const hostRef = useRef<HTMLDivElement>(null);
	const statsRef = useRef<Stats>({ ...ZERO });
	const cursor = useRef({ x: 0, y: 0, active: false });

	// Reduced motion decides the opening state, so it is read once, lazily.
	const [phase, setPhase] = useState<Phase>(() =>
		prefersReducedMotion() ? 'idle' : 'running',
	);
	const [stopReason, setStopReason] = useState<string | null>(null);
	const [visible, setVisible] = useState(false);
	const [tabVisible, setTabVisible] = useState(true);
	/** Sticky: once a context exists, keep it rather than churning GL. */
	const [everVisible, setEverVisible] = useState(false);
	/*
	 * Astro server-renders an island's markup regardless of its client
	 * directive — `client:media` gates hydration, not HTML. So the poster
	 * <img> shipped inside this island at every width, and below 1024px
	 * (where the island's whole box is display:none) Chrome fetched it
	 * anyway: measured, mobile requested the poster TWICE, once here and
	 * once from OrbitPoster. Rendering the image only after hydration
	 * removes the duplicate on exactly the devices the plan protects, and
	 * costs no layout shift because the host box already reserves its
	 * aspect ratio.
	 */
	const [hydrated, setHydrated] = useState(false);
	const [stats, setStats] = useState<Stats>({ ...ZERO });

	useEffect(() => setHydrated(true), []);

	// ---- never run unseen (task 7) ----
	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				setVisible(entry.isIntersecting);
				if (entry.isIntersecting) setEverVisible(true);
			},
			// token-lint-ignore: IntersectionObserver rootMargin is a DOM API
			// argument, not a style value; it cannot take a custom property.
			{ rootMargin: '120px' },
		);
		observer.observe(host);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const onVisibility = () => setTabVisible(!document.hidden);
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, []);

	const active = phase === 'running' && visible && tabVisible;

	/*
	 * Stand the backdrop down while the simulation runs. Both scenes blend
	 * additive points on the same GPU, and sharing it cost ~18ms per frame
	 * — enough for Orbit to trip its own 20ms degrade threshold because of
	 * work it does not do, and to report the page's frame time as its own.
	 */
	useEffect(() => {
		if (!active) return;
		return holdSceneSuspend();
	}, [active]);

	/*
	 * Telemetry is sampled on a timer, not driven from the frame loop.
	 * Calling setState 60 times a second would re-render this component
	 * (and its children) 60 times a second, which would itself become the
	 * reason the frame budget was missed. 4Hz is faster than anyone reads.
	 */
	useEffect(() => {
		if (!active) return;
		const id = window.setInterval(() => setStats({ ...statsRef.current }), 250);
		return () => window.clearInterval(id);
	}, [active]);

	function start() {
		statsRef.current = { ...ZERO };
		setStopReason(null);
		setPhase('running');
		track('instrument_interact', { instrument: 'orbit', action: 'start' });
	}

	function stop() {
		setPhase('stopped');
		setStopReason('Stopped.');
		track('instrument_interact', { instrument: 'orbit', action: 'stop' });
	}

	function onAutoStop() {
		setPhase('stopped');
		// Interpolated from the thresholds themselves, so the message can
		// never drift from the behaviour it describes.
		setStopReason(
			`Stopped automatically: frame interval stayed above ${STOP_MS}ms after halving the particle count at ${DEGRADE_MS}ms.`,
		);
		track('instrument_interact', { instrument: 'orbit', action: 'auto_stop' });
	}

	/** Pointer → world units. The camera is fitted to a fixed half-height. */
	function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		const host = hostRef.current;
		if (!host) return;
		const rect = host.getBoundingClientRect();
		const scale = (2 * HALF_HEIGHT) / rect.height;
		cursor.current.x = (event.clientX - rect.left - rect.width / 2) * scale;
		cursor.current.y = -(event.clientY - rect.top - rect.height / 2) * scale;
		cursor.current.active = true;
	}

	const running = phase === 'running';

	return (
		<div className="grid gap-5">
			<div className="grid gap-5 xl:grid-cols-[1fr_13rem] xl:items-start">
				{/*
				  aria-hidden covers the whole visual surface — canvas or
				  poster. The paragraph below is the accessible equivalent, so
				  exposing a decorative image as well would only add noise.
				*/}
				<div
					ref={hostRef}
					data-orbit-host
					data-orbit-phase={phase}
					aria-hidden="true"
					onPointerMove={running ? onPointerMove : undefined}
					onPointerLeave={() => {
						cursor.current.active = false;
					}}
					className="relative w-full overflow-hidden rounded-card border border-hairline bg-void"
					style={{
						maxWidth: `${MAX_W}px`,
						aspectRatio: `${MAX_W} / ${MAX_H}`,
						maxHeight: `${MAX_H}px`,
					}}
				>
					{running && everVisible ? (
						<Suspense fallback={null}>
							<Canvas
								orthographic
								camera={{ position: [0, 0, 100], zoom: 8 }}
								dpr={[1, 1.5]}
								frameloop={active ? 'always' : 'never'}
								gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
								style={{ position: 'absolute', inset: 0 }}
							>
								<Sim
									cursor={cursor.current}
									statsRef={statsRef}
									onStop={onAutoStop}
									halfHeight={HALF_HEIGHT}
									seed={SEED}
								/>
							</Canvas>
						</Suspense>
					) : (
						hydrated && (
							<img
								src={poster}
								width={posterWidth}
								height={posterHeight}
								alt=""
								decoding="async"
								className="absolute inset-0 h-full w-full object-cover"
							/>
						)
					)}
				</div>

				<Telemetry stats={stats} running={running} />
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<button
					type="button"
					aria-pressed={running}
					onClick={running ? stop : start}
					className="rounded-chip border border-accent/60 px-4 py-2 font-mono text-label tracking-[0.14em] text-accent uppercase transition-colors duration-(--duration-fast) ease-ui hover:border-accent hover:bg-accent/10 focus-visible:outline-2"
				>
					{running ? 'Stop simulation' : 'Start simulation'}
				</button>

				{stopReason && (
					<p role="status" className="text-data text-ink-low">
						{stopReason}
					</p>
				)}
			</div>

			<p className="max-w-(--prose) text-body text-ink-mid">{description}</p>
		</div>
	);
}

/**
 * The readouts. `aria-live="off"` is not laziness — numbers changing four
 * times a second would make a screen reader unusable, and the adjacent
 * description already says what the simulation is.
 */
function Telemetry({ stats, running }: { stats: Stats; running: boolean }) {
	const rows: [string, string][] = [
		['FPS', running && stats.fps ? String(stats.fps) : '—'],
		[
			'Interval',
			running && stats.intervalMs ? `${stats.intervalMs.toFixed(1)}ms` : '—',
		],
		['Sim', running && stats.simMs ? `${stats.simMs.toFixed(2)}ms` : '—'],
		['Particles', String(running ? stats.particles : MAX_PARTICLES)],
		['Masses', String(MASS_COUNT)],
		['DPR', running && stats.dpr ? stats.dpr.toFixed(2) : '—'],
		['State', running ? (stats.degraded ? 'Degraded' : 'Nominal') : 'Idle'],
	];

	return (
		<dl
			aria-live="off"
			className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 rounded-card border border-hairline bg-surface-1/60 p-4 font-mono text-[0.6875rem] tracking-[0.08em] uppercase xl:grid-cols-1"
		>
			{rows.map(([label, value]) => (
				<div key={label} className="flex items-baseline justify-between gap-3">
					<dt className="text-ink-low">{label}</dt>
					<dd
						className={`m-0 tabular-nums ${
							label === 'State' && stats.degraded && running
								? 'text-danger'
								: 'text-ink-hi'
						}`}
					>
						{value}
					</dd>
				</div>
			))}
		</dl>
	);
}
