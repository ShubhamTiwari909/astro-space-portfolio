import Planet from './Planet';
import type { PlanetDatum } from './planetLayout';

/**
 * Catalogued Worlds in the scene — master plan §10.6.
 *
 * A thin wrapper: placement lives in planetLayout, appearance in Planet.
 * Kept separate so the tier can drop the atmosphere shell and lower the
 * subdivision without either of those files knowing about tiers.
 */
interface Props {
	planets: readonly PlanetDatum[];
	segments: number;
	atmosphere: boolean;
}

export default function PlanetSystem({ planets, segments, atmosphere }: Props) {
	return (
		<>
			{planets.map((datum, i) => (
				<Planet
					key={datum.slug}
					datum={datum}
					index={i}
					segments={segments}
					atmosphere={atmosphere}
				/>
			))}
		</>
	);
}
