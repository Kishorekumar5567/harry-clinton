"use client";

import { useEffect, useRef } from "react";

export default function CategoryHero({ image, title, subtitle, description, ctaText = "Shop Now", ctaLink = "#category-grid" }) {
  const imageRef = useRef(null);

  useEffect(() => {
    const updateParallax = () => {
      const media = imageRef.current;
      if (!media) return;

      const hero = media.parentElement;
      if (!hero) return;

      // Reference-style parallax: image rises at 0.4x the hero's scroll
       // progress, clamped to its available extra height so no background
       // can appear inside the hero.
      const scrolled = Math.max(0, -hero.getBoundingClientRect().top);
      const maxOffset = Math.max(0, media.offsetHeight - hero.clientHeight);
      const offset = Math.min(scrolled * 0.4, maxOffset);
      media.style.transform = `translate3d(0, ${-offset}px, 0)`;
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
    <section className="category-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} src={image} alt={title} className="category-hero__image" />
      <div className="category-hero__shade" />
      <div className="category-hero__content">
        <h1 className="category-hero__title">{title}</h1>
        <h2 className="category-hero__subtitle">{subtitle}</h2>
        {description && <p className="category-hero__description">{description}</p>}
        {ctaLink?.startsWith("#") ? (
          <button type="button" className="category-hero__button" onClick={scrollToCategories}>{ctaText}</button>
        ) : (
          <a href={ctaLink || "#category-grid"} className="category-hero__button">{ctaText}</a>
        )}
      </div>
    </section>
  );
}
