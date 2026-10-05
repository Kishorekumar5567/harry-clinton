import Link from "next/link";
import { apiGet, unwrap } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import "./reference-page-typography.css";
import "./help-center.css";

const TOPICS = [
  { icon: "bi-truck", title: "Shipping", desc: "Learn about dispatch timelines, delivery options, tracking your order, and express delivery within Chennai.", href: "/Policies" },
  { icon: "bi-arrow-return-left", title: "Returns & Exchanges", desc: "Find out how to return or exchange an item, our 5-day window policy, and refund timelines.", href: "/Policies" },
  { icon: "bi-x-circle", title: "Cancellation", desc: "Understand how to cancel an order before shipping, cancellation for bespoke orders, and our right to cancel orders.", href: "/Policies" },
  { icon: "bi-rulers", title: "Sizing & Custom Orders", desc: "How to choose the right size, book a bespoke consultation, and what to expect from a custom garment.", href: "/FAQs" },
  { icon: "bi-shield-check", title: "Privacy & Security", desc: "How we collect, use, and protect your personal information and payment details.", href: "/privacy-policy" },
  { icon: "bi-file-text", title: "Terms & Conditions", desc: "Everything about using our website, eligibility, payments, bespoke orders, and intellectual property.", href: "/terms-and-conditions" },
];

const DEFAULT_GUIDES = [
  { question: "How do I place an order?", answer: "Browse collections, add products to cart, and proceed to checkout. For bespoke orders, contact us via WhatsApp or email." },
  { question: "How long does a bespoke suit take?", answer: "A bespoke suit is typically ready within 2 weeks after measurements and design confirmation." },
  { question: "Can I track my order?", answer: "Yes. Once dispatched, we send tracking details to your registered email and phone number." },
  { question: "What payment methods do you accept?", answer: "We accept cards, UPI, net banking, and select wallets via secure payment gateways." },
  { question: "Do you offer international shipping?", answer: "We currently ship across India. International shipping is available on request for select countries." },
  { question: "How do I contact customer support?", answer: "Email us at connect@harryclinton.com or call +91 7094 094 194, Monday to Saturday, 10am–7pm IST." },
];

// Help Center: hero, topics, guides, help card — verbatim from before.
export default async function HelpCenterView() {
  const faqs = await apiGet("/FAQs").then(unwrap).catch(() => []);
  const guides = (Array.isArray(faqs) && faqs.length > 0
    ? faqs.slice(0, 6).map((f) => ({ question: f.question, answer: f.answer }))
    : DEFAULT_GUIDES);

  return (
    <div className="hc-reference-page help-center-page">
      <section className="help-center-hero">
        <h1>Help Center</h1>
        <p>
          Find answers, manage orders, and learn more about Harry Clinton.
        </p>
      </section>

      <div className="help-center-container">
      <h2>Browse by Topic</h2>
      <div className="help-topics-grid">
        {TOPICS.map((t) => (
          <Link key={t.title} href={t.href} className="help-topic-card">
            <i className={`bi ${t.icon}`} aria-hidden="true" />
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
          </Link>
        ))}
      </div>

      <h2>Quick Guides</h2>
      <div className="help-accordion">
        {guides.map((g, i) => (
          <details key={i}>
            <summary>{g.question}</summary>
            <div className="help-accordion__body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(g.answer || "") }} />
          </details>
        ))}
      </div>

      <div className="help-center-cta">
        <h3>Still need help?</h3>
        <p>
          Our support team is available Monday to Saturday, 10am–7pm IST.
        </p>
        <div className="help-center-cta__buttons">
          <a href="mailto:connect@harryclinton.com">
            <i className="bi bi-envelope" />Email Us
          </a>
          <a href="tel:+917094094194">
            <i className="bi bi-telephone" />Call Us
          </a>
          <Link href="/contact-us">
            <i className="bi bi-chat-dots" />Contact Page
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
