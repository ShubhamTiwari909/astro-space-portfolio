/**
 * The eight spectral bands — master plan §3.3.
 *
 * Each section owns one accent hue, drawn from a real emission line or
 * stellar source. The hue drives the DOM's accents (via --band) and, from
 * Phase 4, the scene's key light and nebula tint — both reading from here so
 * they can never disagree.
 *
 * Hex values are duplicated in global.css as --band-* because CSS needs them
 * before JS runs. This file is the source of truth for anything scripted;
 * if you change one, change both (the token lint catches strays elsewhere).
 */

export interface Band {
	/** Section anchor id this band belongs to. */
	readonly section: string;
	/** Human name, shown on /dev/tokens. */
	readonly name: string;
	readonly hex: string;
	/** Space-separated channels, so the scene can use it as a uniform. */
	readonly rgb: readonly [number, number, number];
	/** Physical source — this is what keeps the palette honest (§3.3). */
	readonly source: string;
	/** Measured contrast ratio against --color-void #04060D (§25.2). */
	readonly contrastOnVoid: number;
	/** Backdrop plate for this band (§3.4). */
	readonly plate: string;
}

export const BANDS: readonly Band[] = [
	{
		section: 'first-light',
		name: 'Ion Cyan',
		hex: '#7DE2FF',
		rgb: [125, 226, 255],
		source: 'O III / instrument starlight',
		contrastOnVoid: 13.0,
		plate: 'field-deep',
	},
	{
		section: 'log',
		name: 'Nebula Magenta',
		hex: '#FF5FA2',
		rgb: [255, 95, 162],
		source: 'H-alpha hydrogen emission',
		contrastOnVoid: 7.4,
		plate: 'nebula-magenta',
	},
	{
		section: 'atlas',
		name: 'Stellar Blue',
		hex: '#8FB8FF',
		rgb: [143, 184, 255],
		source: 'Hot O/B-type young stars',
		contrastOnVoid: 9.8,
		plate: 'cluster-blue',
	},
	{
		section: 'trajectory',
		name: 'Solar Ember',
		hex: '#FFB454',
		rgb: [255, 180, 84],
		source: 'G-type stellar warmth / ion engine',
		contrastOnVoid: 10.9,
		plate: 'trail-ember',
	},
	{
		section: 'worlds',
		name: 'Plasma Violet',
		hex: '#A78BFA',
		rgb: [167, 139, 250],
		source: 'Deep-space reflection nebulae',
		contrastOnVoid: 7.9,
		plate: 'system-violet',
	},
	{
		section: 'instruments',
		name: 'Aurora Green',
		hex: '#5BE9B9',
		rgb: [91, 233, 185],
		source: 'O III aurora / oxygen airglow',
		contrastOnVoid: 11.6,
		plate: 'station-aurora',
	},
	{
		section: 'transmissions',
		name: 'Signal Gold',
		hex: '#FFD76E',
		rgb: [255, 215, 110],
		source: 'Sodium line / relay beacon',
		contrastOnVoid: 13.1,
		plate: 'relay-gold',
	},
	{
		// Closes the loop where it began (§4).
		section: 'uplink',
		name: 'Ion Cyan',
		hex: '#7DE2FF',
		rgb: [125, 226, 255],
		source: 'O III / instrument starlight',
		contrastOnVoid: 13.0,
		plate: 'field-deep',
	},
] as const;

/** Section ids in flight-path order (§4.1). Also the rail's order. */
export const SECTION_ORDER: readonly string[] = BANDS.map((b) => b.section);

export function bandForSection(section: string): Band {
	return BANDS.find((b) => b.section === section) ?? BANDS[0];
}

/**
 * A band's colour as a normalised RGB triplet, for use as a shader uniform.
 *
 * Set pieces in the scene must take their colour from here rather than
 * hardcoding one: the whole point of §3.3 is that page and scene cannot
 * disagree about a band's hue, and a literal in a shader is exactly how that
 * guarantee would quietly rot.
 */
export function bandUniform(section: string): [number, number, number] {
	const { rgb } = bandForSection(section);
	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

/** Distinct plates — `field-deep` serves both the first and last band. */
export const PLATES: readonly string[] = [...new Set(BANDS.map((b) => b.plate))];
