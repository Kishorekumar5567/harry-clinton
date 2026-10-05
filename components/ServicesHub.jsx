"use client";

import Link from "next/link";
import { useState } from "react";
import "./services-hub.css";

const SERVICE_TYPES = [
  { id: "embroidery", label: "Embroidery", href: "/services" },
  { id: "alterations", label: "Alterations", href: "/services" },
  { id: "styling", label: "Personal Styling", href: "/services" },
  { id: "tailoring", label: "Custom Tailoring", href: "/services" },
];

const TECHNIQUES = [
  { name: "Zardozi", origin: "Mughal Era", description: "Gold and silver thread work with semi-precious stones." },
  { name: "Kantha", origin: "Bengal", description: "Running stitch patterns in vibrant silk threads." },
  { name: "Chikankari", origin: "Lucknow", description: "Delicate white-on-white hand embroidery on fine fabric." },
  { name: "Kashmiri Aari", origin: "Kashmir", description: "Chain stitch florals on shawls and garments." },
];

const SAMPLE_WORK = [
  { label: "Floral Motif", color: "#3d2c1e", accent: "#c9a96e" },
  { label: "Geometric Border", color: "#1e2d2c", accent: "#7ab8a8" },
  { label: "Monogram", color: "#2c1e2d", accent: "#b87ab8" },
  { label: "Bridal Panel", color: "#2d261e", accent: "#d4a06a" },
];

