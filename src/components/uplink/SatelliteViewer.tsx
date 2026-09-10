import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { prefersReducedMotion } from '../../lib/webglSupport';
import Model, { type Pose } from './satellite/Model';

/**
 * The satellite bay — the island that hosts the model (§14.3's pattern,
 * applied to the Uplink section).
 *
 * ── Why it is not in the backdrop any more ───────────────────────────────
 * It was a set piece at the Uplink keyframe, and as a background object it
 * could only be glimpsed: small, off-axis, and gone on the next scroll.
 * Here it can be turned over and looked at, which is the whole reason to
 * model a thing rather than suggest one.
 *
 * ── What this borrows from Orbit ─────────────────────────────────────────
 *  - No WebGL context until the host intersects, and `frameloop` suspended
 *    whenever it is off-screen or the tab is hidden. A canvas nobody can
 *    see must cost nothing (§26.3).
 *  - The Astro wrapper owns the still fallback underneath, and the canvas
 *    fades in over it once it has drawn a frame.
 *
 * Orbit additionally defers its own markup until after hydration, because
 * it server-renders a poster <img> that phones would otherwise download
 * twice. There is no image inside this island — the still lives in the
 * wrapper — so that gate would buy nothing here, and copying it caused a
 * real bug: the IntersectionObserver effect ran on mount while the
 * component was still returning null, found `hostRef.current` empty, and
 * with an empty dependency list never ran again. The canvas never mounted
 * at all.
 *
 * ── Why it does NOT stand the backdrop down ──────────────────────────────
 * Orbit does, and copying it here was wrong. Orbit is a 4,000-particle
 * n-body sim that measured ~18ms a frame against the backdrop; this is six
 * small meshes. And the cost of suspending is specific and bad: this bay
 * becomes visible exactly as the visitor reaches the Uplink section, which
 * is where the flight performs its finale — the camera turning to look back
 * down everything it crossed. Holding the backdrop's last frame froze that
 * finale mid-flight, so the closing beat simply never played, and the
 * section sat in front of a stalled frame of the planet system.
 *
 * ── What it does differently ─────────────────────────────────────────────
 * Mounted with `client:capable`, not `client:media`. This is decoration
 * rather than an experiment with a hard width boundary, and the directive
 * already asks the two questions that matter: no WebGL, or a visitor who
 * asked for less data, and the chunk is never fetched (§24.2).
 *
 * ── Accessibility ────────────────────────────────────────────────────────
 * Decorative, so `aria-hidden` and no tab stop (§25.0) — and because of
 * that, nothing may live only behind the drag. The model turns on its own,
 * so every side is shown to everyone; dragging only lets you stop it and
 * choose. Under `prefers-reduced-motion` the idle turn does not run and the
 * model sits still, with the drag still available (§16.4).
 */

export default function SatelliteViewer() {
	const hostRef = useRef<HTMLDivElement>(null);
	/* A ref, not state: a drag writes this every frame. */
	const pose = useRef<Pose>({ yaw: -0.6, pitch: 0.22, auto: true });
	const drag = useRef({ active: false, x: 0, y: 0 });

	const [visible, setVisible] = useState(false);
	const [everVisible, setEverVisible] = useState(false);
	const [tabVisible, setTabVisible] = useState(true);
	const [ready, setReady] = useState(false);
	const [spin] = useState(() => !prefersReducedMotion());

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
			{ rootMargin: '200px' },
		);
		observer.observe(host);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const onVisibility = () => setTabVisible(!document.hidden);
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, []);

	const active = visible && tabVisible;

	function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
		drag.current = { active: true, x: event.clientX, y: event.clientY };
		// Taking hold stops the idle turn for good: having it resume under
		// the visitor's hand is the thing that makes these feel broken.
		pose.current.auto = false;
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		if (!drag.current.active) return;
		const dx = event.clientX - drag.current.x;
		const dy = event.clientY - drag.current.y;
		drag.current.x = event.clientX;
		drag.current.y = event.clientY;
		pose.current.yaw += dx * 0.008;
		// Clamped: past vertical the model reads as upside down rather than
		// as turned over.
		pose.current.pitch = Math.min(
			0.9,
			Math.max(-0.9, pose.current.pitch + dy * 0.006),
		);
	}

	function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
		if (!drag.current.active) return;
		drag.current.active = false;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	return (
		<div
			ref={hostRef}
			aria-hidden="true"
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={endDrag}
			onPointerCancel={endDrag}
			data-satellite-host
			data-satellite-ready={ready ? '' : undefined}
			className="absolute inset-0 cursor-grab touch-pan-y opacity-0 transition-opacity duration-(--duration-handover) ease-soft active:cursor-grabbing data-satellite-ready:opacity-100 motion-reduce:transition-none"
		>
			{everVisible && (
				<Canvas
					frameloop={active ? 'always' : 'never'}
					dpr={[1, 1.75]}
					camera={{ position: [0, 3.4, 27], fov: 42, near: 0.1, far: 120 }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'low-power',
					}}
					style={{ background: 'transparent' }}
				>
					<Model pose={pose.current} spin={spin} onReady={() => setReady(true)} />
				</Canvas>
			)}
		</div>
	);
}
