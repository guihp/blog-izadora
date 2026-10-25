import glob, os, sys
from PIL import Image
dest = sys.argv[1]
for f in sorted(glob.glob("out_petals/*.png")):
    im = Image.open(f).convert("RGBA")
    im = im.crop(im.getbbox())
    im.thumbnail((96, 96), Image.LANCZOS)
    im.save(os.path.join(dest, os.path.basename(f)[:-4] + ".webp"), quality=86, method=6)
frames = [Image.open(f).convert("RGBA") for f in sorted(glob.glob("out_rose/*.png"))]
box = frames[-1].getbbox()
for fr in frames:
    b = fr.getbbox()
    if b: box = (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
pad = 6
box = (max(0, box[0]-pad), max(0, box[1]-pad), box[2]+pad, box[3]+pad)
size = (360, round(360 * (box[3]-box[1]) / (box[2]-box[0])))
frames = [fr.crop(box).resize(size, Image.LANCZOS) for fr in frames]
durations = [45] * (len(frames) - 1) + [1000]
frames[0].save(os.path.join(dest, "rosa-desabrochando.webp"), save_all=True, append_images=frames[1:],
               duration=durations, loop=1, quality=82, method=6, minimize_size=True)
frames[-1].save(os.path.join(dest, "rosa.webp"), quality=86, method=6)
print("rosa", size)
