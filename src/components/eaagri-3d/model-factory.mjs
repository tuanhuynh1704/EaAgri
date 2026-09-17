import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Deterministic, entirely geometric assets. No generated image, network texture,
// scanned model, commercial asset, or hidden asset dependency is used.
const V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
function random(seed = 230305) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const UP = V(0, 1, 0);
const mat = (name, roughness = 0.7, metalness = 0, extra = {}) => {
  const m = new T.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness,
    metalness,
    ...extra,
  });
  m.name = name;
  return m;
};
function transform(
  position = V(),
  scale = V(1, 1, 1),
  rotation = new T.Quaternion(),
) {
  return new T.Matrix4().compose(position, rotation, scale);
}
function euler(x = 0, y = 0, z = 0) {
  return new T.Quaternion().setFromEuler(new T.Euler(x, y, z));
}
function paint(g, hex, shade) {
  const col = new T.Color(hex),
    a = g.getAttribute("position"),
    data = [];
  for (let i = 0; i < a.count; i++) {
    const k = shade ? shade(a.getX(i), a.getY(i), a.getZ(i), i) : 1;
    data.push(col.r * k, col.g * k, col.b * k);
  }
  g.setAttribute("color", new T.Float32BufferAttribute(data, 3));
  return g;
}

class Baker {
  constructor(parent) {
    this.parent = parent;
    this.buckets = new Map();
  }
  add(g, material, color, matrix, shade) {
    if (matrix) g.applyMatrix4(matrix);
    g.deleteAttribute("uv");
    g.deleteAttribute("uv1");
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.index)
      g.setIndex(
        Array.from({ length: g.attributes.position.count }, (_, i) => i),
      );
    if (color) paint(g, color, shade);
    if (!g.attributes.color) paint(g, "#ffffff");
    if (!this.buckets.has(material)) this.buckets.set(material, []);
    this.buckets.get(material).push(g);
  }
  finish(prefix = "") {
    for (const [m, geos] of this.buckets) {
      const g = mergeGeometries(geos, false);
      g.computeBoundingSphere();
      const mesh = new T.Mesh(g, m);
      mesh.name = prefix + m.name;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.parent.add(mesh);
      geos.forEach((x) => x.dispose());
    }
    this.buckets.clear();
  }
}

