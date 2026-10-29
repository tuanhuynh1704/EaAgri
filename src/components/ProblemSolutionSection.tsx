import { useState, useRef, useEffect, useCallback } from "react";

interface ProblemSolutionSectionProps {
  image?: string;
  imageAlt?: string;
}

export default function ProblemSolutionSection({
  image: _image,
  imageAlt: _imageAlt,
}: ProblemSolutionSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoVisible, setVideoVisible] = useState<boolean>(false);
  const hasPlayedRef = useRef(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVideoVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (videoVisible) {
      // Attempt audible playback; browsers may require a user gesture before allowing it.
      video.muted = isMuted;
      void video.play().then(() => {
        hasPlayedRef.current = true;
      }).catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [videoVisible, isMuted]);

  // Định dạng thời gian mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Cập nhật thời gian khi video chạy
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  // Tua video khi click vào thanh tiến trình
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetPercent = clickX / rect.width;
    const newTime = targetPercent * (videoRef.current.duration || 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Play / Pause toggle
  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mute / Unmute toggle
  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  // Tua lại từ đầu
  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  // Toàn màn hình
  const handleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const elem = containerRef.current || videoRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Lắng nghe thay đổi Fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // Controls visibility
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isFullscreen && isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isFullscreen, isPlaying]);

  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    } else {
      resetControlsTimer();
    }
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [isFullscreen, isPlaying, resetControlsTimer]);

  return (
    <section className="section__container problem-solution__container">
      {/* Dynamic Background Aurora */}
      <div className="problem-solution__aurora-bg problem-solution__aurora-bg--emerald" />

      {/* Section Header */}
      <div className="problem-solution__header-wrap" data-aos="fade-down">
        {/* <span className="problem-solution__tag">
          <i className="ri-lightbulb-line"></i> Tầm Nhìn & Sứ Mệnh
        </span> */}
        <h2 className="problem-solution__title">
          Vấn Đề & <span className="highlight">Giải Pháp Đột Phá</span>
        </h2>
        {/* <p className="problem-solution__lead">
          EaAgri giải mã <strong>"Tứ giác rủi ro"</strong> bằng hệ sinh thái Nông nghiệp Thông minh toàn diện tích hợp <strong>IoT & Trí tuệ nhân tạo (AI)</strong>.
        </p> */}
      </div>

      {/* Centered Large Video Showcase */}
      <div className="problem-solution__video-showcase" data-aos="fade-up">
        {/* Video Player Container với Custom Controls đồng bộ */}
        <div
            ref={containerRef}
            className={`problem-solution__video-container ${!isPlaying ? "problem-solution__video-container--paused" : ""}`}
            onClick={togglePlay}
            onMouseMove={resetControlsTimer}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => {
              if (isPlaying) setShowControls(false);
            }}
          >
            <video
              ref={videoRef}
              src="/Video/GIOITHIEU.mp4"
              className="problem-solution__video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => {
                hasPlayedRef.current = true;
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
            />

            {/* Big Center Play Button khi tạm dừng */}
            {!isPlaying && (
              <button
                type="button"
                className="problem-solution__video-center-play"
                onClick={togglePlay}
                title="Nhấn để tiếp tục phát video"
                aria-label="Nhấn để tiếp tục phát video"
              >
                <div className="video-center-pulse" />
                <i className="ri-play-fill"></i>
              </button>
            )}

            {/* Custom Glassmorphism Controls Bar */}
            <div
              className={`problem-solution__video-controls ${
                showControls || !isPlaying ? "problem-solution__video-controls--visible" : ""
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scrubber / Progress timeline */}
              <div
                ref={progressBarRef}
                className="problem-solution__video-progress"
                onClick={handleSeek}
                title="Nhấn để tua video"
                role="slider"
                aria-label="Thanh tiến trình phát video"
                aria-valuemin={0}
                aria-valuemax={duration || 100}
                aria-valuenow={currentTime}
              >
                <div className="video-progress__track">
                  <div
                    className="video-progress__fill"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="video-progress__thumb" />
                  </div>
                </div>
              </div>

              {/* Buttons and time display */}
              <div className="problem-solution__video-actions">
                <div className="video-actions__left">
                  {/* Play/Pause */}
                  <button
                    type="button"
                    className="video-action-btn"
                    onClick={togglePlay}
                    title={isPlaying ? "Tạm dừng" : "Phát tiếp"}
                    aria-label={isPlaying ? "Tạm dừng video" : "Phát tiếp video"}
                  >
                    <i className={isPlaying ? "ri-pause-fill" : "ri-play-fill"}></i>
                    <span className="video-action-btn__text">{isPlaying ? "Tạm dừng" : "Phát"}</span>
                  </button>

                  {/* Mute/Unmute */}
                  <button
                    type="button"
                    className={`video-action-btn ${isMuted ? "video-action-btn--muted-alert" : "video-action-btn--active"}`}
                    onClick={toggleMute}
                    title={isMuted ? "Bật âm thanh video" : "Tắt âm thanh"}
                    aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                  >
                    <i className={isMuted ? "ri-volume-mute-fill" : "ri-volume-up-fill"}></i>
                    <span className="video-action-btn__text">{isMuted ? "Bật tiếng" : "Đang bật"}</span>
                  </button>

                  {/* Time display */}
                  <div className="video-time">
                    <span className="video-time__current">{formatTime(currentTime)}</span>
                    <span className="video-time__divider">/</span>
                    <span className="video-time__total">{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="video-actions__right">
                  {/* Replay */}
                  <button
                    type="button"
                    className="video-action-btn video-action-btn--icon"
                    onClick={handleReplay}
                    title="Tua lại từ đầu"
                    aria-label="Tua lại từ đầu"
                  >
                    <i className="ri-restart-line"></i>
                  </button>

                  {/* Fullscreen */}
                  <button
                    type="button"
                    className="video-action-btn video-action-btn--icon"
                    onClick={handleFullscreen}
                    title={isFullscreen ? "Thu nhỏ màn hình" : "Toàn màn hình"}
                    aria-label={isFullscreen ? "Thu nhỏ màn hình" : "Toàn màn hình"}
                  >
                    <i className={isFullscreen ? "ri-fullscreen-exit-fill" : "ri-fullscreen-fill"}></i>
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}

