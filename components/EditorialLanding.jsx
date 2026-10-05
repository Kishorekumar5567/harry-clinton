"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const spotlightCards = [
  ["/editorial-media/spotlight-wedding.jpeg", "Spotlight", "The Wedding Edit", "Ceremonial Tailoring · 2025", "/wedding"],
  ["/editorial-media/spotlight-casual.jpeg", "Spotlight", "Smart Casual Redefined", "Everyday Luxury · 2025", "/smart-casual"],
  ["/editorial-media/spotlight-nano.jpeg", "New", "Nano Collection Preview", "Designer Series · 2025", "/designer"],
];

const styleLooks = [
  ["/editorial-media/style-wedding.jpeg", "The Ivory Ceremony", "Wedding", "Bridal Season", "Ivory double-breasted suit with hand-stitched lapels.", "/wedding"],
  ["/editorial-media/style-designer.jpeg", "The Designer Cut", "Formal", "New Season", "Structured silhouette for the modern executive.", "/designer"],
  ["/editorial-media/style-travel.jpeg", "Jet Set Traveller", "Travel", "Essential", "Wrinkle-resistant linen blend, cabin-ready.", "/travel"],
  ["/editorial-media/style-casual.jpeg", "Smart Weekend", "Smart Casual", "Weekend Edit", "Relaxed tailoring without compromising on elegance.", "/smart-casual"],
  ["/editorial-media/style-label.jpeg", "Label Edition", "Formal", "Signature", "Our signature label cut — timeless, authoritative.", "/business"],
  ["/editorial-media/style-nano.jpeg", "Nano Collection", "Smart Casual", "Limited", "Micro-textured fabric for a next-gen smart casual look.", "/designer"],
];

const marquee = (words) => Array(4).fill(words).flat();

function Hero({ style }) {
  const router = useRouter();
  return <section className="ep-hero">
    <img src={style ? "/editorial-media/style-hero.jpeg" : "/editorial-media/spotlight-hero.jpeg"} alt={style ? "Style by HC" : "HC Spotlight"} className="ep-hero__bg" />
    <div className="ep-hero__content">
      <p className="ep-hero__eyebrow">Harry Clinton</p>
      <h1 className="ep-hero__title">{style ? "Style by HC" : "HC Spotlight"}</h1>
      <p className="ep-hero__sub">{style ? "Curated looks, style guides and outfit inspiration from our in-house stylists." : "Editorials, stories and craft features from the world of Harry Clinton."}</p>
      <button className="ep-btn" onClick={() => document.getElementById(style ? "style-content" : "spotlight-content")?.scrollIntoView({ behavior: "smooth" })}>{style ? "Explore Looks" : "Read Now"}</button>
    </div>
  </section>;
}

function Marquee({ style }) {
  const words = style ? ["STYLE BY HC", "·", "THE LOOK", "·", "HOW TO WEAR IT", "·", "HARRY CLINTON", "·", "CURATED STYLE", "·"] : ["HC SPOTLIGHT", "·", "EDITORIAL", "·", "BEHIND THE SEAMS", "·", "HARRY CLINTON", "·", "THE CRAFT", "·"];
  return <div className="ep-marquee"><div className="ep-marquee__track">{marquee(words).map((word, i) => <span key={i} className={word === "·" ? "ep-marquee__dot" : "ep-marquee__word"}>{word}</span>)}</div></div>;
}

function Feature({ reverse = false, image, tag, title, desc, meta, href }) {
  const router = useRouter();
  return <div className={`ep-feature mb-5${reverse ? " ep-feature--reverse" : ""}`} onClick={() => router.push(href)}>
    <div className="ep-feature__img-wrap"><img src={image} alt={title} className="ep-feature__img" /></div>
    <div className="ep-feature__body"><p className="ep-feature__tag">{tag}</p><h2 className="ep-feature__title">{title}</h2><p className="ep-feature__desc">{desc}</p><p className="ep-feature__meta">{meta}</p></div>
  </div>;
}

