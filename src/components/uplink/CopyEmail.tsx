import { useEffect, useRef, useState } from 'react';
import { track } from '../../lib/analytics';

/**
 * Copy-to-clipboard — master plan §15.3.
 *
 * A separate <button> beside the mailto link, never nested inside it. The
 * email is plain text in the HTML: obfuscation breaks copy/paste and screen
 * readers for negligible spam benefit, and the address is already public on
 * GitHub and dev.to.
 *
 * Failure path matters here — `navigator.clipboard` is unavailable in
 * insecure contexts and can be permission-denied. When it fails we select
 * the address instead and say so, rather than silently doing nothing.
 */

type State = 'idle' | 'copied' | 'selected';

const LABEL: Record<State, string> = {
	idle: 'Copy',
	copied: 'Copied ✓',
	selected: 'Selected — press ⌘C',
};

interface Props {
	email: string;
	/** Id of the element holding the address, for the selection fallback. */
	targetId: string;
}

export default function CopyEmail({ email, targetId }: Props) {
	const [state, setState] = useState<State>('idle');
	const timer = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	function announce(next: State) {
		setState(next);
		window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => setState('idle'), 2000);
	}

	function selectFallback() {
		const node = document.getElementById(targetId);
		if (!node) return;
		const range = document.createRange();
		range.selectNodeContents(node);
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
		announce('selected');
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(email);
			announce('copied');
			track('uplink_copy_email');
		} catch {
			selectFallback();
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={copy}
				aria-label="Copy email address"
				className="shrink-0 cursor-pointer rounded-chip border border-accent/35 bg-transparent px-3 py-2 font-mono text-label tracking-[0.14em] text-ink-hi uppercase transition-colors duration-[var(--duration-fast)] ease-ui hover:border-accent/60 hover:bg-surface-2 data-[state=copied]:border-accent data-[state=copied]:text-accent"
				data-state={state}
			>
				{LABEL[state]}
			</button>

			{/* Polite and empty until something happens, so it never
			    interrupts (§15.3). Focus deliberately does not move. */}
			<span aria-live="polite" className="sr-only">
				{state === 'copied' && 'Email address copied to clipboard'}
				{state === 'selected' && 'Email address selected. Press Command or Control C to copy.'}
			</span>
		</>
	);
}
