/**
 * Analytics — master plan §28. Seven events, no PII, no consent banner.
 *
 * Phase 3 registers the call sites; the provider is connected in Phase 8, so
 * every call is a no-op until then. That ordering is deliberate: it keeps
 * analytics from masking a performance problem during Phase 7, and it means
 * Phase 8 is configuration rather than a hunt for call sites.
 */

export type AnalyticsEvent =
	| 'dossier_download'
	| 'world_link_click'
	| 'uplink_copy_email'
	| 'uplink_social_click'
	| 'transmission_click'
	| 'instrument_interact'
	| 'section_reach';

type Props = Record<string, string | number | boolean>;

declare global {
	interface Window {
		/** Provider hook, wired in Phase 8. */
		__analytics?: (event: string, props?: Props) => void;
	}
}

export function track(event: AnalyticsEvent, props?: Props): void {
	if (typeof window === 'undefined') return;
	// No provider yet — silent by design, so local dev and CI stay quiet.
	window.__analytics?.(event, props);
}

/**
 * Delegated listener for declarative call sites: any element carrying
 * `data-analytics="<event>"` reports on activation, with `data-analytics-*`
 * attributes becoming event properties.
 *
 * One listener for the whole document rather than per-component handlers —
 * the same reasoning as the single scroll loop and single observer.
 */
export function initAnalytics(): () => void {
	if (typeof document === 'undefined') return () => {};

	const onActivate = (e: Event) => {
		const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
			'[data-analytics]',
		);
		if (!el) return;

		const event = el.dataset.analytics as AnalyticsEvent | undefined;
		if (!event) return;

		const props: Props = {};
		for (const [key, value] of Object.entries(el.dataset)) {
			if (key === 'analytics' || value === undefined) continue;
			if (!key.startsWith('analytics')) continue;
			const name = key.slice('analytics'.length);
			props[name.charAt(0).toLowerCase() + name.slice(1)] = value;
		}

		track(event, props);
	};

	document.addEventListener('click', onActivate, { passive: true });
	return () => document.removeEventListener('click', onActivate);
}
