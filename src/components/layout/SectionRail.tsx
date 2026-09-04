import { useEffect, useRef, useState } from 'react';
import { BANDS } from '../../lib/bands';
import { scrollState, subscribe } from '../../lib/scrollProgress';

/**
 * The declination rail — master plan §7.2.
 *
 * Additive only: the server renders a complete, working anchor list, and
 * this island adds the active state and the progress fill. Delete its JS and
 * navigation still works.
 *
 * Reads scroll from the shared singleton rather than adding a listener
 * (§19.2b), and keeps per-frame work out of React: the progress fill is a
 * scale written to a ref, and setState fires only when the active section
 * actually changes.
 */

const LABELS: Record<string, string> = {
	'first-light': 'Home',
	log: 'About',
	atlas: 'Skills',
	trajectory: 'Experience',
	worlds: 'Projects',
	instruments: 'Lab',
	transmissions: 'Writing',
	uplink: 'Contact',
};

export default function SectionRail() {
	const [activeIndex, setActiveIndex] = useState(0);
	const fillRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let lastIndex = -1;
		return subscribe(() => {
			// scaleY on a ref: no React render per frame (§22).
			fillRef.current?.style.setProperty('scale', `1 ${scrollState.progress}`);
			if (scrollState.bandIndex !== lastIndex) {
				lastIndex = scrollState.bandIndex;
				setActiveIndex(scrollState.bandIndex);
			}
		});
	}, []);

	return (
		<nav
			aria-label="Sections"
			className="group/rail fixed end-0 top-1/2 z-[var(--z-rail)] hidden -translate-y-1/2 items-center gap-3 pe-4 lg:flex"
		>
			<ul className="order-1 m-0 grid list-none gap-1 p-0 text-end">
				{BANDS.map((band, index) => (
					<li key={band.section}>
						<a
							href={`#${band.section}`}
							aria-current={index === activeIndex ? 'true' : undefined}
							data-active={index === activeIndex || undefined}
							className="group/tick flex min-h-[1.375rem] items-center justify-end gap-2 px-1 text-ink-low no-underline transition-colors duration-[var(--duration-base)] ease-ui hover:text-ink-hi data-[active]:text-accent"
						>
							<span
								aria-hidden="true"
								className="block h-px w-1.5 bg-current transition-[width] duration-[var(--duration-base)] ease-ui group-data-[active]/tick:w-3 group-data-[active]/tick:shadow-glow-1"
							/>
							<span className="font-mono text-[0.625rem] tracking-[0.14em] uppercase opacity-0 transition-opacity duration-[var(--duration-fast)] ease-ui group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 group-data-[active]/tick:opacity-100 2xl:opacity-100">
								{LABELS[band.section]}
							</span>
						</a>
					</li>
				))}
			</ul>

			{/* Axis: a hairline that fills top-to-bottom with scroll progress. */}
			<div aria-hidden="true" className="relative order-2 h-44 w-px bg-hairline">
				<div
					ref={fillRef}
					style={{ scale: '1 0' }}
					className="absolute inset-0 origin-top bg-linear-to-b from-transparent to-accent"
				/>
			</div>
		</nav>
	);
}
