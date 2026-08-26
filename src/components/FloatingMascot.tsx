import { useState, useEffect, useRef, useCallback } from "react";

/**
 * FloatingMascot — Chú sầu riêng mascot EaAgri bay lơ lửng trên trang,
 * di chuyển tự do khắp màn hình, tương tác khi chuột chạm vào.
 *
 * Hành vi:
 *  - Bay tự do khắp viewport, chọn điểm đích ngẫu nhiên rồi lướt đến
 *  - Kết hợp bay lơ lửng Lissajous + di chuyển đến điểm mới
 *  - Khi chuột lại gần → mascot "nhìn" về phía chuột
 *  - Khi click → bật nhảy lên + hiệu ứng lấp lánh + tooltip
 *  - Khi kéo thả (drag) → di chuyển mascot đến vị trí mới
 *  - Tự động đổi animation mood sau mỗi chu kỳ
 *  - Ẩn khi đang ở Hero section (tránh đè lên Hero)
 *  - Hướng nhìn lật trái/phải theo chiều di chuyển
 */

const MASCOT_SIZE = 80;
const FLOAT_SPEED = 0.0008;
const AMPLITUDE_X = 25;
const AMPLITUDE_Y = 15;

// Tốc độ di chuyển đến điểm đích (px/frame tại 60fps)
const ROAM_SPEED = 3.6;
// Thời gian nghỉ tại mỗi điểm trước khi chọn điểm mới (ms)
const ROAM_PAUSE_MIN = 6500;
const ROAM_PAUSE_MAX = 11500;
// Khoảng cách coi như "đã đến nơi"
const ARRIVAL_THRESHOLD = 8;
// Margin an toàn khỏi mép viewport
const EDGE_MARGIN = 24;

type MascotMood = "idle" | "wave" | "bounce" | "spin" | "wiggle" | "sleep";
const MOODS: MascotMood[] = ["idle", "wave", "bounce", "spin", "wiggle", "sleep"];
const MOOD_DURATION = 8000;

const IDLE_IMAGE = "/Amination/logo EaAgri.png";
const MASCOT_FRAMES: Record<MascotMood, string[]> = {
  // Repeated idle frames make the blink happen naturally every few seconds.
  idle: [
    IDLE_IMAGE, IDLE_IMAGE, IDLE_IMAGE, IDLE_IMAGE, IDLE_IMAGE,
    IDLE_IMAGE, IDLE_IMAGE, IDLE_IMAGE, "/Amination/Đứng chớp mắt.png",
    "/Amination/Đứng chớp mắt 2.png",
  ],
  wave: [
    "/Amination/Chào 01.png",
    "/Amination/Chào 02.png",
    "/Amination/Chào 03.png",
    "/Amination/Chào 02.png",
  ],
  bounce: [
    "/Amination/Nhảy chuẩn bị.png",
    "/Amination/Nhảy trên không.png",
    "/Amination/Nhảy tiếp đất.png",
  ],
  spin: ["/Amination/Phấn khích.png"],
  wiggle: [
    IDLE_IMAGE,
    "/Amination/Đứng nghiêng phải.png",
    IDLE_IMAGE,
    "/Amination/Chỉ tay.png",
  ],
  sleep: ["/Amination/Ngủ thở 01.png", "/Amination/Ngủ thở 02.png"],
};

const RUN_FRAMES = [
  "/Amination/Chạy 03.png",
  "/Amination/Chạy 04.png",
  "/Amination/Chạy 05.png",
  "/Amination/Chạy 04.png",
];
const HEART_FRAMES = ["/Amination/trái tim.png"];
const DRAG_FRAMES = ["/Amination/Chụp hình.png"];

const ALL_MASCOT_IMAGES = Array.from(new Set([
  ...Object.values(MASCOT_FRAMES).flat(),
  ...RUN_FRAMES,
  "/Amination/trái tim.png",
  "/Amination/Chụp hình.png",
]));

