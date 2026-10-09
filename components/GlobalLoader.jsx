"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const API_ACTIVITY_EVENT = "hc:api-activity";

export default function GlobalLoader() {
  const pathname = usePathname();
  const [pending, setPending] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDots((previous) => (previous.length >= 3 ? "." : `${previous}.`));
    }, 700);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onActivity = (event) => {
      const delta = Number(event.detail?.delta) || 0;
      setPending((count) => Math.max(0, count + delta));
    };
    window.addEventListener(API_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(API_ACTIVITY_EVENT, onActivity);
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
    const busy = pending > 0 || navigating;
    const timer = window.setTimeout(() => setVisible(busy), busy ? 180 : 280);
    return () => window.clearTimeout(timer);
  }, [pending, navigating]);

  if (!visible) return null;

  return (
    <div className="hc-global-loader" role="status" aria-live="polite" aria-label="Loading">
      {/* White HC mark, matching the Coming Soon treatment. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/hc-white.png" alt="Harry Clinton" className="hc-global-loader__logo" />
      <span className="hc-global-loader__text">Loading<span className="hc-global-loader__dots">{dots}</span></span>
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
        gap: 22px;
          margin: 0;
          padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .hc-global-loader__logo {
          width: min(118px, 30vw);
          height: auto;
          object-fit: contain;
        }
        .hc-global-loader__text {
          color: #fff;
          font-family: var(--font-mainlux), Arial, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }
        .hc-global-loader__dots {
          display: inline-block;
          width: 24px;
          text-align: left;
        }
        @media (prefers-reduced-motion: reduce) {
          .hc-global-loader__dots { animation: none; }
        }
        @media (max-width: 640px) {
          .hc-global-loader { gap: 16px; }
          .hc-global-loader__logo { width: 96px; }
        }
      `}</style>
    </div>
  );
}
