import { useState, useEffect, useRef, useCallback } from "react";

/**
 * FloatingMascot — Chú Sầu Sầu Mascot EaAgri tinh nghịch
 * với cơ chế "Chạy Vào 4 Góc Trốn & Ló Ra Từ 4 Góc Màn Hình":
 *
 *  1. KHI ĐI TRỐN: Bé cất lời "Mình đi trốn đây! 🏃‍♂️💨", đổi sang tư thế chạy,
 *     quay mặt và phi thẳng ra ngoài 1 trong 4 góc màn hình để lặn mất.
 *  2. KHI ẨN (8-14s): Trả lại không gian màn hình hoàn toàn yên tĩnh.
 *  3. KHI XUẤT HIỆN LẠI: Bé từ một góc màn hình khác bất ngờ "thò đầu ló ra",
 *     chào "Ú òa! Tìm thấy mình chưa? 😜" rồi chạy tung tăng tiến vào trong màn hình!
 *  4. KHI BẮT ĐƯỢC / CLICK: Bé bật nhảy, tung sao lấp lánh và hủy lệnh trốn để ở lại chơi tiếp.
 */

const MASCOT_SIZE = 76;
const FLOAT_SPEED = 0.0008;
const AMPLITUDE_X = 18;
const AMPLITUDE_Y = 12;

// Tốc độ đi dạo bình thường & Tốc độ chạy lon ton đi trốn
const ROAM_SPEED_NORMAL = 3.0;
const ROAM_SPEED_RUSH = 4.8;
const ARRIVAL_THRESHOLD = 12;

// Thời gian ở lại chơi đùa cùng người dùng trước khi chạy đi trốn (ms: 40 giây)
const ACTIVE_STAY_DURATION = 40000;
// Thời gian ẩn mình ngoài mép màn hình trước khi ló ra góc khác (ms: 15 giây)
const HIDDEN_REST_DURATION = 15000;

type MascotMood = "idle" | "wave" | "bounce" | "spin" | "wiggle" | "sleep";
type LifecycleState = "spawning" | "running_in" | "active" | "running_out" | "hidden";
type CornerId = "top_left" | "top_right" | "bottom_left" | "bottom_right";

const CORNERS: CornerId[] = ["top_left", "top_right", "bottom_left", "bottom_right"];

