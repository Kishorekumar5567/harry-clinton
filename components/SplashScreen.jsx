"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Runs pre-paint on the client (no-op on the server): lets us hide the
// splash synchronously for returning visitors without a flash frame.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// The intro must last SPLASH_MS, but the brand clip is longer. Rather than
// re-encode the asset, play it faster: playbackRate = duration / 3s, so the
// clip lands on its own final frame at the 3s mark and onEnded fires for
// real. SPLASH_MS is also a hard fallback, so a stalled or undecodable video
// can never trap the visitor on the splash.
const SPLASH_MS = 3000;

// Opening splash: brand video plays at a raised rate so the intro lasts
// SPLASH_MS (3s), then reveals the store. Dismissed by the video ending, that
// hard cap, the Skip button, or Esc. Taps elsewhere on the screen must NOT
// skip it. Frontend-only asset by design.
export default function SplashScreen() {
  // Start VISIBLE so the server HTML already covers the homepage — no
  // homepage flash before the splash. Returning visitors are hidden
  // synchronously pre-paint below, so they never see a flicker either.
  const [show, setShow] = useState(true);
  const videoRef = useRef(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem("hc_splash_seen")) {
      setShow(false);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dismiss = useCallback(() => {
    sessionStorage.setItem("hc_splash_seen", "1");
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") dismiss();
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

  // Raise the playback rate so the clip finishes in SPLASH_MS. The video is
  // server-rendered with preload="auto", so metadata can already be ready
  // before React hydrates — apply immediately AND on the event, otherwise the
  // rate silently stays at 1.
  useEffect(() => {
    if (!show) return undefined;
    const v = videoRef.current;
    if (!v) return undefined;
    const speedUp = () => {
      if (Number.isFinite(v.duration) && v.duration > 0) {
        // 10s clip -> 3.33x, so it lands on its own final frame at 3s.
        v.preservedPitch = false; // keep the original pitch if ever unmuted
        v.defaultPlaybackRate = v.duration / (SPLASH_MS / 1000);
        v.playbackRate = v.defaultPlaybackRate;
      }
    };
    speedUp();
    v.addEventListener("loadedmetadata", speedUp);
    return () => v.removeEventListener("loadedmetadata", speedUp);
  }, [show]);

  // Stall guard only. The video's own onEnded is the normal exit (it lands at
  // SPLASH_MS thanks to the raised playback rate); this backstop is a little
  // longer so a healthy clip always ends on its own final frame, while a
  // stalled, blocked or undecodable video still can't trap the visitor.
  useEffect(() => {
    if (!show) return undefined;
    const t = window.setTimeout(dismiss, SPLASH_MS + 600);
    return () => window.clearTimeout(t);
  }, [show, dismiss]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      role="dialog"
      aria-label="Harry Clinton intro"
    >
      <video
        ref={videoRef}
        src="/brand/hc-splash.mp4"
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={dismiss}
      />
      <div className="absolute bottom-6 md:bottom-8 flex flex-col items-center z-20">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Skip intro video"
          className="group flex items-center gap-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] !text-white !bg-[#101010]/80 border border-[#c6a15b]/40 backdrop-blur-md transition-all duration-300 hover:!bg-[#c6a15b] hover:!text-neutral-950 hover:!border-[#c6a15b] hover:shadow-[0_4px_20px_rgba(198,161,91,0.35)] cursor-pointer"
        >
          <span>Skip</span>
          <svg
            className="w-3 h-3 text-[#c6a15b] group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
