#!/usr/bin/env python3
"""
Procedural backdrop plates + grain tile.  Master plan §3.4 / §29.

Generated to the plan's prompt contract: deep #04060D ground, one dominant
band hue plus at most one neighbour, volumetric dust with visible depth
layers, star field, no text, no flares, astrophotography-like falloff.

Technique — the parts that matter for it not looking like a blurry gradient:
  * ridged multifractal noise (1 - |2n-1| per octave) produces the filaments
    and dust lanes real nebulae have; plain fBm gives soft blobs;
  * domain warping (offsetting sample coords by a second noise field) makes
    those filaments wispy and directional rather than symmetric;
  * screen/additive compositing keeps hues saturated, where alpha-blending
    toward the mean greys them out;
  * three depth layers at different frequencies so parallax reads as volume;
  * a magnitude-distributed star field with cross glints on the brightest.

Drop-in replaceable: when real AI art is produced, overwrite the files at the
same paths and dimensions — no code changes needed.
"""

import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, "src", "assets", "art")
os.makedirs(ART, exist_ok=True)

VOID = np.array([4, 6, 13], dtype=np.float32) / 255.0

# name -> (dominant, neighbour, seed, (w, h), warp strength, dust gain)
PLATES = {
    "field-deep":     ("#7DE2FF", "#A78BFA", 11, (2560, 1440), 0.55, 0.75),
    "nebula-magenta": ("#FF5FA2", "#A78BFA", 23, (2048, 2048), 0.95, 1.15),
    "cluster-blue":   ("#8FB8FF", "#7DE2FF", 37, (2048, 1152), 0.70, 0.85),
    "trail-ember":    ("#FFB454", "#FF5FA2", 41, (2048, 1152), 0.85, 1.00),
    "system-violet":  ("#A78BFA", "#7DE2FF", 59, (2560, 1440), 0.80, 0.95),
    "station-aurora": ("#5BE9B9", "#8FB8FF", 67, (2048, 1152), 0.75, 0.90),
    "relay-gold":     ("#FFD76E", "#FFB454", 71, (2048, 1152), 0.65, 0.85),
}


def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255.0