const IDLE_IMAGE = "/Amination/logo EaAgri.png";
const MASCOT_FRAMES: Record<MascotMood, string[]> = {
  idle: [
    IDLE_IMAGE, IDLE_IMAGE, IDLE_IMAGE, IDLE_IMAGE,
    "/Amination/Đứng chớp mắt.png",
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

const ALL_MASCOT_IMAGES = Array.from(
  new Set([
    ...Object.values(MASCOT_FRAMES).flat(),
    ...RUN_FRAMES,
    ...HEART_FRAMES,
    ...DRAG_FRAMES,
    "/Amination/logo EaAgri chào.png",
    "/Amination/Tưới cây.png",
    "/Amination/Phát hiện.png",
  ])
);

// Lời thoại khi từ góc chạy vào
const ARRIVAL_GREETINGS = [
  "Ú òa! Mình lại đến chơi nè! 🎉",
  "Tìm thấy mình chưa? 😜",
  "Bắt mình đi nào! ⚡",
  "Xin chào! Sầu Sầu đây! 🍈",
  "Mình xuất hiện rồi nè! 🌟",
  "Chơi với mình tiếp nha! 🏃‍♂️",
];

// Lời thoại khi bị bắt / click vào
const PLAYFUL_QUOTES = [
  "Aaaa bắt được mình rồi! 🎉",
  "Haha nhột quá đi! 🤣",
  "Wheee! Nhảy cao chưa nè! 🦘",
  "Bạn nhanh tay ghê! ⚡",
  "Chơi với bạn vui quá! 🍈",
  "Đố bạn bắt được nữa đó! 😜",
  "Mình là Sầu Sầu siêu cấp đáng yêu! ✨",
  "Đừng cù lét mình nha! 🤭",
];

// Lời thoại khi chuẩn bị chạy vào 4 góc để trốn
const HIDE_QUOTES = [
  "Mình chuẩn bị đi trốn đây nha! Đố bạn bắt được! 😜",
  "Đếm từ 1 đến 3 mình chạy đi trốn nè! ⏱️🏃‍♂️💨",
  "Mình chạy trốn vào góc đây! Bắt mình đi! 🙈",
  "Hẹn gặp lại bạn lát nữa nha! Tạm biệt! 👋",
];

export default function FloatingMascot() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [mood, setMood] = useState<MascotMood>("wave");
  const [lifecycle, setLifecycle] = useState<LifecycleState>("hidden");
  const [isPastHero, setIsPastHero] = useState(false);
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
  const basePositionRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isRoamingRef = useRef(false);
  const positionRef = useRef({ x: -100, y: -100 });
  const currentSpeedRef = useRef(ROAM_SPEED_NORMAL);
  const lastCornerRef = useRef<CornerId>("bottom_right");

  // Timers
  const stayTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const restTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const roamTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Preload toàn bộ ảnh
  useEffect(() => {
    ALL_MASCOT_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Tính tọa độ ngoài màn hình của 4 góc
  const getCornerOutsidePos = (corner: CornerId) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const offset = 100;
    switch (corner) {
      case "top_left":
        return { x: -offset, y: 40 };
      case "top_right":
        return { x: vw + offset, y: 40 };
      case "bottom_left":
        return { x: -offset, y: vh - 120 };
      case "bottom_right":
      default:
        return { x: vw + offset, y: vh - 120 };
    }
  };

  // Tính điểm dừng chân an toàn bên trong màn hình khi từ góc chạy vào
  const getCornerSafeInsidePos = (corner: CornerId) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw <= 768;
    const size = mobile ? 60 : MASCOT_SIZE;

    const minX = mobile ? 24 : 60;
    const maxX = Math.max(minX, vw - size - (mobile ? 50 : 120));
    const minY = mobile ? 85 : 120;
    const maxY = Math.max(minY, vh - size - (mobile ? 60 : 90));

    switch (corner) {
      case "top_left":
        return { x: minX + 30, y: minY + 20 };
      case "top_right":
        return { x: maxX - 20, y: minY + 20 };
      case "bottom_left":
        return { x: minX + 20, y: maxY * 0.75 };
      case "bottom_right":
      default:
        return { x: maxX, y: maxY * 0.75 };
    }
  };

  // Tìm góc gần nhất với vị trí hiện tại để chạy trốn nhanh nhất
  const getClosestCorner = (pos: { x: number; y: number }): CornerId => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isLeft = pos.x < vw / 2;
    const isTop = pos.y < vh / 2;

    if (isTop && isLeft) return "top_left";
    if (isTop && !isLeft) return "top_right";
    if (!isTop && isLeft) return "bottom_left";
    return "bottom_right";
  };

  // KÍCH HOẠT CHẠY VÀO 4 GÓC ĐỂ TRỐN (Running to Corner)
  const triggerRunToCornerToHide = useCallback(() => {
    if (isDraggingRef.current) return;

    // Chọn góc để chạy trốn (góc gần nhất)
    const targetCorner = getClosestCorner(positionRef.current);
    lastCornerRef.current = targetCorner;
    const outsidePos = getCornerOutsidePos(targetCorner);

    // Vẫy tay báo hiệu chuẩn bị đi trốn
    setMood("wave");
    const hideText = HIDE_QUOTES[Math.floor(Math.random() * HIDE_QUOTES.length)];
    setTooltipText(hideText);
    setShowTooltip(true);

    // Chờ 2.2s cho người dùng kịp quan sát & có cơ hội click bắt bé!
    setTimeout(() => {
      setShowTooltip(false);
      setLifecycle("running_out");
      currentSpeedRef.current = ROAM_SPEED_RUSH; // Tốc độ chạy lon ton
      targetRef.current = outsidePos;
      isRoamingRef.current = true;
      setIsRoaming(true);
      setFacingLeft(outsidePos.x < positionRef.current.x);
    }, 2200);
  }, []);

  // KÍCH HOẠT TỪ GÓC CHẠY VÀO MÀN HÌNH (Peeking & Running In from Corner)
  const triggerAppearFromCorner = useCallback(() => {
    // Chọn góc khác với góc vừa trốn để tạo bất ngờ
    const availableCorners = CORNERS.filter((c) => c !== lastCornerRef.current);
    const chosenCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    lastCornerRef.current = chosenCorner;

    const startOutsidePos = getCornerOutsidePos(chosenCorner);
    const safeInsidePos = getCornerSafeInsidePos(chosenCorner);

    // Đặt xuất phát ở ngoài mép
    basePositionRef.current = { ...startOutsidePos };
    positionRef.current = { ...startOutsidePos };
    setPosition({ ...startOutsidePos });

    setLifecycle("running_in");
    currentSpeedRef.current = ROAM_SPEED_RUSH;
    targetRef.current = safeInsidePos;
    isRoamingRef.current = true;
    setIsRoaming(true);
    setFacingLeft(safeInsidePos.x < startOutsidePos.x);

    // Khi vừa ló đầu vào thì cất tiếng chào
    setTimeout(() => {
      const greet = ARRIVAL_GREETINGS[Math.floor(Math.random() * ARRIVAL_GREETINGS.length)];
      setTooltipText(greet);
      setShowTooltip(true);

      setTimeout(() => setShowTooltip(false), 2800);
    }, 350);
  }, []);

  // Lên lịch dạo chơi nhẹ nhàng khi đang ở trong màn hình
  const pickNextRoamTarget = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw <= 768;
    const size = mobile ? 60 : MASCOT_SIZE;

    const minX = mobile ? 24 : 60;
    const maxX = Math.max(minX, vw - size - (mobile ? 50 : 120));
    const minY = mobile ? 90 : 120;
    const maxY = Math.max(minY, vh - size - (mobile ? 60 : 90));

    const current = positionRef.current;
    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 160;

    let nx = current.x + Math.cos(angle) * dist;
    let ny = current.y + Math.sin(angle) * dist;

    nx = Math.min(maxX, Math.max(minX, nx));
    ny = Math.min(maxY, Math.max(minY, ny));

    targetRef.current = { x: nx, y: ny };
    currentSpeedRef.current = ROAM_SPEED_NORMAL;
    isRoamingRef.current = true;
    setIsRoaming(true);
    setFacingLeft(nx < current.x);
  }, []);

  // Reset timer ở lại chơi (khi có click / hover / drag)
  const resetStayTimer = useCallback(() => {
    if (stayTimerRef.current) clearTimeout(stayTimerRef.current);
    stayTimerRef.current = setTimeout(() => {
      triggerRunToCornerToHide();
    }, ACTIVE_STAY_DURATION);
  }, [triggerRunToCornerToHide]);

  // Theo dõi cuộn qua Hero để bắt đầu xuất hiện lần đầu
  useEffect(() => {
    const handleScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.55;
      setIsPastHero(past);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Khi cuộn qua Hero lần đầu ➔ Chạy từ góc ra!
  useEffect(() => {
    if (isPastHero && lifecycle === "hidden") {
      triggerAppearFromCorner();
    }
    if (!isPastHero) {
      setLifecycle("hidden");
      if (stayTimerRef.current) clearTimeout(stayTimerRef.current);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
      if (roamTimerRef.current) clearTimeout(roamTimerRef.current);
    }
  }, [isPastHero]);

  // Frame animations
  const activeFrames = isClicked
    ? HEART_FRAMES
    : isDragging
      ? DRAG_FRAMES
      : (lifecycle === "running_in" || lifecycle === "running_out" || isRoaming)
        ? RUN_FRAMES
        : MASCOT_FRAMES[mood];

  useEffect(() => {
    setFrameIndex(0);
    if (lifecycle === "hidden" || activeFrames.length < 2) return;

    const isRunning = lifecycle === "running_in" || lifecycle === "running_out" || isRoaming;
    const frameDuration = isRunning ? 130 : mood === "sleep" ? 600 : 250;
    const timer = window.setInterval(() => {
      setFrameIndex((curr) => (curr + 1) % activeFrames.length);
    }, frameDuration);

    return () => window.clearInterval(timer);
  }, [lifecycle, isRoaming, mood, activeFrames]);

  // Main Animation Loop
  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isDraggingRef.current && lifecycle !== "hidden") {
        timeRef.current += delta * FLOAT_SPEED;
        const t = timeRef.current;

        // Lissajous breathing float khi đang active (không float khi đang chạy trốn)
        const isRush = lifecycle === "running_out" || lifecycle === "running_in";
        const floatX = isRush ? 0 : Math.sin(t * 1.3) * AMPLITUDE_X;
        const floatY = isRush ? 0 : Math.cos(t * 0.9) * AMPLITUDE_Y;

        // Di chuyển đến Target
        if (isRoamingRef.current) {
          const dx = targetRef.current.x - basePositionRef.current.x;
          const dy = targetRef.current.y - basePositionRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < ARRIVAL_THRESHOLD) {
            // Đã đến điểm đích
            if (lifecycle === "running_out") {
              // ĐÃ CHẠY RA NGOÀI MÀN HÌNH ➔ ẨN ĐI
              isRoamingRef.current = false;
              setIsRoaming(false);
              setLifecycle("hidden");

              // Lên lịch nghỉ ngơi rồi từ góc khác chạy vào
              restTimerRef.current = setTimeout(() => {
                triggerAppearFromCorner();
              }, HIDDEN_REST_DURATION + Math.random() * 4000);
            } else if (lifecycle === "running_in") {
              // ĐÃ CHẠY VÀO ĐẾN NƠI AN TOÀN ➔ BẬT NHẢY CHÀO RỒI ACTIVE
              isRoamingRef.current = false;
              setIsRoaming(false);
              setLifecycle("active");
              setMood("bounce");
              setTimeout(() => setMood("idle"), 1200);

              // Lên lịch dạo chơi
              roamTimerRef.current = setTimeout(() => {
                pickNextRoamTarget();
              }, 4500);

              // Bắt đầu đếm ngược thời gian ở lại chơi
              resetStayTimer();
            } else {
              // Dạo chơi bình thường xong
              isRoamingRef.current = false;
              setIsRoaming(false);
              setMood("bounce");
              setTimeout(() => setMood("idle"), 1000);
            }
          } else {
            // Đang chạy đến đích
            const speed = Math.min(
              currentSpeedRef.current * (delta / 16.67),
              Math.max(3, dist * 0.08)
            );
            const nx = (dx / dist) * speed;
            const ny = (dy / dist) * speed;
            basePositionRef.current.x += nx;
            basePositionRef.current.y += ny;
          }
        }

        const rawX = basePositionRef.current.x + floatX;
        const rawY = basePositionRef.current.y + floatY;

        // Khi đang active thì giới hạn trong viewport, khi running_out/in thì cho phép vượt ra mép
        let finalX = rawX;
        let finalY = rawY;

        if (lifecycle === "active") {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const mobile = vw <= 768;
          const mascotSize = mobile ? 60 : MASCOT_SIZE;
          const minX = mobile ? 14 : 28;
          const maxX = Math.max(minX, vw - mascotSize - (mobile ? 20 : 40));
          const minY = mobile ? 80 : 95;
          const maxY = Math.max(minY, vh - mascotSize - (mobile ? 22 : 40));

          finalX = Math.min(maxX, Math.max(minX, rawX));
          finalY = Math.min(maxY, Math.max(minY, rawY));
        }

        const newPos = { x: finalX, y: finalY };
        positionRef.current = newPos;
        setPosition(newPos);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [lifecycle, triggerAppearFromCorner, pickNextRoamTarget, resetStayTimer]
  );

  useEffect(() => {
    if (lifecycle !== "hidden") {
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lifecycle, animate]);

  // Theo dõi chuột khi chuột lại gần
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (lifecycle === "hidden" || lifecycle === "running_out") return;

      const cx = positionRef.current.x + MASCOT_SIZE / 2;
      const cy = positionRef.current.y + MASCOT_SIZE / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const near = dist < 180;
      setMouseNear(near);
      isHoveredRef.current = dist < 100;

      if (near) {
        resetStayTimer();
        setLookAngle(Math.atan2(dy, dx) * (180 / Math.PI));
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [lifecycle, resetStayTimer]);

  // Click vào bé → Bật nhảy, tung hạt, hủy chạy trốn, gia hạn ở lại chơi
  const handleClick = () => {
    if (isDragging || lifecycle === "hidden") return;

    // Nếu đang chạy trốn mà bị người dùng click trúng ➔ Quay lại chơi tiếp!
    if (lifecycle === "running_out") {
      setLifecycle("active");
      currentSpeedRef.current = ROAM_SPEED_NORMAL;
    }

    setIsClicked(true);
    setMood("bounce");

    const quote = PLAYFUL_QUOTES[Math.floor(Math.random() * PLAYFUL_QUOTES.length)];
    setTooltipText(quote);
    setShowTooltip(true);

    resetStayTimer();

    setTimeout(() => setIsClicked(false), 700);
    setTimeout(() => setShowTooltip(false), 3000);
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (lifecycle === "hidden") return;
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    isRoamingRef.current = false;
    setIsRoaming(false);
    if (lifecycle === "running_out") {
      setLifecycle("active");
    }
    resetStayTimer();

    dragOffsetRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw <= 768;
    const mascotSize = mobile ? 60 : MASCOT_SIZE;
    const minX = 12;
    const maxX = Math.max(minX, vw - mascotSize - 14);
    const minY = 75;
    const maxY = Math.max(minY, vh - mascotSize - 14);

    const rawX = e.clientX - dragOffsetRef.current.x;
    const rawY = e.clientY - dragOffsetRef.current.y;
    const newPos = {
      x: Math.min(maxX, Math.max(minX, rawX)),
      y: Math.min(maxY, Math.max(minY, rawY)),
    };
    positionRef.current = newPos;
    setPosition(newPos);
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      setIsDragging(false);
      isDraggingRef.current = false;
      basePositionRef.current = { ...positionRef.current };
      resetStayTimer();
      setMood("bounce");
      setTimeout(() => setMood("idle"), 1000);
    }
  };

  if (lifecycle === "hidden") {
    return null; // Ẩn hoàn toàn khi đã trốn ra ngoài 4 góc
  }

  const eyeOffsetX = mouseNear ? Math.cos((lookAngle * Math.PI) / 180) * 3 : 0;
  const eyeOffsetY = mouseNear ? Math.sin((lookAngle * Math.PI) / 180) * 2 : 0;

  const stateClasses = [
    `floating-mascot--${mood}`,
    `floating-mascot--${lifecycle}`,
    isClicked ? "floating-mascot--clicked" : "",
    isDragging ? "floating-mascot--dragging" : "",
    mouseNear ? "floating-mascot--mouse-near" : "",
    (isRoaming || lifecycle === "running_in" || lifecycle === "running_out")
      ? "floating-mascot--roaming"
      : "",
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
      title="Bắt mình đi nào! 🍈✨"
    >
      {/* Vòng sáng ma thuật lấp lánh */}
      <div className="floating-mascot__glow" />

      {/* Vệt bụi gió khi chạy vút */}
      {(lifecycle === "running_in" || lifecycle === "running_out") && (
        <div className="floating-mascot__rush-wind" />
      )}

      {/* Hạt lấp lánh khi click */}
      {isClicked && (
        <div className="floating-mascot__particles">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="floating-mascot__particle"
              style={{
                "--angle": `${i * 36}deg`,
                "--delay": `${i * 0.03}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Ảnh Mascot */}
      <img
        src={mascotImage}
        alt="EaAgri Mascot - Sầu Sầu"
        className="floating-mascot__img"
        draggable={false}
        onError={(e) => {
          e.currentTarget.src = "/Amination/logo EaAgri.png";
        }}
      />

      {/* Bóng dưới chân */}
      <div className="floating-mascot__shadow" />

      {/* Bong bóng thoại */}
      {showTooltip && (
        <div className="floating-mascot__tooltip">
          <span>{tooltipText}</span>
          <div className="floating-mascot__tooltip-arrow" />
        </div>
      )}
    </div>
  );
}
