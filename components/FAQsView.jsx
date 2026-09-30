import Link from "next/link";
import { apiGet, unwrap } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";

// FAQs page: same structure as the previous UI —
// H2 title, accordion, footer block with links.
export default async function FAQsView() {
  const faqs = await apiGet("/FAQs").then(unwrap).catch(() => []);
  const list = (Array.isArray(faqs) ? faqs : []).filter((f) => f.isactive !== false);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <h2 className="text-center font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-neutral-950">Frequently Asked Questions</h2>
      {list.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-500">Unable to load FAQs. Please try again later.</p>
      ) : (
        <div className="mt-12 space-y-4">
          {list.map((f, i) => (
            <details key={f.faq_id} className="border border-neutral-200 bg-white transition-colors duration-200 hover:border-neutral-300">
              <summary className="cursor-pointer p-5 sm:p-6 font-medium text-neutral-900 text-[15px] sm:text-[16px] leading-snug">
                {`${i + 1}) ${(f.question || "").replace(/^\s*\d+\s*[).:-]\s*/, "")}`}
              </summary>
              {/<[a-z][\s\S]*>/i.test(f.answer || "") ? (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-[14px] sm:text-[15px] text-neutral-600 border-t border-neutral-100 pt-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(f.answer) }} />
              ) : (
                <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-[14px] sm:text-[15px] text-neutral-600 border-t border-neutral-100 pt-4">{f.answer}</p>
              )}
            </details>
          ))}
        </div>
      )}
      <div className="mt-12 border-t border-neutral-200 bg-[#f4f4f4] py-6 text-center text-sm text-[#101010]">
        <p>© 2025 Harry Clinton. All rights reserved.</p>
        <p className="mt-2">
          <Link href="/" className="underline">Home</Link>
          <span className="mx-2">|</span>
          <Link href="/FAQs" className="underline">FAQs</Link>
          <span className="mx-2">|</span>
          <Link href="/contact-us" className="underline">Contact</Link>
        </p>
      </div>
    </div>
  );
}
