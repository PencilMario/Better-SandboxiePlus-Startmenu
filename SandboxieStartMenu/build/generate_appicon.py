from __future__ import annotations

import ctypes
from ctypes import wintypes
from io import BytesIO
from pathlib import Path
from struct import pack

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parent
PROJECT_ICON = ROOT / "appicon.png"
ICO_PATH = ROOT / "windows" / "icon.ico"
SOURCE_ICON_PNG = ROOT / "sandboxie-start-menu-source.png"
START_EXE = Path(r"C:\Program Files\Sandboxie-Plus\Start.exe")


class ICONINFO(ctypes.Structure):
    _fields_ = [
        ("fIcon", ctypes.c_bool),
        ("xHotspot", ctypes.c_ulong),
        ("yHotspot", ctypes.c_ulong),
        ("hbmMask", ctypes.c_void_p),
        ("hbmColor", ctypes.c_void_p),
    ]


def rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def mix(a: tuple[int, int, int, int], b: tuple[int, int, int, int], t: float) -> tuple[int, int, int, int]:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(4))


def linear_gradient(size: int, start: tuple[int, int, int, int], mid: tuple[int, int, int, int], end: tuple[int, int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            color = mix(start, mid, t / 0.55) if t < 0.55 else mix(mid, end, (t - 0.55) / 0.45)
            px[x, y] = color
    return img


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def extract_icon_from_exe(path: Path, size: int) -> Image.Image:
    if not path.exists():
        raise FileNotFoundError(f"Sandboxie Start.exe not found: {path}")

    user32 = ctypes.windll.user32
    gdi32 = ctypes.windll.gdi32

    user32.PrivateExtractIconsW.argtypes = [
        wintypes.LPCWSTR,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.POINTER(wintypes.HICON),
        ctypes.c_void_p,
        ctypes.c_uint,
        ctypes.c_uint,
    ]
    user32.PrivateExtractIconsW.restype = ctypes.c_uint
    user32.GetIconInfo.argtypes = [wintypes.HICON, ctypes.POINTER(ICONINFO)]
    user32.GetIconInfo.restype = wintypes.BOOL
    user32.DestroyIcon.argtypes = [wintypes.HICON]
    user32.DestroyIcon.restype = wintypes.BOOL
    user32.GetDC.argtypes = [wintypes.HWND]
    user32.GetDC.restype = wintypes.HDC
    user32.ReleaseDC.argtypes = [wintypes.HWND, wintypes.HDC]
    user32.ReleaseDC.restype = ctypes.c_int
    gdi32.CreateCompatibleDC.argtypes = [wintypes.HDC]
    gdi32.CreateCompatibleDC.restype = wintypes.HDC
    gdi32.DeleteDC.argtypes = [wintypes.HDC]
    gdi32.DeleteDC.restype = wintypes.BOOL
    gdi32.DeleteObject.argtypes = [wintypes.HGDIOBJ]
    gdi32.DeleteObject.restype = wintypes.BOOL
    gdi32.GetDIBits.argtypes = [
        wintypes.HDC,
        wintypes.HBITMAP,
        ctypes.c_uint,
        ctypes.c_uint,
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.c_uint,
    ]
    gdi32.GetDIBits.restype = ctypes.c_int

    hicons = (wintypes.HICON * 1)()
    count = user32.PrivateExtractIconsW(str(path), 0, size, size, hicons, None, 1, 0)
    if count == 0 or not hicons[0]:
        raise RuntimeError(f"Could not extract icon from {path}")

    hicon = hicons[0]
    info = ICONINFO()
    if not user32.GetIconInfo(hicon, ctypes.byref(info)):
        user32.DestroyIcon(hicon)
        raise RuntimeError("GetIconInfo failed")

    try:
        hdc = user32.GetDC(None)
        memdc = gdi32.CreateCompatibleDC(hdc)
        bitmap_info = ctypes.create_string_buffer(40)
        ctypes.memset(bitmap_info, 0, 40)
        ctypes.cast(bitmap_info, ctypes.POINTER(ctypes.c_uint32))[0] = 40
        ctypes.cast(bitmap_info, ctypes.POINTER(ctypes.c_int32))[1] = size
        ctypes.cast(bitmap_info, ctypes.POINTER(ctypes.c_int32))[2] = -size
        ctypes.cast(bitmap_info, ctypes.POINTER(ctypes.c_uint16))[6] = 1
        ctypes.cast(bitmap_info, ctypes.POINTER(ctypes.c_uint16))[7] = 32
        pixels = ctypes.create_string_buffer(size * size * 4)
        gdi32.GetDIBits(memdc, info.hbmColor, 0, size, pixels, bitmap_info, 0)
        raw = bytes(pixels)
        img = Image.frombuffer("RGBA", (size, size), raw, "raw", "BGRA", 0, 1).copy()
        if img.getchannel("A").getextrema() == (0, 0):
            mask_pixels = ctypes.create_string_buffer(size * size * 4)
            gdi32.GetDIBits(memdc, info.hbmMask, 0, size, mask_pixels, bitmap_info, 0)
            mask = Image.frombuffer("RGBA", (size, size), bytes(mask_pixels), "raw", "BGRA", 0, 1).getchannel("R")
            img.putalpha(mask.point(lambda p: 255 - p))
        return img
    finally:
        if info.hbmColor:
            gdi32.DeleteObject(info.hbmColor)
        if info.hbmMask:
            gdi32.DeleteObject(info.hbmMask)
        gdi32.DeleteDC(memdc)
        user32.ReleaseDC(None, hdc)
        user32.DestroyIcon(hicon)


def paste_shadow(base: Image.Image, layer: Image.Image, blur: int, alpha: int, y: int) -> None:
    shadow_alpha = layer.getchannel("A").filter(ImageFilter.GaussianBlur(blur))
    shadow = Image.new("RGBA", base.size, (5, 20, 31, alpha))
    shadow.putalpha(shadow_alpha.point(lambda p: p * alpha // 255))
    base.alpha_composite(shadow, (0, y))
    base.alpha_composite(layer)


def draw_base(size: int) -> Image.Image:
    scale = size / 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg = linear_gradient(size, rgba("#2aaee6"), rgba("#176d9e"), rgba("#0d334e"))
    bg.putalpha(rounded_mask(size, round(224 * scale)))
    img.alpha_composite(bg)

    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle(tuple(round(v * scale) for v in (328, 212, 696, 520)), radius=round(104 * scale), fill=255)
    md.rounded_rectangle(tuple(round(v * scale) for v in (424, 300, 600, 448)), radius=round(36 * scale), fill=0)
    handle = Image.new("RGBA", (size, size), rgba("#f8fcff"))
    handle.putalpha(mask)
    layer.alpha_composite(handle)

    d = ImageDraw.Draw(layer, "RGBA")
    d.rounded_rectangle(tuple(round(v * scale) for v in (196, 400, 828, 820)), radius=round(76 * scale), fill=rgba("#e2eef4"))
    d.rounded_rectangle(tuple(round(v * scale) for v in (196, 400, 828, 532)), radius=round(76 * scale), fill=(255, 255, 255, 235))
    d.rectangle(tuple(round(v * scale) for v in (196, 476, 828, 532)), fill=(255, 255, 255, 235))
    d.rounded_rectangle(tuple(round(v * scale) for v in (284, 498, 740, 730)), radius=round(8 * scale), fill=(28, 71, 89, 235))
    d.rounded_rectangle(tuple(round(v * scale) for v in (320, 548, 700, 706)), radius=round(80 * scale), fill=(70, 157, 194, 72))
    paste_shadow(img, layer, round(18 * scale), 64, round(14 * scale))
    return img


def compose(size: int, source_icon: Image.Image) -> Image.Image:
    scale = size / 1024
    img = draw_base(size)
    icon_size = round(292 * scale)
    icon = source_icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    icon_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon_layer.alpha_composite(icon, (round(104 * scale), round(636 * scale)))
    img.alpha_composite(icon_layer)
    return img


def write_ico(images: list[Image.Image], out: Path) -> None:
    pngs = []
    for image in images:
        buf = BytesIO()
        image.save(buf, format="PNG")
        pngs.append(buf.getvalue())

    offset = 6 + 16 * len(images)
    entries = []
    for image, data in zip(images, pngs):
        width, height = image.size
        entries.append(pack("<BBBBHHII", 0 if width == 256 else width, 0 if height == 256 else height, 0, 0, 1, 32, len(data), offset))
        offset += len(data)

    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("wb") as f:
        f.write(pack("<HHH", 0, 1, len(images)))
        for entry in entries:
            f.write(entry)
        for data in pngs:
            f.write(data)


def render(size: int, source_icon: Image.Image) -> Image.Image:
    if size >= 512:
        return compose(size, source_icon)
    source = source_icon.resize((512, 512), Image.Resampling.LANCZOS)
    return compose(size * 3, source).resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    source_icon = extract_icon_from_exe(START_EXE, 256)
    SOURCE_ICON_PNG.parent.mkdir(parents=True, exist_ok=True)
    source_icon.save(SOURCE_ICON_PNG)
    render(1024, source_icon).save(PROJECT_ICON)
    write_ico([render(size, source_icon) for size in [256, 128, 64, 48, 32, 16]], ICO_PATH)


if __name__ == "__main__":
    main()
