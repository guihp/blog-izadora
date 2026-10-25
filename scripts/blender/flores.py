"""Renderiza pétalas soltas e uma rosa desabrochando (fundo transparente).

Uso: blender -b -P flores.py -- petals|rose <pasta_saida> [frames]
"""
import bpy, math, os, random, sys
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = argv[0] if argv else "petals"
OUT = argv[1] if len(argv) > 1 else os.path.join(os.getcwd(), "out")
FRAMES = int(argv[2]) if len(argv) > 2 else 56
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
    scene.eevee.taa_render_samples = 48
except AttributeError:
    pass
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
try:
    scene.view_settings.view_transform = "Standard"
except TypeError:
    pass
scene.view_settings.exposure = 0.0

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = lin("#FFF4F0")
bg.inputs[1].default_value = 0.6


# ───────── Materiais ─────────
def petal_material(name, base, mid, edge, sss=0.15):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    try:
        m.use_backface_culling = False
    except AttributeError:
        pass
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    uv = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(uv.outputs["UV"], sep.inputs[0])
    nt.links.new(sep.outputs["Y"], ramp.inputs[0])
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.0, lin(base)
    els[1].position, els[1].color = 1.0, lin(edge)
    e = els.new(0.45)
    e.color = lin(mid)
    nt.links.new(ramp.outputs[0], bsdf.inputs["Base Color"])
    setin(bsdf, "Roughness", 0.6)
    setin(bsdf, ["Subsurface Weight", "Subsurface"], sss)
    setin(bsdf, "Subsurface Scale", 0.05)
    setin(bsdf, ["Sheen Weight", "Sheen"], 0.35)
    setin(bsdf, "Sheen Tint", lin("#FFFFFF"))
    return m


