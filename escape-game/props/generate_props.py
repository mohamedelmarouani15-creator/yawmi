"""Generates Accessoires-Maison-de-la-Sagesse.pdf — the full printable prop
set for the "Le Secret de la Maison de la Sagesse" IRL escape game.

Run: python3 generate_props.py
"""
import math
import os

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas

import design_system as ds

ds.register_fonts()

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(HERE, "Accessoires-Maison-de-la-Sagesse.pdf")

W, H = A4
c = canvas.Canvas(OUT_PATH, pagesize=A4)

_seed = [0]


def page_bg():
    _seed[0] += 1
    ds.draw_parchment_bg(c, W, H, _seed[0])


def footer(text="BAYT AL-HIKMA · BAGDAD · 215 AH", page_no=None):
    c.setFont(ds.MONO, 6.8)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(W / 2, 0.9 * cm, text)
    if page_no:
        c.drawRightString(W - 1.1 * cm, 0.9 * cm, page_no)
    ds.draw_seal(c, W - 1.6 * cm, 1.55 * cm, radius=0.5 * cm)


def cut_card(width, height, label=None, sub_label=None):
    """Centers a cut-guide card on the page, returns inner content rect."""
    x = (W - width) / 2
    y = (H - height) / 2
    return ds.draw_card_frame(c, x, y, width, height, label=label, sub_label=sub_label)


