"use client";

import { useEffect, useState } from "react";

const API_ACTIVITY_EVENT = "hc:api-activity";

export default function GlobalLoader() {
  const [pending, setPending] = useState(0);
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
    const timer = window.setTimeout(() => setVisible(pending > 0), pending > 0 ? 120 : 0);
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (!visible) return null;

  return (
    <div className="hc-global-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="hc-global-loader__ring">
        {/* The same black navbar logo is used as the loader mark. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-black.png" alt="Harry Clinton" className="hc-global-loader__logo" />
      </div>
      <span className="hc-global-loader__text">Loading</span>
      <style jsx>{`
        .hc-global-loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .hc-global-loader__ring {
          position: relative;
          display: grid;
          width: 132px;
          height: 132px;
          place-items: center;
          border: 2px solid rgba(16, 16, 16, 0.12);
          border-top-color: #111;
          border-right-color: #c6a15b;
          border-radius: 50%;
          animation: hc-loader-spin 1s linear infinite;
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
          animation: hc-loader-counter-spin 1s linear infinite;
        }
        .hc-global-loader__text {
          color: #111;
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
      `}</style>
    </div>
  );
}
