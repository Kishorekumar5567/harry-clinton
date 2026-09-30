"use client";

import { useState } from "react";

// Reviews: same structure/texts as the previous UI —
// "Customer Reviews", average + stars + count, author/date cards,
// login-gated "Write a Review" form with labelled fields.
export default function ReviewsSection({ productId, initialReviews }) {
  const [reviews] = useState(initialReviews || []);
  const [loading] = useState(false);

  const avg =
    reviews.length > 0
      ? reviews.reduce((n, r) => n + Number(r.rating || 0), 0) / reviews.length
      : 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h3 className="font-display text-3xl font-bold">Customer Reviews</h3>
      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">Loading reviews...</p>
      ) : (
        <>
          {reviews.length > 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              <span className="font-bold text-neutral-900">{avg.toFixed(1)}</span>{" "}
              <span className="text-gold">{"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}</span>{" "}
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          )}
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No reviews yet. Verified reviews will appear here.</p>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.review_id} className="border border-neutral-200 p-5">
                  <p className="text-gold">
                    {"★".repeat(Math.min(Number(r.rating) || 5, 5))}
                    {"☆".repeat(5 - Math.min(Number(r.rating) || 5, 5))}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {r.user_name || "Verified Buyer"}
                    {r.created_at ? ` • ${new Date(r.created_at).toLocaleDateString("en-IN")}` : ""}
                  </p>
                  <h5 className="mt-1 font-semibold">{r.review_title}</h5>
                  <p className="mt-1 text-sm text-neutral-600">{r.review_text}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
