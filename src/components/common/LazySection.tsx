import { useState, useEffect, useRef, type ReactNode, Suspense } from "react";
import AOS from "aos";

interface LazySectionProps {
  children: ReactNode;
  minHeight?: string | number;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  id?: string;
}

export default function LazySection({
  children,
  minHeight = "400px",
  rootMargin = "300px 0px",
  threshold = 0.01,
  className = "",
  id,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        try {
          AOS.refresh();
        } catch {
          // ignore
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`lazy-section-container ${className}`}
      style={{
        minHeight: isVisible ? undefined : minHeight,
      }}
    >
      {isVisible ? (
        <Suspense
          fallback={
            <div
              className="lazy-section-placeholder"
              style={{
                minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="lazy-section-spinner" />
            </div>
          }
        >
          {children}
        </Suspense>
      ) : null}
    </div>
  );
}
