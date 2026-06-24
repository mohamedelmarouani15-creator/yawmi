"""
Nouvelle icône Yawmi — mihrab + croissant + étoile sur fond émeraude
lumineux. Master 1024x1024 plein-cadre (iOS/Android appliquent leur
propre masque), puis export de toutes les tailles de manifest.ts.
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
CX, CY = SIZE // 2, SIZE // 2 + 10

EMERALD_LIGHT = (16, 150, 102)
EMERALD_MID = (5, 70, 48)
EMERALD_DEEP = (3, 23, 16)
GOLD_HILITE = (250, 226, 165)
GOLD_TOP = (231, 196, 110)
GOLD_BOTTOM = (147, 103, 24)
CREAM = (250, 246, 238)


def radial_gradient(size, cx, cy, inner, outer, inner_color, outer_color, power=1.25):
    ys, xs = np.mgrid[0:size, 0:size]
    d = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2)
    t = np.clip((d - inner) / (outer - inner), 0, 1) ** power
    out = np.empty((size, size, 3), dtype=np.float64)
    for c in range(3):
        out[..., c] = inner_color[c] * (1 - t) + outer_color[c] * t
    return out


def star8(draw, cx, cy, r_outer, r_inner, fill, rotation=0.0):
    pts = []
    for i in range(16):
        ang = math.pi / 8 * i - math.pi / 2 + rotation
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    draw.polygon(pts, fill=fill)


def mihrab_mask(size, half_w, spring_y, bottom_y):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rectangle([CX - half_w, spring_y, CX + half_w, bottom_y], fill=255)
    d.pieslice([CX - half_w, spring_y - half_w, CX + half_w, spring_y + half_w], 180, 360, fill=255)
    base_w = half_w + 40
    d.rectangle([CX - base_w, bottom_y - 22, CX + base_w, bottom_y + 14], fill=255)
    return mask


def crescent_mask(size, big_r, small_r, offset_x, offset_y, cx, cy):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([cx - big_r, cy - big_r, cx + big_r, cy + big_r], fill=255)
    d.ellipse(
        [cx - small_r + offset_x, cy - small_r + offset_y, cx + small_r + offset_x, cy + small_r + offset_y],
        fill=0,
    )
    return mask


def vertical_gradient_rgba(mask, top_color, bottom_color, top_y, bottom_y, gamma=0.9):
    h = mask.height
    t = np.clip((np.arange(h) - top_y) / max(1, (bottom_y - top_y)), 0, 1) ** gamma
    grad = np.empty((h, 1, 3), dtype=np.float64)
    for c in range(3):
        grad[:, 0, c] = top_color[c] * (1 - t) + bottom_color[c] * t
    grad_img = np.tile(grad, (1, mask.width, 1)).astype(np.uint8)
    rgba = np.dstack([grad_img, np.array(mask)])
    return Image.fromarray(rgba)


def main():
    half_w, spring_y, bottom_y = 186, CY - 70, CY + 222

    # ── Fond émeraude lumineux ──────────────────────────────────────────
    bg = radial_gradient(SIZE, CX, CY - 60, 60, 720, EMERALD_LIGHT, EMERALD_MID, power=0.9)
    bg2 = radial_gradient(SIZE, CX, CY - 60, 420, 760, EMERALD_MID, EMERALD_DEEP, power=1.6)
    mix = np.clip((np.sqrt((np.arange(SIZE)[None, :] - CX) ** 2 + (np.arange(SIZE)[:, None] - (CY - 60)) ** 2) - 420) / 340, 0, 1)[..., None]
    bg_final = bg * (1 - mix) + bg2 * mix
    base = Image.fromarray(np.clip(bg_final, 0, 255).astype(np.uint8)).convert("RGBA")

    # Vignette de coin très légère (ancre le carré sans assombrir le motif)
    ys, xs = np.mgrid[0:SIZE, 0:SIZE]
    corner = np.sqrt((xs - SIZE / 2) ** 2 + (ys - SIZE / 2) ** 2) / (SIZE * 0.74)
    corner_dark = (np.clip((corner - 0.66) / 0.34, 0, 1) ** 1.3)[..., None] * np.array([10, 7, 5])
    arr = np.asarray(base.convert("RGB")).astype(np.float64) - corner_dark
    base = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")

    # ── Halo doré derrière le motif ─────────────────────────────────────
    glow_src = Image.new("L", (SIZE, SIZE), 0)
    gd = ImageDraw.Draw(glow_src)
    gd.ellipse([CX - 300, CY - 320, CX + 300, CY + 300], fill=255)
    glow_blur = glow_src.filter(ImageFilter.GaussianBlur(85))
    glow_rgba = Image.new("RGBA", (SIZE, SIZE), (*GOLD_TOP, 0))
    glow_rgba.putalpha(glow_blur.point(lambda p: int(p * 0.5)))
    base = Image.alpha_composite(base, glow_rgba)

    # ── Ombre de contact douce sous le mihrab ───────────────────────────
    m_mask = mihrab_mask(SIZE, half_w, spring_y, bottom_y)
    shadow_mask = m_mask.filter(ImageFilter.GaussianBlur(22))
    shadow_rgba = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 255))
    shadow_rgba.putalpha(shadow_mask.point(lambda p: int(p * 0.30)))
    base.alpha_composite(shadow_rgba, (0, 16))

    # ── Mihrab doré : dégradé vertical glossy ───────────────────────────
    mihrab_rgba = vertical_gradient_rgba(m_mask, GOLD_TOP, GOLD_BOTTOM, spring_y - half_w, bottom_y)
    base.alpha_composite(mihrab_rgba)

    # Sheen diagonal (reflet glossy) — bande claire semi-transparente
    sheen = Image.new("L", (SIZE, SIZE), 0)
    sd = ImageDraw.Draw(sheen)
    sd.polygon(
        [(CX - half_w - 20, spring_y - half_w), (CX - half_w + 70, spring_y - half_w),
         (CX - 10, bottom_y), (CX - 95, bottom_y)],
        fill=255,
    )
    sheen = sheen.filter(ImageFilter.GaussianBlur(28))
    sheen_rgba = Image.new("RGBA", (SIZE, SIZE), (*GOLD_HILITE, 0))
    sheen_alpha = Image.composite(sheen, Image.new("L", (SIZE, SIZE), 0), m_mask)
    sheen_rgba.putalpha(sheen_alpha.point(lambda p: int(p * 0.45)))
    base.alpha_composite(sheen_rgba)

    # Contour fin profond — juste assez pour détacher la forme à petite taille
    edge = m_mask.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))
    edge_rgba = Image.new("RGBA", (SIZE, SIZE), (*EMERALD_DEEP, 0))
    edge_rgba.putalpha(edge.point(lambda p: int(min(255, p * 1.4) * 0.55)))
    base.alpha_composite(edge_rgba)

    # ── Croissant — détaché à droite du dôme, sur le fond émeraude ──────
    moon_cx, moon_cy = CX + 8, CY - 138
    c_mask = crescent_mask(SIZE, 104, 88, 40, -16, moon_cx, moon_cy)
    moon_rgba = Image.new("RGBA", (SIZE, SIZE), (*CREAM, 0))
    moon_rgba.putalpha(c_mask)
    base.alpha_composite(moon_rgba)

    # ── Étoile à 8 branches — posée dans le ciel, hors du dôme ──────────
    star_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(star_layer)
    star8(sdraw, CX + 232, CY - 256, 34, 14, (*CREAM, 255), rotation=0.2)
    star_glow = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(star_glow).ellipse([CX + 232 - 50, CY - 256 - 50, CX + 232 + 50, CY - 256 + 50], fill=255)
    star_glow = star_glow.filter(ImageFilter.GaussianBlur(20))
    star_glow_rgba = Image.new("RGBA", (SIZE, SIZE), (*CREAM, 0))
    star_glow_rgba.putalpha(star_glow.point(lambda p: int(p * 0.35)))
    base.alpha_composite(star_glow_rgba)
    base.alpha_composite(star_layer)

    base.convert("RGB").save("master-1024.png")
    print("master saved")

    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    out_dir = "../"
    for s in sizes:
        resized = base.convert("RGB").resize((s, s), Image.LANCZOS)
        resized.save(f"{out_dir}icon-{s}x{s}.png")
    base.convert("RGB").resize((180, 180), Image.LANCZOS).save(f"{out_dir}icon-180x180.png")
    print("all sizes exported")


if __name__ == "__main__":
    main()
