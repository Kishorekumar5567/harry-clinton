"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import "./reference-page-typography.css";
import "./contact-us.css";

// Contact Us page: hero, equal-height info cards, centered message form,
// atelier banner — aligned to the site grid.
export default function ContactUsView() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("");
    setIsError(false);
    setSending(true);
    try {
      await apiFetch("/Mail/Send-Mail", {
        method: "POST",
        body: {
          to: "connect@harryclinton.com",
          subject: `Contact Form: ${form.subject}`,
          html: `<p><strong>Name:</strong> ${form.name}</p><p><strong>Email:</strong> ${form.email}</p><p><strong>Phone:</strong> ${form.phone || "Not provided"}</p><p><strong>Subject:</strong> ${form.subject}</p><p><strong>Message:</strong></p><p>${form.message.replace(/\n/g, "<br/>")}</p>`,
          text: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nSubject: ${form.subject}\nMessage: ${form.message}`,
        },
      });
      setStatus("Thank you for reaching out. Our team will get back to you within 24 hours.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus(err.message || "Failed to send message. Please try again.");
      setIsError(true);
    } finally {
      setSending(false);
    }
  };

  const inputCls = "w-full border border-neutral-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none";

  return (
    <div className="hc-reference-page contact-page">
      <div className="contact-hero">
        <div className="contact-hero__inner">
          <img src="/brand/hc-black-contact.png" alt="Harry Clinton" />
          <h1>Contact Us</h1>
          <p>We would love to hear from you. Reach out for bespoke consultations, orders, or any questions.</p>
        </div>
      </div>

      <div className="contact-page__container">
        <div className="contact-info-grid">
          <InfoCard icon="bi-telephone" title="Phone" value="+91 7094 094 194" href="tel:+917094094194" />
          <InfoCard icon="bi-envelope" title="Email" value="connect@harryclinton.com" href="mailto:connect@harryclinton.com" />
          <InfoCard icon="bi-geo-alt" title="Atelier" value="Chennai, Tamil Nadu, India" href="#" />
          <InfoCard icon="bi-clock" title="Working Hours" value="Mon – Sat, 10am – 7pm IST" href="#" />
        </div>

        <div className="contact-main-grid">
          <div className="contact-card contact-form-card">
            <h2>Send us a Message</h2>
            {status && <p className={`contact-alert ${isError ? "contact-alert--error" : "contact-alert--success"}`}>{status}</p>}
            <form onSubmit={submit} className="contact-form">
            <label>
              <span>Full Name</span>
              <input value={form.name} onChange={set("name")} placeholder="Your name" required className={inputCls} />
            </label>
            <label>
              <span>Email Address</span>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required className={inputCls} />
            </label>
            <label>
              <span>Phone Number</span>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" className={inputCls} />
            </label>
            <label>
              <span>Subject</span>
              <select value={form.subject} onChange={set("subject")} required className={inputCls}>
                <option value="">Select a subject</option>
                <option value="Bespoke Consultation">Bespoke Consultation</option>
                <option value="Order Enquiry">Order Enquiry</option>
                <option value="Returns & Exchanges">Returns & Exchanges</option>
                <option value="Feedback">Feedback</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="contact-form__wide">
              <span>Message</span>
              <textarea value={form.message} onChange={set("message")} placeholder="Tell us how we can help..." rows="5" required className={inputCls} />
            </label>
            <div className="contact-form__wide">
              <button disabled={sending} className="contact-submit">
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
          </div>

          <div className="contact-card atelier-card">
            <h2>Visit Our Atelier</h2>
            <p className="atelier-card__intro">
              Experience the world of Harry Clinton in person. Schedule a bespoke consultation with our master tailors and explore fabrics, fits, and finishes tailored to you.
            </p>
            <ul className="atelier-details">
              <li><i className="bi bi-geo-alt" />Harry Clinton Atelier, Chennai, Tamil Nadu, India</li>
              <li><i className="bi bi-envelope" />connect@harryclinton.com</li>
              <li><i className="bi bi-telephone" />+91 7094 094 194</li>
              <li><i className="bi bi-clock" />Mon – Sat, 10am – 7pm IST</li>
            </ul>
            <div className="consultation-box">
              <i className="bi bi-calendar-check" />
              <p>Prefer a face-to-face consultation?</p>
              <Link href="/help-center">Visit Help Center</Link>
            </div>
          </div>
        </div>

        <div className="contact-back"><Link href="/">Back to Home</Link></div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value, href }) {
  return (
    <a
      href={href}
      className="contact-info-card"
    >
      <i className={`bi ${icon}`} />
      <h3>{title}</h3>
      <p>{value}</p>
    </a>
  );
}