# ════════════════════════════════════════════════════════════════════
# PAGE 1 — COVER / CHECKLIST
# ════════════════════════════════════════════════════════════════════
def page_cover():
    page_bg()
    cx = W / 2
    ds.draw_mihrab_arch(c, cx, H - 3.0 * cm, 6 * cm, 1.6 * cm, ds.GOLD, 1.3)
    c.setFont(ds.DISPLAY, 30)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, H - 4.6 * cm, "BAYT AL-HIKMA")
    c.setFont(ds.BODY, 11.5)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, H - 5.5 * cm, "Le Secret de la Maison de la Sagesse")
    ds.draw_divider(c, cx, H - 6.2 * cm, 9 * cm, ds.GOLD)

    c.setFont(ds.BODY, 10)
    c.setFillColor(ds.INK)
    intro = (
        "Ce dossier réunit les quinze accessoires imprimables du jeu d'évasion familial "
        "« Le Secret de la Maison de la Sagesse » (Bagdad, l'an 215 de l'Hégire). "
        "Imprimer sur papier ou carton épais (160–200 g) si possible, à 100 % "
        "(sans ajustement automatique à la page)."
    )
    ds.draw_paragraph(c, intro, 2.6 * cm, H - 7.6 * cm, W - 5.2 * cm, ds.BODY, 10, 13.4, ds.INK)

    items = [
        ("1", "Coffre de la Connaissance + cadenas 3 chiffres", "à fabriquer"),
        ("2–6", "Tablettes du Voyage de la Foi (5 cartes)", "pages 2–6"),
        ("7", "Carte-Clé du Pèlerinage", "page 7"),
        ("8", "Astrolabe de papier (+ attache parisienne)", "page 8"),
        ("—", "Boussole réelle ou application Qibla", "à fournir"),
        ("9", "Parchemin de la Direction Sacrée", "page 9"),
        ("10", "Grille percée (à découper)", "page 10"),
        ("11", "Page-Grille des Mots", "page 11"),
        ("12–13", "Livret des Sagesses", "pages 12–13"),
        ("14", "Manuscrit Final", "page 14"),
        ("15", "Feuillet du Maître du Jeu — réservé MJ", "page 15"),
        ("—", "Bougies LED, encens, minuteur 45 min, sacoche, récompense", "à fournir"),
    ]
    y = H - 10.2 * cm
    c.setFont(ds.MONO, 9)
    for num, label, where in items:
        c.setFillColor(ds.GOLD)
        c.drawString(2.6 * cm, y, num.rjust(5))
        c.setFillColor(ds.INK)
        c.setFont(ds.BODY, 9.6)
        c.drawString(4.1 * cm, y, label)
        c.setFont(ds.MONO, 7.6)
        c.setFillColor(ds.UMBER)
        c.drawRightString(W - 2.6 * cm, y, where)
        c.setFont(ds.MONO, 9)
        y -= 0.78 * cm

    ds.draw_divider(c, cx, 3.4 * cm, 9 * cm, ds.GOLD)
    c.setFont(ds.POETIC, 10)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, 2.6 * cm, "« La sagesse ne se perd jamais — elle attend la prochaine main qui tournera la page. »")
    footer(page_no="1 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGES 2–6 — TABLETTES DU VOYAGE DE LA FOI
# ════════════════════════════════════════════════════════════════════
TABLETTES = [
    "Avant le premier souffle de l'aube, avant le premier pas de l'enfant, des mots furent "
    "soufflés à mon oreille — une vérité plus ancienne que les sables, plus simple qu'une "
    "goutte d'eau : qu'il n'est de dieu que Lui, et qu'un homme fut Son messager. Je suis "
    "la porte sans serrure, le commencement sans lequel rien d'autre n'existe.",

    "Cinq fois le soleil me voit incliner le front vers la terre ; cinq fois je tourne mon "
    "visage vers la Maison Sacrée que nul ici n'a jamais touchée de ses mains. Je ne demande "
    "ni or ni saison, seulement que le jour entier me soit offert, miette par miette, comme "
    "cinq perles sur un même fil.",

    "Un mois lunaire entier, et le ventre se fait silencieux du lever au coucher du soleil. "
    "Ce n'est pas la faim que je façonne, mais la patience ; ce n'est pas la soif que "
    "j'enseigne, mais la gratitude pour l'eau du soir. Quand la dernière étoile de mon mois "
    "s'éteint, une fête couronne le sacrifice.",

    "Je ne suis pas un don : je suis une dette déjà due. Sur ce que tu possèdes depuis une "
    "lune entière, une part — la plus petite des parts utiles — appartient déjà à celui qui "
    "n'a rien. Je purifie ta richesse comme l'eau purifie le vêtement ; sans moi, ce que tu "
    "gardes te brûlerait en secret.",

    "Une fois dans toute une vie, si tes jambes le permettent et ta bourse le permet, tu "
    "quitteras ta maison pour une autre maison, plus ancienne que Bagdad elle-même, bâtie "
    "par un prophète et son fils pour Celui qui n'a besoin d'aucune maison. Mes pas sont "
    "rares — mais on dit qu'ils valent plus que mille jours ordinaires.",
]


def page_tablette(poem_text, page_label):
    page_bg()
    cw, ch = 10 * cm, 15 * cm
    ix, iy, iw, ih = cut_card(cw, ch, label="TABLETTE", sub_label="Voyage de la Foi")
    cx = (W) / 2

    ds.draw_mihrab_arch(c, cx, iy + ih - 0.15 * cm, 3.2 * cm, 0.9 * cm, ds.GOLD, 1.0)
    c.setFont(ds.DISPLAY, 12.5)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, iy + ih - 1.55 * cm, "TABLETTE DU VOYAGE")
    ds.draw_divider(c, cx, iy + ih - 1.95 * cm, iw - 1.2 * cm, ds.GOLD)

    text_top = iy + ih - 2.55 * cm
    ds.draw_paragraph(c, poem_text, ix + 0.25 * cm, text_top, iw - 0.5 * cm,
                       ds.POETIC, 9.6, 13.3, ds.INK)

    ds.draw_divider(c, cx, iy + 0.85 * cm, iw - 1.6 * cm, ds.GOLD, with_star=False)
    c.setFont(ds.MONO, 6.6)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, iy + 0.45 * cm, "verso vierge · marquer au crayon avant de cacher")

    footer(page_no=page_label)
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGE 7 — CARTE-CLÉ DU PÈLERINAGE
# ════════════════════════════════════════════════════════════════════
def page_carte_cle():
    page_bg()
    cw, ch = 7 * cm, 10 * cm
    ix, iy, iw, ih = cut_card(cw, ch, label="CARTE-CLÉ", sub_label="Pèlerinage")
    cx = W / 2
    ds.draw_mihrab_arch(c, cx, iy + ih - 0.1 * cm, 2.4 * cm, 0.7 * cm, ds.GOLD, 0.9)
    c.setFont(ds.DISPLAY, 10)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, iy + ih - 1.15 * cm, "CARTE-CLÉ DU PÈLERINAGE")
    ds.draw_divider(c, cx, iy + ih - 1.5 * cm, iw - 1 * cm, ds.GOLD)

    text = ("Vous avez formé la rangée d'une vie entière. Comptez, dans cette rangée, la "
            "place du pèlerin dont les pas sont si rares qu'on ne les compte qu'une fois "
            "dans une existence — celui qui marche vers la maison plus ancienne que Bagdad. "
            "Sa place dans votre rangée est le Premier Chiffre du Coffre.")
    ds.draw_paragraph(c, text, ix + 0.2 * cm, iy + ih - 2.05 * cm, iw - 0.4 * cm,
                       ds.POETIC, 8.6, 11.6, ds.INK)
    footer(page_no="7 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGE 8 — ASTROLABE DE PAPIER
# ════════════════════════════════════════════════════════════════════
PLANETS = [
    ("Soleil", "Shams", "sun"),
    ("Lune", "Qamar", "moon"),
    ("Mercure", "Utarid", "dot"),
    ("Vénus", "Zuhra", "dot"),
    ("Mars", "Mirrikh", "dot"),
    ("Jupiter", "Mushtari", "dot"),
    ("Saturne", "Zuhal", "dot"),
]


def draw_planet_icon(cx, cy, r, kind):
    if kind == "sun":
        c.setFillColor(ds.GOLD)
        c.circle(cx, cy, r * 0.5, fill=1, stroke=0)
        c.setStrokeColor(ds.GOLD)
        c.setLineWidth(0.8)
        for i in range(8):
            a = math.pi / 4 * i
            c.line(cx + r * 0.62 * math.cos(a), cy + r * 0.62 * math.sin(a),
                   cx + r * 0.95 * math.cos(a), cy + r * 0.95 * math.sin(a))
    elif kind == "moon":
        c.setFillColor(ds.GOLD)
        c.circle(cx, cy, r * 0.55, fill=1, stroke=0)
        c.setFillColor(ds.PARCHMENT)
        c.circle(cx + r * 0.22, cy, r * 0.5, fill=1, stroke=0)
    else:
        c.setFillColor(ds.EMERALD)
        c.circle(cx, cy, r * 0.34, fill=1, stroke=0)
        c.setStrokeColor(ds.GOLD)
        c.setLineWidth(0.6)
        c.circle(cx, cy, r * 0.34, fill=0, stroke=1)


def page_astrolabe():
    page_bg()
    cx, cy = W / 2, H / 2 + 0.6 * cm
    R = 10 * cm

    c.setFont(ds.DISPLAY, 15)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, H - 2.4 * cm, "ASTROLABE")
    c.setFont(ds.BODY, 9)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, H - 3.05 * cm, "Les sept étoiles errantes de la Maison de la Sagesse")

    # outer rim + tick marks (every 10°, longer every 30°)
    c.setStrokeColor(ds.GOLD)
    c.setLineWidth(1.3)
    c.circle(cx, cy, R, fill=0, stroke=1)
    c.setLineWidth(1.0)
    c.circle(cx, cy, R - 0.45 * cm, fill=0, stroke=1)
    for deg in range(0, 360, 10):
        a = math.radians(90 - deg)
        long_tick = (deg % 30 == 0)
        emphasis = (deg == 200)
        r0 = R
        r1 = R - (0.55 * cm if long_tick else 0.3 * cm)
        c.setStrokeColor(ds.SEAL_RED if emphasis else ds.GOLD)
        c.setLineWidth(1.3 if emphasis else 0.6)
        c.line(cx + r0 * math.cos(a), cy + r0 * math.sin(a), cx + r1 * math.cos(a), cy + r1 * math.sin(a))
    # cardinal labels
    c.setFont(ds.MONO, 8)
    c.setFillColor(ds.INK)
    for deg, lab in [(0, "N"), (90, "E"), (180, "S"), (270, "O")]:
        a = math.radians(90 - deg)
        lx, ly = cx + (R + 0.5 * cm) * math.cos(a), cy + (R + 0.5 * cm) * math.sin(a)
        c.drawCentredString(lx, ly - 2.5, lab)
    c.setFont(ds.MONO, 7)
    c.setFillColor(ds.SEAL_RED)
    a200 = math.radians(90 - 200)
    lx, ly = cx + (R + 0.85 * cm) * math.cos(a200), cy + (R + 0.85 * cm) * math.sin(a200)
    c.drawCentredString(lx, ly - 2.5, "200° — cap visé")

    # 7 planet segments
    n = len(PLANETS)
    label_r = R - 1.65 * cm
    icon_r = R - 0.95 * cm
    for i, (fr, ar, kind) in enumerate(PLANETS):
        a = math.radians(90 - i * 360 / n)
        # radial divider
        c.setStrokeColor(ds.GOLD)
        c.setLineWidth(0.5)
        c.line(cx + (R - 0.45 * cm) * math.cos(a - math.pi / n),
               cy + (R - 0.45 * cm) * math.sin(a - math.pi / n),
               cx + 5.2 * cm * math.cos(a - math.pi / n),
               cy + 5.2 * cm * math.sin(a - math.pi / n))
        ix, iy_ = cx + icon_r * math.cos(a), cy + icon_r * math.sin(a)
        draw_planet_icon(ix, iy_, 0.42 * cm, kind)
        lx, ly_ = cx + label_r * math.cos(a), cy + label_r * math.sin(a)
        c.setFont(ds.BODY_BOLD, 8.4)
        c.setFillColor(ds.INK)
        c.drawCentredString(lx, ly_ + 3, fr)
        c.setFont(ds.MONO, 6.4)
        c.setFillColor(ds.UMBER)
        c.drawCentredString(lx, ly_ - 7.5, ar)

    # central inscription disc
    inner_r = 4.7 * cm
    c.setFillColor(ds.PARCHMENT)
    c.setStrokeColor(ds.GOLD)
    c.setLineWidth(1.0)
    c.circle(cx, cy, inner_r, fill=1, stroke=1)
    inscription = (
        "Ô chercheur du ciel, la Terre est ronde comme une perle. Depuis Bagdad, la Maison "
        "Sacrée de La Mecque ne se trouve ni au Levant ni au Couchant, mais presque droit "
        "vers le Midi, légèrement inclinée vers le Couchant — un cap que les savants "
        "mesurent à deux cents degrés depuis le Nord. Tourne-toi vers cette direction avec "
        "l'instrument que l'on t'a remis."
    )
    ds.draw_paragraph(c, inscription, cx - inner_r + 0.55 * cm, cy + inner_r - 1.0 * cm,
                       2 * inner_r - 1.1 * cm, ds.POETIC, 7.6, 10.4, ds.INK, align="center")

    # center pinhole
    c.setStrokeColor(ds.SEAL_RED)
    c.setLineWidth(0.7)
    c.circle(cx, cy, 0.18 * cm, fill=0, stroke=1)
    c.line(cx - 0.4 * cm, cy, cx + 0.4 * cm, cy)
    c.line(cx, cy - 0.4 * cm, cx, cy + 0.4 * cm)

    c.setFont(ds.MONO, 7)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, cy - inner_r - 0.55 * cm,
                         "percer ici (Ø 3 mm) · attache parisienne · le disque tourne librement")

    c.setDash(3, 3)
    c.setStrokeColor(ds.UMBER)
    c.setLineWidth(0.6)
    c.circle(cx, cy, R + 0.15 * cm, fill=0, stroke=1)
    c.setDash()

    footer(page_no="8 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGE 9 — PARCHEMIN DE LA DIRECTION SACRÉE
# ════════════════════════════════════════════════════════════════════
def page_parchemin():
    page_bg()
    cw, ch = 14.8 * cm, 21 * cm
    ix, iy, iw, ih = cut_card(cw, ch, label="PARCHEMIN", sub_label="Direction Sacrée")
    cx = W / 2

    ds.draw_mihrab_arch(c, cx, iy + ih - 0.2 * cm, 4.5 * cm, 1.3 * cm, ds.GOLD, 1.1)
    c.setFont(ds.DISPLAY, 15)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, iy + ih - 2.1 * cm, "PARCHEMIN DE LA")
    c.drawCentredString(cx, iy + ih - 2.75 * cm, "DIRECTION SACRÉE")
    ds.draw_divider(c, cx, iy + ih - 3.3 * cm, iw - 2 * cm, ds.GOLD)

    text = ("Tu as trouvé la bonne direction, chercheur — celle que des générations de "
            "pèlerins et de savants ont calculée avant toi avec des instruments de bronze "
            "et de patience.\n\n"
            "Retourne maintenant à l'astrolabe, et compte une à une les étoiles errantes "
            "qui voyagent sur le pourtour du disque : le Soleil, la Lune et les cinq "
            "étoiles vagabondes que les Anciens connaissaient.\n\n"
            "Leur nombre total est le Deuxième Chiffre du Coffre.")
    y_end = ds.draw_paragraphs(c, text.split("\n\n"), ix + 0.7 * cm, iy + ih - 4.4 * cm, iw - 1.4 * cm,
                                ds.POETIC, 13.5, 19, ds.INK)

    # the parchment's own seal: a wind-rose, since its whole subject is direction-finding
    ds.draw_divider(c, cx, y_end - 0.9 * cm, iw - 2.6 * cm, ds.GOLD)
    rose_top = y_end - 1.5 * cm
    rose_bottom = iy + 2.3 * cm
    rose_cy = (rose_top + rose_bottom) / 2
    rose_r = min(3.1 * cm, (rose_top - rose_bottom) / 2)
    if rose_r > 1.1 * cm:
        for deg in range(0, 360, 15):
            a = math.radians(90 - deg)
            long_tick = deg % 90 == 0
            emphasis = deg == 200
            r1 = rose_r if (long_tick or emphasis) else rose_r * 0.6
            c.setStrokeColor(ds.SEAL_RED if emphasis else ds.GOLD)
            c.setLineWidth(1.2 if (long_tick or emphasis) else 0.5)
            c.line(cx, rose_cy, cx + r1 * math.cos(a), rose_cy + r1 * math.sin(a))
        ds.draw_star8(c, cx, rose_cy, rose_r * 0.22, rose_r * 0.22 * 0.42, ds.EMERALD,
                       stroke_color=ds.GOLD, stroke_width=0.5)
        c.setFont(ds.MONO, 7.5)
        c.setFillColor(ds.INK)
        for deg, lab in [(0, "N"), (90, "E"), (180, "S"), (270, "O")]:
            a = math.radians(90 - deg)
            c.drawCentredString(cx + (rose_r + 0.5 * cm) * math.cos(a),
                                 rose_cy + (rose_r + 0.5 * cm) * math.sin(a) - 2.5, lab)
        c.setFont(ds.MONO, 6.6)
        c.setFillColor(ds.SEAL_RED)
        a200 = math.radians(90 - 200)
        c.drawCentredString(cx + (rose_r + 0.78 * cm) * math.cos(a200),
                             rose_cy + (rose_r + 0.78 * cm) * math.sin(a200) - 2.5, "200°")

    footer(page_no="9 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGES 10–11 — GRILLE PERCÉE + PAGE-GRILLE DES MOTS (aligned pair)
# ════════════════════════════════════════════════════════════════════
GRID_COLS = ["A", "B", "C", "D", "E", "F"]
CELL = 2.5 * cm
GRID_SIZE = 6 * CELL
GRID_X0 = (W - GRID_SIZE) / 2
GRID_Y0 = 7.2 * cm

WORDS = {
    "A1": "SABLE", "B1": "JE", "C1": "LUNE", "D1": "PAPYRUS", "E1": "N'AI", "F1": "CALAME",
    "A2": "ÉTÉ", "B2": "JARDIN", "C2": "RIVIÈRE", "D2": "ENVOYÉ", "E2": "ÉTOILE", "F2": "ENCRE",
    "A3": "DÉSERT", "B3": "PALMIER", "C3": "QUE", "D3": "BOUGIE", "E3": "TAPIS", "F3": "POUR",
    "A4": "CARAVANE", "B4": "PARFAIRE", "C4": "COLOMBE", "D4": "ENCENS", "E4": "LES", "F4": "MINARET",
    "A5": "NOBLES", "B5": "FONTAINE", "C5": "GRENADE", "D5": "SAFRAN", "E5": "AMBRE", "F5": "MUSC",
    "A6": "DATTE", "B6": "TURBAN", "C6": "PARCHEMIN", "D6": "CARACTÈRES", "E6": "HORIZON", "F6": "ROSÉE",
}
WINDOWS = ["B1", "E1", "A2", "D2", "C3", "F3", "B4", "E4", "A5", "D6"]


def cell_rect(coord):
    col, row = coord[0], int(coord[1])
    ci = GRID_COLS.index(col)
    x = GRID_X0 + ci * CELL
    y = GRID_Y0 + (6 - row) * CELL
    return x, y, CELL, CELL


def draw_registration_crosses():
    pts = [
        (GRID_X0, GRID_Y0), (GRID_X0 + GRID_SIZE, GRID_Y0),
        (GRID_X0, GRID_Y0 + GRID_SIZE), (GRID_X0 + GRID_SIZE, GRID_Y0 + GRID_SIZE),
    ]
    c.setStrokeColor(ds.SEAL_RED)
    c.setLineWidth(0.6)
    for px, py in pts:
        off = 0.55 * cm
        sign_x = 1 if px > W / 2 else -1
        sign_y = 1 if py > GRID_Y0 + GRID_SIZE / 2 else -1
        ox, oy = px + sign_x * off, py + sign_y * off
        c.line(ox - 0.25 * cm, oy, ox + 0.25 * cm, oy)
        c.line(ox, oy - 0.25 * cm, ox, oy + 0.25 * cm)


def draw_print_note():
    c.setFont(ds.MONO, 7.2)
    c.setFillColor(ds.SEAL_RED)
    c.drawCentredString(W / 2, GRID_Y0 - 0.8 * cm,
                         "IMPRIMER À 100 % — PAS D'AJUSTEMENT À LA PAGE — pour préserver l'alignement millimétrique")


def page_grille_percee():
    page_bg()
    cx = W / 2
    c.setFont(ds.DISPLAY, 15)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, H - 3 * cm, "GRILLE PERCÉE")
    c.setFont(ds.BODY, 9)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, H - 3.65 * cm, "Voile de la Sagesse — découper les 10 fenêtres marquées")

    for r in range(1, 7):
        for col in GRID_COLS:
            coord = f"{col}{r}"
            x, y, w, h = cell_rect(coord)
            if coord in WINDOWS:
                c.setFillColor(ds.PARCHMENT)
                c.setStrokeColor(ds.SEAL_RED)
                c.setDash(2.2, 2.2)
                c.setLineWidth(1.0)
                c.rect(x + 0.12 * cm, y + 0.12 * cm, w - 0.24 * cm, h - 0.24 * cm, fill=1, stroke=1)
                c.setDash()
                c.setFont(ds.MONO, 6.6)
                c.setFillColor(ds.SEAL_RED)
                c.drawCentredString(x + w / 2, y + h / 2 - 2, coord)
                c.setFont(ds.MONO, 5.6)
                c.drawCentredString(x + w / 2, y + h * 0.24, "DÉCOUPER")
            else:
                c.setFillColor(ds.UMBER)
                c.setStrokeColor(ds.UMBER)
                c.setLineWidth(0.4)
                c.rect(x, y, w, h, fill=0, stroke=1)
                c.saveState()
                p = c.beginPath()
                p.rect(x, y, w, h)
                c.clipPath(p, stroke=0, fill=0)
                step = 0.34 * cm
                c.setStrokeColor(ds.UMBER)
                c.setLineWidth(0.35)
                n_lines = int((w + h) / step) + 2
                for k in range(-n_lines, n_lines):
                    x0, y0 = x + k * step, y
                    x1, y1 = x + k * step - h, y + h
                    c.line(x0, y0, x1, y1)
                c.restoreState()

    c.setStrokeColor(ds.GOLD)
    c.setLineWidth(1.6)
    c.rect(GRID_X0, GRID_Y0, GRID_SIZE, GRID_SIZE, fill=0, stroke=1)
    draw_registration_crosses()
    draw_print_note()

    instr = ("Imprimer sur carton fin (ou contrecoller sur du carton), découper le contour "
             "doré, puis découper au cutter les 10 fenêtres bordées de rouge en pointillés. "
             "Astuce : superposer les deux pages à contre-jour pour vérifier l'alignement "
             "des croix avant de découper.")
    ds.draw_paragraph(c, instr, 2.4 * cm, GRID_Y0 - 1.5 * cm, W - 4.8 * cm, ds.BODY, 8.2, 11, ds.INK)

    footer(page_no="10 / 15")
    c.showPage()


