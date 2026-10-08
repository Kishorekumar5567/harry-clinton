"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Runs pre-paint on the client (no-op on the server): lets us hide the
// splash synchronously for returning visitors without a flash frame.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const SPLASH_ACTIVITY_EVENT = "hc:splash-activity";

// Opening splash: the store is revealed only after the complete video emits
// `ended`. There is intentionally no duration shortcut or timeout fallback.
export default function SplashScreen() {
  // Start VISIBLE so the server HTML already covers the homepage — no
  // homepage flash before the splash. Returning visitors are hidden
  // synchronously pre-paint below, so they never see a flicker either.
  const [show, setShow] = useState(true);
  const videoRef = useRef(null);
  const splashLoading = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem("hc_splash_seen")) {
      setShow(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    if (splashLoading.current) {
      window.dispatchEvent(new CustomEvent(SPLASH_ACTIVITY_EVENT, { detail: { delta: -1 } }));
      splashLoading.current = false;
    }
    sessionStorage.setItem("hc_splash_seen", "1");
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return;
    // Freeze the homepage behind the video: no scrollbar, no scroll — native
    // AND Lenis (which drives wheel scrolling past overflow locks).
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    try {
      window.lenis?.stop();
    } catch {
      /* no smooth scroller */
    }
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      try {
        window.lenis?.start();
      } catch {
        /* no smooth scroller */
      }
    };
  }, [show, dismiss]);

  useEffect(() => {
    if (!show) return undefined;
    const v = videoRef.current;
    if (!v) return undefined;
    const announceLoading = () => {
      if (splashLoading.current) return;
      splashLoading.current = true;
      window.dispatchEvent(new CustomEvent(SPLASH_ACTIVITY_EVENT, { detail: { delta: 1 } }));
    };
    const ready = () => {
      if (!splashLoading.current) return;
      splashLoading.current = false;
      window.dispatchEvent(new CustomEvent(SPLASH_ACTIVITY_EVENT, { detail: { delta: -1 } }));
    };
    announceLoading();
    v.addEventListener("canplay", ready, { once: true });
    if (v.readyState >= 3) ready();
    return () => v.removeEventListener("canplay", ready);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      role="dialog"
      aria-label="Harry Clinton intro"
    >
      <video
        ref={videoRef}
        src="/brand/hc-splash.mp4"
        className="h-full w-full object-cover lg:scale-[1.12] xl:scale-[1.22] 2xl:scale-[1.3]"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={dismiss}
      />
    </div>
  );
}
