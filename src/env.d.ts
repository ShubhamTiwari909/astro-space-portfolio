/// <reference types="astro/client" />

/**
 * Custom client directives are registered at build time, so TypeScript has
 * no way to know about them. Declaring it here keeps `astro check` honest
 * about which directives exist rather than loosening the type.
 *
 * `export {}` matters: without it this file is an ambient script and
 * `declare module 'astro'` would REPLACE Astro's own types instead of
 * augmenting them.
 */
export {};

declare module 'astro' {
	interface AstroClientDirectives {
		/**
		 * `client:idle`, plus §24.2's bail-out moved in front of the
		 * download. See `src/lib/sceneDirective.mjs`.
		 */
		'client:capable'?: boolean;
	}
}
