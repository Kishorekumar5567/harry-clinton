"use client";

import { useEffect, useRef } from "react";

export default function CategoryHero({ image, title, subtitle }) {
  const heroRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const updateParallax = () => {
      const hero = heroRef.current;
      const media = imageRef.current;
      if (!hero || !media) return;

      const bounds = hero.getBoundingClientRect();
      const progress = Math.max(0, Math.min(bounds.height, -bounds.top));
      media.style.transform = `translate3d(0, ${progress * -0.4}px, 0)`;
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateParallax();
      });
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [image]);

  const scrollToCategories = () => {
    document.getElementById("category-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={heroRef} className="category-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} src={image} alt={title} className="category-hero__image" />
      <div className="category-hero__shade" />
      <div className="category-hero__content">
        <h1 className="category-hero__title">{title}</h1>
        <h2 className="category-hero__subtitle">{subtitle}</h2>
        <button type="button" className="category-hero__button" onClick={scrollToCategories}>
          Shop Now
        </button>
      </div>
    </section>
  );
}
