import { useEffect } from "react";

/**
 * Marks page blocks that are off screen with `data-offscreen` so CSS can pause their
 * infinite animations (see base/_global.scss). The browser otherwise keeps ticking
 * dozens of decorative animations the visitor cannot see, which costs frames while
 * scrolling. Blocks mounted later (lazy sections, route changes) are picked up via a
 * MutationObserver.
 */
const TARGETS = "section, footer, [data-pause-offscreen]";

export function usePauseOffscreenAnimations() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
        }
      },
      // Resume a little before a block scrolls into view so nothing looks frozen
      { rootMargin: "200px 0px" }
    );

    const observed = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(TARGETS).forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };

    let scheduled = 0;
    const mo = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(() => {
        scheduled = 0;
        scan();
      });
    });

    scan();
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(scheduled);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
