import type { ThemeRegistration } from 'shiki';

/**
 * The syntax theme — master plan §14.2 ("coloured by tokens").
 *
 * Every colour is a `var()` rather than a hex value, so highlighting is
 * driven by the same token layer as the rest of the site and re-tints with
 * the live band instead of being a second, unrelated palette. Shiki resolves
 * scopes at build time and emits the variables inline; the browser never
 * loads a highlighter.
 *
 * `editor.background` is transparent on purpose: the excerpt sits on a
 * Panel, and a theme background would punch an opaque rectangle through the
 * glass surface.
 */
export const CODE_THEME: ThemeRegistration = {
	name: 'deep-field',
	type: 'dark',
	colors: {
		'editor.foreground': 'var(--code-fg)',
		'editor.background': 'transparent',
	},
	settings: [
		{ settings: { foreground: 'var(--code-fg)' } },
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: 'var(--code-comment)', fontStyle: 'italic' },
		},
		{
			scope: [
				'keyword',
				'keyword.control',
				'keyword.operator.expression',
				'storage',
				'storage.type',
				'storage.modifier',
				'entity.name.tag',
			],
			settings: { foreground: 'var(--code-keyword)' },
		},
		{
			scope: ['string', 'string.quoted', 'constant.other.symbol'],
			settings: { foreground: 'var(--code-string)' },
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.character'],
			settings: { foreground: 'var(--code-number)' },
		},
		{
			scope: [
				'entity.name.function',
				'support.function',
				'meta.function-call.generic',
			],
			settings: { foreground: 'var(--code-function)' },
		},
		{
			scope: [
				'entity.name.type',
				'entity.name.class',
				'support.type',
				'support.class',
			],
			settings: { foreground: 'var(--code-type)' },
		},
		{
			scope: ['variable.other.property', 'meta.object-literal.key'],
			settings: { foreground: 'var(--code-prop)' },
		},
		{
			scope: ['punctuation', 'meta.brace', 'punctuation.separator'],
			settings: { foreground: 'var(--code-punct)' },
		},
	],
};
