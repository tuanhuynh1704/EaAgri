import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

type ScanMode = "overall" | "flesh" | "disease";

interface DiagnosticInfo {
  grade: string;
  brix: string;
  ripeness: number;
  weight: string;
  health: string;
  confidence: number;
  fleshQuality: string;
  harvestWindow: string;
}

const DurianScannerSection = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMode, setActiveMode] = useState<ScanMode>("overall");
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const complete = progress >= 100;

  const diagnosticData: Record<ScanMode, DiagnosticInfo> = {
    overall: {
      grade: "Loại 1 (Xuất khẩu)",
      brix: "18.5° Brix",
      ripeness: 85,
      weight: "3.85 kg",
      health: "100% An toàn",
      confidence: 99.4,
      fleshQuality: "Cơm vàng hạt lép 92%",
      harvestWindow: "Thu hoạch trong 3 ngày",
    },
    flesh: {
      grade: "Chuẩn Hạt Lép",
      brix: "19.2° Brix",
      ripeness: 88,
      weight: "Múi dày 3.2cm",
      health: "Không sượng",
      confidence: 98.8,
      fleshQuality: "Cơm sáp dẻo, béo ngậy",
      harvestWindow: "Đạt đỉnh vị giác",
    },
    disease: {
      grade: "Sạch Bệnh 100%",
      brix: "Kháng nấm Phytophthora",
      ripeness: 85,
      weight: "Gai khô đều",
      health: "Không rệp sáp / nấm",
      confidence: 99.7,
      fleshQuality: "Vỏ lành lặn, không nứt",
      harvestWindow: "Đạt chuẩn GlobalGAP",
    },
  };

  const currentData = diagnosticData[activeMode];

  useEffect(() => {
    if (!isScanning || complete) return;

    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(100, current + 2.8));
    }, 60);

    return () => window.clearInterval(timer);
  }, [isScanning, complete]);

  const moveScanner = (event: PointerEvent<HTMLDivElement>) => {
    const element = scannerRef.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
    const normalizedX = x / bounds.width - 0.5;
    const normalizedY = y / bounds.height - 0.5;

    element.style.setProperty("--scan-x", `${x}px`);
    element.style.setProperty("--scan-y", `${y}px`);
    element.style.setProperty("--fruit-rotate-x", `${normalizedY * -6}deg`);
    element.style.setProperty("--fruit-rotate-y", `${normalizedX * 8}deg`);

    // Determine hovered zone
    if (y < bounds.height * 0.3) {
      setHoveredPoint("Cuống sầu riêng: Tươi mới (Vết cắt 24h)");
    } else if (y > bounds.height * 0.7) {
      setHoveredPoint("Đáy quả: Gai nở đều, rãnh múi lộ rõ");
    } else {
      setHoveredPoint("Thân quả: Cơm vàng dày 3.2cm, Brix 18.5°");
    }
  };

  const beginScan = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsScanning(true);
    moveScanner(event);
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  const resetScan = () => {
    setProgress(0);
    setIsScanning(false);
    setHoveredPoint(null);
  };

  return (
    <section className="durian-scanner-section">
      {/* Soft Ambient Glows in Background */}
      <div className="scanner-bg-aura scanner-bg-aura--1" aria-hidden="true"></div>
      <div className="scanner-bg-aura scanner-bg-aura--2" aria-hidden="true"></div>

      <div className="durian-scanner-section__inner section__container">
        {/* LEFT COLUMN: Modern Tech Copy & Value Propositions */}
        <div className="durian-scanner-copy" data-aos="fade-right">
          <div className="scanner-eyebrow">
            <span className="scanner-eyebrow__icon">
              <i className="ri-focus-3-line"></i>
            </span>
            <span className="scanner-eyebrow__text">EA VISION AI • QUÉT THÔNG MINH</span>
          </div>

          <h2 className="scanner-title">
            Truy quét chất lượng<br />
            <span className="text-gradient">sầu riêng bằng AI</span>
          </h2>

          <p className="scanner-desc">
            Ứng dụng thị giác máy tính AI đa phương thức và quang phổ NIR để phân tích
            chất lượng cơm sầu, độ ngọt Brix, tỷ lệ hạt lép và nấm bệnh ngay trên bề mặt quả theo thời gian thực.
          </p>

          {/* Interactive Feature Cards */}
          <div className="scanner-feature-cards">
            <div className={`feature-step-card ${progress > 0 ? "is-active" : ""}`}>
              <div className="step-badge">01</div>
              <div className="step-info">
                <h4>Quét Quang Học 360°</h4>
                <p>Nhận diện hình thái gai, độ mở rãnh múi và độ căng vỏ quả</p>
              </div>
            </div>

            <div className={`feature-step-card ${progress >= 50 ? "is-active" : ""}`}>
              <div className="step-badge">02</div>
              <div className="step-info">
                <h4>Phân Tích Cơm & Độ Ngọt</h4>
                <p>Đo chỉ số Brix 18.5°, tỷ lệ nạc hạt lép và độ dẻo của múi</p>
              </div>
            </div>

            <div className={`feature-step-card ${complete ? "is-active" : ""}`}>
              <div className="step-badge">03</div>
              <div className="step-info">
                <h4>Định Danh & Cấp Mã Xuất Khẩu</h4>
                <p>Gắn mã số vùng trồng Blockchain phục vụ thị trường cao cấp</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Luxury Glassmorphic AI Diagnostic Terminal */}
        <div className="durian-scanner-console-wrapper" data-aos="zoom-in">
          <div className="durian-scanner-console">
            
            {/* Top Control Bar with Mode Selector */}
            <div className="durian-scanner-console__topbar">
              <div className="terminal-status">
                <span className="status-indicator"></span>
                <span className="status-text">EA VISION LIVE TERMINAL</span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="terminal-modes" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeMode === "overall"}
                  className={`mode-tab ${activeMode === "overall" ? "is-active" : ""}`}
                  onClick={() => setActiveMode("overall")}
                >
                  <i className="ri-radar-line"></i> Toàn Diện
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeMode === "flesh"}
                  className={`mode-tab ${activeMode === "flesh" ? "is-active" : ""}`}
                  onClick={() => setActiveMode("flesh")}
                >
                  <i className="ri-cake-3-line"></i> Cơm & Múi
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeMode === "disease"}
                  className={`mode-tab ${activeMode === "disease" ? "is-active" : ""}`}
                  onClick={() => setActiveMode("disease")}
                >
                  <i className="ri-shield-check-line"></i> Sạch Bệnh
                </button>
              </div>
            </div>

            {/* Main Interactive Scanning Canvas Stage */}
            <div
              ref={scannerRef}
              className={`durian-scan-stage ${isScanning ? "is-scanning" : ""} ${complete ? "is-complete" : ""}`}
              style={{ "--scan-x": "50%", "--scan-y": "50%" } as CSSProperties}
              onPointerDown={beginScan}
              onPointerMove={(event) => {
                if (isScanning || event.pointerType === "mouse") moveScanner(event);
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setIsScanning(true);
              }}
              onPointerLeave={stopScan}
              onPointerUp={stopScan}
              aria-label="Vùng tương tác quét quả sầu riêng 3D"
            >
              {/* Holographic Background Grid & Tech Rings */}
              <div className="durian-scan-stage__grid" aria-hidden="true"></div>
              <div className="durian-scan-stage__rings" aria-hidden="true">
                <span className="ring ring--1"></span>
                <span className="ring ring--2"></span>
              </div>

              {/* Central 3D Smart Durian Image */}
              <img loading="lazy" decoding="async"
                src="/assets/smart_durian_hero.webp"
                alt="Quả sầu riêng đang được AI truy quét chất lượng"
                className="durian-scan-subject"
              />

              {/* Interactive Target Reticle Cursor */}
              <span className="durian-scan-reticle" aria-hidden="true">
                <span className="reticle-core"></span>
                <span className="reticle-label">{hoveredPoint || "Di chuyển để quét"}</span>
              </span>

              {/* Sweeping Laser Scan Line */}
              <span className="durian-scan-laser" aria-hidden="true"></span>

              {/* Floating Live AI Pins on Fruit */}
              <div className="fruit-ai-pins" aria-hidden="true">
                <div className="fruit-pin fruit-pin--stem">
                  <span className="fruit-pin__dot"></span>
                  <span className="fruit-pin__tag">Cuống tươi (100%)</span>
                </div>
                <div className="fruit-pin fruit-pin--brix">
                  <span className="fruit-pin__dot"></span>
                  <span className="fruit-pin__tag">Brix 18.5° • Múi sáp</span>
                </div>
                <div className="fruit-pin fruit-pin--spikes">
                  <span className="fruit-pin__dot"></span>
                  <span className="fruit-pin__tag">Gai nở chuẩn Loại 1</span>
                </div>
              </div>

              {/* Bottom Floating Interactive Hint Pill */}
              <span className="durian-scan-hint">
                <i className="ri-fingerprint-line"></i>
                {complete ? "Phân tích AI hoàn tất" : "Chạm & Di chuyển chuột trên quả để quét"}
              </span>
            </div>

            {/* Realtime Progress & Confidence Bar */}
            <div className="durian-scan-progress-bar">
              <div className="progress-info">
                <span className="progress-label">
                  <i className="ri-cpu-line"></i> Tiến trình phân tích quang phổ AI
                </span>
                <span className="progress-percent">{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }}>
                  <span className="progress-glow"></span>
                </div>
              </div>
            </div>

            {/* Diagnostic Metrics Result Cards (Luxury Frosted Glass Cards) */}
            <div className={`durian-scan-results-grid ${complete ? "is-visible" : ""}`} aria-live="polite">
              <div className="result-metric-card result-metric-card--primary">
                <div className="metric-icon"><i className="ri-award-fill"></i></div>
                <div className="metric-text">
                  <span className="metric-lbl">Phân Loại Trái</span>
                  <strong className="metric-val text-emerald">{currentData.grade}</strong>
                </div>
              </div>

              <div className="result-metric-card">
                <div className="metric-icon metric-icon--amber"><i className="ri-fire-fill"></i></div>
                <div className="metric-text">
                  <span className="metric-lbl">Độ Ngọt / Múi</span>
                  <strong className="metric-val text-amber">{currentData.brix}</strong>
                </div>
              </div>

              <div className="result-metric-card">
                <div className="metric-icon metric-icon--cyan"><i className="ri-dashboard-3-line"></i></div>
                <div className="metric-text">
                  <span className="metric-lbl">Độ Chín / Trọng Lượng</span>
                  <strong className="metric-val text-cyan">{currentData.ripeness}% • {currentData.weight}</strong>
                </div>
              </div>

              <div className="result-metric-card">
                <div className="metric-icon metric-icon--teal"><i className="ri-shield-check-fill"></i></div>
                <div className="metric-text">
                  <span className="metric-lbl">Chất Lượng Vỏ & Cơm</span>
                  <strong className="metric-val text-teal">{currentData.fleshQuality}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="result-actions">
                <button type="button" className="btn-rescan" onClick={resetScan} title="Thực hiện quét lại">
                  <i className="ri-restart-line"></i> Quét Lại
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DurianScannerSection;
