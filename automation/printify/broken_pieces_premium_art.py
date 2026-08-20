import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W, H = 4500, 5400
TRANSPARENT = (0, 0, 0, 0)


def _font_path(italic=False):
    candidates = ([
        "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Oblique.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf",
    ] if italic else [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ])
    for path in candidates:
        if os.path.exists(path):
            return path
    return None


def font(size, italic=False):
    path = _font_path(italic)
    return ImageFont.truetype(path, size) if path else ImageFont.load_default()


def fit_font(draw, text, max_width, start, floor=120, italic=False):
    size = start
    while size >= floor:
        candidate = font(size, italic)
        box = draw.textbbox((0, 0), text, font=candidate)
        if box[2] - box[0] <= max_width:
            return candidate
        size -= 16
    return font(floor, italic)


def heart_points(cx, cy, scale):
    points = []
    for i in range(320):
        t = math.pi * 2 * i / 320
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        points.append((cx + x * scale, cy - y * scale))
    return points


def texture_rgb(seed, dark=(58, 49, 42), mid=(133, 111, 88), light=(210, 188, 158)):
    rng = random.Random(seed)
    sw, sh = 760, 920
    coarse = Image.effect_noise((sw, sh), 70).filter(ImageFilter.GaussianBlur(1.8))
    fine = Image.effect_noise((sw, sh), 28)
    gray = Image.blend(coarse, fine, 0.32).resize((W, H), Image.Resampling.BICUBIC)
    base = ImageOps.colorize(gray, dark, light)
    draw = ImageDraw.Draw(base)
    for _ in range(700):
        x = rng.randrange(W)
        y = rng.randrange(H)
        radius = rng.randrange(3, 18)
        if rng.random() < 0.58:
            color = tuple(max(0, min(255, value + rng.randrange(-24, 25))) for value in mid)
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    return base


def apply_texture(image, mask, seed, dark, mid, light, distress_seed=None, distress_count=700):
    working = mask.copy()
    if distress_seed is not None:
        rng = random.Random(distress_seed)
        draw = ImageDraw.Draw(working)
        bbox = working.getbbox()
        if bbox:
            x0, y0, x1, y1 = bbox
            for _ in range(distress_count):
                x = rng.randint(x0, max(x0, x1 - 1))
                y = rng.randint(y0, max(y0, y1 - 1))
                rw = rng.randint(8, 46)
                rh = rng.randint(3, 18)
                draw.ellipse((x, y, x + rw, y + rh), fill=rng.choice([0, 40, 80]))
    texture = texture_rgb(seed, dark, mid, light).convert("RGBA")
    texture.putalpha(working)
    image.alpha_composite(texture)


