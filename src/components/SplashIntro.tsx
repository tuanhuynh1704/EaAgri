import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";

interface SplashIntroProps {
  onComplete?: () => void;
  titleLines?: string[];
  forceShow?: boolean;
}

const DEFAULT_TITLE_LINES = [
  "Chào mừng đến với hệ sinh thái",
  "NÔNG NGHIỆP THÔNG MINH EA AGRI"
];

const TYPE_DURATION = 1100;
const TYPE_DELAY = 120;
const HOLD_AFTER_TYPED = 500;
const MAX_SPLASH = 2800;
const SPLASH_SEEN_KEY = "eaagri_homepage_splash_seen_v1";

const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform vec3 uCameraPosition;
  uniform float uHoverIntensity;
  uniform float uConvergence;
  uniform float uWarp;
  uniform vec2 uWarpTarget;

  varying float vDistanceFromCenter;
  varying float vMouseInfluence;
  varying vec3 vWorldPosition;
  varying float vDepth;
  varying float vTunnelProgress;

  vec3 applyGravitationalLensing(vec3 pos, float time) {
    vec2 toCenter = pos.xy;
    float radialDist = length(toCenter);
    float horizonWarp = smoothstep(2.4, 0.4, radialDist);
    float warpStrength = horizonWarp * 0.22;
    float angle = atan(pos.y, pos.x);
    float spiralSpeed = (1.0 - radialDist * 0.35) * time * 0.4;
    float newAngle = angle + spiralSpeed * horizonWarp;
    vec2 warped = vec2(cos(newAngle) * radialDist, sin(newAngle) * radialDist);
    pos.xy = mix(toCenter, warped, warpStrength);
    float compression = horizonWarp * 0.12;
    pos.xy *= (1.0 - compression);
    return pos;
  }

  vec3 applySpacetimeRipples(vec3 pos, float time) {
    float wave1 = sin(pos.z * 1.5 - time * 2.0) * 0.04;
    float wave2 = cos(pos.z * 2.5 + time * 1.5) * 0.03;
    float radialDist = length(pos.xy);
    float rippleStrength = smoothstep(2.5, 0.8, radialDist);
    pos.xy += normalize(pos.xy) * (wave1 + wave2) * rippleStrength;
    return pos;
  }

  void main() {
    vec3 pos = position;
    vTunnelProgress = (position.z + 12.5) / 25.0;
    float warpTargetEase = smoothstep(0.02, 1.18, uWarp);

    float convEase = 1.0 - pow(1.0 - uConvergence, 3.0);
    pos.xy *= mix(2.6, 1.0, convEase);
    pos.z *= mix(1.5, 1.0, convEase);

    pos = applyGravitationalLensing(pos, uTime);
    pos = applySpacetimeRipples(pos, uTime);

    float resonance = sin(uTime * 2.0) * 0.5 + 0.5;
    float resonanceStrength = sin(vTunnelProgress * 6.28318 + uTime * 3.0) * 0.02;
    pos.xy += normalize(pos.xy) * resonanceStrength * resonance;

    vec2 toCenter = -pos.xy;
    float radialDist = length(pos.xy);
    float gravityPull = smoothstep(1.8, 0.4, radialDist);
    float breathe = sin(uTime * 0.5) * 0.08 + 1.0;
    pos.xy += normalize(toCenter) * gravityPull * 0.12 * breathe;
    pos.xy += uWarpTarget * warpTargetEase;

    vDistanceFromCenter = smoothstep(2.8, 0.4, radialDist);

    vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vWorldPosition = worldPos;

    float depthFromCamera = length(uCameraPosition - worldPos);
    vDepth = depthFromCamera;

    float distToMouse = length(worldPos - uMouse);
    float mouseInfluence = smoothstep(3.5, 0.0, distToMouse);
    mouseInfluence = pow(mouseInfluence, 2.0) * uHoverIntensity;
    vMouseInfluence = mouseInfluence;

    vec3 direction = normalize(uMouse - worldPos);
    pos += direction * mouseInfluence * 0.35;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depthSize = smoothstep(20.0, 2.0, depthFromCamera);
    float centerSize = vDistanceFromCenter * 2.6;
    float perspectiveScale = 1.0 / (1.0 + depthFromCamera * 0.06);
    float warpSize = 1.0 + uWarp * 6.0;
    gl_PointSize = (3.0 + depthSize * 5.2 + centerSize + mouseInfluence * 0.8) * perspectiveScale * warpSize;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uHoverIntensity;
  varying float vDistanceFromCenter;
  varying float vMouseInfluence;
  varying vec3 vWorldPosition;
  varying float vDepth;
  varying float vTunnelProgress;

  vec3 getWormholeColor(vec3 worldPos, float tunnelProgress, float time) {
    float radialDist = length(worldPos.xy);
    float horizonGlow = smoothstep(1.8, 0.0, radialDist);
    
    // Light Eco Theme: Emerald Bio, Mint, Golden Amber Pollen, Forest Teal
    vec3 leafDeep = vec3(0.04, 0.42, 0.25);
    vec3 emeraldBio = vec3(0.06, 0.72, 0.42);
    vec3 goldenPollen = vec3(0.95, 0.68, 0.12);
    vec3 mintAqua = vec3(0.08, 0.65, 0.55);

    float resonance = sin(time * 2.0) * 0.5 + 0.5;
    float colorPhase1 = sin(tunnelProgress * 3.14159 + time * 0.5) * 0.5 + 0.5;
    float colorPhase2 = cos(radialDist * 2.5 - time * 0.6) * 0.5 + 0.5;
    float colorPhase3 = sin(radialDist * 3.0 + time * 0.8) * 0.5 + 0.5;

    vec3 baseColor = mix(leafDeep, emeraldBio, colorPhase1 * 0.85);
    baseColor = mix(baseColor, mintAqua, colorPhase2 * 0.45);
    baseColor = mix(baseColor, goldenPollen, colorPhase3 * 0.4 * resonance);
    
    vec3 finalColor = mix(baseColor, emeraldBio, horizonGlow * 0.4);
    finalColor += vec3(0.05, 0.2, 0.1) * vMouseInfluence * uHoverIntensity;
    return finalColor;
  }

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    float roundMask = 1.0 - smoothstep(0.24, 0.5, dist);
    if (roundMask <= 0.001) discard;
    float coreGlow = exp(-dist * dist * 9.0);
    float softEdge = pow(roundMask, 1.25) * (0.65 + coreGlow * 0.35);
    float depthFade = smoothstep(22.0, 2.0, vDepth);
    depthFade = pow(depthFade, 1.8);

    float alpha = 0.55 + vDistanceFromCenter * 0.4;
    alpha = mix(alpha, 0.88, vMouseInfluence * 0.4);
    alpha *= depthFade;
    alpha *= softEdge;

    vec3 wormholeColor = getWormholeColor(vWorldPosition, vTunnelProgress, uTime);
    float intensity = 1.1 + vDistanceFromCenter * 0.35 + vMouseInfluence * 0.3;
    wormholeColor = mix(wormholeColor, vec3(0.05, 0.3, 0.18), coreGlow * 0.15);
    wormholeColor *= intensity;
    gl_FragColor = vec4(wormholeColor, alpha);
  }
