import { useEffect, useRef, useState } from 'react';
import { SECTION_ORDER } from '../../lib/bands';
import { scrollState, subscribe } from '../../lib/scrollProgress';

/**
 * Bottom tab bar — master plan §7.3.
 *
 * Four primary items plus a MORE sheet. Additive only: the server renders a
 * static, functional bar; this island adds hide-on-scroll and the sheet.
 *
 * Two rules from the plan that are easy to get wrong:
 *  - the bar never hides while a focus ring is inside it (§7.3);
 *  - every target is >=44px, with the safe-area inset respected (§24.3).
 */

const PRIMARY = [
	{ id: 'first-light', label: 'Home', icon: 'home' },
	{ id: 'atlas', label: 'Skills', icon: 'atlas' },
	{ id: 'trajectory', label: 'Path', icon: 'trajectory' },
	{ id: 'worlds', label: 'Work', icon: 'worlds' },
] as const;

const OVERFLOW = [
	{ id: 'log', label: 'About' },
	{ id: 'instruments', label: 'Instrument Bay' },
	{ id: 'transmissions', label: 'Writing' },
	{ id: 'uplink', label: 'Uplink' },
] as const;

const ITEM_CLASS =
	'flex w-full min-h-[var(--tabbar-h)] cursor-pointer flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-1 py-1.5 font-mono text-[0.5625rem] tracking-[0.08em] text-ink-low uppercase no-underline transition-colors duration-[var(--duration-fast)] ease-ui data-[active]:text-accent';

function TabIcon({ name }: { name: string }) {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<use href={`#i-${name}`} />
		</svg>
	);
}

export default function MobileNav() {
	const [hidden, setHidden] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [activeId, setActiveId] = useState('first-light');
	const barRef = useRef<HTMLElement>(null);

	useEffect(() => {
		let lastIndex = -1;
		return subscribe(() => {
			const { velocity, progress, bandIndex } = scrollState;

			if (bandIndex !== lastIndex) {
				lastIndex = bandIndex;
				setActiveId(SECTION_ORDER[bandIndex] ?? 'first-light');
			}

			// Never hide while focus is inside the bar (§7.3), while the sheet
			// is open, or near the top of the page.
			if (barRef.current?.contains(document.activeElement) || sheetOpen) {
				setHidden(false);
				return;
			}
			if (progress < 0.04) {
				setHidden(false);
				return;
			}
			if (Math.abs(velocity) < 2) return;
			setHidden(velocity > 0);
		});
	}, [sheetOpen]);

	useEffect(() => {
		if (!sheetOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setSheetOpen(false);
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [sheetOpen]);

	return (
		<>
			{sheetOpen && (
				<div
					aria-hidden="true"
					onClick={() => setSheetOpen(false)}
					className="fixed inset-0 z-[var(--z-overlay)] bg-void/70"
				/>
			)}

			<nav
				aria-label="Sections"
				ref={barRef}
				data-hidden={hidden || undefined}
				className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] block border-t border-hairline bg-void/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-[var(--duration-fast)] ease-ui data-[hidden]:translate-y-full md:hidden"
			>
				<ul className="m-0 grid list-none grid-cols-5 p-0">
					{PRIMARY.map((item) => (
						<li key={item.id}>
							<a
								href={`#${item.id}`}
								aria-current={activeId === item.id ? 'true' : undefined}
								data-active={activeId === item.id || undefined}
								className={ITEM_CLASS}
							>
								<TabIcon name={item.icon} />
								<span>{item.label}</span>
							</a>
						</li>
					))}
					<li>
						<button
							type="button"
							aria-expanded={sheetOpen}
							onClick={() => setSheetOpen((v) => !v)}
							className={ITEM_CLASS}
						>
							<TabIcon name="more" />
							<span>More</span>
						</button>
					</li>
				</ul>

				{sheetOpen && (
					<ul className="absolute inset-x-0 bottom-full z-[calc(var(--z-overlay)+1)] m-0 list-none border-t border-hairline bg-surface-1 p-2">
						{OVERFLOW.map((item) => (
							<li key={item.id}>
								<a
									href={`#${item.id}`}
									onClick={() => setSheetOpen(false)}
									className="flex min-h-11 items-center px-4 font-mono text-label tracking-[0.14em] text-ink-hi uppercase no-underline"
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>
				)}
			</nav>
		</>
	);
}
