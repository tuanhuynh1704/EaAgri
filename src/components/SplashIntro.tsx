import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
// three.js is loaded on demand inside the effect so it stays out of the main bundle
import type * as T3 from "three";

interface SplashIntroProps {
  onComplete?: () => void;
  titleLines?: string[];
  forceShow?: boolean;
}

const DEFAULT_TITLE_LINES = [
  "Chào mừng đến với hệ sinh thái",
  "NÔNG NGHIỆP"
];

const TYPE_DURATION = 950;
const TYPE_DELAY = 120;
const HOLD_BEFORE_DISSOLVE = 300;
const WARP_FLY_DURATION = 1350; // Total fly-through duration (ms)
const MAX_SPLASH = 4000;
const SPLASH_SEEN_KEY = "eaagri_homepage_splash_seen_v1";

type SplashPhase = "typing" | "text_dissolve" | "flying_logo" | "leaving";

const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform vec3 uCameraPosition;
  uniform float uHoverIntensity;
  uniform float uPixelRatio;

  varying float vDistanceFromCenter;
  varying float vMouseInfluence;
  varying vec3 vWorldPosition;
  varying float vDepth;
  varying float vTunnelProgress;

  void main() {
    vec3 pos = position;

    // Organic bio-pulse wave along the tunnel
    float wave = sin(pos.z * 0.35 - uTime * 2.0) * 0.05;
    float breathe = sin(uTime * 1.2 + pos.z * 0.15) * 0.03;
    vec2 radialDir = normalize(pos.xy + vec2(0.0001, 0.0001));
    pos.xy += radialDir * (wave + breathe);

    vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vWorldPosition = worldPos;

    float depthFromCamera = length(uCameraPosition - worldPos);
    vDepth = depthFromCamera;

    // Interactive mouse deflection
    float distToMouse = length(worldPos - uMouse);
    float mouseInfluence = smoothstep(3.5, 0.0, distToMouse);
    mouseInfluence = pow(mouseInfluence, 2.0) * uHoverIntensity;
    vMouseInfluence = mouseInfluence;

    vec3 direction = normalize(uMouse - worldPos + vec3(0.001));
    pos += direction * mouseInfluence * 0.3;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Tunnel progress and center distance
    vTunnelProgress = clamp((-pos.z + 10.0) / 55.0, 0.0, 1.0);
    vDistanceFromCenter = smoothstep(3.2, 0.5, length(pos.xy));

    // Particle sizing: strictly capped, crisp and elegant (NEVER giant blotches!)
    float depthSize = clamp(14.0 / max(depthFromCamera, 1.2), 0.8, 3.8);
    gl_PointSize = (1.8 + depthSize + mouseInfluence * 0.5) * uPixelRatio;
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

  vec3 getEcoColor(vec3 worldPos, float progress, float time) {
    float radialDist = length(worldPos.xy);
    float centerGlow = smoothstep(2.5, 0.2, radialDist);

    // Light Eco Theme: Fresh emerald bio, vibrant mint aqua, golden pollen, deep jade
    vec3 forestDeep = vec3(0.03, 0.40, 0.22);
    vec3 emeraldBio = vec3(0.05, 0.72, 0.40);
    vec3 goldenPollen = vec3(0.96, 0.70, 0.14);
    vec3 mintAqua = vec3(0.09, 0.68, 0.54);

    float phase1 = sin(progress * 3.14159 + time * 0.6) * 0.5 + 0.5;
    float phase2 = cos(radialDist * 2.2 - time * 0.8) * 0.5 + 0.5;
    float phase3 = sin(radialDist * 2.8 + time * 1.0) * 0.5 + 0.5;

    vec3 col = mix(forestDeep, emeraldBio, phase1 * 0.85);
    col = mix(col, mintAqua, phase2 * 0.4);
    col = mix(col, goldenPollen, phase3 * 0.35);
    col = mix(col, emeraldBio, centerGlow * 0.35);

    return col;
  }

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Smooth rounded circular mask
    float roundMask = 1.0 - smoothstep(0.28, 0.5, dist);
    if (roundMask <= 0.001) discard;

    // Core glow for luminous bio-particles
    float coreGlow = exp(-dist * dist * 10.0);

    // CRITICAL: Near-Camera Dissolve - particles within 2.8 units smoothly dissolve to 0!
    // This absolutely guarantees NO giant dots or blurry discs can ever appear!
    float nearFade = smoothstep(1.0, 2.8, vDepth);

    // Far fade: distant particles fade into background mist
    float farFade = smoothstep(48.0, 8.0, vDepth);

    float alpha = (0.55 + coreGlow * 0.45) * roundMask * nearFade * farFade;
    alpha = mix(alpha, 0.95, vMouseInfluence * 0.4);

    if (alpha <= 0.015) discard;

    vec3 color = getEcoColor(vWorldPosition, vTunnelProgress, uTime);
    color *= (1.05 + vDistanceFromCenter * 0.3 + coreGlow * 0.15);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function SplashIntro({
  onComplete,
  titleLines = DEFAULT_TITLE_LINES,
  forceShow = false,
}: SplashIntroProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<SplashPhase>("typing");
  const [isBlooming, setIsBlooming] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showCaret, setShowCaret] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoBoxRef = useRef<HTMLDivElement | null>(null);
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
    let cancelled = false;

    // Dynamic import: the typed text + gradient fallback show immediately; the particle
    // tunnel fades in once three.js arrives. finish() already copes with no wormhole.
    import("three").then((THREE) => {
    if (cancelled) return;
    const isMobile = window.innerWidth <= 768;
    const numRings = isMobile ? 100 : 160;
    const pointsPerRing = isMobile ? 90 : 150;
    const zStart = 8;
    const zEnd = -46;
    const tunnelLength = zStart - zEnd;
    const warpDuration = WARP_FLY_DURATION / 1000; // in seconds

    let renderer: T3.WebGLRenderer | null = null;
    let scene: T3.Scene | null = null;
    let camera: T3.PerspectiveCamera | null = null;
    let points: T3.Points | null = null;
    let material: T3.ShaderMaterial | null = null;
    let clock: T3.Clock | null = null;
    let rafId = 0;
    let disposed = false;
    let hovering = false;
    let hoverIntensity = 0;
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointer = new THREE.Vector2(0, 0);

    let warping = false;
    let warpStart = 0;

    // Organic spine function: curves gently through 3D space
    // At z = 5 (initial camera position), spine is exactly (0, 0)
    const getSpine = (z: number) => {
      const dz = z - 5;
      const x = Math.sin(dz * 0.08) * 1.6;
      const y = (Math.cos(dz * 0.065) - 1.0) * 1.2;
      return { x, y };
    };

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setClearColor(0xf6fbf7, 1);
      const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight, false);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 5);

      const positions: number[] = [];

      for (let ring = 0; ring < numRings; ring++) {
        const ringProgress = ring / numRings;
        const z = zStart - ringProgress * tunnelLength;
        const spine = getSpine(z);

        // Wide opening at front to keep text & logo clean and spacious
        const baseRadius = 2.0 + Math.sin(ringProgress * Math.PI) * 0.9;

        for (let i = 0; i < pointsPerRing; i++) {
          const angle = (i / pointsPerRing) * Math.PI * 2;
          const radius = baseRadius + Math.sin(ring * 0.45 + i * 0.25) * 0.12;
          positions.push(
            spine.x + Math.cos(angle) * radius,
            spine.y + Math.sin(angle) * radius,
            z
          );
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
          uPixelRatio: { value: pixelRatio },
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

        points.rotation.z += 0.0012;
        hoverIntensity += ((hovering ? 1 : 0) - hoverIntensity) * 0.1;

        if (warping) {
          const wt = Math.min((t - warpStart) / warpDuration, 1.0);
          // Smooth easeInOutQuad for cinematic surge and landing
          const easeP = wt < 0.5 ? 2 * wt * wt : 1 - Math.pow(-2 * wt + 2, 2) / 2;

          // Camera plunges forward along Z through the curved tunnel ("chạy vào")
          const camZ = THREE.MathUtils.lerp(5, -34, easeP);
          const spine = getSpine(camZ);

          // Serpentine weave ("luồng lách") inside the tunnel!
          const weaveAngle = easeP * Math.PI * 3.0; // 1.5 complete S-curves
          const weaveAmp = Math.sin(easeP * Math.PI); // Envelope: 0 at start, peak at center, 0 at exit
          const weaveX = Math.sin(weaveAngle) * 0.75 * weaveAmp;
          const weaveY = Math.cos(weaveAngle * 0.85) * 0.45 * weaveAmp;

          camera.position.x = spine.x + weaveX;
          camera.position.y = spine.y + weaveY;
          camera.position.z = camZ;

          // Dynamic banking roll: tilts into turns like a glider/drone
          const roll = -Math.cos(weaveAngle) * 0.14 * weaveAmp;
          camera.rotation.z = roll;

          // Look ahead along curve
          const lookAheadZ = camZ - 5.5;
          const lookSpine = getSpine(lookAheadZ);
          const lookWeaveX = Math.sin(weaveAngle + 0.6) * 0.55 * weaveAmp;
          const lookWeaveY = Math.cos((weaveAngle + 0.6) * 0.85) * 0.35 * weaveAmp;
          camera.lookAt(lookSpine.x + lookWeaveX, lookSpine.y + lookWeaveY, lookAheadZ);
        } else {
          // Subtle breathing & mouse interaction in idle state
          camera.position.x = mouse3D.x * 0.08 + Math.sin(t * 0.8) * 0.04;
          camera.position.y = mouse3D.y * 0.08 + Math.cos(t * 0.7) * 0.03;
          camera.position.z = 5;
          camera.rotation.z = 0;
          camera.lookAt(0, 0, -4);
        }

        const u = material.uniforms;
        u.uTime.value = t;
        u.uCameraPosition.value.copy(camera.position);
        u.uMouse.value.copy(mouse3D);
        u.uHoverIntensity.value = hoverIntensity;

        renderer.render(scene, camera);
      };

      loop();

      wormholeRef.current = {
        start: () => {},
        warpOut: () => {
          warping = true;
          if (clock) warpStart = clock.getElapsedTime();
          return new Promise<void>((resolve) => setTimeout(resolve, WARP_FLY_DURATION));
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
          // Release the WebGL context now so it doesn't count against the browser's
          // context limit and evict the hero's 3D model.
          if (renderer) {
            renderer.forceContextLoss();
            renderer.dispose();
          }
        },
      };
    } catch (err) {
      console.warn("WebGL initialization failed, running in fallback mode", err);
    }
    }).catch((err) => {
      console.warn("three.js failed to load, running in fallback mode", err);
    });

    return () => {
      cancelled = true;
      wormholeRef.current?.dispose();
      wormholeRef.current = null;
    };
  }, [shouldRender]);

  // Finish sequence:
  // 1. Text dissolves ("mất chữ")
  // 2. Camera weaves into the tunnel ("chạy vào")
  // 3. Logo EA Agri appears in center ("sẽ hiện logo thêm")
  // 4. Daylight bloom opens and smoothly enters homepage ("rầu vào web trang chủ")
  const finish = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    setShowCaret(false);
    // 1. Chữ mờ biến mất ("mất chữ")
    setPhase("text_dissolve");

    // Bắt đầu cho camera lao vào đường hầm ("chạy vào")
    const warpPromise = wormholeRef.current ? wormholeRef.current.warpOut() : Promise.resolve();

    // 2. Khi vừa bắt đầu chạy vào (sau 280ms khi chữ vừa tan), LOGO XUẤT HIỆN Ở TRUNG TÂM!
    const logoTimer = setTimeout(() => {
      setPhase("flying_logo");
    }, 280);

    // 3. Khi chạy gần hết hầm (sau 950ms): Daylight Bloom hé mở từ tâm
    const bloomTimer = setTimeout(() => {
      setIsBlooming(true);
    }, 950);

    try {
      await warpPromise;
    } catch (e) {
      console.error(e);
    }

    clearTimeout(logoTimer);
    clearTimeout(bloomTimer);
    setIsBlooming(true);

    // 4. Logo bay vào vị trí navbar logo
    setPhase("leaving");
    setIsLeaving(true);

    // Tính toán vị trí navbar logo để bay vào chính xác
    if (logoBoxRef.current) {
      const navLogo = document.querySelector('.nav__logo-img') as HTMLElement;
      if (navLogo) {
        // #root is scaled to 1.03 during the splash (homepage-splash-prime) and eases back
        // to none on reveal. Measure the navbar logo with that transform removed so the
        // flight lands where the logo will actually sit, not where it is mid-animation.
        // Same for the navbar's own AOS fade-down slide.
        const root = document.getElementById('root');
        const nav = navLogo.closest('nav') as HTMLElement | null;
        const settled = [root, nav].filter(Boolean) as HTMLElement[];
        settled.forEach((node) => {
          node.style.setProperty('transition', 'none', 'important');
          node.style.setProperty('transform', 'none', 'important');
        });
        const navRect = navLogo.getBoundingClientRect();
        settled.forEach((node) => {
          node.style.removeProperty('transform');
          node.style.removeProperty('transition');
        });

        const el = logoBoxRef.current;
        const splashRect = el.getBoundingClientRect();
        const splashCenterX = splashRect.left + splashRect.width / 2;
        const splashCenterY = splashRect.top + splashRect.height / 2;
        const navCenterX = navRect.left + navRect.width / 2;
        const navCenterY = navRect.top + navRect.height / 2;
        const dx = navCenterX - splashCenterX;
        const dy = navCenterY - splashCenterY;
        // offsetHeight = untransformed size. The inline transform below replaces the
        // CSS scale on the box, so the ratio must be taken against the unscaled height.
        const scaleTarget = navRect.height / el.offsetHeight;

        // Bước 1: Bay về đúng vị trí logo navbar — giữ rõ nét suốt đường bay
        el.style.transition = 'transform 0.6s cubic-bezier(0.32, 0, 0.15, 1)';
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scaleTarget})`;
        el.style.filter = 'none';
        el.style.opacity = '1';

        // Bước 2: Đã tới đích -> hòa vào logo thật trên navbar
        setTimeout(() => {
          el.style.transition = 'opacity 0.15s ease-out';
          el.style.opacity = '0';
        }, 600);
      }
    }

    document.body.classList.remove("homepage-splash-prime");
    document.body.classList.add("homepage-splash-reveal");

    setTimeout(() => {
      document.body.classList.remove(
        "homepage-splash-locked",
        "homepage-splash-prime",
        "homepage-splash-reveal"
      );
      setShouldRender(false);
      if (onComplete) onComplete();
    }, 750);
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
    let finishTimeout = 0;
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
          // Gõ xong chữ -> dừng 300ms rồi tự động kích hoạt finish (mất chữ -> chạy vào hiện logo -> vào web)
          finishTimeout = window.setTimeout(() => {
            finish();
          }, HOLD_BEFORE_DISSOLVE);
          return;
        }

        rafId = requestAnimationFrame(step);
      };

      rafId = requestAnimationFrame(step);
    }, TYPE_DELAY);

    maxTimeout = window.setTimeout(finish, MAX_SPLASH);

    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(finishTimeout);
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

      {/* Daylight Bloom Portal Reveal */}
      <div className={`homepage-splash__bloom ${isBlooming ? "is-blooming" : ""}`} />

      {/* Centered Content: Title and Emerging Logo */}
      <div className="homepage-splash__content">
        {/* Title: Centered, dissolves smoothly when typing completes ("mất chữ") */}
        <div className={`homepage-splash__title-box ${phase !== "typing" ? "is-faded" : ""}`}>
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

        {/* Logo: Appears when camera flies into tunnel ("chạy vào sẽ hiện logo thêm") */}
        <div
          ref={logoBoxRef}
          className={`homepage-splash__logo-box ${
            phase === "flying_logo" ? "is-visible" : phase === "leaving" ? "is-leaving" : ""
          }`}
        >
          <img
            src="/logo_banner.jpg"
            alt="EA Agri Logo"
            className="homepage-splash__logo"
          />
        </div>
      </div>

      {/* Skip button with Glassmorphism */}
      <button
        type="button"
        className={`homepage-splash__skip ${phase === "leaving" ? "is-hidden" : ""}`}
        onClick={finish}
      >
        Bỏ qua ›
      </button>
    </div>,
    document.body
  );
}