`;

export default function SplashIntro({
  onComplete,
  titleLines = DEFAULT_TITLE_LINES,
  forceShow = false,
}: SplashIntroProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isWarping, setIsWarping] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showCaret, setShowCaret] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wormholeRef = useRef<{
    start: () => void;
    warpOut: () => Promise<void>;
    dispose: () => void;
  } | null>(null);

  const finishedRef = useRef(false);

  // Check if splash should run
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceParam = params.get("splash") === "true" || params.get("splash") === "1";
    const alreadySeen = sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";

    if (forceShow || forceParam || !alreadySeen) {
      setShouldRender(true);
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
      document.body.classList.add("homepage-splash-locked", "homepage-splash-prime");
    } else {
      if (onComplete) onComplete();
    }
  }, [forceShow, onComplete]);

  // Three.js Wormhole Lifecycle
  useEffect(() => {
    if (!shouldRender || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const isMobile = window.innerWidth <= 768;
    const numRings = isMobile ? 90 : 140;
    const pointsPerRing = isMobile ? 110 : 170;
    const tunnelLength = 25;
    const warpRamp = 1.4;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let points: THREE.Points | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let clock: THREE.Clock | null = null;
    let rafId = 0;
    let disposed = false;
    let hovering = false;
    let hoverIntensity = 0;
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointer = new THREE.Vector2(0, 0);
    let warp = 0;
    let warping = false;
    let warpStart = 0;
    let speedMult = 1;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      // Soft pearlescent eco-white clear color
      renderer.setClearColor(0xf6fbf7, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight, false);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 5);

      const positions: number[] = [];
      const velocities: number[] = [];

      for (let ring = 0; ring < numRings; ring++) {
        const z = (ring / numRings) * tunnelLength - tunnelLength * 0.5;
        const ringProgress = ring / numRings;
        // Wider tunnel base radius to keep the center spacious and clear for text
        const baseRadius = 1.55 + Math.sin(ringProgress * Math.PI) * 0.55;

        for (let i = 0; i < pointsPerRing; i++) {
          const angle = (i / pointsPerRing) * Math.PI * 2;
          const radius = baseRadius + Math.sin(ring * 0.5 + i * 0.2) * 0.08;
          positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
          velocities.push(-0.034 - Math.random() * 0.017);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

      material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: mouse3D },
          uCameraPosition: { value: camera.position },
          uHoverIntensity: { value: 0 },
          uConvergence: { value: 0 },
          uWarp: { value: 0 },
          uWarpTarget: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      clock = new THREE.Clock();
      clock.start();

      const handleResize = () => {
        if (!renderer || !camera) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!camera) return;
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
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      canvas.addEventListener("pointerenter", handlePointerEnter);
      canvas.addEventListener("pointerleave", handlePointerLeave);

      const loop = () => {
        if (disposed || !renderer || !scene || !camera || !points || !material || !clock) return;
        rafId = requestAnimationFrame(loop);
        const t = clock.getElapsedTime();

        const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0, v = 0; i < arr.length; i += 3, v++) {
          arr[i + 2] += velocities[v] * speedMult;
          if (arr[i + 2] < -12.5) {
            arr[i + 2] = warping ? arr[i + 2] : 12.5;
          }
        }
        posAttr.needsUpdate = true;

        points.rotation.z += 0.0018;
        hoverIntensity += ((hovering ? 1 : 0) - hoverIntensity) * 0.1;

        if (warping) {
          const wt = t - warpStart;
          const eIn = (wt / warpRamp) * (wt / warpRamp);
          warp = Math.min(eIn, 1.5);
          speedMult = 1 + Math.min(eIn, 1.6) * 20;
          camera.position.x += (0 - camera.position.x) * 0.1;
          camera.position.y += (0 - camera.position.y) * 0.1;
          camera.position.z += (0.3 - camera.position.z) * 0.05;
          camera.lookAt(0, 0, -2);
        }

        const u = material.uniforms;
        u.uTime.value = t;
        u.uConvergence.value = warping ? 1 : Math.min(0.35 + t / 2.2, 1.0);
        u.uCameraPosition.value.copy(camera.position);
        u.uMouse.value.copy(mouse3D);
        u.uHoverIntensity.value = hoverIntensity;
        u.uWarp.value = warp;

        renderer.render(scene, camera);
      };

      loop();

      wormholeRef.current = {
        start: () => {},
        warpOut: () => {
          warping = true;
          if (clock) warpStart = clock.getElapsedTime();
          return new Promise<void>((resolve) => setTimeout(resolve, 750));
        },
        dispose: () => {
          disposed = true;
          cancelAnimationFrame(rafId);
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("pointermove", handlePointerMove);
          canvas.removeEventListener("pointerenter", handlePointerEnter);
          canvas.removeEventListener("pointerleave", handlePointerLeave);
          if (geometry) geometry.dispose();
          if (material) material.dispose();
          if (renderer) renderer.dispose();
        },
      };
    } catch (err) {
      console.warn("WebGL initialization failed, running in fallback mode", err);
    }

    return () => {
      wormholeRef.current?.dispose();
    };
  }, [shouldRender]);

  // Finish sequence (Warp out -> Dawn Flash -> Reveal Homepage)
  const finish = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    setShowCaret(false);
    setIsWarping(true);

    document.body.classList.remove("homepage-splash-prime");
    document.body.classList.add("homepage-splash-reveal");

    try {
      if (wormholeRef.current) {
        await wormholeRef.current.warpOut();
      }
    } catch (e) {
      console.error(e);
    }

    setIsLeaving(true);

    setTimeout(() => {
      document.body.classList.remove(
        "homepage-splash-locked",
        "homepage-splash-prime",
        "homepage-splash-reveal"
      );
      setShouldRender(false);
      if (onComplete) onComplete();
    }, 850);
  }, [onComplete]);

  // Typing Effect
  useEffect(() => {
    if (!shouldRender) return;

    const fullText = titleLines.join("\n");
    const totalChars = fullText.length;
    if (totalChars === 0) {
      finish();
      return;
    }

    let rafId = 0;
    let typingTimeout = 0;
    let holdTimeout = 0;
    let maxTimeout = 0;

    typingTimeout = window.setTimeout(() => {
      const startTime = performance.now();

      const step = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / TYPE_DURATION, 1);
        const count = Math.min(totalChars, Math.floor(progress * totalChars) + 1);

        setTypedText(fullText.slice(0, count));

        if (count >= totalChars) {
          setShowCaret(false);
          holdTimeout = window.setTimeout(finish, HOLD_AFTER_TYPED);
          return;
        }

        rafId = requestAnimationFrame(step);
      };

      rafId = requestAnimationFrame(step);
    }, TYPE_DELAY);

    maxTimeout = window.setTimeout(finish, MAX_SPLASH);

    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(holdTimeout);
      clearTimeout(maxTimeout);
      cancelAnimationFrame(rafId);
    };
  }, [shouldRender, titleLines, finish]);

  // Keyboard shortcut (Escape or Space to skip)
  useEffect(() => {
    if (!shouldRender) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        finish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldRender, finish]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`homepage-splash ${isLeaving ? "is-leaving" : ""}`}
      role="dialog"
      aria-label="Welcome Intro"
    >
      {/* Fallback ambient gradient */}
      <div className="homepage-splash__fallback" />

      {/* ThreeJS WebGL Canvas Particle Tunnel */}
      <canvas ref={canvasRef} className="homepage-splash__canvas" />

      {/* Cinematic Flash Beam on Warp Out */}
      <div className="homepage-splash__flash-wrap">
        <div className={`homepage-splash__flash ${isWarping ? "is-on" : ""}`} />
      </div>

      {/* Centered Luminous Animated Title (Pure floating text with NO box) */}
      <div className={`homepage-splash__title-wrap ${isWarping ? "is-warping" : ""}`}>
        <h1 className="homepage-splash__title">
          <span className="homepage-splash__text">
            {typedText}
          </span>
          {showCaret && (
            <span className="homepage-splash__caret" aria-hidden="true">
              ▌
            </span>
          )}
        </h1>
      </div>

      {/* Skip button with Glassmorphism */}
      <button
        type="button"
        className={`homepage-splash__skip ${isWarping ? "is-hidden" : ""}`}
        onClick={finish}
      >
        Bỏ qua ›
      </button>
    </div>,
    document.body
  );
}