def page_page_grille():
    page_bg()
    cx = W / 2
    c.setFont(ds.DISPLAY, 15)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, H - 3 * cm, "PAGE-GRILLE DES MOTS")
    c.setFont(ds.BODY, 9)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, H - 3.65 * cm, "À glisser dans un gros livre de la bibliothèque")

    for r in range(1, 7):
        for col in GRID_COLS:
            coord = f"{col}{r}"
            x, y, w, h = cell_rect(coord)
            c.setStrokeColor(ds.UMBER)
            c.setLineWidth(0.4)
            c.rect(x, y, w, h, fill=0, stroke=1)
            word = WORDS[coord]
            size = 9.4 if len(word) <= 8 else 7.6
            c.setFont(ds.BODY_BOLD, size)
            c.setFillColor(ds.INK)
            c.drawCentredString(x + w / 2, y + h / 2 - 3, word)

    c.setStrokeColor(ds.GOLD)
    c.setLineWidth(1.6)
    c.rect(GRID_X0, GRID_Y0, GRID_SIZE, GRID_SIZE, fill=0, stroke=1)
    draw_registration_crosses()
    draw_print_note()

    instr = ("Pose la Grille percée exactement sur cette page (croix sur croix), et ne lis "
             "que les mots visibles à travers les 10 fenêtres, ligne par ligne, de gauche à "
             "droite. Les mots révélés forment une parole authentique du Prophète "
             "Muhammad (paix et bénédiction sur lui).")
    ds.draw_paragraph(c, instr, 2.4 * cm, GRID_Y0 - 1.5 * cm, W - 4.8 * cm, ds.BODY, 8.2, 11, ds.INK)

    footer(page_no="11 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGES 12–13 — LIVRET DES SAGESSES
# ════════════════════════════════════════════════════════════════════
HADITHS = [
    ("Le sourire que tu adresses à ton frère est une aumône.", "At-Tirmidhî"),
    ("Que celui qui croit en Allah et au Jour Dernier dise du bien, ou qu'il se taise.", "Al-Bukhârî et Muslim"),
    ("Facilitez les choses, ne les compliquez pas. Annoncez d'heureuses nouvelles, ne repoussez personne.", "Al-Bukhârî"),
    ("Allah est doux et Il aime la douceur en toute chose.", "Al-Bukhârî et Muslim"),
    ("La recherche du savoir est une obligation pour tout musulman.", "Ibn Mâjah"),
    ("Je n'ai été envoyé que pour parfaire les nobles caractères.", "Al-Bayhaqî"),
    ("Le plus fort d'entre vous n'est pas celui qui terrasse les autres à la lutte, mais celui qui se maîtrise lorsqu'il est en colère.", "Al-Bukhârî et Muslim, sens rapporté"),
    ("Celui qui ne remercie pas les gens ne remercie pas Allah.", "At-Tirmidhî"),
    ("Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", "Al-Bukhârî"),
]


def page_livret_cover():
    page_bg()
    cx = W / 2
    ds.draw_mihrab_arch(c, cx, H / 2 + 5 * cm, 6 * cm, 1.7 * cm, ds.GOLD, 1.3)
    c.setFont(ds.DISPLAY, 24)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, H / 2 + 3.6 * cm, "LIVRET DES SAGESSES")
    ds.draw_divider(c, cx, H / 2 + 2.9 * cm, 8 * cm, ds.GOLD)
    c.setFont(ds.POETIC, 11)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, H / 2 + 1.9 * cm, "Neuf paroles authentiques du Prophète Muhammad")
    c.setFont(ds.BODY, 9.5)
    c.drawCentredString(cx, H / 2 + 1.2 * cm, "Laquelle correspond au message révélé par la Grille percée ?")
    footer(page_no="12 / 15")
    c.showPage()


