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
 */
export default (load) => {
	const start = async () => {
		const { hasWebGL, prefersLessData } = await import('./webglSupport');

		// Checked before load(), because load() is the fetch.
		if (!hasWebGL() || prefersLessData()) return;

		const hydrate = await load();
		await hydrate();
	};

	if ('requestIdleCallback' in window) {
		// The same timeout Astro's own client:idle uses, so behaviour on a
		// busy main thread is unchanged for capable devices.
		window.requestIdleCallback(start, { timeout: 2000 });
	} else {
		setTimeout(start, 200);
	}
};
