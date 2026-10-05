import "./about-designer.css";

const story = [
  "Harry Clinton is more than a brand — it is a journey shaped by passion, precision, and purpose.",
  "I began designing at the age of 18, driven not by trends but by instinct. Fabric, fit, and form were never just garments to me; they were expressions of identity.",
  "Over the past decade, I have styled more than 5,000 weddings, created original collections, and earned the trust of men on the most important days of their lives.",
  "Harry Clinton stands for men who lead with quiet confidence — where every stitch tells a story and every piece is built for legacy.",
];

export default function AboutDesignerView() {
  return (
    <div className="about-designer-page">
      <section className="about-designer-banner">
        <div className="about-designer-banner__overlay" />
        <div className="about-designer-banner__content">
          <h1>About Us</h1>
        </div>
      </section>
      <section className="about-designer-story">
        <h2>The Story of Harry Clinton</h2>
        <ul>
          {story.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </div>
  );
}