def page_livret_entries():
    page_bg()
    cx = W / 2
    c.setFont(ds.DISPLAY, 14)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, H - 2.4 * cm, "LES NEUF ENTRÉES")
    ds.draw_divider(c, cx, H - 2.9 * cm, 7 * cm, ds.GOLD)

    y = H - 3.8 * cm
    left = 2.6 * cm
    width = W - 5.2 * cm
    for i, (text, citation) in enumerate(HADITHS, start=1):
        c.setFont(ds.BODY_BOLD, 10.5)
        c.setFillColor(ds.GOLD)
        c.drawString(left, y, f"{i}.")
        y2 = ds.draw_paragraph(c, text, left + 0.6 * cm, y, width - 0.6 * cm,
                                ds.BODY, 9.6, 12.6, ds.INK)
        c.setFont(ds.MONO, 7)
        c.setFillColor(ds.UMBER)
        c.drawString(left + 0.6 * cm, y2 - 1, f"— {citation}")
        y = y2 - 0.62 * cm

    footer(page_no="13 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGE 14 — MANUSCRIT FINAL
# ════════════════════════════════════════════════════════════════════
def scroll_band(y, height):
    c.setFillColor(ds.UMBER)
    c.rect(0, y, W, height, fill=1, stroke=0)
    c.setStrokeColor(ds.GOLD)
    c.setLineWidth(0.8)
    c.line(0, y + height * 0.5, W, y + height * 0.5)


def page_manuscrit():
    page_bg()
    scroll_band(H - 1.7 * cm, 1.7 * cm)
    scroll_band(0, 1.7 * cm)
    cx = W / 2

    c.setFont(ds.DISPLAY, 17)
    c.setFillColor(ds.GOLD)
    c.drawCentredString(cx, H - 1.15 * cm, "MANUSCRIT FINAL")

    text = ("À vous qui avez percé les trois voies,\n\n"
            "Sachez que ce Coffre ne contenait, en vérité, aucun trésor d'or ni d'argent — "
            "car la véritable richesse de la Maison de la Sagesse n'a jamais été dans ses "
            "coffres, mais dans les esprits qui ont franchi son seuil.\n\n"
            "Vous avez marché sur la Voie de la Foi, et compté les pas d'une vie entière "
            "jusqu'au Pèlerinage. Vous avez marché sur la Voie de la Science, et tourné "
            "votre visage vers la Maison Sacrée comme l'ont fait des générations avant "
            "vous. Vous avez marché sur la Voie de la Sagesse, et découvert qu'un bon "
            "caractère vaut plus que mille calculs.\n\n"
            "Le Calife Al-Ma'mûn, depuis son trône, a suivi chacun de vos pas. Il vous "
            "déclare désormais Gardiens de la Maison de la Sagesse — un titre que nul "
            "voleur, fût-il le plus rusé de Bagdad, ne pourra jamais vous arracher.\n\n"
            "Que la lumière de ce savoir vous accompagne longtemps après que cette bougie "
            "se sera éteinte.")
    y_end = ds.draw_paragraphs(c, text.split("\n\n"), 3 * cm, H - 3.1 * cm, W - 6 * cm,
                                ds.POETIC, 11.3, 16, ds.INK)

    ds.draw_divider(c, cx, y_end - 0.6 * cm, 7 * cm, ds.GOLD)
    c.setFont(ds.BODY, 10)
    c.setFillColor(ds.UMBER)
    c.drawCentredString(cx, y_end - 1.4 * cm, "— Bayt al-Hikma, Bagdad, l'an 215 de l'Hégire —")

    footer(page_no="14 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
# PAGE 15 — FEUILLET DU MAÎTRE DU JEU
# ════════════════════════════════════════════════════════════════════
def page_mj():
    page_bg()
    cx = W / 2
    c.setFillColor(ds.SEAL_RED)
    c.rect(0, H - 1.5 * cm, W, 1.5 * cm, fill=1, stroke=0)
    c.setFont(ds.MONO_BOLD, 11)
    c.setFillColor(ds.PARCHMENT)
    c.drawCentredString(cx, H - 1.0 * cm, "FEUILLET DU MAÎTRE DU JEU — NE PAS MONTRER AUX JOUEURS")

    y = H - 2.4 * cm
    c.setFont(ds.DISPLAY, 16)
    c.setFillColor(ds.INK)
    c.drawCentredString(cx, y, "COMBINAISON FINALE : 5 – 7 – 6")
    y -= 0.9 * cm
    ds.draw_divider(c, cx, y, 8 * cm, ds.GOLD)
    y -= 1.0 * cm

    rows = [
        ("Énigme A — Foi", "Chiffre = 5",
         "Position du Hajj dans la rangée de vie : Shahada (1) · Salat (2) · Sawm (3) · "
         "Zakat (4) · Hajj (5)."),
        ("Énigme B — Science", "Chiffre = 7",
         "7 étoiles errantes sur l'astrolabe (Soleil, Lune, Mercure, Vénus, Mars, Jupiter, "
         "Saturne). Cap réel Bagdad → La Mecque ≈ 199,8° (~200°, Sud-Sud-Ouest)."),
        ("Énigme C — Sagesse", "Chiffre = 6",
         "La grille révèle « Je n'ai été envoyé que pour parfaire les nobles caractères » "
         "= entrée n°6 du Livret des Sagesses."),
    ]
    for title, chiffre, detail in rows:
        c.setFont(ds.BODY_BOLD, 11)
        c.setFillColor(ds.GOLD)
        c.drawString(2.4 * cm, y, title)
        c.setFont(ds.MONO_BOLD, 10)
        c.setFillColor(ds.SEAL_RED)
        c.drawRightString(W - 2.4 * cm, y, chiffre)
        y -= 0.55 * cm
        y = ds.draw_paragraph(c, detail, 2.4 * cm, y, W - 4.8 * cm, ds.BODY, 9.4, 12.4, ds.INK)
        y -= 0.55 * cm

    ds.draw_divider(c, cx, y, 8 * cm, ds.GOLD)
    y -= 0.9 * cm
    c.setFont(ds.BODY_BOLD, 10.5)
    c.setFillColor(ds.INK)
    c.drawString(2.4 * cm, y, "Marquage des tablettes (verso vierge, à crayonner avant de cacher) :")
    y -= 0.55 * cm
    mapping = "page 2 = Shahada · page 3 = Salat · page 4 = Sawm · page 5 = Zakat · page 6 = Hajj"
    y = ds.draw_paragraph(c, mapping, 2.4 * cm, y, W - 4.8 * cm, ds.MONO, 8.6, 11.6, ds.UMBER)
    y -= 0.7 * cm

    c.setFont(ds.BODY_BOLD, 10.5)
    c.setFillColor(ds.INK)
    c.drawString(2.4 * cm, y, "Jalons d'aide dynamique :")
    y -= 0.55 * cm
    jalons = [
        "15:00 — si 0 énigme résolue : indice niveau 1 (ambiance) sur l'énigme A.",
        "30:00 — si 0–1 énigme résolue : indice niveau 2 sur les énigmes non résolues.",
        "40:00 — si le code n'est pas complet : indice niveau 3 (solution directe) partout.",
    ]
    for j in jalons:
        y = ds.draw_paragraph(c, "• " + j, 2.7 * cm, y, W - 5.4 * cm, ds.BODY, 9.2, 12.2, ds.INK)
        y -= 0.18 * cm

    y -= 0.4 * cm
    c.setFillColor(ds.SEAL_RED)
    c.setFont(ds.MONO_BOLD, 8.6)
    c.drawString(2.4 * cm, y, "⚠ Vérifier avant le début : le cadenas n'est PAS déjà réglé sur 5-7-6.")

    footer(page_no="15 / 15")
    c.showPage()


# ════════════════════════════════════════════════════════════════════
page_cover()
for i, poem in enumerate(TABLETTES):
    page_tablette(poem, f"{i + 2} / 15")
page_carte_cle()
page_astrolabe()
page_parchemin()
page_grille_percee()
page_page_grille()
page_livret_cover()
page_livret_entries()
page_manuscrit()
page_mj()

c.save()
print("Wrote", OUT_PATH)
