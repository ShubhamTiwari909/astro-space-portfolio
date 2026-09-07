/**
 * The `client:capable` directive — master plan §24.2, Phase 7 task 2.
 *
 * `useSceneTier` documents that when there is no WebGL, or the visitor has
 * asked for less data, "the art layer is the entire experience and no chunk
 * is fetched". That was not true. Under `client:idle` the browser fetched
 * and parsed the 227KB scene chunk first, and only then ran the check that
 * decided to render nothing — so the one group of visitors the bail-out
 * exists to protect paid the entire cost of it.
 *
 * This directive moves the decision in front of the download. It runs at
 * idle, asks the same two questions `detect()` asks, and only then calls
 * `load()` — which is what triggers the fetch.
 *
 * Deliberately only the two hard disqualifiers. Everything else — core
 * count, memory, viewport, reduced motion — chooses a *fidelity*, and that
 * is the tier ladder's job once the scene is running. A directive that
 * second-guessed the ladder would be a second, silent copy of it.
 *
 * ── Why it waits for `load` and not just for idle ────────────────────────
 * `requestIdleCallback` measures the MAIN THREAD, not the network. The main
 * thread is idle almost immediately on this page — there is barely any
 * blocking script — so the callback fired while the stylesheet, both
 * preloaded fonts and the opening art plate were still in flight, and the
 * scene's 212KB joined that queue. Lighthouse's own dependency tree named
 * the result: the longest chain on the home route was
 * `/` → `DeepFieldScene.js` → `react-three-fiber.esm.js`, and first paint
 * came out bimodal — ~1450ms when the fetch lost the race, ~2290ms when it
 * won — because 212KB on a throttled connection is about 800ms of someone
 * else's bandwidth.
 *
 * Waiting for `load` costs the scene nothing it can spend. The art layer
 * (§17.1) has already painted the opening plate, the scene cross-fades over
 * it rather than replacing it, and the opening beat is "nearly still" by
 * §4.1 — so arriving a few hundred milliseconds later is invisible, while
 * arriving early is measurable.
 */
export default (load) => {
	const start = async () => {
		const { hasWebGL, prefersLessData } = await import('./webglSupport');

		// Checked before load(), because load() is the fetch.
		if (!hasWebGL() || prefersLessData()) return;

		const hydrate = await load();
		await hydrate();
	};

	/** Main thread quiet AND the critical path finished. */
	const whenIdle = () => {
		if ('requestIdleCallback' in window) {
			// The same timeout Astro's own client:idle uses, so behaviour on
			// a busy main thread is unchanged for capable devices.
			window.requestIdleCallback(start, { timeout: 2000 });
		} else {
			setTimeout(start, 200);
		}
	};

	if (document.readyState === 'complete') {
		whenIdle();
	} else {
		window.addEventListener('load', whenIdle, { once: true });
	}
};