def text_mask(text, y, size, max_width=3700, italic=False):
    candidate = fit_font(ImageDraw.Draw(Image.new("L", (1, 1))), text, max_width, size, max(120, int(size * 0.55)), italic)
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    box = draw.textbbox((0, 0), text, font=candidate)
    width = box[2] - box[0]
    draw.text(((W - width) // 2, y), text, font=candidate, fill=255)
    return mask


def textured_text(image, text, y, size, seed, max_width=3700, italic=False, palette="tan"):
    mask = text_mask(text, y, size, max_width, italic)
    if palette == "gold":
        colors = ((104, 67, 27), (186, 124, 50), (255, 205, 118))
    elif palette == "darktan":
        colors = ((72, 59, 48), (140, 112, 82), (195, 156, 112))
    else:
        colors = ((94, 79, 64), (167, 141, 108), (225, 204, 174))
    apply_texture(
        image,
        mask,
        seed,
        *colors,
        distress_seed=seed + 900,
        distress_count=(70 if italic else 180),
    )


def draw_label(image, y=3700, seed=99):
    textured_text(image, "BROKEN PIECES", y, 380, seed, 3400)


def premium_glow_line(image, points, width=28):
    glow = Image.new("RGBA", (W, H), TRANSPARENT)
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.line(points, fill=(255, 145, 38, 205), width=width * 5, joint="curve")
    glow = glow.filter(ImageFilter.GaussianBlur(width * 2.4))
    image.alpha_composite(glow)

    core = Image.new("RGBA", (W, H), TRANSPARENT)
    core_draw = ImageDraw.Draw(core)
    core_draw.line(points, fill=(255, 177, 63, 255), width=width * 2, joint="curve")
    core_draw.line(points, fill=(255, 236, 183, 255), width=max(8, width // 2), joint="curve")
    image.alpha_composite(core)


def add_stone_cracks(image, lines):
    draw = ImageDraw.Draw(image)
    for line in lines:
        draw.line(line, fill=(25, 20, 17, 245), width=58, joint="curve")
        draw.line(line, fill=(79, 62, 46, 235), width=19, joint="curve")


def front_cracked_heart():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(heart_points(2030, 1900, 108), fill=255)
    apply_texture(image, mask, 101, (76, 62, 50), (160, 132, 101), (226, 203, 170), distress_seed=404)

    cracks = [
        [(2020, 840), (1900, 1290), (2110, 1650), (1880, 2020), (2070, 2410), (1940, 2920)],
        [(1900, 1290), (1550, 1480), (1310, 1820)],
        [(2110, 1650), (2470, 1500), (2740, 1200)],
        [(1880, 2020), (1510, 2180), (1320, 2500)],
        [(2070, 2410), (2420, 2300), (2680, 1980)],
        [(1550, 1480), (1670, 1120)],
        [(2470, 1500), (2540, 1120)],
    ]
    add_stone_cracks(image, cracks)

    draw = ImageDraw.Draw(image)
    draw.polygon([(2670, 1120), (3110, 1400), (2840, 1700), (3070, 2010), (2760, 2290), (2990, 2620), (2550, 3070)], fill=TRANSPARENT)
    rng = random.Random(505)
    for index in range(24):
        x = rng.randint(2740, 3540)
        y = rng.randint(1120, 2860)
        size = rng.randint(70, 210)
        shard = Image.new("L", (W, H), 0)
        shard_draw = ImageDraw.Draw(shard)
        shard_draw.polygon([(x, y), (x + size, y + rng.randint(-40, 80)), (x + rng.randint(15, size), y + size)], fill=255)
        apply_texture(image, shard, 600 + index, (80, 65, 52), (155, 127, 96), (220, 196, 163), distress_count=0)
    draw_label(image, 3600, 808)
    return image


def front_kintsugi_heart():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(heart_points(2250, 1900, 110), fill=255)
    apply_texture(image, mask, 202, (22, 21, 20), (67, 58, 49), (128, 105, 77), distress_seed=808)
    cracks = [
        [(2100, 830), (2170, 1250), (2010, 1560), (2300, 1930), (2180, 2310), (2350, 2900)],
        [(2170, 1250), (1730, 1180), (1450, 1450)],
        [(2010, 1560), (1650, 1870), (1470, 2260)],
        [(2300, 1930), (2760, 1730), (3040, 1420)],
        [(2180, 2310), (2630, 2380), (2880, 2720)],
        [(1730, 1870), (1890, 2440), (1710, 2730)],
        [(2760, 1730), (2850, 2180)],
    ]
    for line in cracks:
        premium_glow_line(image, line, 24)
    draw_label(image, 3600, 818)
    return image


def cross_mask():
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((1810, 620, 2690, 3190), radius=35, fill=255)
    draw.rounded_rectangle((920, 1270, 3580, 2130), radius=35, fill=255)
    return mask


def front_broken_cross():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = cross_mask()
    apply_texture(image, mask, 303, (35, 31, 28), (90, 76, 61), (158, 131, 98), distress_seed=909)
    cracks = [
        [(2250, 650), (2120, 1110), (2350, 1430), (2130, 1770), (2350, 2140), (2190, 2610), (2320, 3140)],
        [(2120, 1110), (1800, 1320), (1460, 1430)],
        [(2350, 1430), (2730, 1280), (3120, 1460)],
        [(2130, 1770), (1730, 1870), (1240, 1780)],
        [(2350, 2140), (2770, 1980), (3260, 2080)],
    ]
    for line in cracks:
        premium_glow_line(image, line, 30)
    rng = random.Random(1203)
    draw = ImageDraw.Draw(image)
    for _ in range(55):
        x = rng.randint(1100, 3400)
        y = rng.randint(800, 3000)
        radius = rng.randint(10, 38)
        if rng.random() < 0.55:
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(156, 118, 74, rng.randint(90, 190)))
    draw_label(image, 3570, 828)
    return image


def puzzle_mask():
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((1280, 850, 3200, 3040), radius=80, fill=255)
    draw.ellipse((1950, 520, 2550, 1120), fill=255)
    draw.ellipse((2920, 1610, 3520, 2210), fill=255)
    draw.ellipse((1950, 2740, 2550, 3340), fill=0)
    draw.ellipse((980, 1610, 1580, 2210), fill=0)
    return mask


def front_puzzle_piece():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = puzzle_mask()
    mask_draw = ImageDraw.Draw(mask)
    broken_holes = [
        (2760, 1450, 3120, 1810),
        (2900, 1760, 3260, 2140),
        (2670, 1950, 3060, 2310),
        (2980, 2140, 3380, 2500),
    ]
    for box in broken_holes:
        mask_draw.ellipse(box, fill=0)
    mask_draw.polygon([(3040, 1350), (3490, 1580), (3260, 1890), (3510, 2110), (3240, 2490), (3040, 2300)], fill=0)
    apply_texture(image, mask, 404, (25, 24, 22), (70, 61, 53), (139, 114, 86), distress_seed=1001, distress_count=900)

    cracks = [
        [(2460, 930), (2590, 1340), (2470, 1690), (2740, 2030), (2610, 2470), (2860, 2860)],
        [(2470, 1690), (2090, 1580), (1840, 1310)],
    ]
    for line in cracks:
        premium_glow_line(image, line, 25)
    for edge in [
        [(2790, 1480), (3000, 1600), (2860, 1780)],
        [(2910, 1780), (3120, 1930), (2930, 2140)],
        [(2710, 1980), (2910, 2160), (2780, 2300)],
        [(3000, 2160), (3200, 2320), (3060, 2460)],
    ]:
        premium_glow_line(image, edge, 30)

    rng = random.Random(1414)
    for index in range(20):
        x = rng.randint(3050, 3630)
        y = rng.randint(1400, 2550)
        size = rng.randint(35, 120)
        shard = Image.new("L", (W, H), 0)
        shard_draw = ImageDraw.Draw(shard)
        shard_draw.polygon([(x, y), (x + size, y + rng.randint(-25, 65)), (x + rng.randint(10, size), y + size)], fill=255)
        apply_texture(image, shard, 1500 + index, (55, 45, 36), (110, 86, 60), (190, 145, 90), distress_count=0)
    draw_label(image, 3570, 838)
    return image


def front_streetwear():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    textured_text(image, "BROKEN", 760, 1150, 505, 3600)
    textured_text(image, "PIECES", 1900, 1150, 506, 3600)
    textured_text(image, "STILL BREATHING.", 3300, 460, 507, 3200, True, "gold")
    return image


def wrap_lines(text, max_width, start=560, max_lines=6):
    draw = ImageDraw.Draw(Image.new("L", (1, 1)))
    candidate = font(start)
    lines = []
    current = ""
    for word in text.split():
        option = (current + " " + word).strip()
        if draw.textbbox((0, 0), option, font=candidate)[2] <= max_width:
            current = option
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    if len(lines) > max_lines:
        return wrap_lines(text, max_width, start - 30, max_lines)
    return lines, candidate


def back_statement(text, kind):
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    lines, candidate = wrap_lines(text, 3300, 540, 6)
    line_height = int(candidate.size * 1.06)
    total_height = line_height * len(lines)
    y = max(760, (H - total_height) // 2 - 330)
    for index, line in enumerate(lines):
        textured_text(image, line, y + index * line_height, candidate.size, 700 + index, 3400)
    if kind == "broken-cross":
        underline_y = y + len(lines) * line_height + 120
        underline = Image.new("L", (W, H), 0)
        underline_draw = ImageDraw.Draw(underline)
        underline_draw.arc((1250, underline_y - 80, 3250, underline_y + 170), 190, 350, fill=255, width=25)
        apply_texture(image, underline, 901, (110, 73, 38), (189, 126, 59), (242, 190, 115), distress_count=0)
    textured_text(image, "Willy Will", min(H - 820, y + total_height + 460), 340, 933, 2100, True, "gold")
    return image


def back_streetwear():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mark = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mark)
    cx, cy = 2250, 850
    draw.arc((cx - 300, cy - 170, cx + 40, cy + 130), 190, 360, fill=255, width=36)
    draw.arc((cx - 30, cy - 250, cx + 360, cy + 130), 180, 350, fill=255, width=36)
    draw.line((cx - 230, cy + 90, cx + 230, cy + 90), fill=255, width=36)
    draw.polygon([(2250, 760), (2090, 1080), (2240, 1060), (2150, 1350), (2440, 980), (2280, 1000)], fill=255)
    apply_texture(image, mark, 1002, (97, 58, 24), (187, 123, 50), (247, 194, 111), distress_count=0)
    textured_text(image, "Willy Will", 4000, 320, 1003, 1800, True, "gold")
    return image


def build_art(spec):
    builders = {
        "cracked-heart": front_cracked_heart,
        "kintsugi-heart": front_kintsugi_heart,
        "broken-cross": front_broken_cross,
        "streetwear": front_streetwear,
        "puzzle-piece": front_puzzle_piece,
    }
    front = builders[spec["front_kind"]]()
    back = back_streetwear() if spec["front_kind"] == "streetwear" else back_statement(spec["back_text"], spec["front_kind"])
    return front, back