function tube(points, r0, r1, radial = 9, segments = 12, bark = false) {
  const curve = new T.CatmullRomCurve3(points),
    frames = curve.computeFrenetFrames(segments, false);
  const pos = [],
    idx = [];
  for (let j = 0; j <= segments; j++) {
    const u = j / segments,
      p = curve.getPointAt(u),
      r = T.MathUtils.lerp(r0, r1, u);
    for (let k = 0; k <= radial; k++) {
      const a = (k / radial) * Math.PI * 2,
        ridge = bark
          ? 1 + 0.1 * Math.sin(a * 7 + u * 2) + 0.05 * Math.cos(a * 13 - u * 5)
          : 1;
      const q = p
        .clone()
        .addScaledVector(frames.normals[j], Math.cos(a) * r * ridge)
        .addScaledVector(frames.binormals[j], Math.sin(a) * r * ridge);
      pos.push(q.x, q.y, q.z);
      if (j < segments && k < radial) {
        const n = j * (radial + 1) + k;
        idx.push(
          n,
          n + radial + 1,
          n + 1,
          n + 1,
          n + radial + 1,
          n + radial + 2,
        );
      }
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function leafGeometry(detail = 6, underside = false) {
  const p = [0, 0, 0],
    i = [];
  for (let j = 1; j < detail; j++) {
    const t = j / detail,
      w = Math.pow(Math.sin(Math.PI * t), 0.8) * 0.105 * (1 - 0.25 * t),
      bend = -0.105 * t * t;
    p.push(
      -w,
      t * 0.64,
      bend,
      0,
      t * 0.64,
      bend + 0.03 * Math.sin(Math.PI * t),
      w,
      t * 0.64,
      bend,
    );
  }
  const tip = p.length / 3;
  p.push(0, 0.64, -0.105);
  i.push(0, 1, 2, 0, 2, 3);
  for (let j = 0; j < detail - 2; j++) {
    const s = 1 + j * 3;
    i.push(
      s,
      s + 3,
      s + 1,
      s + 1,
      s + 3,
      s + 4,
      s + 1,
      s + 4,
      s + 2,
      s + 2,
      s + 4,
      s + 5,
    );
  }
  const end = 1 + (detail - 2) * 3;
  i.push(end, tip, end + 1, end + 1, tip, end + 2);
  if (!underside)
    for (let j = 0; j < i.length; j += 3)
      [i[j + 1], i[j + 2]] = [i[j + 2], i[j + 1]];
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(p, 3));
  g.setIndex(i);
  g.computeVertexNormals();
  return g;
}

function terrain(rng, materials, root, low) {
  const island = new T.Group();
  island.name = "Island";
  root.add(island);
  const b = new Baker(island);
  const rings = low ? 48 : 80,
    levels = [
      { r: 0.08, y: -1.42 },
      { r: 1.8, y: -1.15 },
      { r: 2.9, y: -0.65 },
      { r: 3.38, y: -0.13 },
      { r: 3.36, y: 0 },
    ];
  const pos = [],
    idx = [];
  const rim = (a) =>
    1 +
    0.045 * Math.sin(a * 5) +
    0.038 * Math.cos(a * 9 + 0.8) +
    0.022 * Math.sin(a * 17);
  for (let j = 0; j < levels.length; j++)
    for (let k = 0; k <= rings; k++) {
      const a = (k / rings) * Math.PI * 2,
        q = levels[j],
        w = rim(a);
      pos.push(
        Math.cos(a) * q.r * w,
        q.y + (j > 0 ? 0.07 * Math.sin(a * 11 + j * 0.75) : 0),
        Math.sin(a) * q.r * w * 0.77,
      );
      if (j < levels.length - 1 && k < rings) {
        const n = j * (rings + 1) + k;
        idx.push(n, n + 1, n + rings + 1, n + 1, n + rings + 2, n + rings + 1);
      }
    }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  b.add(
    geo,
    materials.rock,
    "#665039",
    null,
    (x, y, z) => 0.65 + 0.2 * Math.sin(x * 12 + z * 4) + 0.16 * (y + 1.4),
  );
  const topPos = [0, 0.075, 0],
    topIdx = [];
  for (let k = 0; k <= rings; k++) {
    const a = (k / rings) * Math.PI * 2;
    topPos.push(
      Math.cos(a) * 3.36 * rim(a),
      0.015 + 0.07 * Math.sin(a * 11 + 3),
      Math.sin(a) * 3.36 * rim(a) * 0.77,
    );
    if (k < rings) topIdx.push(0, k + 2, k + 1);
  }
  const top = new T.BufferGeometry();
  top.setAttribute("position", new T.Float32BufferAttribute(topPos, 3));
  top.setIndex(topIdx);
  b.add(
    top,
    materials.ground,
    "#57702d",
    null,
    (x, y, z) => 0.8 + 0.16 * Math.sin(x * 2.8 + z * 3),
  );
  for (let n = 0; n < (low ? 27 : 48); n++) {
    const a = rng() * Math.PI * 2,
      rad = 2.8 + rng() * 0.4,
      s = 0.1 + rng() * 0.33;
    b.add(
      new T.DodecahedronGeometry(1, 1),
      materials.rock,
      n % 3 ? "#8a8061" : "#706951",
      transform(
        V(Math.cos(a) * rad, -0.3 - rng() * 0.4, Math.sin(a) * rad * 0.77),
        V(s * 1.5, s * 1.1, s),
        euler(rng(), rng() * 3, rng()),
      ),
      (x, y, z) => 0.8 + 0.16 * Math.sin(y * 18 + x * 4),
    );
  }
  // Small grass blades, fern rosettes and trailing roots are geometry, not cards.
  for (let n = 0; n < (low ? 360 : 1200); n++) {
    const a = rng() * Math.PI * 2,
      r = Math.sqrt(rng()) * 3.2,
      x = Math.cos(a) * r,
      z = Math.sin(a) * r * 0.75;
    const h = 0.06 + rng() * 0.16,
      w = 0.012 + rng() * 0.017;
    const g = new T.BufferGeometry();
    g.setAttribute(
      "position",
      new T.Float32BufferAttribute(
        [-w, 0, 0, w, 0, 0, w * 0.6, h * 0.65, 0, w * 1.3, h, 0.008],
        3,
      ),
    );
    g.setIndex([0, 1, 2, 0, 2, 3]);
    b.add(
      g,
      materials.grass,
      n % 4 ? "#729443" : "#a1b958",
      transform(V(x, 0.08, z), V(1, 1, 1), euler(0, a, 0)),
    );
  }
  for (let n = 0; n < 11; n++) {
    const a = (n / 11) * Math.PI * 2,
      r = 2.3 + (n % 3) * 0.19,
      x = Math.cos(a) * r,
      z = Math.sin(a) * r * 0.73;
    for (let k = 0; k < 9; k++) {
      const theta = (k / 9) * Math.PI * 2;
      const q = new T.Quaternion().setFromUnitVectors(
        UP,
        V(Math.cos(theta), 0.5, Math.sin(theta)).normalize(),
      );
      b.add(
        leafGeometry(5),
        materials.grass,
        k % 2 ? "#3d772e" : "#689c3a",
        transform(V(x, 0.09, z), V(0.8, 0.68, 0.8), q),
      );
    }
  }
  for (let n = 0; n < 14; n++) {
    const a = (n / 14) * Math.PI * 2,
      x = Math.cos(a) * 3.05,
      z = Math.sin(a) * 2.3;
    b.add(
      tube(
        [
          V(x, 0, z),
          V(x * 0.98, -0.45, z * 0.97),
          V(x * 0.92, -0.9 - rng() * 0.3, z * 0.94),
        ],
        0.026,
        0.003,
        5,
        6,
      ),
      materials.wood,
      "#4f582d",
    );
  }
  b.finish();
}

function durianFruit(materials, low, seed = 7) {
  const rng = random(seed),
    g = new T.Group(),
    b = new Baker(g),
    width = 0.3,
    height = 0.4;
  b.add(
    new T.SphereGeometry(1, low ? 16 : 24, low ? 12 : 20),
    materials.husk,
    "#879135",
    transform(V(0, -0.47, 0), V(width, height, width * 0.92)),
    (x, y, z) => 0.82 + 0.1 * Math.sin(y * 28 + x * 10),
  );
  const rows = low ? 12 : 18;
  for (let j = 1; j < rows; j++) {
    const theta = (j / rows) * Math.PI,
      count = Math.max(6, Math.round(Math.sin(theta) * (low ? 26 : 40)));
    for (let k = 0; k < count; k++) {
      const phi = ((k + (j % 2) * 0.5) / count) * Math.PI * 2;
      const normal = V(
        (Math.sin(theta) * Math.cos(phi)) / width,
        Math.cos(theta) / height,
        (Math.sin(theta) * Math.sin(phi)) / (width * 0.92),
      ).normalize();
      const p = V(
        width * Math.sin(theta) * Math.cos(phi),
        height * Math.cos(theta) - 0.47,
        width * 0.92 * Math.sin(theta) * Math.sin(phi),
      );
      const h = 0.038 + rng() * 0.035,
        q = new T.Quaternion().setFromUnitVectors(UP, normal);
      b.add(
        new T.ConeGeometry(0.028 + rng() * 0.012, h, low ? 4 : 5, 1),
        materials.husk,
        k % 4 ? "#a4a34a" : "#b7ae58",
        transform(p.addScaledVector(normal, h * 0.34), V(1, 1, 1), q),
      );
    }
  }
  b.add(
    tube(
      [V(0, 0, 0), V(0.013, -0.1, 0.003), V(0, -0.19, 0)],
      0.036,
      0.026,
      8,
      5,
    ),
    materials.wood,
    "#68562a",
  );
  // Five subtle longitudinal sutures under the spikes.
  if (!low)
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2,
        points = [];
      for (let j = 1; j < 12; j++) {
        const t = (j / 12) * Math.PI;
        points.push(
          V(
            Math.cos(a) * Math.sin(t) * width * 1.008,
            Math.cos(t) * height - 0.47,
            Math.sin(a) * Math.sin(t) * width * 0.92 * 1.008,
          ),
        );
      }
      b.add(tube(points, 0.006, 0.004, 4, 12), materials.husk, "#5d6c25");
    }
  b.finish();
  return g;
}

function durianTree(materials, root, low) {
  const rng = random(15376),
    tree = new T.Group();
  tree.name = "DurianTree";
  root.add(tree);
  const wood = new Baker(tree),
    canopies = [],
    fruits = [];
  const trunkPoints = [
    V(0, 0, 0),
    V(-0.1, 0.65, 0.02),
    V(0.07, 1.8, -0.06),
    V(-0.12, 2.8, 0.03),
    V(0.02, 3.8, -0.08),
    V(-0.1, 4.65, -0.1),
  ];
  wood.add(
    tube(trunkPoints, 0.31, 0.045, low ? 14 : 28, low ? 22 : 42, true),
    materials.wood,
    "#745637",
    null,
    (x, y, z) =>
      0.75 +
      0.12 * Math.sin(Math.atan2(z, x) * 17 + y * 0.7) +
      0.1 * Math.cos(y * 21 + x * 8),
  );
  for (let n = 0; n < 9; n++) {
    const a = (n / 9) * Math.PI * 2,
      end = V(
        Math.cos(a) * (0.65 + rng() * 0.45),
        0.085,
        Math.sin(a) * (0.65 + rng() * 0.35),
      );
    wood.add(
      tube(
        [
          V(-0.01, 0.48, 0),
          V(Math.cos(a) * 0.31, 0.18, Math.sin(a) * 0.31),
          end,
        ],
        0.12,
        0.012,
        9,
        10,
        true,
      ),
      materials.wood,
      "#695038",
    );
  }
  // Mature, layered lateral branches. Lower branches remain visible beneath leaves.
  for (let level = 0; level < 4; level++)
    for (let arm = 0; arm < 5; arm++) {
      const a = (arm / 5) * Math.PI * 2 + level * 0.56,
        y = 1.95 + level * 0.62,
        radius = 2.15 - level * 0.32;
      const start = V(0, y, 0),
        mid = V(
          Math.cos(a) * radius * 0.52,
          y + 0.32,
          Math.sin(a) * radius * 0.52,
        ),
        end = V(Math.cos(a) * radius, y + 0.54, Math.sin(a) * radius);
      wood.add(
        tube(
          [start, mid, end],
          0.12 - level * 0.014,
          0.017,
          low ? 7 : 11,
          12,
          true,
        ),
        materials.wood,
        "#715535",
      );
      for (let fork = 0; fork < 3; fork++) {
        const t = 0.48 + fork * 0.22,
          base = mid.clone().lerp(end, (t - 0.48) * 1.4),
          delta = (fork % 2 ? 1 : -1) * 0.55;
        const tip = V(
          Math.cos(a + delta) * (radius + 0.3),
          y + 0.45 + fork * 0.09,
          Math.sin(a + delta) * (radius + 0.3),
        );
        wood.add(
          tube(
            [
              base,
              base
                .clone()
                .lerp(tip, 0.5)
                .add(V(0, 0.12, 0)),
              tip,
            ],
            0.032,
            0.004,
            6,
            6,
          ),
          materials.wood,
          "#66502c",
        );
        const cluster = new T.Group();
        cluster.name = `Canopy_${level}_${arm}_${fork}`;
        cluster.position.copy(tip);
        tree.add(cluster);
        canopies.push(cluster);
        const leaves = new Baker(cluster),
          count = low ? 17 : 38;
        for (let leaf = 0; leaf < count; leaf++) {
          const az = rng() * Math.PI * 2,
            rr = Math.sqrt(rng()) * 0.56;
          const pos = V(
            Math.cos(az) * rr,
            (rng() - 0.45) * 0.38,
            Math.sin(az) * rr * 0.85,
          );
          const dir = V(
            Math.cos(az),
            -0.2 - rng() * 0.7,
            Math.sin(az),
          ).normalize();
          const rotation = new T.Quaternion()
            .setFromUnitVectors(UP, dir)
            .multiply(euler(0, (rng() - 0.5) * 1.5, 0));
          const size = 0.65 + rng() * 0.6,
            m = transform(pos, V(size, size, size), rotation);
          leaves.add(
            leafGeometry(low ? 4 : 6),
            materials.leaf,
            ["#2f7a3d", "#3d9147", "#55a653", "#246b35", "#6bb65a"][leaf % 5],
            m,
            (x, y, z) => 0.86 + 0.14 * Math.sin(y * 7 + leaf),
          );
          leaves.add(
            leafGeometry(low ? 4 : 6, true),
            materials.leafBack,
            ["#236b38", "#2f7d40", "#3c8d48"][leaf % 3],
            m,
          );
          if (!low && leaf % 2 === 0) {
            const vein = tube(
              [V(0, 0.02, 0.002), V(0, 0.32, 0.009), V(0, 0.57, -0.08)],
              0.0025,
              0.0006,
              3,
              4,
            );
            leaves.add(vein, materials.leaf, "#91a455", m);
          }
        }
        leaves.finish();
      }
    }
  // Crown tip, not a spherical blob.
  const top = new T.Group();
  top.name = "Canopy_crown";
  top.position.set(-0.1, 4.8, -0.1);
  tree.add(top);
  canopies.push(top);
  const topB = new Baker(top);
  for (let n = 0; n < (low ? 34 : 100); n++) {
    const a = rng() * Math.PI * 2,
      rr = rng() * 0.6,
      q = new T.Quaternion().setFromUnitVectors(
        UP,
        V(Math.cos(a), -0.3 + rng() * 0.5, Math.sin(a)).normalize(),
      ),
      m = transform(
        V(Math.cos(a) * rr, (rng() - 0.5) * 0.4, Math.sin(a) * rr),
        V(1, 1, 1),
        q,
      );
    topB.add(leafGeometry(6), materials.leaf, "#4b9b4d", m);
    topB.add(leafGeometry(6, true), materials.leafBack, "#2f783d", m);
  }
  topB.finish();
  const hanging = [
    [-1.62, 2.92, 0.95, 0.94],
    [-0.9, 3.42, 1.25, 1.02],
    [0.16, 3.55, 1.5, 0.98],
    [1.12, 3.25, 1.07, 1.04],
    [1.79, 2.87, 0.65, 0.85],
    [-0.8, 2.48, 1.12, 0.86],
    [0.67, 2.66, 1.29, 0.9],
    [0.12, 2.09, 0.7, 0.78],
    [-1.55, 3.3, -0.66, 0.82],
    [1.21, 3.69, -0.7, 0.88],
  ];
  hanging.forEach(([x, y, z, s], i) => {
    wood.add(
      tube(
        [
          V(x * 0.12, y - 0.25, z * 0.1),
          V(x * 0.6, y - 0.01, z * 0.55),
          V(x, y, z),
        ],
        0.075,
        0.03,
        8,
        9,
        true,
      ),
      materials.wood,
      "#785731",
    );
    const fruit = durianFruit(materials, low, 100 + i);
    fruit.name = `DurianFruit_${String(i + 1).padStart(2, "0")}`;
    fruit.position.set(x, y, z);
    fruit.scale.setScalar(s);
    fruit.rotation.z = i % 2 ? 0.03 : -0.04;
    tree.add(fruit);
    fruits.push(fruit);
  });
  wood.finish();
  return { tree, canopies, fruits };
}

function equipment(materials, root) {
  const group = new T.Group();
  group.name = "IoT";
  root.add(group);
  const b = new Baker(group);
  const box = (p, size, color, m = materials.equipment) =>
    b.add(new T.BoxGeometry(...size), m, color, transform(V(...p)));
  const ball = (p, size, color, m = materials.equipment) =>
    b.add(
      new T.SphereGeometry(1, 12, 8),
      m,
      color,
      transform(V(...p), V(...size)),
    );
  const pipe = (ps, r, c, m = materials.equipment) =>
    b.add(
      tube(
        ps.map((p) => V(...p)),
        r,
        r,
        10,
        16,
      ),
      m,
      c,
    );
  // Blue main feed and drip irrigation ring around the roots.
  pipe(
    [
      [-2.7, 0.14, 1.75],
      [-1.6, 0.15, 1.75],
      [0, 0.15, 1.64],
      [1.8, 0.15, 1.58],
      [2.05, 0.33, 1.48],
    ],
    0.053,
    "#287e9c",
  );
  const ring = new T.TorusGeometry(1.08, 0.027, 6, 70);
  ring.rotateX(Math.PI / 2);
  b.add(ring, materials.equipment, "#30464a", transform(V(0, 0.11, 0)));
  pipe(
    [
      [0, 0.12, 1.65],
      [0, 0.12, 1.1],
    ],
    0.024,
    "#24444b",
  );
  for (let n = 0; n < 8; n++) {
    const a = (n / 8) * Math.PI * 2;
    ball(
      [Math.cos(a) * 1.08, 0.15, Math.sin(a) * 1.08],
      [0.055, 0.03, 0.055],
      "#44aeba",
    );
  }
  // Pump, cooling ribs, valves, display and casing feet.
  box([1.8, 0.43, 1.48], [0.64, 0.47, 0.46], "#dbe7df");
  box([1.8, 0.18, 1.48], [0.78, 0.07, 0.6], "#264d46");
  for (let n = 0; n < 6; n++)
    box([1.61 + n * 0.07, 0.44, 1.73], [0.028, 0.25, 0.033], "#52776c");
  box([1.83, 0.6, 1.72], [0.29, 0.13, 0.018], "#183933");
  box([1.84, 0.61, 1.733], [0.22, 0.055, 0.009], "#46d9a4", materials.glow);
  pipe(
    [
      [2.09, 0.4, 1.46],
      [2.34, 0.4, 1.46],
      [2.34, 0.14, 1.46],
    ],
    0.049,
    "#27738c",
  );
  b.add(
    new T.TorusGeometry(0.09, 0.012, 6, 18),
    materials.metal,
    "#ca8b43",
    transform(V(2.3, 0.58, 1.45), V(1, 1, 1), euler(Math.PI / 2, 0, 0)),
  );
  // Moisture stake with a solar panel to the left.
  pipe(
    [
      [-1.86, 0.09, 1.34],
      [-1.86, 1.38, 1.34],
    ],
    0.038,
    "#aebcb4",
    materials.metal,
  );
  box([-1.86, 1.07, 1.34], [0.33, 0.4, 0.23], "#e0eadf");
  box([-1.86, 1.12, 1.463], [0.2, 0.13, 0.012], "#102f3c");
  ball([-1.86, 0.98, 1.46], [0.027, 0.027, 0.01], "#48e4b2", materials.glow);
  const solar = new T.Group();
  solar.name = "SolarPanel";
  solar.position.set(-1.86, 1.5, 1.29);
  solar.rotation.x = 0.34;
  group.add(solar);
  const sb = new Baker(solar);
  sb.add(new T.BoxGeometry(0.73, 0.055, 0.51), materials.metal, "#cbd7ca");
  for (let x = 0; x < 4; x++)
    for (let z = 0; z < 3; z++)
      sb.add(
        new T.BoxGeometry(0.157, 0.011, 0.142),
        materials.solar,
        "#163e64",
        transform(V((x - 1.5) * 0.173, 0.034, (z - 1) * 0.157)),
      );
  sb.finish();
  // Weather mast, radiation shield, cross bar and anemometer.
  pipe(
    [
      [2.2, 0.08, -0.32],
      [2.2, 1.9, -0.32],
    ],
    0.032,
    "#c7d4c9",
    materials.metal,
  );
  for (let n = 0; n < 6; n++)
    b.add(
      new T.CylinderGeometry(0.15, 0.18, 0.045, 20),
      materials.equipment,
      "#eef1e5",
      transform(V(2.2, 1.12 + n * 0.053, -0.32)),
    );
  pipe(
    [
      [1.87, 1.9, -0.32],
      [2.53, 1.9, -0.32],
    ],
    0.018,
    "#99b7a7",
  );
  for (let n = 0; n < 3; n++) {
    const a = (n / 3) * Math.PI * 2;
    pipe(
      [
        [2.2, 2.06, -0.32],
        [2.2 + Math.cos(a) * 0.25, 2.06, -0.32 + Math.sin(a) * 0.25],
      ],
      0.012,
      "#63867b",
    );
    ball(
      [2.2 + Math.cos(a) * 0.25, 2.06, -0.32 + Math.sin(a) * 0.25],
      [0.065, 0.047, 0.065],
      "#c0d5cb",
    );
  }
  // Two trunk camera/sensor enclosures.
  for (let n = 0; n < 2; n++) {
    const y = 1.1 + n * 0.91;
    box([0.06, y, 0.36], [0.25, 0.31, 0.12], "#e8ecda");
    box([0.06, y, 0.426], [0.2, 0.23, 0.013], "#375e55");
    b.add(
      new T.CylinderGeometry(0.055, 0.063, 0.04, 20),
      materials.glow,
      "#78e6bd",
      transform(V(0.06, y + 0.03, 0.45), V(1, 1, 1), euler(Math.PI / 2, 0, 0)),
    );
    pipe(
      [
        [0.18, y, 0.39],
        [0.3, y - 0.15, 0.3],
        [0.2, 0.15, 0.28],
      ],
      0.012,
      "#34493a",
    );
  }
  b.finish();
  const pumpHit = new T.Mesh(
    new T.BoxGeometry(0.82, 0.58, 0.68),
    new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  pumpHit.name = "PumpInteraction";
  pumpHit.position.set(1.8, 0.43, 1.48);
  group.add(pumpHit);
  return group;
}

function farmer(materials, root) {
  const g = new T.Group();
  g.name = "Farmer";
  g.position.set(2.55, 0.09, 1.03);
  g.rotation.y = -0.28;
  g.scale.setScalar(0.77);
  root.add(g);
  const b = new Baker(g);
  const sphere = (p, s, c) =>
    b.add(
      new T.SphereGeometry(1, 18, 12),
      materials.character,
      c,
      transform(V(...p), V(...s)),
    );
  const cyl = (a, end, r, c) =>
    b.add(
      tube([V(...a), V(...end)], r, r * 0.88, 10, 3),
      materials.character,
      c,
    );
  sphere([0, 1.16, 0], [0.29, 0.49, 0.19], "#3cae87");
  sphere([0, 1.92, 0.01], [0.3, 0.34, 0.28], "#e6b887");
  sphere([-0.29, 1.92, 0], [0.065, 0.1, 0.052], "#dfaa78");
  sphere([0.29, 1.92, 0], [0.065, 0.1, 0.052], "#dfaa78");
  sphere([0, 1.86, 0.285], [0.055, 0.055, 0.068], "#dca171");
  for (const x of [-0.108, 0.108]) {
    sphere([x, 1.99, 0.262], [0.04, 0.05, 0.013], "#fff4dc");
    sphere([x, 1.985, 0.278], [0.022, 0.031, 0.012], "#243832");
    sphere([x - 0.005, 1.998, 0.288], [0.007, 0.01, 0.004], "#ffffff");
  }
  b.add(
    tube(
      [V(-0.075, 1.79, 0.263), V(0, 1.765, 0.29), V(0.075, 1.79, 0.263)],
      0.009,
      0.009,
      5,
      7,
    ),
    materials.character,
    "#885535",
  );
  // Woven-looking hat brim and crown, with band and concentric strands.
  b.add(
    new T.CylinderGeometry(0.53, 0.54, 0.07, 36),
    materials.character,
    "#c69a59",
    transform(V(0, 2.2, 0)),
  );
  b.add(
    new T.CylinderGeometry(0.24, 0.34, 0.29, 28),
    materials.character,
    "#d1ac6b",
    transform(V(0, 2.36, 0)),
  );
  b.add(
    new T.CylinderGeometry(0.326, 0.34, 0.075, 28),
    materials.character,
    "#426a46",
    transform(V(0, 2.24, 0)),
  );
  for (let n = 0; n < 5; n++)
    b.add(
      new T.TorusGeometry(0.34 + n * 0.039, 0.004, 4, 40),
      materials.character,
      "#ac804a",
      transform(V(0, 2.24, 0), V(1, 1, 1), euler(Math.PI / 2, 0, 0)),
    );
  sphere([0, 0.82, 0.018], [0.27, 0.29, 0.21], "#32679d");
  b.add(
    new T.BoxGeometry(0.33, 0.41, 0.048),
    materials.character,
    "#3876ad",
    transform(V(0, 1.18, 0.185)),
  );
  for (const x of [-0.19, 0.19]) {
    cyl([x, 1.57, 0.1], [x * 0.74, 1.0, 0.23], 0.045, "#3a70a3");
    sphere([x * 0.74, 1.36, 0.213], [0.022, 0.023, 0.015], "#d2b45c");
    cyl([x, 0.7, 0.02], [x, 0.28, 0.055], 0.114, "#2c5687");
    sphere([x, 0.14, 0.1], [0.147, 0.19, 0.23], "#274c3c");
  }
  cyl([-0.24, 1.47, 0], [-0.37, 1.11, 0.08], 0.091, "#3ba585");
  cyl([-0.37, 1.11, 0.08], [-0.35, 0.95, 0.14], 0.064, "#e3af7e");
  sphere([-0.35, 0.94, 0.14], [0.078, 0.105, 0.075], "#e3af7e");
  cyl([0.24, 1.49, 0], [0.39, 1.19, 0.18], 0.087, "#3ca785");
  cyl([0.39, 1.19, 0.18], [0.48, 1.42, 0.34], 0.065, "#e4b588");
  sphere([0.48, 1.44, 0.33], [0.079, 0.09, 0.065], "#e4b588");
  b.add(
    new T.BoxGeometry(0.19, 0.32, 0.045),
    materials.equipment,
    "#233e3b",
    transform(V(0.48, 1.56, 0.28), V(1, 1, 1), euler(0.2, 0, -0.1)),
  );
  b.add(
    new T.BoxGeometry(0.14, 0.23, 0.005),
    materials.glow,
    "#7bdbc1",
    transform(V(0.48, 1.56, 0.31), V(1, 1, 1), euler(0.2, 0, -0.1)),
  );
  b.finish();
  return g;
}

function dog(materials, root, low) {
  const g = new T.Group();
  g.name = "Dog";
  g.position.set(-1.55, 0.1, 0.92);
  g.rotation.y = 0.18;
  g.scale.setScalar(low ? 0.72 : 0.86);
  root.add(g);
  const b = new Baker(g),
    legs = new Baker(g),
    tail = new Baker(g);
  const sphere = (p, s, c, m = materials.character) =>
    b.add(
      new T.SphereGeometry(1, low ? 10 : 14, low ? 7 : 10),
      m,
      c,
      transform(V(...p), V(...s)),
    );
  const leg = (x, z) =>
    legs.add(
      tube([V(x, 0.34, z), V(x, 0.1, z + 0.015)], 0.065, 0.052, 7, 4),
      materials.character,
      "#8a5a3b",
    );
  sphere([0, 0.48, 0], [0.38, 0.29, 0.58], "#a8734d");
  sphere([0, 0.74, 0.43], [0.3, 0.27, 0.32], "#bd8456");
  sphere(
    [-0.1, 0.77, 0.7],
    [0.045, 0.045, 0.035],
    "#21150f",
    materials.dogEyes,
  );
  sphere([0.1, 0.77, 0.7], [0.045, 0.045, 0.035], "#21150f", materials.dogEyes);
  sphere([0, 0.66, 0.75], [0.06, 0.05, 0.04], "#3b241c", materials.dogEyes);
  for (const x of [-0.19, 0.19]) for (const z of [-0.28, 0.28]) leg(x, z);
  b.add(
    new T.ConeGeometry(0.11, 0.27, 5),
    materials.character,
    "#6f472f",
    transform(V(-0.19, 0.91, 0.45), V(1, 1, 1), euler(-0.35, 0, 0.35)),
  );
  b.add(
    new T.ConeGeometry(0.11, 0.27, 5),
    materials.character,
    "#6f472f",
    transform(V(0.19, 0.91, 0.45), V(1, 1, 1), euler(-0.35, 0, -0.35)),
  );
  b.add(
    new T.TorusGeometry(0.23, 0.025, 6, 20),
    materials.glow,
    "#39b789",
    transform(V(0, 0.72, 0.43), V(1, 1, 1), euler(Math.PI / 2, 0, 0)),
  );
  tail.add(
    tube(
      [V(0, 0.58, -0.48), V(0.18, 0.75, -0.72), V(0.3, 0.68, -0.84)],
      0.045,
      0.018,
      7,
      7,
    ),
    materials.character,
    "#8a5a3b",
  );
  b.finish();
  legs.finish("DogLeg");
  tail.finish("DogTail");
  return g;
}

export function createFarmModel({ quality = "high", treeOnly = false } = {}) {
  const low = quality === "mobile",
    root = new T.Group();
  root.name = treeOnly ? "EaAgri_DurianTree" : "EaAgri_DurianFarm";
  root.userData = {
    version: "2.0.0",
    species: "Durio zibethinus",
    style: "stylized procedural interpretation; not a botanical scan",
    units: "metres",
    quality,
    seed: 15376,
  };
  const materials = {
    wood: mat("Bark", 0.96),
    leaf: mat("LeafUpper", 0.64),
    leafBack: mat("LeafBronzeUnderside", 0.84),
    husk: mat("DurianSpikyHusk", 0.92),
    rock: mat("CliffRock", 1),
    ground: mat("SoilMoss", 1),
    grass: mat("GrassFern", 0.9, 0, { side: T.DoubleSide }),
    equipment: mat("IoTEnclosure", 0.48, 0.16),
    metal: mat("Metal", 0.38, 0.52),
    solar: mat("SolarCells", 0.27, 0.46),
    glow: mat("IndicatorLight", 0.4, 0, {
      emissive: 0x3fdab0,
      emissiveIntensity: 0.45,
    }),
    dogEyes: mat("DogEyes", 0.22, 0),
    character: mat("FarmerMaterials", 0.72),
  };
  const { tree, canopies, fruits } = durianTree(materials, root, low);
  if (!treeOnly) {
    terrain(random(378), materials, root, low);
    equipment(materials, root);
    farmer(materials, root);
    dog(materials, root, low);
  }
  const anchors = {
    overview: [0.12, 3.22, 1.64],
    disease: [0.08, 2.02, 0.51],
    soil: [-1.86, 1.14, 1.51],
    weather: [2.2, 2.15, -0.32],
    irrigation: [1.8, 0.73, 1.59],
    assistant: [2.4, 1.72, 1.24],
  };
  for (const [id, p] of Object.entries(anchors)) {
    const anchor = new T.Object3D();
    anchor.name = `Hotspot_${id}`;
    anchor.position.set(...p);
    anchor.userData = { hotspot: id };
    root.add(anchor);
  }
  const tracks = [];
  canopies.forEach((obj, i) => {
    const values = [];
    for (let n = 0; n < 5; n++) {
      const a = Math.sin((n / 4) * Math.PI * 2 + i * 0.61) * 0.016;
      const q = euler(a * 0.4, 0, a);
      values.push(q.x, q.y, q.z, q.w);
    }
    tracks.push(
      new T.QuaternionKeyframeTrack(
        `${obj.name}.quaternion`,
        [0, 2, 4, 6, 8],
        values,
      ),
    );
  });
  fruits.forEach((obj, i) => {
    const values = [];
    for (let n = 0; n < 5; n++) {
      const q = euler(0, 0, Math.sin((n / 4) * Math.PI * 2 + i) * 0.023);
      values.push(q.x, q.y, q.z, q.w);
    }
    tracks.push(
      new T.QuaternionKeyframeTrack(
        `${obj.name}.quaternion`,
        [0, 2, 4, 6, 8],
        values,
      ),
    );
  });
  const clips = [new T.AnimationClip("Gentle_Breeze", 8, tracks)];
  root.updateMatrixWorld(true);
  return { root, tree, clips, anchors };
}
