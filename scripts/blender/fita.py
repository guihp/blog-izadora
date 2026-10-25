"""Renderiza uma fita de cetim ondulando em loop perfeito (fundo transparente).

Uso: blender -b --factory-startup -P fita.py -- <pasta_saida> [quadros] [largura] [altura]
Depois: blender -b --factory-startup -P fita_video.py -- <pasta_quadros> <destino> [largura]
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else os.path.join(os.getcwd(), "out_fita")
FRAMES = int(argv[1]) if len(argv) > 1 else 168
W = int(argv[2]) if len(argv) > 2 else 1600
H = int(argv[3]) if len(argv) > 3 else 500
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1.0]


def setin(node, names, value):
    for n in names if isinstance(names, (list, tuple)) else [names]:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return


# ───────── Render ─────────
for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        scene.render.engine = eng
        break
    except TypeError:
        pass
try:
    scene.eevee.taa_render_samples = 64
except AttributeError:
    pass
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
try:
    scene.view_settings.view_transform = "Standard"
except TypeError:
    pass

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = lin("#FFF1EE")
bg.inputs[1].default_value = 0.3

# ───────── Material de cetim ─────────
mat = bpy.data.materials.new("Cetim")
mat.use_nodes = True
try:
    mat.use_backface_culling = False
except AttributeError:
    pass
nt = mat.node_tree
bsdf = nt.nodes["Principled BSDF"]
# Degradê ao longo do comprimento: rosa-claro → rosa antigo → rosa-claro
uv = nt.nodes.new("ShaderNodeTexCoord")
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
ramp = nt.nodes.new("ShaderNodeValToRGB")
nt.links.new(uv.outputs["UV"], sep.inputs[0])
nt.links.new(sep.outputs["X"], ramp.inputs[0])
els = ramp.color_ramp.elements
els[0].position, els[0].color = 0.0, lin("#E2B4BF")
els[1].position, els[1].color = 1.0, lin("#DDA9B6")
els.new(0.5).color = lin("#B97A8B")
nt.links.new(ramp.outputs[0], bsdf.inputs["Base Color"])
setin(bsdf, "Roughness", 0.26)
setin(bsdf, "Anisotropic", 0.75)
setin(bsdf, ["Sheen Weight", "Sheen"], 0.6)
setin(bsdf, "Sheen Tint", lin("#FFFFFF"))
setin(bsdf, ["Specular IOR Level", "Specular"], 0.55)
setin(bsdf, ["Subsurface Weight", "Subsurface"], 0.05)

# ───────── Malha da fita ─────────
NU, NV = 420, 10
LENGTH, WIDTH = 30.0, 1.25
mesh = bpy.data.meshes.new("Fita")
bm = bmesh.new()
uv_layer = bm.loops.layers.uv.new("UVMap")
verts = [[bm.verts.new((0, 0, 0)) for _ in range(NV)] for _ in range(NU)]
for i in range(NU - 1):
    for j in range(NV - 1):
        bm.faces.new((verts[i][j], verts[i + 1][j], verts[i + 1][j + 1], verts[i][j + 1]))
for f in bm.faces:
    f.smooth = True
bm.to_mesh(mesh)
bm.free()
obj = bpy.data.objects.new("Fita", mesh)
scene.collection.objects.link(obj)
obj.data.materials.append(mat)

# UVs: X = posição ao longo do comprimento, Y = largura
uvl = mesh.uv_layers[0].data
for poly in mesh.polygons:
    for li in poly.loop_indices:
        vi = mesh.loops[li].vertex_index
        uvl[li].uv = ((vi // NV) / (NU - 1), (vi % NV) / (NV - 1))


def frame_coords(phase):
    """Posições dos vértices para uma fase entre 0 e 2π (loop perfeito)."""
    def center(u):
        x = u
        y = 0.65 * math.sin(0.32 * u + phase) + 0.25 * math.sin(0.75 * u - 2 * phase)
        z = 1.4 * math.cos(0.4 * u + phase) + 0.4 * math.sin(0.8 * u + 2 * phase)
        return Vector((x, y, z))

    coords = []
    up = Vector((0, 0, 1))
    for i in range(NU):
        u = -LENGTH / 2 + LENGTH * i / (NU - 1)
        c = center(u)
        t = (center(u + 0.01) - center(u - 0.01)).normalized()
        n1 = up.cross(t).normalized()
        n2 = t.cross(n1).normalized()
        twist = 0.45 + 1.2 * math.sin(0.36 * u + phase) + 0.3 * math.sin(0.9 * u - phase)
        w = n1 * math.cos(twist) + n2 * math.sin(twist)
        for j in range(NV):
            p = c + w * (WIDTH * (j / (NV - 1) - 0.5))
            coords.extend(p)
    return coords


# ───────── Luzes e câmera ─────────
def area(name, loc, rot, size, energy, color="#FFFFFF"):
    d = bpy.data.lights.new(name, "AREA")
    d.size, d.energy, d.color = size, energy, lin(color)[:3]
    o = bpy.data.objects.new(name, d)
    o.location, o.rotation_euler = loc, rot
    scene.collection.objects.link(o)


area("Chave", (-6, 6, 10), (math.radians(-38), math.radians(-30), 0), 16, 2600, "#FFF6EE")
area("Contra", (7, -5, 6), (math.radians(40), math.radians(35), 0), 14, 700, "#FFE4EA")
area("Preenchimento", (0, 0, 14), (0, 0, 0), 20, 120)

cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 19.5
cam = bpy.data.objects.new("Cam", cam_data)
cam.location = (0, 0, 30)
scene.collection.objects.link(cam)
scene.camera = cam
obj.rotation_euler = (0, 0, math.radians(2))

# ───────── Quadros ─────────
for f in range(FRAMES):
    mesh.vertices.foreach_set("co", frame_coords(2 * math.pi * f / FRAMES))
    mesh.update()
    scene.render.filepath = os.path.join(OUT, f"fita_{f:04d}.png")
    bpy.ops.render.render(write_still=True)
print("ok", FRAMES, "quadros em", OUT)