export function HCSpotlightLanding() {
  const router = useRouter();
  return <><Hero /><Marquee /><div id="spotlight-content" className="container-fluid px-4 px-md-5 py-5">
    <p className="ep-label mb-4">Cover Story</p>
    <Feature image="/editorial-media/spotlight-feature.jpeg" tag="Cover Story" title="The Art of the Perfect Suit" desc="From the first drape of fabric to the final stitch, every Harry Clinton suit is a study in restraint and precision. We go behind the seams of our most celebrated silhouette." meta="Editorial · June 2025" href="/designer" />
    <div className="ep-quote"><span className="ep-quote__mark">&quot;</span><p className="ep-quote__text">A suit is not merely clothing — it is the architecture of a man&apos;s presence.</p><p className="ep-quote__author">— Harry Clinton, Founder</p></div>
    <p className="ep-label mb-4">More Spotlights</p><div className="ep-grid mb-5">{spotlightCards.map(([img, badge, title, sub, href]) => <EditorialCard key={title} image={img} badge={badge} title={title} sub={sub} href={href} />)}</div>
    <p className="ep-label mb-4">In Focus</p><Feature reverse image="/editorial-media/spotlight-travel.jpeg" tag="In Focus" title="Travel Ready, Always Refined" desc="Our Travel Collection is engineered for the man who moves between boardrooms and airports without losing a single crease. Wrinkle-resistant, breathable, impeccable." meta="Collection Feature · May 2025" href="/travel" />
    <p className="ep-label mb-4">Shop the Story</p><div className="ep-twoup">{[["/editorial-media/spotlight-business.jpeg", "Business", "Power Dressing, Perfected", "/business"], ["/editorial-media/spotlight-occasion.jpeg", "Occasion", "Celebrations in Style", "/wedding"]].map(([img, tag, title, href]) => <div className="ep-twoup__item" key={title} onClick={() => router.push(href)}><img src={img} alt={title} className="ep-twoup__img" /><div className="ep-twoup__body"><p className="ep-twoup__tag">{tag}</p><p className="ep-twoup__title">{title}</p></div></div>)}</div>
  </div></>;
}

function EditorialCard({ image, badge, title, sub, href }) {
  const router = useRouter();
  return <div className="ep-card" onClick={() => router.push(href)}><div className="ep-card__img-wrap"><img src={image} alt={title} className="ep-card__img" /><span className="ep-card__badge">{badge}</span><div className="ep-card__overlay" /></div><div className="ep-card__body"><p className="ep-card__title">{title}</p><p className="ep-card__sub">{sub}</p></div></div>;
}

export function StyleByHCLanding() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered = activeFilter === "All" ? styleLooks : styleLooks.filter((look) => look[2] === activeFilter);
  return <><Hero style /><Marquee style /><div id="style-content" className="container-fluid px-4 px-md-5 py-5">
    <p className="ep-label mb-4">Style Guide</p><Feature image="/editorial-media/style-business.jpeg" tag="Style Guide" title="How to Dress for the Boardroom" desc="Power dressing is not about loudness. It is about precision — the right fit, the right fabric, the right cut. Our stylists break down the anatomy of a commanding business ensemble." meta="Style Guide · June 2025" href="/business" />
    <div className="sbhc-tips mb-5">{[["01", "Fit First", "No fabric compensates for poor fit. Always start with the silhouette."], ["02", "Fabric for Occasion", "Wool for formal, linen for warm climates, blends for travel."], ["03", "Colour Confidence", "Navy and charcoal are universals. Build from there."], ["04", "Detail Matters", "Buttons, lapels and pocket squares are the punctuation of a suit."]].map(([no, title, desc]) => <div className="sbhc-tip" key={no}><span className="sbhc-tip__no">{no}</span><p className="sbhc-tip__title">{title}</p><p className="sbhc-tip__desc">{desc}</p></div>)}</div>
    <div className="ep-quote mb-5"><span className="ep-quote__mark">&quot;</span><p className="ep-quote__text">Style is not what you wear — it is how you carry what you wear.</p><p className="ep-quote__author">— HC House of Style</p></div>
    <div className="sbhc-toolbar mb-4"><p className="ep-label" style={{ margin: 0 }}>Curated Looks</p><div className="sbhc-filters">{["All", "Formal", "Smart Casual", "Wedding", "Travel"].map((filter) => <button key={filter} className={`sbhc-filter${activeFilter === filter ? " sbhc-filter--active" : ""}`} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div></div>
    <div className="ep-grid mb-5">{filtered.map(([img, title, styleName, tag, desc, href]) => <EditorialCard key={title} image={img} badge={tag} title={title} sub={desc} href={href} />)}</div>
    <p className="ep-label mb-4">Travel Style</p><Feature reverse image="/editorial-media/style-travel-feature.jpeg" tag="Travel Style" title="Packing Light, Dressing Heavy" desc="The seasoned traveller knows: one suit, infinite occasions. Our Travel edit ensures you look impeccable from take-off to keynote." meta="Style Guide · May 2025" href="/travel" />
    <div className="sbhc-cta-strip"><p className="sbhc-cta-strip__label">Ready to build your look?</p><h3 className="sbhc-cta-strip__title">Book a Personal Styling Session</h3><p className="sbhc-cta-strip__sub">Sit with one of our in-house stylists and let us curate your wardrobe from scratch.</p><button className="ep-btn ep-btn--dark" onClick={() => router.push("/book-appointment")}>Book Now</button></div>
  </div></>;
}
