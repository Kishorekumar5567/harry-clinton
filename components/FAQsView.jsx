import Link from "next/link";
import { apiGet, unwrap } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import "./reference-page-typography.css";
import "./faqs.css";

// FAQs page: same structure as the previous UI —
// H2 title, accordion, footer block with links.
export default async function FAQsView() {
  const faqs = await apiGet("/FAQs").then(unwrap).catch(() => []);
  const list = (Array.isArray(faqs) ? faqs : []).filter((f) => f.isactive !== false);

  return (
    <div className="hc-reference-page faqs-page">
      <div className="faqs-container">
      <h2>Frequently Asked Questions</h2>
      {list.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-500">Unable to load FAQs. Please try again later.</p>
      ) : (
        <div className="faq-accordion">
          {list.map((f, i) => (
            <details key={f.faq_id}>
              <summary>
                {(f.question || "").replace(/^\s*\d+\s*[).:-]\s*/, "")}
              </summary>
              <div className="faq-accordion__body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(f.answer || "") }} />
            </details>
          ))}
        </div>
      )}
      </div>
      <footer className="faqs-footer">
        <p>© {new Date().getFullYear()} Harry Clinton. All rights reserved.</p>
        <p className="mt-2">
          <Link href="/" className="underline">Home</Link>
          <span className="mx-2">|</span>
          <Link href="/FAQs" className="underline">FAQs</Link>
          <span className="mx-2">|</span>
          <Link href="/contact-us" className="underline">Contact</Link>
        </p>
      </footer>
    </div>
  );
}