def _smooth_grid(h, w, cells_y, cells_x, rng):
    """Bicubic-upsampled random grid = one octave of value noise."""
    grid = rng.random((cells_y + 1, cells_x + 1)).astype(np.float32)
    img = Image.fromarray((grid * 255).astype(np.uint8), mode="L")
    img = img.resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def fbm(h, w, seed, octaves=6, base=3, ridged=False, gain=0.5):
    rng = np.random.default_rng(seed)
    total = np.zeros((h, w), dtype=np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        cy = base * (2 ** o)
        cx = max(1, int(cy * w / h))
        n = _smooth_grid(h, w, cy, cx, rng)
        if ridged:
            n = 1.0 - np.abs(2.0 * n - 1.0)
            n *= n  # sharpen the ridges into filaments
        total += n * amp
        norm += amp
        amp *= gain
    return total / norm


def warp(field, wx, wy, strength):
    """Domain warp: resample `field` with coordinates pushed by wx/wy."""
    h, w = field.shape
    yy, xx = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")
    px = min(h, w) * 0.12 * strength
    sx = np.clip(xx + (wx - 0.5) * 2.0 * px, 0, w - 1).astype(np.int32)
    sy = np.clip(yy + (wy - 0.5) * 2.0 * px, 0, h - 1).astype(np.int32)
    return field[sy, sx]


def falloff(h, w, seed, softness=1.5):
    """Two overlapping off-centre ellipses, so structure spans the frame
    instead of sitting as one blob in the middle."""
    rng = np.random.default_rng(seed * 31 + 7)
    yy, xx = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")
    acc = np.zeros((h, w), dtype=np.float32)

    for k in range(2):
        cx = rng.uniform(0.15, 0.85) * w
        cy = rng.uniform(0.18, 0.82) * h
        rx = rng.uniform(0.85, 1.45) * w
        ry = rng.uniform(0.70, 1.30) * h
        rot = rng.uniform(0, np.pi)
        dx, dy = (xx - cx), (yy - cy)
        ca, sa = np.cos(rot), np.sin(rot)
        u = (dx * ca + dy * sa) / rx
        v = (-dx * sa + dy * ca) / ry
        d = np.sqrt(u * u + v * v) * 2.0
        acc = np.maximum(acc, np.clip(1.0 - d, 0.0, 1.0) ** softness)
    return acc


def star_field(h, w, seed, density=1.0):
    """Magnitude-distributed stars; brightest get a small cross glint."""
    rng = np.random.default_rng(seed * 7919)
    layer = np.zeros((h, w), dtype=np.float32)

    count = int(h * w / 1400 * density)
    ys = rng.integers(0, h, count)
    xs = rng.integers(0, w, count)
    mag = rng.random(count) ** 2.6  # mostly faint, a few bright
    np.maximum.at(layer, (ys, xs), 0.22 + mag * 0.78)

    bright = mag > 0.86
    by, bx, bv = ys[bright], xs[bright], mag[bright]
    for dy, dx, f in ((0, 1, 0.42), (0, -1, 0.42), (1, 0, 0.42), (-1, 0, 0.42),
                      (0, 2, 0.16), (0, -2, 0.16), (2, 0, 0.16), (-2, 0, 0.16)):
        ny, nx = np.clip(by + dy, 0, h - 1), np.clip(bx + dx, 0, w - 1)
        np.maximum.at(layer, (ny, nx), bv * f)
    return layer


def make_plate(name, dom_hex, neigh_hex, seed, size, warp_str, dust_gain):
    w, h = size
    # Render at half res, upscale at the end: cheaper and slightly softer,
    # which is what "generate at 2x and downsample" is really buying.
    hh, ww = h // 2, w // 2

    dom = hex_rgb(dom_hex)
    neigh = hex_rgb(neigh_hex)

    # Warp fields, shared by all three depth layers so structure stays coherent.
    wx = fbm(hh, ww, seed + 501, octaves=3, base=2)
    wy = fbm(hh, ww, seed + 977, octaves=3, base=2)

    rgb = np.tile(VOID, (hh, ww, 1))

    # (frequency base, octaves, intensity, colour, ridged)
    layers = (
        (2, 4, 0.85 * dust_gain, dom,   False),  # far, soft volume
        (4, 6, 0.95 * dust_gain, neigh, True),   # mid, filaments
        (7, 7, 0.62 * dust_gain, dom,   True),   # near, fine dust lanes
    )

    for i, (base, octs, intensity, colour, is_ridged) in enumerate(layers):
        n = fbm(hh, ww, seed + i * 131, octaves=octs, base=base, ridged=is_ridged)
        n = warp(n, wx, wy, warp_str * (0.6 + 0.4 * i))
        n *= falloff(hh, ww, seed + i * 17, softness=1.2 + 0.35 * i)
        # Contrast curve: push midtones down so dust reads as dust, not haze.
        n = np.clip((n - 0.10) / 0.90, 0.0, 1.0) ** 1.28
        rgb += (n * intensity)[..., None] * colour  # additive: keeps hue

    stars = star_field(hh, ww, seed, density=1.0)
    rgb += stars[..., None] * np.array([0.92, 0.95, 1.0], dtype=np.float32)

    # Filmic-ish shoulder so bright cores roll off instead of clipping flat.
    rgb = rgb / (1.0 + rgb * 0.34)
    rgb = np.clip(rgb, 0.0, 1.0)

    img = Image.fromarray((rgb * 255).astype(np.uint8), mode="RGB")
    img = img.resize((w, h), Image.LANCZOS)

    path = os.path.join(ART, f"{name}.png")
    img.save(path, "PNG", optimize=True)

    lq_h = max(1, round(32 * h / w))
    img.resize((32, lq_h), Image.LANCZOS).save(
        os.path.join(ART, f"{name}.lqip.png"), "PNG", optimize=True
    )
    return path, os.path.getsize(path)


def make_grain():
    """128x128 tiling monochrome noise (§17.1). Kills gradient banding."""
    rng = np.random.default_rng(4242)
    a = rng.integers(104, 152, (128, 128), dtype=np.uint8)
    path = os.path.join(ART, "grain.png")
    Image.fromarray(a, mode="L").save(path, "PNG", optimize=True)
    return path, os.path.getsize(path)


if __name__ == "__main__":
    total = 0
    for name, (dom, neigh, seed, size, ws, dg) in PLATES.items():
        _, n = make_plate(name, dom, neigh, seed, size, ws, dg)
        total += n
        print(f"  {name:<16} {size[0]}x{size[1]:<5} {n / 1024:8.0f} KB  (png)")
    _, n = make_grain()
    total += n
    print(f"  {'grain':<16} {'128x128':<11} {n / 1024:8.1f} KB")
    print(f"\n  {len(PLATES)} plates + grain — {total / 1024 / 1024:.1f} MB PNG")
    print("  AVIF encoding happens at build time via astro:assets.")
