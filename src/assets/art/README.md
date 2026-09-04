# Backdrop art

Procedural stand-ins for the AI-generated plates specified in the master plan
§3.4, generated to the same prompt contract (deep `#04060D` ground, one
dominant band hue plus a neighbour, volumetric dust with visible depth
layers, star field, no text, no flares).

Regenerate with:

    pnpm art

Output is deterministic — every plate is seeded, so regenerating produces
byte-identical files. The PNGs here are the *masters*; `astro:assets`
encodes them to AVIF at build time (620KB PNG → ~28KB AVIF).

## Replacing these with real art

Overwrite the `*.png` files at the same paths and dimensions and no code
changes are needed. `*.lqip.png` must be regenerated alongside (32px wide,
same aspect) — `scripts/_art.py` does both. Dimensions and budgets are in
§3.4 of the plan.