def plain_material(name, color, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    try:
        m.use_backface_culling = False
    except AttributeError:
        pass
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = lin(color)
    setin(bsdf, "Roughness", rough)
    setin(bsdf, ["Sheen Weight", "Sheen"], 0.2)
    return m


# ───────── Geometria da pétala ─────────
def petal_mesh(name, length=1.0, width=0.55, cup=0.35, curl=0.2, notch=0.05,
               ruffle=0.015, seed=0, leaf=False, ru=40, rv=30):
    verts, faces = [], []
    for i in range(ru + 1):
        u = i / ru
        for j in range(rv + 1):
            v = -1 + 2 * j / rv
            if leaf:
                w = width * math.sin(math.pi * u ** 0.85) ** 0.9
                uu = u
            else:
                w = width * (u ** 0.85) * max(0.0, 1 - u ** 3.2) ** 0.45
                uu = u * (1 - notch * math.exp(-(v / 0.25) ** 2) * u ** 6)
            x = v * w
            y = uu * length
            # bordas sobem (concha), ponta curva para fora
            z = cup * v * v * w - curl * uu ** 3
            z += ruffle * math.sin(v * 9 + seed * 1.7) * u * u * abs(v)
            if leaf:
                z += 0.04 * abs(v) * w  # nervura central
            verts.append((x, y, z))
    for i in range(ru):
        for j in range(rv):
            a = i * (rv + 1) + j
            faces.append((a, a + 1, a + rv + 2, a + rv + 1))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    uvl = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        poly.use_smooth = True
        for li in poly.loop_indices:
            vi = me.loops[li].vertex_index
            uvl.data[li].uv = ((vi % (rv + 1)) / rv, (vi // (rv + 1)) / ru)
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob


def add_light(name, loc, energy, size, color):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy, ld.size, ld.color = energy, size, color[:3]
    ob = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob


def add_camera(loc, target, ortho_scale):
    cd = bpy.data.cameras.new("Cam")
    cd.type = "ORTHO"
    cd.ortho_scale = ortho_scale
    ob = bpy.data.objects.new("Cam", cd)
    scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.camera = ob
    return ob


PALETTES = [
    ("#D493A5", "#E8BAC6", "#F8E7EB"),
    ("#CF8C9F", "#E3B0BD", "#F6E0E6"),
    ("#E0A9B6", "#F0CDD5", "#FDF1F3"),
    ("#C98799", "#DFA9B6", "#F3D9E0"),
]


def light_rig(scale=1.0):
    add_light("Key", (-3 * scale, -2.5 * scale, 5 * scale), 210 * scale * scale, 4 * scale, lin("#FFF1E6"))
    add_light("Fill", (3.5 * scale, -1.5 * scale, 2.5 * scale), 80 * scale * scale, 5 * scale, lin("#FFE3EA"))
    add_light("Rim", (0.5 * scale, 4 * scale, 3 * scale), 120 * scale * scale, 3 * scale, lin("#FFFFFF"))


# ═════════ Pétalas soltas ═════════
if MODE == "petals":
    scene.render.resolution_x = scene.render.resolution_y = 240
    light_rig()
    add_camera((0, 0, 6), (0, 0, 0), 1.35)
    rnd = random.Random(7)
    for k in range(8):
        pal = PALETTES[k % len(PALETTES)]
        ob = petal_mesh(f"P{k}", length=1.0, width=0.5 + 0.08 * rnd.random(),
                        cup=0.25 + 0.25 * rnd.random(), curl=0.1 + 0.3 * rnd.random(),
                        notch=0.03 + 0.06 * rnd.random(), seed=k)
        ob.data.materials.append(petal_material(f"M{k}", *pal))
        # centraliza pelo meio da pétala e inclina para dar profundidade
        ob.location = (0, 0, 0)
        ob.data.transform(Matrix.Translation((0, -0.5, 0)))
        ob.rotation_euler = (math.radians(rnd.uniform(-35, 35)), math.radians(rnd.uniform(-40, 40)),
                             math.radians(rnd.uniform(0, 360)))
        for other in scene.objects:
            if other.type == "MESH":
                other.hide_render = other is not ob
        scene.render.filepath = os.path.join(OUT, f"petala-{k + 1}.png")
        bpy.ops.render.render(write_still=True)

# ═════════ Rosa desabrochando ═════════
elif MODE == "rose":
    res = 480
    scene.render.resolution_x = scene.render.resolution_y = res
    light_rig(1.0)
    elev = math.radians(58)
    dist = 8
    add_camera((0, -dist * math.cos(elev), dist * math.sin(elev)), (0, 0, 0.25), 3.5)

    root = bpy.data.objects.new("Root", None)
    scene.collection.objects.link(root)

    # (qtd, raio, comprimento, largura, concha, curl, ângulo fechado, ângulo aberto, atraso)
    rings = [
        (3, 0.03, 0.42, 0.30, 0.65, 0.02, 0.00, 0.16, 0.45),
        (5, 0.07, 0.58, 0.40, 0.55, 0.06, 0.02, 0.40, 0.34),
        (6, 0.12, 0.76, 0.50, 0.45, 0.14, 0.05, 0.74, 0.22),
        (7, 0.17, 0.92, 0.58, 0.36, 0.22, 0.08, 1.04, 0.10),
        (8, 0.22, 1.02, 0.62, 0.28, 0.30, 0.12, 1.26, 0.00),
    ]
    rnd = random.Random(3)
    petals = []  # (objeto, ângulo phi, raio, fechado, aberto, atraso)
    pal_by_ring = [PALETTES[3], PALETTES[3], PALETTES[1], PALETTES[0], PALETTES[2]]
    for r, (n, rad, ln, wd, cup, curl, a0, a1, delay) in enumerate(rings):
        mat = petal_material(f"R{r}", *pal_by_ring[r])
        off = rnd.uniform(0, math.pi)
        for k in range(n):
            phi = off + 2 * math.pi * k / n + rnd.uniform(-0.12, 0.12)
            ob = petal_mesh(f"R{r}_{k}", length=ln * rnd.uniform(0.94, 1.06), width=wd, cup=cup,
                            curl=curl, notch=0.04, seed=r * 10 + k)
            ob.data.materials.append(mat)
            ob.parent = root
            ob.rotation_mode = "QUATERNION"
            petals.append((ob, phi, rad, a0 + rnd.uniform(-0.04, 0.04), a1 + rnd.uniform(-0.08, 0.08), delay))

    leaf_mat = plain_material("Folha", "#9DB091")
    for k in range(3):
        phi = 0.6 + 2 * math.pi * k / 3
        ob = petal_mesh(f"F{k}", length=1.25, width=0.42, cup=0.12, curl=0.18, leaf=True, seed=40 + k)
        ob.data.materials.append(leaf_mat)
        ob.parent = root
        ob.rotation_mode = "QUATERNION"
        petals.append((ob, phi, 0.12, 0.55, 1.45, 0.0))

    def place(ob, phi, rad, theta, z0=0.0):
        s, c = math.sin(theta), math.cos(theta)
        # eixos da pétala no espaço radial: y = comprimento, z = face interna
        y = Vector((s, 0, c))
        z = Vector((-c, 0, s))
        x = y.cross(z)
        m = Matrix((x, y, z)).transposed()
        rot = Matrix.Rotation(phi, 3, "Z") @ m
        ob.rotation_quaternion = rot.to_quaternion()
        ob.location = Matrix.Rotation(phi, 3, "Z") @ Vector((rad, 0, z0))

    def ease(t):
        t = max(0.0, min(1.0, t))
        return t * t * (3 - 2 * t)

    def ease_out(t):
        t = max(0.0, min(1.0, t))
        return 1 - (1 - t) ** 3

    total = FRAMES
    for f in range(total):
        t = f / (total - 1)
        for ob, phi, rad, a0, a1, delay in petals:
            local = ease_out((t - delay) / (1 - delay * 0.6))
            theta = a0 + (a1 - a0) * local
            place(ob, phi, rad + 0.05 * local, theta, z0=0.0 if not ob.name.startswith("F") else -0.05)
        sc = 0.62 + 0.38 * ease_out(t * 1.1)
        root.scale = (sc, sc, sc)
        root.rotation_euler = (0, 0, math.radians(-25 + 25 * ease_out(t)))
        scene.render.filepath = os.path.join(OUT, f"rosa-{f:03d}.png")
        bpy.ops.render.render(write_still=True)

print("OK", MODE, scene.render.engine)
