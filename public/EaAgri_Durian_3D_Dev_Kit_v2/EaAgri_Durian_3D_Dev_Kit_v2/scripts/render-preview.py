"""Optional geometry render for the handoff poster; not required by the web widget.
Requires numpy, Pillow, trimesh, pyrender and an OpenGL/EGL driver.
The poster is a render of the delivered GLB, not an AI reference image.
"""
import os
os.environ.setdefault('PYOPENGL_PLATFORM', 'egl')
from pathlib import Path
import numpy as np
import trimesh
import pyrender
from PIL import Image

BASE = Path(__file__).resolve().parent.parent

def pose(eye, target):
    eye, target = np.array(eye, dtype=float), np.array(target, dtype=float)
    z = eye-target
    z /= np.linalg.norm(z)
    x = np.cross([0, 1, 0], z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    matrix = np.eye(4)
    matrix[:3, :3] = np.stack([x, y, z], axis=1)
    matrix[:3, 3] = eye
    return matrix

asset = trimesh.load(BASE/'assets/eaagri-durian-high.glb', force='scene', process=False)
scene = pyrender.Scene(bg_color=[0,0,0,0], ambient_light=[.40,.40,.35])
for node_name in asset.graph.nodes_geometry:
    matrix, geometry_name = asset.graph[node_name]
    geometry = asset.geometry[geometry_name]
    mesh = pyrender.Mesh.from_trimesh(geometry, smooth=True)
    # Trimesh stores glTF COLOR_0 alongside TextureVisuals when a PBR material
    # is present. Pyrender's convenience importer otherwise drops those colors.
    colors = geometry.visual.vertex_attributes.get('color')
    if colors is not None:
        for primitive in mesh.primitives:
            primitive.color_0 = np.asarray(colors)
    scene.add(mesh, pose=matrix)
camera = pyrender.PerspectiveCamera(yfov=np.radians(32))
scene.add(camera, pose=pose([.3,4.6,13.7],[0,1.8,0]))
scene.add(pyrender.DirectionalLight(color=[1,.91,.74], intensity=2.3), pose=pose([-5,9,7],[0,2,0]))
scene.add(pyrender.DirectionalLight(color=[.82,1,.92], intensity=1.4), pose=pose([5,5,3],[0,2,0]))
scene.add(pyrender.DirectionalLight(color=[.95,1,.79], intensity=1.8), pose=pose([-1,8,-5],[0,3,0]))
renderer = pyrender.OffscreenRenderer(1800,1600)
color, depth = renderer.render(scene, flags=pyrender.RenderFlags.RGBA)
poster = BASE/'assets/poster.png'
temporary = BASE/'assets/poster.tmp.png'
Image.fromarray(color).save(temporary)
os.replace(temporary, poster)
renderer.delete()
print('Rendered', poster)