export default function FloatingMascot() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mood, setMood] = useState<MascotMood>("idle");
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [mouseNear, setMouseNear] = useState(false);
  const [lookAngle, setLookAngle] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isRoaming, setIsRoaming] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const mascotRef = useRef<HTMLDivElement>(null);
  const basePositionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const roamTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isRoamingRef = useRef(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const edgeRef = useRef<"top" | "right" | "bottom" | "left">("right");

  // Load every pose before it is needed so frame changes never flash blank.
  useEffect(() => {
    ALL_MASCOT_IMAGES.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  const TOOLTIPS = [
    "Xin chào! Mình là Sầu Sầu 🌱",
    "Chạm vào mình đi nào! 🎉",
    "Hãy khám phá Ea Agri nhé! 🚀",
    "Sầu riêng thông minh đây! 🍈",
    "Mình yêu nông nghiệp! 💚",
    "Click mình để xem điều bất ngờ! ✨",
    "Mình đang bay lượn nè! 🦋",
    "Bắt mình đi nào! 😜",
  ];

  // Chọn một điểm trên đường viền viewport. Mascot đi tuần quanh màn hình
  // thay vì cắt ngang qua nội dung chính.
  const pickNewTarget = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw <= 768;
    const mascotSize = mobile ? 60 : MASCOT_SIZE;
    const topSafe = mobile ? 82 : 112;
    const rightSafe = mobile ? 18 : 116;
    const bottomSafe = mobile ? 22 : 34;
    const leftX = EDGE_MARGIN;
    const rightX = Math.max(leftX, vw - mascotSize - rightSafe);
    const topY = topSafe;
    const bottomY = Math.max(topY, vh - mascotSize - bottomSafe);

    const clockwise = ["top", "right", "bottom", "left"] as const;
    const currentIndex = clockwise.indexOf(edgeRef.current);
    // Chủ yếu sang cạnh kế bên; đôi lúc quay đầu để chuyển động bớt máy móc.
    const direction = Math.random() < 0.82 ? 1 : -1;
    const nextEdge = clockwise[(currentIndex + direction + clockwise.length) % clockwise.length];
    edgeRef.current = nextEdge;

    const horizontalInset = Math.min(150, Math.max(42, vw * 0.1));
    const verticalSpan = Math.max(1, bottomY - topY);
    const horizontalSpan = Math.max(1, rightX - leftX - horizontalInset * 2);
    let tx = positionRef.current.x;
    let ty = positionRef.current.y;

    if (nextEdge === "top" || nextEdge === "bottom") {
      tx = leftX + horizontalInset + Math.random() * horizontalSpan;
      ty = nextEdge === "top" ? topY : bottomY;
    } else {
      tx = nextEdge === "left" ? leftX : rightX;
      ty = topY + Math.random() * verticalSpan;
    }

    targetRef.current = { x: tx, y: ty };
    isRoamingRef.current = true;
    setIsRoaming(true);

    // Lật hướng mascot theo chiều di chuyển
    setFacingLeft(tx < positionRef.current.x);
  }, []);

  // Lên lịch chọn điểm mới
  const scheduleNextRoam = useCallback(() => {
    if (roamTimerRef.current) clearTimeout(roamTimerRef.current);
    const delay = ROAM_PAUSE_MIN + Math.random() * (ROAM_PAUSE_MAX - ROAM_PAUSE_MIN);
    roamTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        pickNewTarget();
      }
    }, delay);
  }, [pickNewTarget]);

  // Khởi tạo vị trí ban đầu
  useEffect(() => {
    const initX = window.innerWidth - MASCOT_SIZE - 120;
    const initY = window.innerHeight * 0.35;
    edgeRef.current = "right";
    basePositionRef.current = { x: initX, y: initY };
    targetRef.current = { x: initX, y: initY };
    positionRef.current = { x: initX, y: initY };
    setPosition({ x: initX, y: initY });
  }, []);

  // Giữ mascot trong viewport khi thay đổi kích thước cửa sổ.
  useEffect(() => {
    const handleResize = () => {
      const size = window.innerWidth <= 768 ? 60 : MASCOT_SIZE;
      const clamped = {
        x: Math.min(Math.max(EDGE_MARGIN, positionRef.current.x), window.innerWidth - size - EDGE_MARGIN),
        y: Math.min(Math.max(82, positionRef.current.y), window.innerHeight - size - 22),
      };
      basePositionRef.current = clamped;
      positionRef.current = clamped;
      setPosition(clamped);
      scheduleNextRoam();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scheduleNextRoam]);

  // Hiển thị sau khi cuộn qua Hero
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bắt đầu roam khi visible
  useEffect(() => {
    if (isVisible) {
      scheduleNextRoam();
    }
    return () => {
      if (roamTimerRef.current) clearTimeout(roamTimerRef.current);
    };
  }, [isVisible, scheduleNextRoam]);

  // Đổi mood tự động
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setMood(MOODS[Math.floor(Math.random() * MOODS.length)]);
    }, MOOD_DURATION);
    return () => clearInterval(interval);
  }, [isVisible]);

  const activeFrames = isClicked
    ? HEART_FRAMES
    : isDragging
      ? DRAG_FRAMES
      : isRoaming
        ? RUN_FRAMES
        : MASCOT_FRAMES[mood];

  // Play actual frame-by-frame sequences instead of merely swapping poses.
  useEffect(() => {
    setFrameIndex(0);
    if (!isVisible || activeFrames.length < 2) return;

    const frameDuration = isRoaming
      ? 155
      : mood === "sleep"
        ? 620
        : mood === "idle"
          ? 260
          : mood === "wave"
            ? 240
            : 190;

    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % activeFrames.length);
    }, frameDuration);

    return () => window.clearInterval(timer);
  }, [isVisible, isClicked, isDragging, isRoaming, mood, activeFrames]);

  // Main animation loop
  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isDraggingRef.current && !isHoveredRef.current) {
        timeRef.current += delta * FLOAT_SPEED;
        const t = timeRef.current;

        // Lissajous micro-float (nhỏ, chỉ là hiệu ứng "thở")
        const floatX =
          Math.sin(t * 1.3) * AMPLITUDE_X +
          Math.sin(t * 0.7) * (AMPLITUDE_X * 0.4);
        const floatY =
          Math.cos(t * 0.9) * AMPLITUDE_Y +
          Math.cos(t * 1.6) * (AMPLITUDE_Y * 0.3);

        // Di chuyển mượt đến target (roaming)
        if (isRoamingRef.current) {
          const dx = targetRef.current.x - basePositionRef.current.x;
          const dy = targetRef.current.y - basePositionRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < ARRIVAL_THRESHOLD) {
            // Đã đến nơi → dừng roam, lên lịch điểm tiếp
            isRoamingRef.current = false;
            setIsRoaming(false);
            scheduleNextRoam();
          } else {
            // Lerp (interpolation mượt) đến target
            const speed = Math.min(ROAM_SPEED * (delta / 16.67), dist * 0.03);
            const nx = (dx / dist) * speed;
            const ny = (dy / dist) * speed;
            basePositionRef.current.x += nx;
            basePositionRef.current.y += ny;
          }
        }

        const newPos = {
          x: basePositionRef.current.x + floatX,
          y: basePositionRef.current.y + floatY,
        };
        positionRef.current = newPos;
        setPosition(newPos);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [scheduleNextRoam]
  );

  useEffect(() => {
    if (isVisible) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible, animate]);

  // Theo dõi chuột để mascot "nhìn theo"
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = positionRef.current.x + MASCOT_SIZE / 2;
      const cy = positionRef.current.y + MASCOT_SIZE / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      setMouseNear(dist < 200);
      isHoveredRef.current = dist < 120;

      if (dist < 300) {
        setLookAngle(Math.atan2(dy, dx) * (180 / Math.PI));
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Click → bật nhảy + tooltip
  const handleClick = () => {
    if (isDragging) return;
    setIsClicked(true);
    setMood("bounce");
    const tip = TOOLTIPS[Math.floor(Math.random() * TOOLTIPS.length)];
    setTooltipText(tip);
    setShowTooltip(true);

    setTimeout(() => setIsClicked(false), 600);
    setTimeout(() => setShowTooltip(false), 3000);
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    // Tạm dừng roaming khi kéo
    isRoamingRef.current = false;
    setIsRoaming(false);
    if (roamTimerRef.current) clearTimeout(roamTimerRef.current);

    dragOffsetRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;
    const newPos = { x: newX, y: newY };
    positionRef.current = newPos;
    setPosition(newPos);
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      setIsDragging(false);
      isDraggingRef.current = false;
      // Cập nhật "home" position mới
      basePositionRef.current = { ...positionRef.current };
      // Lên lịch roam tiếp
      scheduleNextRoam();
    }
  };

  // Tính toán style "nhìn theo" chuột
  const eyeOffsetX = mouseNear
    ? Math.cos((lookAngle * Math.PI) / 180) * 3
    : 0;
  const eyeOffsetY = mouseNear
    ? Math.sin((lookAngle * Math.PI) / 180) * 2
    : 0;

  const stateClasses = [
    `floating-mascot--${mood}`,
    isClicked ? "floating-mascot--clicked" : "",
    isDragging ? "floating-mascot--dragging" : "",
    mouseNear ? "floating-mascot--mouse-near" : "",
    isVisible ? "floating-mascot--visible" : "",
    isRoaming ? "floating-mascot--roaming" : "",
    facingLeft ? "floating-mascot--facing-left" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mascotImage = activeFrames[frameIndex % activeFrames.length] ?? IDLE_IMAGE;

  return (
    <div
      ref={mascotRef}
      className={`floating-mascot ${stateClasses}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        "--eye-x": `${eyeOffsetX}px`,
        "--eye-y": `${eyeOffsetY}px`,
      } as React.CSSProperties}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Kéo thả hoặc click vào mình nhé!"
    >
      {/* Vòng sáng phía sau */}
      <div className="floating-mascot__glow" />

      {/* Vệt sáng đuôi khi di chuyển */}
      {isRoaming && <div className="floating-mascot__trail" />}

      {/* Hạt lấp lánh khi click */}
      {isClicked && (
        <div className="floating-mascot__particles">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="floating-mascot__particle"
              style={{
                "--angle": `${i * 45}deg`,
                "--delay": `${i * 0.04}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Ảnh mascot */}
      <img
        src={mascotImage}
        alt="EaAgri Mascot - Sầu Sầu"
        className="floating-mascot__img"
        draggable={false}
        onError={(event) => {
          event.currentTarget.src = "/Amination/logo EaAgri.png";
        }}
      />

      {/* Shadow bên dưới */}
      <div className="floating-mascot__shadow" />

      {/* Tooltip */}
      {showTooltip && (
        <div className="floating-mascot__tooltip">
          <span>{tooltipText}</span>
          <div className="floating-mascot__tooltip-arrow" />
        </div>
      )}
    </div>
  );
}
