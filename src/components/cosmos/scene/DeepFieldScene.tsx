import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
	Component,
	type ErrorInfo,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from 'react';
import CameraRig from './CameraRig';
import GalaxySprites from './GalaxySprites';
import NebulaVolume from './NebulaVolume';
import StarField from './StarField';
import { degrade, useSceneTier, type SceneTier } from './useSceneTier';

/**
 * The spine — master plan §19.2a, §17.1.
 *
 * ONE canvas, fixed behind the page, aria-hidden, with zero focusable
 * children. The canvas is a LAYER, never a container: the DOM scrolls over
 * it, and deleting this element leaves the site complete (§25.0).
 *
 * Three things here are load-bearing rather than decorative:
 *  1. The art layer underneath NEVER unmounts, so a failed init or a lost
 *     context reveals a designed still rather than a black hole.
 *  2. It cross-fades in only after the first frame is drawn, so the visitor
 *     never sees a flash of empty canvas.
 *  3. Runtime degradation is one-way per session — never oscillate.
 */

/**
 * Anything slower than this is a stall (tab throttling, a long task, a
 * garbage-collection pause), not a slow frame. ~6 frames at 60fps.
 */
const STALL_THRESHOLD = 0.1;

/** Renders null on failure: never an error message over the design. */
class SceneBoundary extends Component<
	{ children: ReactNode; onError: () => void },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		if (import.meta.env.DEV) {
			console.warn('[scene] failed; art layer remains visible.', error, info);
		}
		this.props.onError();
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

/**
 * Frame governor: caps FPS on low tier, pauses when the tab is hidden, and
 * runs the one-way degradation ladder (§16.4).
 *
 * `frameloop="demand"` would stop R3F rendering entirely, so instead we own
 * invalidation: this component is the only thing that asks for frames.
 */
function FrameGovernor({
	tier,
	onDegrade,
	onFirstFrame,
}: {
	tier: SceneTier;
	onDegrade: () => void;
	onFirstFrame: () => void;
}) {
	const invalidate = useThree((s) => s.invalidate);
	const drawn = useRef(false);
	const last = useRef(0);
	const samples = useRef<number[]>([]);
	const overBudgetSince = useRef(0);
	const degraded = useRef(false);

	useEffect(() => {
		const onVisibility = () => {
			if (!document.hidden) invalidate();
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, [invalidate]);

	useFrame((state, delta) => {
		if (!drawn.current) {
			drawn.current = true;
			onFirstFrame();
		}

		// A hidden tab must do zero work (§26.3).
		if (document.hidden) return;

		// FPS cap on the low tier: saves battery and heat on phones.
		const minStep = 1 / tier.fps;
		last.current += delta;
		if (tier.fps < 60 && last.current < minStep) return;
		last.current = 0;

		if (degraded.current) return;

		/*
		 * Discard implausible deltas before they reach the rolling mean.
		 *
		 * A backgrounded or throttled tab produces frames hundreds of
		 * milliseconds apart, which looks identical to a device that cannot
		 * cope. Without this guard, a visitor who switches tabs for a few
		 * seconds returns to a permanently degraded scene — degradation is
		 * one-way by design, so a false positive is not recoverable.
		 *
		 * A stall also poisons the mean for the next second, so the buffer
		 * and the over-budget timer are both reset rather than merely skipped.
		 */
		if (delta > STALL_THRESHOLD) {
			samples.current.length = 0;
			overBudgetSince.current = 0;
			return;
		}

		// Rolling mean frame time. Degrade after 2s over budget, once.
		const buf = samples.current;
		buf.push(delta * 1000);
		if (buf.length > 60) buf.shift();
		const mean = buf.reduce((a, b) => a + b, 0) / buf.length;

		const budget = tier.fps >= 60 ? 20 : 34;
		if (buf.length >= 30 && mean > budget) {
			if (overBudgetSince.current === 0) {
				overBudgetSince.current = state.clock.elapsedTime;
			} else if (state.clock.elapsedTime - overBudgetSince.current > 2) {
				degraded.current = true;
				if (import.meta.env.DEV) {
					console.info(
						`[scene] frame time ${mean.toFixed(1)}ms over ${budget}ms — degrading once.`,
					);
				}
				onDegrade();
			}
		} else {
			overBudgetSince.current = 0;
		}
	});

	return null;
}

export default function DeepFieldScene() {
	const detected = useSceneTier();
	const [tier, setTier] = useState(detected);
	const [ready, setReady] = useState(false);
	const [failed, setFailed] = useState(false);

	// Tier 'none': no WebGL, saveData, or reduced motion on a weak device.
	// The art layer is the entire experience — a designed outcome (§16.4).
	const enabled = detected.name !== 'none';

	useEffect(() => {
		if (!enabled || typeof document === 'undefined') return;
		const onLost = (e: Event) => {
			e.preventDefault();
			// Do not attempt recovery: fade out and let the art show (§17.1).
			setFailed(true);
			if (import.meta.env.DEV) {
				console.warn('[scene] WebGL context lost; art layer revealed.');
			}
		};
		document.addEventListener('webglcontextlost', onLost, true);
		return () => document.removeEventListener('webglcontextlost', onLost, true);
	}, [enabled]);

	if (!enabled || failed) return null;

	/*
	 * The data-scene-* attributes below are test surface, not debug cruft:
	 * the Phase 6 tier-matrix test (§34.3) has to assert the scene mounted at
	 * the right fidelity, and this is the only way to observe that from
	 * outside the React tree.
	 */
	return (
		<div
			aria-hidden="true"
			role="presentation"
			data-scene-ready={ready || undefined}
			data-scene-tier={tier.name}
			data-scene-dpr={tier.dpr}
			data-scene-stars={tier.stars}
			className="pointer-events-none fixed inset-0 z-[var(--z-scene)] opacity-0 transition-opacity duration-[var(--duration-handover)] ease-soft data-[scene-ready]:opacity-100 motion-reduce:transition-none"
		>
			<SceneBoundary onError={() => setFailed(true)}>
				<Canvas
					dpr={Math.min(tier.dpr, typeof window === 'undefined' ? 1 : window.devicePixelRatio)}
					gl={{
						antialias: false,
						powerPreference: 'high-performance',
						alpha: true,
						// The art layer behind provides the ground; the canvas
						// must not paint over it.
						premultipliedAlpha: false,
					}}
					camera={{ position: [0, 0, 120], near: 0.1, far: 800 }}
					style={{ background: 'transparent' }}
				>
					<FrameGovernor
						tier={tier}
						onFirstFrame={() => setReady(true)}
						onDegrade={() => setTier((t) => degrade(t))}
					/>
					<CameraRig staticCamera={tier.staticCamera} />
					<StarField count={tier.stars} pixelRatio={tier.dpr} />
					<NebulaVolume layers={tier.nebulaLayers} />
					<GalaxySprites />
				</Canvas>
			</SceneBoundary>
		</div>
	);
}
