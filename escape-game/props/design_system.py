"""Bayt al-Hikma Archive — shared design system for the escape-game props.

Palette, type, parchment texture, and the recurring motifs (khatim seal,
mihrab arch, gold divider) used across every printable page.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.expanduser("~/.claude/skills/canvas-design/canvas-fonts")
CACHE_DIR = os.path.join(HERE, "_build")
os.makedirs(CACHE_DIR, exist_ok=True)

# ── Palette ──────────────────────────────────────────────────────────
PARCHMENT = colors.HexColor("#EBDFBF")
INK = colors.HexColor("#2A1B10")
UMBER = colors.HexColor("#6B4423")
GOLD = colors.HexColor("#B8862E")
EMERALD = colors.HexColor("#055C3F")
SEAL_RED = colors.HexColor("#7A2E1D")

PARCHMENT_RGB = (235, 223, 191)
UMBER_RGB = (107, 68, 35)

# ── Type ─────────────────────────────────────────────────────────────
DISPLAY = "Italiana"
POETIC = "CrimsonPro-Italic"
POETIC_BOLD = "CrimsonPro-Bold"
BODY = "Lora"
BODY_BOLD = "Lora-Bold"
MONO = "IBMPlexMono"
MONO_BOLD = "IBMPlexMono-Bold"

_FONTS_REGISTERED = False


def register_fonts():
    global _FONTS_REGISTERED
    if _FONTS_REGISTERED:
        return
    mapping = {
        DISPLAY: "Italiana-Regular.ttf",
        POETIC: "CrimsonPro-Italic.ttf",
        POETIC_BOLD: "CrimsonPro-Bold.ttf",
        "CrimsonPro": "CrimsonPro-Regular.ttf",
        BODY: "Lora-Regular.ttf",
        BODY_BOLD: "Lora-Bold.ttf",
        "Lora-Italic": "Lora-Italic.ttf",
        MONO: "IBMPlexMono-Regular.ttf",
        MONO_BOLD: "IBMPlexMono-Bold.ttf",
    }
    for name, filename in mapping.items():
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, filename)))
    _FONTS_REGISTERED = True


# ── Parchment texture ────────────────────────────────────────────────
DPI = 110


def make_parchment(width_pt, height_pt, seed):
    """Returns a path to a cached aged-parchment JPEG at the given page size."""
    w_px = max(1, round(width_pt / 72 * DPI))
    h_px = max(1, round(height_pt / 72 * DPI))
    path = os.path.join(CACHE_DIR, f"parchment_{w_px}x{h_px}_{seed}.jpg")
    if os.path.exists(path):
        return path

    rng = np.random.default_rng(seed)
    base = np.empty((h_px, w_px, 3), dtype=np.float64)
    base[:, :] = PARCHMENT_RGB

    # fine paper grain
    grain = rng.normal(0, 1, (h_px, w_px))
    g8 = ((grain - grain.min()) / (grain.max() - grain.min()) * 255).astype(np.uint8)
    grain_img = Image.fromarray(g8, mode="L").filter(ImageFilter.GaussianBlur(0.5))
    grain_arr = (np.asarray(grain_img).astype(np.float64) - 127.5) / 127.5
    base += grain_arr[..., None] * 7.0

    # rectangular vignette — darker, burnt toward the edges
    xs = np.linspace(-1, 1, w_px)
    ys = np.linspace(-1, 1, h_px)
    gx, gy = np.meshgrid(xs, ys)
    edge = np.maximum(np.abs(gx), np.abs(gy))
    darken = np.clip((edge - 0.45) / 0.55, 0, 1) ** 1.6
    base = base * (1 - darken[..., None] * 0.55) + np.array(UMBER_RGB) * (darken[..., None] * 0.55)

    # foxing blotches — scattered, soft, never identical between pages
    mask = Image.new("L", (w_px, h_px), 0)
    draw = ImageDraw.Draw(mask)
    n_blotches = int(w_px * h_px / 380000 * 22)
    for _ in range(n_blotches):
        cx = int(rng.integers(0, w_px))
        cy = int(rng.integers(0, h_px))
        r = int(rng.integers(6, 38))
        alpha = int(rng.uniform(18, 55))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=10))
    mask_arr = np.asarray(mask).astype(np.float64) / 255.0
    base = base * (1 - mask_arr[..., None]) + np.array(UMBER_RGB) * mask_arr[..., None]

    out = np.clip(base, 0, 255).astype(np.uint8)
    Image.fromarray(out, mode="RGB").save(path, quality=80, optimize=True)
    return path


def draw_parchment_bg(c, width, height, seed):
    path = make_parchment(width, height, seed)
    c.drawImage(path, 0, 0, width=width, height=height)


# ── Motifs ───────────────────────────────────────────────────────────
def draw_star8(c, cx, cy, r_outer, r_inner, fill_color, stroke_color=None, stroke_width=0.5):
    pts = []
    for i in range(16):
        ang = math.pi / 8 * i - math.pi / 2
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    c.setFillColor(fill_color)
    if stroke_color is not None:
        c.setStrokeColor(stroke_color)
        c.setLineWidth(stroke_width)
        c.drawPath(p, fill=1, stroke=1)
    else:
        c.drawPath(p, fill=1, stroke=0)


def draw_seal(c, cx, cy, radius=0.6 * cm, ring_color=GOLD, star_color=EMERALD):
    c.setStrokeColor(ring_color)
    c.setLineWidth(1.1)
    c.circle(cx, cy, radius, fill=0, stroke=1)
    c.setLineWidth(0.6)
    c.circle(cx, cy, radius * 0.76, fill=0, stroke=1)
    draw_star8(c, cx, cy, radius * 0.6, radius * 0.6 * 0.42, star_color, stroke_color=ring_color, stroke_width=0.5)


def draw_mihrab_arch(c, cx, top_y, width, height, color, line_width=1.1):
    half = width / 2
    p = c.beginPath()
    p.moveTo(cx - half, top_y - height)
    p.lineTo(cx - half, top_y - height * 0.32)
    p.curveTo(cx - half, top_y, cx - half * 0.12, top_y, cx, top_y)
    p.curveTo(cx + half * 0.12, top_y, cx + half, top_y, cx + half, top_y - height * 0.32)
    p.lineTo(cx + half, top_y - height)
    c.setStrokeColor(color)
    c.setLineWidth(line_width)
    c.drawPath(p, fill=0, stroke=1)


def draw_divider(c, cx, y, width, color, with_star=True):
    c.setStrokeColor(color)
    c.setLineWidth(0.7)
    c.line(cx - width / 2, y, cx - 7, y)
    c.line(cx + 7, y, cx + width / 2, y)
    if with_star:
        draw_star8(c, cx, y, 4.4, 1.9, color)


def draw_card_frame(c, x, y, w, h, label=None, sub_label=None):
    """Dashed outer cut-guide + double gold inner rule. Returns the inner
    content rectangle (ix, iy, iw, ih)."""
    c.saveState()
    c.setDash(3, 3)
    c.setStrokeColor(UMBER)
    c.setLineWidth(0.6)
    c.rect(x, y, w, h, fill=0, stroke=1)
    c.restoreState()

    inset = 0.32 * cm
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.1)
    c.rect(x + inset, y + inset, w - 2 * inset, h - 2 * inset, fill=0, stroke=1)
    c.setLineWidth(0.5)
    gap = 0.1 * cm
    c.rect(x + inset + gap, y + inset + gap, w - 2 * inset - 2 * gap, h - 2 * inset - 2 * gap, fill=0, stroke=1)

    if label:
        c.setFont(MONO, 6.3)
        c.setFillColor(UMBER)
        c.drawString(x + inset + 0.18 * cm, y + h - inset - 0.32 * cm, label)
    if sub_label:
        c.setFont(MONO, 6.3)
        c.setFillColor(UMBER)
        tw = stringWidth(sub_label, MONO, 6.3)
        c.drawRightString(x + w - inset - 0.18 * cm, y + inset + 0.16 * cm, sub_label)
    return x + inset + gap + 0.25 * cm, y + inset + gap + 0.25 * cm, w - 2 * (inset + gap + 0.25 * cm), h - 2 * (inset + gap + 0.25 * cm)


# ── Text layout helpers ──────────────────────────────────────────────
def wrap_text(text, font, size, max_width):
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if stringWidth(trial, font, size) <= max_width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_paragraph(c, text, x, y_top, max_width, font, size, leading, color, align="left"):
    lines = wrap_text(text, font, size, max_width)
    c.setFont(font, size)
    c.setFillColor(color)
    y = y_top
    for line in lines:
        if align == "center":
            lw = stringWidth(line, font, size)
            c.drawString(x + (max_width - lw) / 2, y, line)
        else:
            c.drawString(x, y, line)
        y -= leading
    return y


def draw_paragraphs(c, paragraphs, x, y_top, max_width, font, size, leading, color, align="left", para_gap=None):
    if para_gap is None:
        para_gap = leading * 0.65
    y = y_top
    for i, para in enumerate(paragraphs):
        y = draw_paragraph(c, para, x, y, max_width, font, size, leading, color, align)
        if i < len(paragraphs) - 1:
            y -= para_gap
    return y


def title_block(c, x, y_top, width, title, color=INK, size=15, align="center"):
    c.setFont(DISPLAY, size)
    c.setFillColor(color)
    if align == "center":
        tw = stringWidth(title, DISPLAY, size)
        c.drawString(x + (width - tw) / 2, y_top, title)
    else:
        c.drawString(x, y_top, title)
    return y_top - size * 1.1
