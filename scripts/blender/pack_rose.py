import glob, os, sys
from PIL import Image
dest, width, q = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
frames = [Image.open(f).convert("RGBA") for f in sorted(glob.glob("out_rose/*.png"))]
box = None
for fr in frames:
    b = fr.getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
pad = 6
box = (max(0, box[0]-pad), max(0, box[1]-pad), box[2]+pad, box[3]+pad)
keep = [fr for i, fr in enumerate(frames) if i % 3 != 1 or i == len(frames) - 1]
size = (width, round(width * (box[3]-box[1]) / (box[2]-box[0])))
keep = [fr.crop(box).resize(size, Image.LANCZOS) for fr in keep]
durations = [66] * (len(keep) - 1) + [1000]
keep[0].save(os.path.join(dest, "rosa-desabrochando.webp"), save_all=True, append_images=keep[1:],
             duration=durations, loop=1, quality=q, method=4)
print(len(keep), "quadros", size, sum(durations[:-1]), "ms")
