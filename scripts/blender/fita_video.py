"""Codifica os quadros preparados da fita (PNG com transparência) em WebM VP9 com canal alfa.

O vídeo é transparente de verdade: no site ele fica por cima do fundo sem nenhum efeito de
mistura (mix-blend-mode), que deixava a rolagem pesada. O Safari não reproduz VP9 com alfa,
então lá o componente mostra o quadro estático `fita.webp`.

Uso: blender -b --factory-startup -P fita_video.py -- <pasta_quadros_preparados> <pasta_destino>
"""
import bpy, glob, os, sys

argv = sys.argv[sys.argv.index("--") + 1:]
SRC, DEST = argv[0], argv[1]
os.makedirs(DEST, exist_ok=True)

files = sorted(glob.glob(os.path.join(SRC, "fita_*.png")))
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

first = bpy.data.images.load(files[0])
scene.render.resolution_x, scene.render.resolution_y = first.size
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start, scene.frame_end = 1, len(files)
scene.render.film_transparent = True
try:
    scene.view_settings.view_transform = "Standard"
except TypeError:
    pass

ed = scene.sequence_editor_create()
strips = ed.strips if hasattr(ed, "strips") else ed.sequences
img = strips.new_image(name="Fita", filepath=files[0], channel=1, frame_start=1)
for f in files[1:]:
    img.elements.append(os.path.basename(f))
img.alpha_mode = "STRAIGHT"

settings = scene.render.image_settings
if hasattr(settings, "media_type"):
    settings.media_type = "VIDEO"
settings.file_format = "FFMPEG"
ff = scene.render.ffmpeg
ff.format = "WEBM"
ff.codec = "WEBM"
settings.color_mode = "RGBA"
ff.audio_codec = "NONE"
ff.gopsize = len(files)  # loop curto: um único quadro-chave
ff.constant_rate_factor = "LOW"
ff.ffmpeg_preset = "BEST"
scene.render.filepath = os.path.join(DEST, "fita.webm")
scene.render.use_file_extension = False
bpy.ops.render.render(animation=True)
print("ok", scene.render.filepath)
