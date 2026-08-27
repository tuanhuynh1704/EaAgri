import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ParticleTree3DProps {
  activeNode?: number | null;
}

const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uHoverIntensity;
  uniform float uPixelRatio;

  attribute float aType; // 0: base/soil, 1: trunk/branch, 2: canopy/leaf, 3: fruit
  attribute float aSize;
  attribute float aPhase;

  varying float vType;
  varying float vPhase;
  varying vec3 vWorldPos;
  varying float vMouseDist;

  void main() {
    vType = aType;
    vPhase = aPhase;

    vec3 pos = position;

    // 1. Natural Organic Wind Sway
    if (aType == 2.0) { // Canopy
      float wind = sin(uTime * 1.8 + pos.y * 1.5 + pos.x * 2.0 + aPhase) * 0.09;
      pos.x += wind * (pos.y * 0.45 + 0.55);
      pos.z += cos(uTime * 1.4 + pos.z * 1.2 + aPhase) * 0.07 * (pos.y * 0.45 + 0.55);
      pos.y += sin(uTime * 2.2 + aPhase) * 0.035;
    } else if (aType == 3.0) { // Fruits hanging sway
      float fruitSway = sin(uTime * 1.5 + aPhase * 3.14) * 0.06;
      pos.x += fruitSway;
      pos.z += cos(uTime * 1.3 + aPhase * 3.14) * 0.05;
    } else if (aType == 1.0) { // Trunk subtle breath
      pos.x += sin(uTime * 0.8 + pos.y) * 0.02;
    }

    // 2. Interactive Mouse Magnetic Repel / Ripple
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    float distToMouse = length(worldPos.xyz - uMouse);
    vMouseDist = distToMouse;

    float mouseForce = smoothstep(2.8, 0.0, distToMouse);
    vec3 dirFromMouse = normalize(worldPos.xyz - uMouse);
    pos += dirFromMouse * mouseForce * 0.35 * uHoverIntensity;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size calculation based on depth and pixel ratio
    float depthScale = 1.0 / (-mvPosition.z * 0.16);
    float pulse = sin(uTime * 2.8 + aPhase * 6.28) * 0.18 + 1.0;
    gl_PointSize = aSize * depthScale * pulse * uPixelRatio;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying float vType;
  varying float vPhase;
  varying vec3 vWorldPos;
  varying float vMouseDist;

  void main() {
    // Sharp circular point with soft edge glow
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float coreGlow = exp(-dist * dist * 10.0);
    float softEdge = smoothstep(0.5, 0.08, dist);

    // Dynamic rising bio-energy pulse
    float energyWave = sin(vWorldPos.y * 2.6 - uTime * 3.2 + vPhase * 2.5) * 0.5 + 0.5;
    energyWave = pow(energyWave, 2.5);

    vec3 color = vec3(0.05, 0.65, 0.35);
    float alpha = 0.95;

    if (vType == 0.0) {
      // 1. Root Base / Island Matrix (Deep Emerald & Teal Jade)
      vec3 deepMoss = vec3(0.04, 0.42, 0.26);
      vec3 tealJade = vec3(0.02, 0.68, 0.55);
      color = mix(deepMoss, tealJade, energyWave * 0.7);
      alpha = 0.88;
    } else if (vType == 1.0) {
      // 2. Trunk & Branches (Rich Wood Green / Cyber Branch)
      vec3 barkGreen = vec3(0.08, 0.48, 0.28);
      vec3 brightEmerald = vec3(0.12, 0.78, 0.46);
      color = mix(barkGreen, brightEmerald, energyWave * 0.85);
      alpha = 0.95;
    } else if (vType == 2.0) {
      // 3. Canopy / Leaves (Vibrant Saturated Emerald, Mint & Lime)
      vec3 deepEmerald = vec3(0.03, 0.58, 0.32);
      vec3 brightMint = vec3(0.08, 0.86, 0.48);
      vec3 sunnyLime = vec3(0.45, 0.88, 0.18);
      float shimmer = sin(uTime * 2.2 + vPhase * 6.28) * 0.5 + 0.5;
      color = mix(deepEmerald, brightMint, shimmer * 0.7);
      color = mix(color, sunnyLime, energyWave * 0.45);
      alpha = 0.96;
    } else if (vType == 3.0) {
      // 4. Durian Fruits (Warm Golden Amber & Mango Gold)
      vec3 amberGold = vec3(0.96, 0.62, 0.06);
      vec3 radiantGold = vec3(1.0, 0.82, 0.18);
      float fruitPulse = sin(uTime * 3.5 + vPhase * 3.14) * 0.5 + 0.5;
      color = mix(amberGold, radiantGold, fruitPulse * 0.8);
      alpha = 1.0;
    }

    // High-contrast solid core for crystal-clear daylight visibility
    color = mix(color, vec3(1.0, 1.0, 0.95), coreGlow * 0.28);
    alpha *= softEdge;

    gl_FragColor = vec4(color, alpha);
  }
`;

function generateDurianTreePointCloud() {
  const positions: number[] = [];
  const types: number[] = [];
  const sizes: number[] = [];
  const phases: number[] = [];

  const addPoint = (x: number, y: number, z: number, type: number, size: number) => {
    positions.push(x, y, z);
    types.push(type);
    sizes.push(size);
    phases.push(Math.random());
  };

  // 1. BASE / FLOATING ISLAND (Đảo gốc rễ - Voxel Matrix)
  const baseCount = 1100;
  for (let i = 0; i < baseCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 2.4;
    const yNorm = (2.4 - r) / 2.4;
    const y = -2.1 - Math.random() * 0.6 * (1.0 - yNorm * 0.4);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r * 0.84;
    addPoint(x, y, z, 0.0, 3.2 + Math.random() * 1.8);
  }

  // 2. TRUNK & MAIN BRANCHES (Thân & Cành cây)
  const trunkCount = 950;
  for (let i = 0; i < trunkCount; i++) {
    const t = i / trunkCount;
    const y = -2.1 + t * 2.7; // y from -2.1 to 0.6
    const trunkRadius = 0.42 * (1.0 - t * 0.52) + Math.random() * 0.06;
    const angle = Math.random() * Math.PI * 2;
    const spiral = y * 1.6;
    const x = Math.cos(angle + spiral) * trunkRadius + Math.sin(y * 1.1) * 0.09;
    const z = Math.sin(angle + spiral) * trunkRadius * 0.88;
    addPoint(x, y, z, 1.0, 3.4 + Math.random() * 1.6);
  }

  // Secondary Branches
  const branchCount = 7;
  for (let b = 0; b < branchCount; b++) {
    const branchAngle = (b / branchCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const branchStartY = -0.5 + (b % 3) * 0.45;
    const branchLen = 1.4 + Math.random() * 0.4;
    const pointsOnBranch = 140;

    for (let p = 0; p < pointsOnBranch; p++) {
      const progress = p / pointsOnBranch;
      const r = progress * branchLen;
      const y = branchStartY + progress * 0.75 - Math.pow(progress, 2.0) * 0.22;
      const x = Math.cos(branchAngle) * r + (Math.random() - 0.5) * 0.14;
      const z = Math.sin(branchAngle) * r * 0.86 + (Math.random() - 0.5) * 0.14;
      addPoint(x, y, z, 1.0, 3.0 + Math.random() * 1.4);
    }
  }

  // 3. CANOPY FOLIAGE (Tán lá sầu riêng sum suê)
  const clusters = [
    { x: 0, y: 1.4, z: 0, rx: 1.7, ry: 1.2, rz: 1.5, count: 1100 },
    { x: -1.0, y: 0.95, z: 0.45, rx: 1.2, ry: 0.9, rz: 1.1, count: 800 },
    { x: 1.05, y: 0.9, z: -0.35, rx: 1.25, ry: 0.9, rz: 1.1, count: 800 },
    { x: -0.45, y: 1.9, z: -0.45, rx: 1.1, ry: 0.8, rz: 0.95, count: 650 },
    { x: 0.45, y: 2.0, z: 0.35, rx: 1.05, ry: 0.8, rz: 0.9, count: 650 },
    { x: 0, y: 2.45, z: 0, rx: 0.9, ry: 0.7, rz: 0.8, count: 500 },
    { x: 0.25, y: 0.55, z: 0.85, rx: 1.0, ry: 0.65, rz: 0.85, count: 500 },
  ];

  clusters.forEach((c) => {
    for (let i = 0; i < c.count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.96;

      const sinPhi = Math.sin(phi);
      const x = c.x + r * sinPhi * Math.cos(theta) * c.rx;
      const y = c.y + r * Math.cos(phi) * c.ry;
      const z = c.z + r * sinPhi * Math.sin(theta) * c.rz;

      addPoint(x, y, z, 2.0, 3.8 + Math.random() * 2.4);
    }
  });

  // 4. DURIAN FRUITS (Quả sầu riêng vàng hổ phách óng ánh)
  const fruits = [
    { x: -0.7, y: 0.35, z: 0.5, size: 0.32, count: 220 },
    { x: 0.75, y: 0.42, z: 0.38, size: 0.34, count: 230 },
    { x: -0.45, y: -0.08, z: -0.45, size: 0.29, count: 200 },
    { x: 0.55, y: 0.12, z: -0.5, size: 0.32, count: 220 },
    { x: 0.08, y: 0.68, z: 0.72, size: 0.3, count: 210 },
  ];

  fruits.forEach((f) => {
    for (let i = 0; i < f.count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const spike = (Math.sin(theta * 12) * Math.sin(phi * 12) > 0.25) ? 1.1 : 0.95;
      const r = f.size * (0.85 + Math.random() * 0.15) * spike;

      const x = f.x + r * Math.sin(phi) * Math.cos(theta) * 0.88;
      const y = f.y + r * Math.cos(phi) * 1.28;
      const z = f.z + r * Math.sin(phi) * Math.sin(theta) * 0.88;

      addPoint(x, y, z, 3.0, 4.2 + Math.random() * 2.0);
    }
  });

  return {
    positions: new Float32Array(positions),
    types: new Float32Array(types),
    sizes: new Float32Array(sizes),
    phases: new Float32Array(phases),
  };
}

export default function ParticleTree3D({ activeNode: _activeNode }: ParticleTree3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let rafId = 0;
    let hovering = false;
    let hoverIntensity = 0;
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointer = new THREE.Vector2(0, 0);

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 480;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
    } catch (e) {
      console.error("WebGL initialization failed:", e);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 7.2);

    const data = generateDurianTreePointCloud();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute("aType", new THREE.BufferAttribute(data.types, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(data.sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(data.phases, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: mouse3D },
        uHoverIntensity: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending, // NormalBlending for bright, rich, solid visibility on daylight backgrounds
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    points.rotation.x = 0.1;
    points.rotation.y = -0.2;

    const clock = new THREE.Clock();
    clock.start();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 480;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hit)) {
        mouse3D.copy(hit);
      }
    };

    const handlePointerEnter = () => {
      hovering = true;
    };

    const handlePointerLeave = () => {
      hovering = false;
      mouse3D.set(999, 999, 999);
    };

    window.addEventListener("resize", handleResize);
    container.addEventListener("mousemove", handlePointerMove as unknown as EventListener);
    container.addEventListener("mouseenter", handlePointerEnter);
    container.addEventListener("mouseleave", handlePointerLeave);

    const loop = () => {
      if (disposed || !renderer) return;
      rafId = requestAnimationFrame(loop);

      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;

      hoverIntensity += ((hovering ? 1 : 0) - hoverIntensity) * 0.1;
      material.uniforms.uHoverIntensity.value = hoverIntensity;

      // Gentle continuous 3D rotation (Duoke signature magnetic spin)
      points.rotation.y = -0.2 + Math.sin(t * 0.45) * 0.28 + (hovering ? pointer.x * 0.35 : 0);
      points.rotation.x = 0.08 + Math.cos(t * 0.35) * 0.08 + (hovering ? -pointer.y * 0.2 : 0);

      renderer.render(scene, camera);
    };

    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove as unknown as EventListener);
      container.removeEventListener("mouseenter", handlePointerEnter);
      container.removeEventListener("mouseleave", handlePointerLeave);
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="particle-tree-3d-wrapper">
      <canvas ref={canvasRef} className="particle-tree-3d-canvas" />
    </div>
  );
}
