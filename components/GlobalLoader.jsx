"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const API_ACTIVITY_EVENT = "hc:api-activity";
const SPLASH_ACTIVITY_EVENT = "hc:splash-activity";

export default function GlobalLoader() {
  const pathname = usePathname();
  const [pending, setPending] = useState(0);
  const [splashPending, setSplashPending] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onActivity = (event) => {
      const delta = Number(event.detail?.delta) || 0;
      setPending((count) => Math.max(0, count + delta));
    };
    window.addEventListener(API_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(API_ACTIVITY_EVENT, onActivity);
  }, []);

  useEffect(() => {
    const onSplashActivity = (event) => {
      const delta = Number(event.detail?.delta) || 0;
      setSplashPending((count) => Math.max(0, count + delta));
    };
    window.addEventListener(SPLASH_ACTIVITY_EVENT, onSplashActivity);
    return () => window.removeEventListener(SPLASH_ACTIVITY_EVENT, onSplashActivity);
  }, []);

  // Cover client-side route transitions, which may begin before their page API
  // requests are started. The pathname change marks the new page as ready.
  useEffect(() => {
    const timer = window.setTimeout(() => setNavigating(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const isInternalLink = (anchor) => {
      if (!anchor?.href || anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
      const url = new URL(anchor.href, window.location.href);
      return url.origin === window.location.origin && url.pathname !== window.location.pathname;
    };

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest?.("a");
      if (isInternalLink(anchor)) setNavigating(true);
    };
    const onPopState = () => setNavigating(true);

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // Safety cleanup for cancelled navigation or a form that remains on-page.
  useEffect(() => {
    if (!navigating) return undefined;
    const timer = window.setTimeout(() => setNavigating(false), 10000);
    return () => window.clearTimeout(timer);
  }, [navigating]);

  useEffect(() => {
    const busy = pending > 0 || splashPending > 0 || navigating;
    const timer = window.setTimeout(() => setVisible(busy), busy ? 180 : 280);
    return () => window.clearTimeout(timer);
  }, [pending, splashPending, navigating]);

  if (!visible) return null;

  return (
    <div className="hc-global-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="hc-global-loader__ring">
        {/* The navbar logo is used as the loader mark. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-white.png" alt="Harry Clinton" className="hc-global-loader__logo" />
      </div>
      <span className="hc-global-loader__text">Loading</span>
      <style jsx>{`
        .hc-global-loader {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          min-height: 100dvh;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          gap: 18px;
          margin: 0;
          padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .hc-global-loader__ring {
          position: relative;
          display: grid;
          width: 132px;
          height: 132px;
          place-items: center;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #fff;
          border-right-color: #c6a15b;
          border-radius: 50%;
          animation: hc-loader-spin 2.2s linear infinite;
        }
        .hc-global-loader__ring::after {
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(198, 161, 91, 0.42);
          border-radius: 50%;
          content: "";
        }
        .hc-global-loader__logo {
          width: 78px;
          height: auto;
          object-fit: contain;
          animation: hc-loader-counter-spin 2.2s linear infinite;
        }
        .hc-global-loader__text {
          color: #fff;
          font-family: var(--font-mainlux), Arial, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }
        @keyframes hc-loader-spin { to { transform: rotate(360deg); } }
        @keyframes hc-loader-counter-spin { to { transform: rotate(-360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .hc-global-loader__ring, .hc-global-loader__logo { animation: none; }
        }
        @media (max-width: 640px) {
          .hc-global-loader { gap: 16px; }
          .hc-global-loader__ring { width: 116px; height: 116px; }
          .hc-global-loader__logo { width: 68px; }
        }
      `}</style>
    </div>
  );
}
