"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import Hamburger from "./Hamburger";
import ProfileDropdown from "./ProfileDropdown";
import SearchDropdown from "./SearchDropdown";
import CartDrawer from "./CartDrawer";
import CIconModal from "./CIconModal";

// Header: exact structure of the previous UI —
// LEFT (hamburger, C-icon appointment, search) | CENTER (logo) | RIGHT (wishlist, bag, profile).
// All four glyphs are one inline SVG line set (24 grid, 1.8 stroke, round
// caps) — never mixed font foundries, so every icon shares one optical
// center and one weight inside identical boxes.
function BarIcon({ label, children }) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}
const SearchGlyph = () => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Search"
    style={{ display: "block", width: "25px", height: "25px" }}
  >
    <circle cx="9.5" cy="9.5" r="8" />
    <line x1="15.2" y1="15.2" x2="23.8" y2="23.8" />
  </svg>
);
const HeartGlyph = () => (
  <BarIcon label="Wishlist">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </BarIcon>
);
const BagGlyph = () => (
  <BarIcon label="Bag">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </BarIcon>
);
const UserGlyph = () => (
  <BarIcon label="Account">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </BarIcon>
);
export default function HeaderBar({ categories }) {
  const router = useRouter();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const profileRef = useRef(null);

  const cartCount = cart?.count || 0;
  const wishlistCount = cart?.wishlist.length || 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        const hero = document.getElementById("hero");
        if (hero) {
          hero.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        router.push("/");
        setTimeout(() => {
          const hero = document.getElementById("hero");
          if (hero) hero.scrollIntoView({ behavior: "smooth" });
          else window.scrollTo({ top: 0, behavior: "smooth" });
        }, 150);
      }
    }
  };

  return (
    <>
      {searchOpen && <SearchDropdown onClose={() => setSearchOpen(false)} />}

      <header className="hc-bar-font topbar-enter relative sticky top-0 z-[80] flex h-[60px] items-center justify-between bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Hamburger categories={categories} onActiveChange={setMenuActive} />

          <div className="c-home flex items-center">
            <button
              type="button"
              className={`c-icon ${menuActive ? "active" : ""}`}
              aria-label="Book a custom appointment"
              onClick={() => setModalOpen(true)}
            />
          </div>

          <div
            className="search hicon"
            onClick={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSearchOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open search"
          >
            <SearchGlyph />
          </div>
        </div>

        {/* True center: absolutely pinned to the bar midpoint, so left/right
            groups can never push the logo off-center. */}
        <div className="logo pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center m-0 p-0">
          <Link
            href="/"
            aria-label="Harry Clinton home"
            onClick={handleLogoClick}
            className="pointer-events-auto block m-0 p-0 leading-none cursor-pointer"
          >
            <Image
              src="/brand/logo-black.png"
              alt="Harry Clinton"
              width={40}
              height={40}
              priority
              style={{ height: "40px", width: "auto", objectFit: "contain", display: "block", margin: 0, padding: 0 }}
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/wishlist" className="hicon relative text-neutral-900" aria-label="Wishlist">
            <HeartGlyph />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-1  bg-red-600 px-1.5 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button type="button" onClick={() => setBagOpen(true)} className="hicon relative text-neutral-900" aria-label="Open bag">
            <BagGlyph />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1  bg-red-600 px-1.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <div ref={profileRef} className="hicon" style={{ position: "relative" }}>
            <span
              style={{ cursor: "pointer", display: "flex" }}
              onClick={() => setOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((prev) => !prev);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Account"
              aria-expanded={open}
            >
              <UserGlyph />
            </span>
            {open && <ProfileDropdown onClose={() => setOpen(false)} />}
          </div>
        </div>
      </header>

      <CIconModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <CartDrawer open={bagOpen} onClose={() => setBagOpen(false)} />

      <style jsx>{`
        .fs-4 { font-size: 1.4rem; }
        /* all header icons ride in an identical 25x25 box with equal bold weight */
        .hicon {
          width: 25px; height: 25px; flex: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          margin: 0; padding: 0;
        }
        /* fixed glyph size — all icons are strictly 25x25 */
        .hicon svg { display: block; width: 25px; height: 25px; flex: none; }
        .topbar-enter { animation: topbarDrop 0.55s cubic-bezier(0.16, 0.8, 0.24, 1) both; }
        @keyframes topbarDrop { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
        .c-home {
          position: relative;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0;
          flex: none;
        }
        /* Reference mark: not a letter "C" — a 25px circle with a 3px border
           whose RIGHT edge is transparent, so the gap opens rightward and
           reads as a C. Hovering spins it a full turn, sweeping the gap
           around the ring. */
        .c-icon {
          display: block;
          position: relative;
          width: 25px; height: 25px;
          margin: 0; padding: 0;
          box-sizing: border-box;
          background: transparent;
          border: 3px solid #000;
          border-right-color: transparent;
          /* the one deliberate circle on the site — must beat the global
             no-round-corners guard in globals.css, hence !important */
          border-radius: 50% !important;
          cursor: pointer;
          transition: transform 0.3s ease, border-color 0.4s ease-in-out;
        }
        .c-icon:hover { transform: rotate(1turn); }
        .c-icon.active {
          border-color: #c6a15b;
          border-right-color: transparent;
        }
      `}</style>
    </>
  );
}
