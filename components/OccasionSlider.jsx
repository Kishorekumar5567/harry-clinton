"use client";

import { useState } from "react";

// 3-slide carousel with Previous/Next controls — same structure as before.
export default function OccasionSlider({ images }) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  if (total === 0) return null;

  const go = (dir) => setIndex((i) => (i + dir + total) % total);

  return (
    <div id="sliderCarousel" className="relative">
      <div className="overflow-hidden">
        {images.map((src, i) => (
          <div key={i} style={{ display: i === index ? "block" : "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              className="d-block w-100"
              alt={`Slide ${i + 1}`}
              style={{ height: "500px", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
      <button className="oc-ctrl oc-ctrl--prev" type="button" onClick={() => go(-1)}>
        <span className="oc-ctrl__icon oc-ctrl__icon--prev" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="oc-ctrl oc-ctrl--next" type="button" onClick={() => go(1)}>
        <span className="oc-ctrl__icon oc-ctrl__icon--next" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
      <style jsx>{`
        .d-block { display: block; }
        .w-100 { width: 100%; }
        /* reference: Bootstrap carousel controls - full-height 15% hit
           areas, bare white chevrons at 50% opacity, 90% on hover */
        .oc-ctrl {
          position: absolute; top: 0; bottom: 0; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          width: 15%; padding: 0; border: 0; background: none;
          opacity: 0.5; cursor: pointer; transition: opacity 0.15s ease;
        }
        .oc-ctrl:hover, .oc-ctrl:focus-visible { opacity: 0.9; outline: 0; }
        .oc-ctrl--prev { left: 0; }
        .oc-ctrl--next { right: 0; }
        .oc-ctrl__icon {
          display: inline-block; width: 2rem; height: 2rem;
          background-repeat: no-repeat; background-position: 50%; background-size: 100% 100%;
        }
        .oc-ctrl__icon--prev {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
        }
        .oc-ctrl__icon--next {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
        }
        .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      `}</style>
    </div>
  );
}
