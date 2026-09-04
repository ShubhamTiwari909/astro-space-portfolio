/**
 * Lets one WebGL exhibit stand down the backdrop scene.
 *
 * `/instruments` is the only route with two WebGL contexts: the persistent
 * Deep Field backdrop, and Orbit. Measured, the problem is not the physics
 * — that is 0.1ms per step — it is that both scenes are blending large
 * numbers of additive points on the same GPU, and the page was landing at
 * ~18ms per frame with Orbit's own degrade threshold set at 20ms.
 *
 * Two things were wrong with that. Orbit would degrade itself because of
 * work it does not do, and its telemetry — the entire point of the exhibit
 * — would be reporting the *page's* frame time while labelled as the
 * simulation's. So while Orbit is running the backdrop suspends its frame
 * loop. It keeps its context and its last frame, so nothing flickers and
 * nothing is re-initialised; it simply stops asking for frames.
 *
 * A counter rather than a boolean: if a second exhibit is ever added, two
 * overlapping suspensions must not have the first one to finish resume the
 * backdrop underneath the second.
 *
 * Deliberately not React state. The publisher is an island and the consumer
 * is a different island, and a module singleton is how this codebase
 * already crosses that gap (see `worldFocus`, `scrollProgress`).
 */

let holds = 0;
const listeners = new Set<(suspended: boolean) => void>();

function notify(): void {
	const suspended = holds > 0;
	for (const listener of listeners) listener(suspended);
}

/** Take or release a suspension hold. Returns nothing; call it in an effect. */
export function holdSceneSuspend(): () => void {
	holds += 1;
	if (holds === 1) notify();
	let released = false;
	return () => {
		// Guard against a double release, which would let holds go negative
		// and strand the backdrop suspended.
		if (released) return;
		released = true;
		holds -= 1;
		if (holds === 0) notify();
	};
}

export function isSceneSuspended(): boolean {
	return holds > 0;
}

export function subscribeSceneSuspend(
	listener: (suspended: boolean) => void,
): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
