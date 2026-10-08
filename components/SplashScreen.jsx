"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Runs pre-paint on the client (no-op on the server): lets us hide the
// splash synchronously for returning visitors without a flash frame.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const SPLASH_ACTIVITY_EVENT = "hc:splash-activity";
const SPLASH_MS = 3000;

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

  const releaseSplashLoader = useCallback(() => {
    if (splashLoading.current) {
      window.dispatchEvent(new CustomEvent(SPLASH_ACTIVITY_EVENT, { detail: { delta: -1 } }));
      splashLoading.current = false;
    }
  }, []);

  const dismiss = useCallback(() => {
    releaseSplashLoader();
    sessionStorage.setItem("hc_splash_seen", "1");
    setShow(false);
  }, [releaseSplashLoader]);

  useEffect(() => {
    if (!show) return;
    const onKey = (event) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
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
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      try {
        window.lenis?.start();
      } catch {
        /* no smooth scroller */
      }
    };
  }, [show, dismiss]);

  // Once the browser has received usable video data, release the global loader.
  // The intro itself remains visible while its accelerated playback completes.
  useEffect(() => {
    if (!show) return undefined;
    const v = videoRef.current;
    if (!v) return undefined;
    const announceLoading = () => {
      if (splashLoading.current) return;
      splashLoading.current = true;
      window.dispatchEvent(new CustomEvent(SPLASH_ACTIVITY_EVENT, { detail: { delta: 1 } }));
    };
    announceLoading();
    const ready = releaseSplashLoader;
    v.addEventListener("loadeddata", ready, { once: true });
    v.addEventListener("canplay", ready, { once: true });
    if (v.readyState >= 2) ready();
    return () => {
      v.removeEventListener("loadeddata", ready);
      v.removeEventListener("canplay", ready);
      releaseSplashLoader();
    };
  }, [show, releaseSplashLoader]);

  // Restore the intended 3-second intro by speeding up the complete source
  // clip rather than cutting it off at an arbitrary timestamp.
  useEffect(() => {
    if (!show) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    const speedUp = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      video.defaultPlaybackRate = video.duration / (SPLASH_MS / 1000);
      video.playbackRate = video.defaultPlaybackRate;
    };
    speedUp();
    video.addEventListener("loadedmetadata", speedUp);
    return () => video.removeEventListener("loadedmetadata", speedUp);
  }, [show]);

  useEffect(() => {
    if (!show) return undefined;
    const timer = window.setTimeout(dismiss, SPLASH_MS + 600);
    return () => window.clearTimeout(timer);
  }, [show, dismiss]);

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
        onLoadedData={releaseSplashLoader}
        onPlaying={releaseSplashLoader}
        onEnded={dismiss}
      />
      <button
        type="button"
        onClick={dismiss}
        aria-label="Skip intro video"
        className="absolute bottom-6 z-20 cursor-pointer border-0 bg-transparent px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        Skip
      </button>
    </div>
  );
}
