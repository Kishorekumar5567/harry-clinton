"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Top-reveal mega-menu (previous-UI style, no sidebar): CATEGORIES (live)
// + COLLECTIONS + SERVICES + Vision tile drop down from under the header.
// Hamburger lines morph into an "H" shape when active (referenced from hc-home-page);
// links stagger in.
const COLLECTIONS = [
  { label: "Tuxedo", to: "/tuxedo" },
  { label: "Extreme Poppins", to: "/extreme-poppins" },
  { label: "Gurkha Trousers", to: "/gurkha-trousers" },
  { label: "Linen Shirts & Trousers", to: "/linen-shirts-trousers" },
  { label: "88 Cigarettes", to: "/cigarettes" },
];

const SERVICES = [
  { label: "Embroidery", to: "/embroidery" },
  { label: "Alterations", to: "/alterations" },
  { label: "Personal Styling", to: "/personal-styling" },
  { label: "Custom Tailoring", to: "/custom-tailoring" },
];

const FALLBACK_CATEGORIES = [
  { label: "Suits", to: "/suits" },
  { label: "Indo-Western", to: "/indowestern" },
  { label: "Shirts", to: "/shirts" },
  { label: "Trousers", to: "/trousers" },
  { label: "Baby Suits", to: "/babysuits" },
];