export default function ServicesHub({ initialService = "embroidery" }) {
  const [activeService, setActiveService] = useState(initialService);
  const [techniqueIndex, setTechniqueIndex] = useState(0);
  const [hoveredSample, setHoveredSample] = useState(null);
  const technique = TECHNIQUES[techniqueIndex];

  return (
    <main className="services-hub">
      <nav className="services-hub__nav" aria-label="Services">
        <div className="services-hub__nav-inner">
          <Link href="/services" className="services-hub__brand" aria-label="Atelier Services">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-gold.png" alt="Atelier Logo" />
          </Link>
          <div className="services-hub__links">
            {SERVICE_TYPES.map((service) => (
              <Link
                key={service.id}
                href="#service-content"
                className={activeService === service.id ? "is-active" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  setActiveService(service.id);
                }}
              >
                {service.label}
              </Link>
            ))}
          </div>
          <Link href="/book-appointment" className="services-hub__book">Book Now</Link>
        </div>
      </nav>

      {activeService === "overview" && <ServicesOverview onSelect={setActiveService} />}
      {activeService === "embroidery" && <>
      <section className="services-hub__hero">
        <div className="services-hub__thread-lines" aria-hidden="true" />
        <div className="services-hub__hero-inner">
          <p className="services-hub__eyebrow">Artisan Embroidery</p>
          <h1>Thread by thread,<br /><em>story by story.</em></h1>
          <p className="services-hub__hero-copy">
            Centuries-old embroidery traditions, reimagined for modern garments. Each stitch placed with intention — from bridal couture to everyday elegance.
          </p>
          <div className="services-hub__tags">
            <span>Hand Embroidered</span>
            <span>Machine Precision</span>
            <span>Bespoke Designs</span>
          </div>
        </div>
      </section>

      <section className="services-hub__techniques">
        <p className="services-hub__section-label">Our Techniques</p>
        <div className="services-hub__technique-tabs">
          {TECHNIQUES.map((item, index) => (
            <button
              key={item.name}
              type="button"
              className={index === techniqueIndex ? "is-active" : ""}
              onClick={() => setTechniqueIndex(index)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="services-hub__technique-card">
          <p>Origin: {technique.origin}</p>
          <h2>{technique.name}</h2>
          <span>{technique.description}</span>
        </div>
      </section>

      <section className="services-hub__samples">
        <p className="services-hub__section-label">Sample Work</p>
        <div className="services-hub__sample-grid">
          {SAMPLE_WORK.map((sample, index) => (
            <div
              key={sample.label}
              className={`services-hub__sample${hoveredSample === index ? " is-hovered" : ""}`}
              style={{ backgroundColor: sample.color, borderColor: hoveredSample === index ? sample.accent : undefined }}
              onMouseEnter={() => setHoveredSample(index)}
              onMouseLeave={() => setHoveredSample(null)}
            >
              <svg className="services-hub__sample-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="20" stroke={sample.accent} strokeWidth="0.8" />
                <path d="M24 4 L24 44 M4 24 L44 24 M8 8 L40 40 M40 8 L8 40" stroke={sample.accent} strokeWidth="0.5" />
              </svg>
              <span style={{ color: sample.accent }}>{sample.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="services-hub__cta">
        <div>
          <h2>Ready to begin?</h2>
          <p>Schedule a free consultation with our specialists.</p>
        </div>
        <Link href="/book-appointment">Book a Consultation <span aria-hidden>→</span></Link>
      </section>
      </>}
      {activeService !== "embroidery" && activeService !== "overview" && <ServiceTabContent service={activeService} />}
    </main>
  );
}

const ALTERATIONS = [
  ["↔", "Taking In / Letting Out", "Waist, hips, chest — resized to your exact measurements.", "3–5 days"],
  ["↕", "Hemming", "Trousers, dresses, skirts — any length, any finish.", "1–2 days"],
  ["✂", "Sleeve Adjustment", "Length and circumference altered for perfect drape.", "2–3 days"],
  ["◈", "Zipper Replacement", "Invisible, exposed, or separating — fully replaced.", "2–4 days"],
  ["⊕", "Lining Repair", "Torn or worn linings restored to original condition.", "3–5 days"],
  ["◇", "Button & Fastener", "Replacement, repositioning, or new buttonholes added.", "1 day"],
];

function ServiceTabContent({ service }) {
  if (service === "alterations") {
    return (
      <div className="services-hub__alterations">
        <section className="services-hub__alterations-hero">
          {[...Array(6)].map((_, index) => <span key={index} className="services-hub__alterations-line" style={{ top: `${18 * index}%` }} aria-hidden />)}
          <div className="services-hub__alterations-hero-inner">
            <div>
              <p className="services-hub__alterations-eyebrow">Alterations Service</p>
              <h1>Every garment<br /><em>deserves to fit.</em></h1>
              <p>A great fit transforms how you feel. We alter off-the-rack and designer pieces alike — with precision, care, and respect for the original craft.</p>
              <div className="services-hub__alterations-stats">
                <span><strong>48hr</strong>Rush Available</span>
                <span><strong>100%</strong>Satisfaction</span>
                <span><strong>15+</strong>Years Experience</span>
              </div>
            </div>
            <div className="services-hub__alterations-mark" aria-hidden>
              <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="95" width="180" height="30" rx="15" fill="#2d2926" />
                {[...Array(18)].map((_, index) => <rect key={index} x={28 + (9 * index)} y="98" width="1" height={index % 3 === 0 ? 16 : 10} fill="#c9a96e" />)}
                <text x="110" y="116" textAnchor="middle" fontFamily="MAINLUX, Arial, sans-serif" fontSize="10" fill="#c9a96e" fontWeight="500">cm</text>
                <g transform="translate(75, 30) rotate(-30)">
                  <ellipse cx="0" cy="0" rx="12" ry="6" fill="none" stroke="#8b7355" strokeWidth="2" />
                  <ellipse cx="24" cy="0" rx="12" ry="6" fill="none" stroke="#8b7355" strokeWidth="2" />
                  <line x1="10" y1="0" x2="50" y2="30" stroke="#2d2926" strokeWidth="2" strokeLinecap="round" />
                  <line x1="14" y1="0" x2="50" y2="-30" stroke="#2d2926" strokeWidth="2" strokeLinecap="round" />
                </g>
                <path d="M140 30 Q160 50 150 80 Q140 110 160 140" stroke="#c9a96e" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                <circle cx="140" cy="30" r="8" fill="none" stroke="#c9a96e" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </section>
        <section className="services-hub__offers">
          <p className="services-hub__section-label">What We Offer</p>
          <div className="services-hub__offer-grid">
            {ALTERATIONS.map(([icon, title, description, time]) => (
              <article key={title} className="services-hub__offer-card">
                <span className="services-hub__offer-icon" aria-hidden>{icon}</span>
                <h2>{title}</h2>
                <p>{description}</p>
                <strong><i />{time}</strong>
              </article>
            ))}
          </div>
        </section>
        <ServiceCTA />
      </div>
    );
  }

  const styling = service === "styling";
  if (styling) return <StylingTabContent />;
  if (service === "tailoring") return <TailoringTabContent />;
  return (
    <div className={`services-hub__secondary services-hub__secondary--${service}`}>
      <section className="services-hub__secondary-hero">
        <p>{styling ? "Personal Styling" : "Custom Tailoring"}</p>
        <h1>{styling ? <>Dress the life<br /><em>you&apos;re living.</em></> : <>Garments born<br /><em>from your vision.</em></>}</h1>
        <span>{styling ? "Your wardrobe should feel effortless. Our stylists decode your lifestyle, body, and personality to build looks that are authentically, unapologetically you." : "Nothing off-the-shelf. Everything made for you, to you — from the first sketch to the final stitch."}</span>
        {styling && <div className="services-hub__moods">
          {["Classic", "Contemporary", "Minimalist", "Bold", "Eclectic"].map((mood) => <span key={mood}>{mood}</span>)}
        </div>}
      </section>
      <section className="services-hub__secondary-content">
        <p className="services-hub__section-label">{styling ? "Styling Packages" : "The Process"}</p>
        <div className="services-hub__secondary-grid">
          {(styling ? ["Essential Edit", "Full Transformation", "Event Ready"] : ["Consultation", "Measurement", "Fabric Selection", "First Fitting", "Construction", "Final Fitting"]).map((item) => (
            <article key={item}><h2>{item}</h2><p>{styling ? "Curated looks, thoughtful guidance, and a wardrobe that feels like you." : "Meticulous attention to every detail, from the first consultation to the final stitch."}</p></article>
          ))}
        </div>
      </section>
      <ServiceCTA />
    </div>
  );
}

const STYLING_PACKAGES = [
  { name: "Essential Edit", price: "₹4,500", duration: "90 min", features: ["Wardrobe audit (up to 50 pieces)", "Colour analysis", "Style profile creation", "Shopping list"], accent: "#7ab8a8" },
  { name: "Full Transformation", price: "₹12,000", duration: "Full Day", features: ["Complete wardrobe overhaul", "Personal shopping session", "Occasion-specific looks", "Digital lookbook", "30-day follow-up"], accent: "#c9a96e", featured: true },
  { name: "Event Ready", price: "₹6,500", duration: "2 hrs", features: ["Single event styling", "Outfit curation", "Accessories advice", "Grooming tips"], accent: "#b87ab8" },
];

function StylingTabContent() {
  return (
    <div className="services-hub__secondary services-hub__secondary--styling">
      <section className="services-hub__secondary-hero">
        <p>Personal Styling</p>
        <h1>Dress the life<br /><em>you&apos;re living.</em></h1>
        <span>Your wardrobe should feel effortless. Our stylists decode your lifestyle, body, and personality to build looks that are authentically, unapologetically you.</span>
        <div className="services-hub__moods">{["Classic", "Contemporary", "Minimalist", "Bold", "Eclectic"].map((mood) => <span key={mood}>{mood}</span>)}</div>
      </section>
      <section className="services-hub__styling-packages">
        <p className="services-hub__section-label">Styling Packages</p>
        <div className="services-hub__package-grid">
          {STYLING_PACKAGES.map((pkg) => (
            <article key={pkg.name} className={`services-hub__package${pkg.featured ? " is-featured" : ""}`} style={{ "--package-accent": pkg.accent }}>
              {pkg.featured && <span className="services-hub__package-badge">Most Popular</span>}
              <p className="services-hub__package-duration">{pkg.duration}</p>
              <h2>{pkg.name}</h2>
              <strong className="services-hub__package-price">{pkg.price}</strong>
              <ul>{pkg.features.map((feature) => <li key={feature}><span aria-hidden>✓</span>{feature}</li>)}</ul>
              <Link href="/book-appointment" className="services-hub__package-button">Choose Package</Link>
            </article>
          ))}
        </div>
      </section>
      <section className="services-hub__styling-process">
        <p className="services-hub__section-label">How It Works</p>
        <div className="services-hub__process-steps">
          {["Style Consult", "Analysis", "Curation", "Final Reveal"].map((step, index) => <div key={step}><span>{index + 1}</span><p>{step}</p></div>)}
        </div>
      </section>
      <ServiceCTA />
    </div>
  );
}

const GARMENTS = ["Suit", "Sherwani", "Kurta Set", "Blazer", "Trousers", "Dress", "Lehenga", "Coat"];
const TAILORING_STEPS = [
  ["01", "Consultation", "Discuss your vision, occasion, and fabric preferences with our master tailor."],
  ["02", "Measurement", "34 precise body measurements taken for a flawless base pattern."],
  ["03", "Fabric Selection", "Choose from 200+ fabrics — imported wools, silks, linens, and bespoke blends."],
  ["04", "First Fitting", "Try the muslin toile and refine every seam, dart, and proportion."],
  ["05", "Construction", "Hand-stitched by our artisans with meticulous attention to every detail."],
  ["06", "Final Fitting", "Wear your finished garment. Minor tweaks included as standard."],
];

function TailoringTabContent() {
  const [garment, setGarment] = useState("Suit");
  return (
    <div className="services-hub__tailoring">
      <section className="services-hub__tailoring-hero">
        <div className="services-hub__tailoring-copy">
          <p className="services-hub__tailoring-eyebrow">Custom Tailoring</p>
          <h1>Garments born<br /><em>from your vision.</em></h1>
          <p>Nothing off-the-shelf. Everything made for you, to you — from the first sketch to the final stitch.</p>
          <p className="services-hub__tailoring-select-label">Select garment type</p>
          <div className="services-hub__garments">
            {GARMENTS.map((item) => <button key={item} type="button" className={garment === item ? "is-active" : ""} onClick={() => setGarment(item)}>{item}</button>)}
          </div>
          <div className="services-hub__tailoring-price">
            <span>✓</span>
            <div><strong>{garment} starting from ₹8,500</strong><small>Delivery in 10–14 working days</small></div>
          </div>
        </div>
        <div className="services-hub__fabric-art" aria-hidden>
          {["#2d2926", "#8b7355", "#4a6b5a", "#6b4a3a", "#3a4a6b"].map((color, index) => <i key={color} style={{ backgroundColor: color, left: `${30 + ((index * 25) % 130)}px`, top: `${20 + ((index * 30) % 90)}px`, transform: `rotate(${[-15, 10, -5, 20, -25][index]}deg)` }} />)}
          <div><strong>200+ Fabrics</strong><span>Italian Wools · Japanese Silks · Indian Linens</span></div>
        </div>
      </section>
      <section className="services-hub__tailoring-process">
        <p className="services-hub__section-label">The Process</p>
        <div className="services-hub__tailoring-steps">
          {TAILORING_STEPS.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></article>)}
        </div>
      </section>
      <ServiceCTA />
    </div>
  );
}

function ServiceCTA() {
  return <section className="services-hub__cta"><div><h2>Ready to begin?</h2><p>Schedule a free consultation with our specialists.</p></div><Link href="/book-appointment">Book a Consultation <span aria-hidden>→</span></Link></section>;
}

function ServicesOverview({ onSelect }) {
  const cards = [
    ["/services", "Embroidery", "Crafted with Precision. Stitched with Passion."],
    ["/services", "Alterations", "Tailored to Fit. Perfected for You."],
    ["/services", "Personal Styling", "Curated Looks. Confident You."],
    ["/services", "Custom Tailoring", "Bespoke Garments. Made for You."],
  ];
  return (
    <section className="services-hub__overview">
      <p className="services-hub__overview-eyebrow">HC Atelier Services</p>
      <h1>Our Services</h1>
      <p className="services-hub__overview-intro">Crafted with Precision. Designed for You.</p>
      <div className="services-hub__overview-grid">
        {cards.map(([href, title, note], index) => <Link key={title} href="#service-content" onClick={(event) => { event.preventDefault(); onSelect(SERVICE_TYPES[index].id); }} className="services-hub__overview-card"><h2>{title}</h2><p>{note}</p><span>Discover <b aria-hidden>→</b></span></Link>)}
      </div>
    </section>
  );
}
