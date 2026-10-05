import Link from "next/link";
import "./about-us.css";

const A = "/about-us/";

const stats = [
  ["12+", "Years of Craft"],
  ["2400+", "Bespoke Pieces"],
  ["98%", "Client Satisfaction"],
  ["6", "Design Awards"],
];

const values = [
  ["bi-scissors", "Craftsmanship", "Every stitch is placed with intention. We never compromise on construction quality."],
  ["bi-gem", "Excellence", "Award-winning garments recognised across top fashion publications and editorials."],
  ["bi-person-heart", "Personal Touch", "Each piece is tailored to the individual — your fit, your story, your statement."],
  ["bi-award", "Integrity", "Transparent pricing, honest timelines, and a brand you can genuinely trust."],
];

const team = [
  ["avatar1.jpeg", "Rajkumar", "Head Designer"],
  ["avatar2.jpeg", "Mounika", "Operations Lead"],
  ["avatar3.jpg", "Sabarish", "Master Tailor"],
  ["avatar4.jpg", "Suganthi", "Client Relations"],
];

const logos = ["logo1.png", "logo2.png", "logo3.png", "logo4.png", "logo5.png", "logo6.png"];

export default function AboutUsView() {
  return (
    <div className="about-us-page">
      <section className="about-us-hero" style={{ backgroundImage: `url(${A}about-hero.jpeg)` }}>
        <div className="about-us-hero__content">
          <p className="about-us-eyebrow">Est. in Pursuit of Perfection</p>
          <h1>Where Bespoke<br />Meets Soul.</h1>
          <p className="about-us-hero__sub">Harry Clinton is not a label. It is a declaration of men&apos;s bold craftsmanship, timeless design, and personal touch.</p>
          <Link href="/about-designer" className="about-us-cta">Discover the Story</Link>
        </div>
      </section>

      <section className="about-us-stats">
        {stats.map(([value, label], index) => (
          <div className="about-us-stat-wrap" key={label}>
            <div className="about-us-stat"><strong>{value}</strong><span>{label}</span></div>
            {index < stats.length - 1 && <i />}
          </div>
        ))}
      </section>

      <section className="about-us-designer">
        <div className="about-us-designer__image"><img src={`${A}about1.jpeg`} alt="Harry Clinton" /></div>
        <div className="about-us-designer__copy">
          <p className="about-us-eyebrow">The Man Behind the Brand</p>
          <h2>Harry Clinton</h2>
          <p>A timeless menswear designer focused on refined craftsmanship. My work blends modern silhouettes with rich Italian tailoring traditions, delivering elegance with a bold personal touch. Every collection begins with a conversation and ends with a garment that defines the person who wears it.</p>
          <blockquote>&ldquo;Design isn&apos;t just what I do — it&apos;s who I am.&rdquo;</blockquote>
          <Link href="/about-designer" className="about-us-link">Full Story →</Link>
        </div>
      </section>

      <Split
        image="atelier.jpeg"
        label="The Atelier"
        eyebrow="Where It All Happens"
        title="Our Studio"
        paragraphs={[
          "Step inside the atelier — a space where fabric meets form. Our studio in Chennai is the beating heart of Harry Clinton, where every measurement, every cut, and every drape is handled with obsessive precision by our master tailors.",
          "From hand-stitched lapels to custom lining choices, the atelier experience is personal, unhurried, and utterly unique.",
        ]}
      />
      <Split
        reverse
        image="craft.jpeg"
        label="The Craft"
        eyebrow="Our Process"
        title="Craft & Detail"
        paragraphs={[
          "We source only the finest fabrics — Italian wools, Irish linens, and artisan silks — before a single cut is made. Each garment goes through a minimum of three fittings to ensure a silhouette that moves with you, not against you.",
          "The result is a piece that lasts decades, not seasons.",
        ]}
      />

      <section className="about-us-values">
        <p className="about-us-eyebrow">What We Stand For</p><h2>Our Values</h2>
        <div className="about-us-values__grid">{values.map(([icon, title, desc]) => <article key={title}><i className={`bi ${icon}`} aria-hidden="true" /><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </section>

      <section className="about-us-brands">
        <p>As seen in &amp; worn by</p>
        <div>{[...logos, ...logos].map((logo, i) => <img key={`${logo}-${i}`} src={`${A}${logo}`} alt="Brand" />)}</div>
      </section>

      <section className="about-us-banner" style={{ backgroundImage: `url(${A}about-banner.jpeg)` }}>
        <div><h2>Heritage. Craft. Identity.</h2><p>Committed to timeless tailoring since the very first stitch.</p><Link href="/about-designer" className="about-us-cta">Meet the Designer</Link></div>
      </section>

      <section className="about-us-team"><p className="about-us-eyebrow">The People</p><h2>Our Team</h2><div>{team.map(([image, name, role]) => <article key={name}><img src={`${A}${image}`} alt={name} /><strong>{name}</strong><span>{role}</span></article>)}</div></section>

      <section className="about-us-story" style={{ backgroundImage: `url(${A}story.jpeg)` }}><div><h2>Our Story</h2><p>Dedicated to craftsmanship and timeless elegance since day one.</p><button type="button">Read Our Story</button></div></section>
    </div>
  );
}

function Split({ image, label, eyebrow, title, reverse = false, children, paragraphs }) {
  return <section className={`about-us-split ${reverse ? "about-us-split--reverse" : ""}`}>
    <div className="about-us-split__image" style={{ backgroundImage: `url(${A}${image})` }}><span>{label}</span></div>
    <div className="about-us-split__copy"><p className="about-us-eyebrow">{eyebrow}</p><h2>{title}</h2>{(paragraphs || [children]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
  </section>;
}