export default function Hamburger({ categories, onActiveChange }) {
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);

  const setMenuState = (next) => {
    setIsActive(next);
    onActiveChange?.(next);
  };

  useEffect(() => {
    const onDown = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !e.target.closest(".hamburger")
      ) {
        setMenuState(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuState(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const cats = categories?.length > 0 ? categories : FALLBACK_CATEGORIES;
  const go = (to) => {
    setMenuState(false);
    router.push(to);
  };

  return (
    <>
      <div
        className={`hamburger ${isActive ? "active" : ""}`}
        onClick={() => setMenuState(!isActive)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setMenuState(!isActive);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Menu"
        aria-expanded={isActive}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div ref={menuRef} className={`topmenu ${isActive ? "show" : ""}`}>
        <div className="Hdropdown grid-4col">
          <div>
            <strong>CATEGORIES</strong>
            <ul>
              {cats.map((c) => (
                <li key={c.to}>
                  <button onClick={() => go(c.to)}>{c.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <strong>COLLECTIONS</strong>
            <ul>
              {COLLECTIONS.map((c) => (
                <li key={c.to}>
                  <button onClick={() => go(c.to)}>{c.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <strong>SERVICES</strong>
            <ul>
              {SERVICES.map((c) => (
                <li key={c.to}>
                  <button onClick={() => go(c.to)}>{c.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="Hdropdown-image-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/vision_title.jpeg" alt="The Vision" className="Hdropdown-image" />
            <div className="Hdropdown-overlay">
              <h4>The Vision</h4>
              <button onClick={() => go("/the-vision")}>Explore &rarr;</button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .hamburger {
          width: 25px;
          height: 25px;
          position: relative;
          cursor: pointer;
          z-index: 1000;
        }
        .hamburger span {
          position: absolute;
          height: 3px;
          width: 100%;
          background-color: black;
          transition: all 0.4s ease-in-out;
          left: 0;
          border-radius: 1px;
        }

        /* Default Positions */
        .hamburger span:nth-child(1) {
          top: 0;
          left: 0;
        }
        .hamburger span:nth-child(2) {
          top: 50%;
          transform: translateY(-50%);
          width: 60%;
          left: 20%;
        }
        .hamburger span:nth-child(3) {
          bottom: 0;
          right: 0;
          left: auto;
        }

        /* Active: H shape */
        .hamburger.active {
          transform: scale(1.0);
        }

        .hamburger.active span {
          background-color: #c6a15b;
        }

        .hamburger.active span:nth-child(1) {
          width: 3px;
          height: 100%;
          top: 0;
          left: 0;
        }

        .hamburger.active span:nth-child(2) {
          width: 100%;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 3px;
        }

        .hamburger.active span:nth-child(3) {
          width: 3px;
          height: 100%;
          top: 0;
          bottom: 0;
          left: auto;
          right: 0;
        }
        .topmenu {
          position: absolute; top: 100%; left: 0; right: 0; background: #fff; z-index: 70;
          max-height: 0; opacity: 0; transform: translateY(-14px); overflow: hidden;
          transition: max-height 0.45s ease, opacity 0.3s ease, transform 0.35s ease;
          box-shadow: 0 30px 40px -20px rgba(0,0,0,0.18);
          border-top: 1px solid rgba(198, 161, 91, 0.2);
        }
        .topmenu.show { max-height: calc(100vh - 100px); opacity: 1; transform: translateY(0); overflow-y: auto; }
        .Hdropdown { 
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr 1.6fr; 
          gap: 2rem; 
          padding: 2.25rem 3rem; 
          max-width: 1300px;
          margin: 0 auto;
        }
        .Hdropdown strong { 
          font-family: var(--font-mainlux), 'MAINLUX', sans-serif;
          font-size: 13px; 
          font-weight: 700;
          letter-spacing: 0.25em; 
          color: #c6a15b;
          display: block;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }
        .Hdropdown ul { margin-top: 0; display: grid; gap: 0.65rem; list-style: none; padding: 0; }
        .Hdropdown button { 
          font-family: var(--font-mainlux), 'MAINLUX', sans-serif;
          font-size: 15px; 
          color: #1a1a1a;
          background: none;
          border: none;
          padding: 2px 0;
          text-align: left;
          cursor: pointer;
          display: inline-block;
          transition: color 0.25s ease, transform 0.25s ease;
        }
        .Hdropdown button:hover { 
          color: #c6a15b; 
          transform: translateX(6px);
        }
        .topmenu.show li { animation: itemIn 0.35s ease backwards; }
        .topmenu.show li:nth-child(2) { animation-delay: 0.05s; }
        .topmenu.show li:nth-child(3) { animation-delay: 0.1s; }
        .topmenu.show li:nth-child(4) { animation-delay: 0.15s; }
        .topmenu.show li:nth-child(5) { animation-delay: 0.2s; }
        .topmenu.show li:nth-child(6) { animation-delay: 0.25s; }
        @keyframes itemIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .Hdropdown-image-box { 
          position: relative; 
          min-height: 220px; 
          background: #101010; 
          color: #fff; 
          display: flex; 
          align-items: flex-end; 
          overflow: hidden;
        }
        .Hdropdown-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.75;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        }
        .Hdropdown-image-box:hover .Hdropdown-image {
          transform: scale(1.06);
          opacity: 0.9;
        }
        .Hdropdown-overlay { 
          position: relative;
          z-index: 2;
          padding: 1.5rem; 
          width: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
        }
        .Hdropdown-overlay h4 { 
          font-family: var(--font-mainlux), 'MAINLUX', sans-serif; 
          font-size: 22px; 
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.4rem;
        }
        .Hdropdown-overlay button { 
          font-family: var(--font-mainlux), 'MAINLUX', sans-serif;
          margin-top: 0.35rem; 
          font-size: 12px; 
          letter-spacing: 0.2em; 
          text-transform: uppercase; 
          font-weight: 700;
          color: #c6a15b;
          background: none;
          border: none;
          border-bottom: 1.5px solid #c6a15b; 
          padding: 0 0 2px 0; 
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .Hdropdown-overlay button:hover {
          color: #ffffff;
          border-bottom-color: #ffffff;
          transform: translateX(4px);
        }
        @media (max-width: 860px) { 
          .Hdropdown { grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 1.5rem; } 
          .Hdropdown-image-box { grid-column: 1 / -1; }
        }
      `}</style>
    </>
  );
}
