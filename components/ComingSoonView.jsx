"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./coming-soon.css";

export default function ComingSoonView({ title = "Coming Soon", message }) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((previous) => (previous.length >= 3 ? "." : `${previous}.`));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-content">
        <img src="/brand/hc-black-contact.png" alt="Harry Clinton" className="coming-soon-logo" />
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-message">
          {message || "We are crafting something extraordinary for you. Stay tuned for the reveal."}
          <span className="coming-soon-dots">{dots}</span>
        </p>
        <Link href="/" className="coming-soon-btn">Back to Home</Link>
      </div>
      <div className="coming-soon-marquee">
        <div className="coming-soon-track">
          {Array(4).fill(["HARRY CLINTON", "·", "COMING SOON", "·", "CRAFTED FOR YOU", "·"]).flat().map((word, index) => (
            <span key={index} className={word === "·" ? "coming-soon-dot" : "coming-soon-word"}>{word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
