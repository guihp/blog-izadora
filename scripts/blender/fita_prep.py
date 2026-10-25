"""Prepara os quadros da fita para o vídeo: reduz o tamanho e apaga suavemente as pontas
(direto na transparência, para o site não precisar de máscara CSS). Também gera o
quadro estático `fita.webp` usado por quem reduz movimento e pelo Safari.

Uso (Python do sistema, com Pillow): python fita_prep.py <quadros_blender> <saida> <pasta_efeitos> [largura]
"""
import glob, os, sys
from PIL import Image

src, out, efeitos = sys.argv[1], sys.argv[2], sys.argv[3]
width = int(sys.argv[4]) if len(sys.argv) > 4 else 1280
os.makedirs(out, exist_ok=True)

files = sorted(glob.glob(os.path.join(src, "fita_*.png")))
first = Image.open(files[0])
size = (width, round(width * first.height / first.width / 2) * 2)

# Máscara horizontal: 0 nas bordas, 1 no meio (14% de transição de cada lado)
fade = Image.new("L", (size[0], 1))
edge = int(size[0] * 0.14)
for x in range(size[0]):
    d = min(x, size[0] - 1 - x)
    t = min(1.0, d / edge)
    fade.putpixel((x, 0), round(255 * t * t * (3 - 2 * t)))
fade = fade.resize(size)

for i, f in enumerate(files):
    im = Image.open(f).convert("RGBA").resize(size, Image.LANCZOS)
    r, g, b, a = im.split()
    a = Image.composite(a, Image.new("L", size, 0), fade)
    im = Image.merge("RGBA", (r, g, b, a))
    im.save(os.path.join(out, f"fita_{i:04d}.png"))
    if i == 0:
        im.save(os.path.join(efeitos, "fita.webp"), quality=82, method=6)
print(len(files), "quadros", size)
