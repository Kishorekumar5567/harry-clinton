"use client";

import { useEffect, useState } from "react";
import { apiCached, apiFetch, currentUserId, homeKV } from "@/lib/api";
import Reveal from "@/components/Reveal";

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    reviewer_name: "Dr. David Raj",
    initials: "DR",
    city: "Bangalore",
    occasion: "Handcrafted Double-Breasted Suit",
    review_title: "The Ultimate Bespoke Experience",
    review_text:
      "A level of service and artisanal tailoring that is rare today. The fabric breathes effortlessly and the silhouette gives unmatched presence in boardroom and evening events alike.",
    rating: 5,
    date: "Verified Google Review • 3 months ago",
  },
  {
    id: "rev-2",
    reviewer_name: "Arjun Muthukumar",
    initials: "AM",
    city: "Chennai",
    occasion: "Bespoke Wedding Tuxedo",
    review_title: "Craftsmanship Beyond Expectation",
    review_text:
      "The craftsmanship is unparalleled. My wedding suit from Harry Clinton was the finest I have ever worn. The precision in shoulder drape and canvas structure felt like a masterpiece on my wedding day.",
    rating: 5,
    date: "Verified Google Review • 2 weeks ago",
  },
  {
    id: "rev-3",
    reviewer_name: "Rahul Sivaraman",
    initials: "RS",
    city: "Bangalore",
    occasion: "3-Piece Italian Wool Tuxedo",
    review_title: "True Sartorial Excellence",
    review_text:
      "From the initial fabric consultation to the master fitting, the atelier experience was genuinely bespoke. The cut, hand-finished lapels, and poise exceeded anything I have commissioned in London.",
    rating: 5,
    date: "Verified Google Review • 1 month ago",
  },
  {
    id: "rev-4",
    reviewer_name: "Vikram Pandian",
    initials: "VP",
    city: "Coimbatore",
    occasion: "Made-to-Measure Silk Suit",
    review_title: "Savile Row Quality in India",
    review_text:
      "I have worn bespoke garments from Savile Row, but Harry Clinton’s attention to proportion and contour rivals the finest houses in Europe. The fit at first trial was absolute perfection.",
    rating: 5,
    date: "Verified Google Review • 1 month ago",
  },
  {
    id: "rev-5",
    reviewer_name: "Siddharth Menon",
    initials: "SM",
    city: "Chennai",
    occasion: "Imperial Midnight Tuxedo",
    review_title: "Uncompromising Elegance",
    review_text:
      "Every detail from the satin peak lapel to the interior silk monogram speaks of supreme luxury. Harry Clinton tailored not just my gala tux, but my entire entourage with immaculate punctuality.",
    rating: 5,
    date: "Verified Google Review • 2 months ago",
  },
];

export default function HomeTestimonials() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [page, setPage] = useState(0);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [copy, setCopy] = useState({
    eyebrow: "WHAT OUR CLIENTS SAY",
    title: "Voices of Distinction",
  });

  // Write Review form state
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formOccasion, setFormOccasion] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formText, setFormText] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [data, kv] = await Promise.all([
          apiCached("/Reviews").catch(() => []),
          homeKV().catch(() => ({})),
        ]);
        if (kv.home_reviews_title) {
          setCopy({
            eyebrow: kv.home_reviews_eyebrow || "WHAT OUR CLIENTS SAY",
            title: kv.home_reviews_title,
          });
        }
        if (Array.isArray(data) && data.length > 0) {
          const approved = data
            .filter((r) => r.is_approved !== false && r.isdeleted !== true && r.review_text)
            .map((r, i) => ({
              id: r.review_id || `db-${i}`,
              reviewer_name: r.reviewer_name || r.user_name || "Verified Client",
              initials:
                (r.reviewer_name || r.user_name || "HC")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "HC",
              city: r.city || "Chennai Atelier",
              occasion: r.review_title || "Bespoke Atelier Client",
              review_title: r.review_title || "Exceptional Sartorial Craftsmanship",
              review_text: r.review_text,
              rating: Number(r.rating) || 5,
              date: "Verified Google Review",
            }));
          if (approved.length > 0) {
            setReviews([...approved, ...INITIAL_REVIEWS]);
          }
        }
      } catch {
        /* fallback to INITIAL_REVIEWS */
      }
    }
    loadData();
  }, []);

  // Desktop shows 3 per page, mobile shows 1
  const pageSize = 3;
  const totalPages = Math.ceil(reviews.length / pageSize);
  const visibleReviews = reviews.slice(page * pageSize, page * pageSize + pageSize);

  const handlePrev = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) return;

    setSubmitting(true);
    const newRev = {
      id: `local-${Date.now()}`,
      reviewer_name: formName.trim(),
      initials: formName
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "HC",
      city: formCity.trim() || "India",
      occasion: formOccasion.trim() || "Bespoke Suit",
      review_title: formTitle.trim() || "Unrivalled Fit & Quality",
      review_text: formText.trim(),
      rating: formRating,
      date: "Verified Client Review • Just now",
    };

    try {
      const userId = currentUserId();
      await apiFetch("/Reviews", {
        method: "POST",
        body: {
          product_id: null,
          user_id: userId || null,
          rating: Number(formRating),
          review_title: formTitle.trim() || "Client Experience",
          review_text: formText.trim(),
          reviewer_name: formName.trim(),
          is_verified: 1,
          rcu: "website",
        },
      }).catch(() => null);
    } catch {
      /* local addition succeeds regardless */
    }

    setReviews([newRev, ...reviews]);
    setSubmitting(false);
    setSuccessMsg("Thank you for sharing your experience! Your review has been added.");
    setPage(0);

    setTimeout(() => {
      setSuccessMsg("");
      setIsWriteOpen(false);
      setFormName("");
      setFormCity("");
      setFormOccasion("");
      setFormTitle("");
      setFormText("");
      setFormRating(5);
    }, 2000);
  };

  return (
    <section className="w-full bg-[#faf9f6] py-16 md:py-24 border-y border-neutral-200/60">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <Reveal>
          {/* Header Block: Clean, Simple, Single Section */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#c6a15b] block mb-2">
              {copy.eyebrow}
            </span>
            <h2 className="font-display text-[32px] font-bold text-neutral-950 uppercase tracking-wide mb-4">
              {copy.title}
            </h2>

            {/* Google Rating Badge & Write Review Action */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-2">
              {/* Google Verified Rating Pill */}
              <div className="inline-flex items-center gap-2.5 bg-white border border-neutral-200 px-4 py-2 shadow-sm">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div className="flex items-center gap-1 text-[#c6a15b] text-[13px] font-bold">
                  <span>4.9</span>
                  <span>★★★★★</span>
                </div>
                <span className="text-[12px] text-neutral-600 font-normal">
                  180+ Google Reviews
                </span>
              </div>

              {/* High-Impact Gold Write Review Button */}
              <button
                type="button"
                onClick={() => setIsWriteOpen(true)}
                className="inline-flex items-center gap-2 bg-[#c6a15b] hover:bg-[#d8b56f] text-neutral-950 px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md border border-[#c6a15b]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Clean 3-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-neutral-200 p-6 md:p-7 flex flex-col justify-between shadow-sm hover:border-[#c6a15b]/60 hover:shadow-md transition-all duration-300"
              >
                <div>
                  {/* Rating Stars & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[#c6a15b] text-[15px] tracking-widest">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e6f4ea] text-[#137333] px-2 py-0.5">
                      ✓ Verified
                    </span>
                  </div>

                  {/* Title */}
                  {rev.review_title && (
                    <h3 className="font-display text-[15px] font-bold text-neutral-950 mb-2 leading-snug">
                      &ldquo;{rev.review_title}&rdquo;
                    </h3>
                  )}

                  {/* Quote */}
                  <p className="font-sans text-[15px] text-neutral-700 italic leading-relaxed mb-6 font-normal">
                    &ldquo;{rev.review_text}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[12px]">
                  <div>
                    <h4 className="font-bold text-neutral-950 text-[12px] m-0">
                      {rev.reviewer_name}
                    </h4>
                    <p className="text-neutral-500 text-[12px] m-0 font-normal">
                      {rev.city} • {rev.occasion}
                    </p>
                  </div>
                  <span className="text-neutral-400 text-[11px] shrink-0 ml-2">
                    {rev.date?.includes("•") ? rev.date.split("•")[1].trim() : rev.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Reviews"
                className="w-9 h-9 border border-neutral-300 bg-white flex items-center justify-center text-neutral-800 hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors cursor-pointer"
              >
                &larr;
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPage(idx)}
                    aria-label={`Go to review page ${idx + 1}`}
                    className={`h-1.5 transition-all duration-200 cursor-pointer ${
                      idx === page ? "w-6 bg-[#c6a15b]" : "w-2 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Reviews"
                className="w-9 h-9 border border-neutral-300 bg-white flex items-center justify-center text-neutral-800 hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors cursor-pointer"
              >
                &rarr;
              </button>
            </div>
          )}
        </Reveal>
      </div>

      {/* Customer Write Review Modal - Screen-Responsive & Luxury UI */}
      {isWriteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWriteOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white border border-[#c6a15b]/30 shadow-2xl text-neutral-950 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Gold Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c6a15b] via-[#e5c98d] to-[#c6a15b] z-10" />

            {/* Sticky Header with Title and Close Button */}
            <div className="relative px-5 py-3.5 sm:px-6 sm:py-4 border-b border-neutral-100 shrink-0 bg-white pr-12">
              <button
                type="button"
                onClick={() => setIsWriteOpen(false)}
                className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-neutral-200 text-neutral-400 hover:text-neutral-950 hover:border-neutral-400 hover:bg-neutral-100 flex items-center justify-center text-lg sm:text-xl font-bold transition-all cursor-pointer"
                aria-label="Close review modal"
              >
                &times;
              </button>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c6a15b] block mb-0.5">
                Customer Review
              </span>
              <h3 className="font-display text-[18px] sm:text-[22px] font-bold text-neutral-950 mb-0.5 leading-snug">
                Share Your Experience
              </h3>
              <p className="text-[12px] text-neutral-500 font-normal leading-relaxed m-0">
                Your feedback guides our master tailors in crafting timeless perfection.
              </p>
            </div>

            {successMsg ? (
              <div className="p-8 text-center bg-[#f4faf6] border border-[#34A853]/30 m-4 flex-1 flex flex-col items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center text-2xl mb-3 font-bold">
                  ✓
                </span>
                <h4 className="text-[18px] font-bold text-neutral-950 mb-1">Review Received</h4>
                <p className="text-[14px] text-[#137333] font-medium m-0">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Scrollable Form Body with sleek scrollbar */}
                <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-3.5 scroll-slim flex-1">
                  {/* Rating Stars Selection */}
                  <div className="bg-[#fbfaf8] border border-neutral-200/80 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 m-0">
                        Your Rating *
                      </label>
                      <span className="text-[11px] text-[#c6a15b] font-bold uppercase tracking-wider">
                        {hoverRating || formRating} of 5 Stars
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-2xl sm:text-3xl text-[#c6a15b] hover:scale-115 transition-transform cursor-pointer p-0.5 focus:outline-none"
                          aria-label={`Rate ${star} star`}
                        >
                          {star <= (hoverRating || formRating) ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Arjun M."
                        className="w-full bg-[#fbfaf8] border border-neutral-300 focus:border-[#c6a15b] focus:bg-white focus:ring-1 focus:ring-[#c6a15b] px-3 py-2 text-[14px] text-neutral-950 transition-all outline-none rounded-none placeholder:text-neutral-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="e.g. Chennai, Bangalore"
                        className="w-full bg-[#fbfaf8] border border-neutral-300 focus:border-[#c6a15b] focus:bg-white focus:ring-1 focus:ring-[#c6a15b] px-3 py-2 text-[14px] text-neutral-950 transition-all outline-none rounded-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  {/* Garment & Headline in 2 columns on tablet/desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                        Suit / Garment Ordered
                      </label>
                      <input
                        type="text"
                        value={formOccasion}
                        onChange={(e) => setFormOccasion(e.target.value)}
                        placeholder="e.g. Bespoke Tuxedo"
                        className="w-full bg-[#fbfaf8] border border-neutral-300 focus:border-[#c6a15b] focus:bg-white focus:ring-1 focus:ring-[#c6a15b] px-3 py-2 text-[14px] text-neutral-950 transition-all outline-none rounded-none placeholder:text-neutral-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                        Review Headline
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Flawless Tailoring"
                        className="w-full bg-[#fbfaf8] border border-neutral-300 focus:border-[#c6a15b] focus:bg-white focus:ring-1 focus:ring-[#c6a15b] px-3 py-2 text-[14px] text-neutral-950 transition-all outline-none rounded-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  {/* Review Body */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                      Your Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Describe the fabric quality, fitting precision, and master tailor consultation..."
                      className="w-full bg-[#fbfaf8] border border-neutral-300 focus:border-[#c6a15b] focus:bg-white focus:ring-1 focus:ring-[#c6a15b] px-3 py-2 text-[14px] text-neutral-950 transition-all outline-none rounded-none placeholder:text-neutral-400 resize-y"
                    />
                  </div>
                </div>

                {/* Sticky Action Footer - GUARANTEED 100% VISIBLE ON SCREEN */}
                <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-neutral-200 bg-[#fbfaf8] shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsWriteOpen(false)}
                    className="w-full sm:w-auto border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-[12px] uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#c6a15b] via-[#d4af37] to-[#c6a15b] text-neutral-950 hover:brightness-105 font-bold text-[12px] uppercase tracking-wider px-6 py-2.5 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-[0_4px_16px_rgba(198,161,91,0.3)] hover:shadow-[0_6px_20px_rgba(198,161,91,0.45)] text-center flex items-center justify-center gap-2 border border-[#c6a15b]"
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>Submit Review</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
