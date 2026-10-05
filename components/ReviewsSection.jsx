"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, currentUser, currentUserId, friendlyError } from "@/lib/api";

// Reviews: same structure/texts as the previous UI —
// "Customer Reviews", average + stars + count, author/date cards,
// login-gated "Write a Review" form with labelled fields.
export default function ReviewsSection({ productId, initialReviews }) {
  const [reviews] = useState(() => (initialReviews || []).filter((review) => String(review.product_id) === String(productId)));
  const [loading] = useState(false);
  const [user] = useState(() => currentUser());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, review_title: "", review_text: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const submitReview = async (event) => {
    event.preventDefault();
    const userId = currentUserId();
    if (!userId) {
      setMessage("Please sign in before writing a review.");
      return;
    }
    if (!form.review_text.trim()) {
      setMessage("Please write a short review.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await apiFetch("/Reviews", {
        method: "POST",
        body: {
          product_id: productId,
          user_id: userId,
          rating: Number(form.rating),
          review_title: form.review_title.trim(),
          review_text: form.review_text.trim(),
          reviewer_name: user?.fullname || user?.name || user?.emailid || "Verified Customer",
          rcu: "STOREFRONT",
        },
      });
      setForm({ rating: 5, review_title: "", review_text: "" });
      setShowForm(false);
      setMessage("Thank you. Your review has been submitted and is awaiting approval.");
    } catch (error) {
      setMessage(friendlyError(error, "Could not submit your review."));
    } finally {
      setSaving(false);
    }
  };

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
                     {r.reviewer_name || r.user_name || "Verified Buyer"}
                     {(r.created_at || r.rcm) ? ` • ${new Date(r.created_at || r.rcm).toLocaleDateString("en-IN")}` : ""}
                  </p>
                  <h5 className="mt-1 font-semibold">{r.review_title}</h5>
                  <p className="mt-1 text-sm text-neutral-600">{r.review_text}</p>
                </li>
              ))}
            </ul>
           )}
           <div className="mt-8 border-t border-neutral-200 pt-6">
             {user ? (
               <>
                 <button type="button" onClick={() => setShowForm((value) => !value)} className="bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold hover:text-neutral-950">
                   {showForm ? "Cancel Review" : "Write a Review"}
                 </button>
                 {showForm && (
                   <div className="fixed inset-0 z-[150] flex items-center justify-center bg-neutral-950/60 p-4" role="dialog" aria-modal="true" aria-label="Write a review" onClick={() => setShowForm(false)}>
                     <form onSubmit={submitReview} onClick={(event) => event.stopPropagation()} className="w-full max-w-xl border border-neutral-200 bg-white p-6 shadow-2xl">
                       <div className="flex items-center justify-between"><h4 className="font-display text-2xl font-bold text-neutral-950">Write a Review</h4><button type="button" onClick={() => setShowForm(false)} aria-label="Close review form" className="text-2xl text-neutral-500 hover:text-neutral-950">×</button></div>
                       <p className="mt-1 text-sm text-neutral-500">Share your experience with this product.</p>
                       <label className="mt-5 block text-sm font-semibold text-neutral-800">Rating
                         <select value={form.rating} onChange={(event) => setForm((value) => ({ ...value, rating: event.target.value }))} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm">
                           {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                         </select>
                       </label>
                       <label className="mt-3 block text-sm font-semibold text-neutral-800">Title
                         <input value={form.review_title} onChange={(event) => setForm((value) => ({ ...value, review_title: event.target.value }))} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm" placeholder="Summarise your experience" />
                       </label>
                       <label className="mt-3 block text-sm font-semibold text-neutral-800">Review
                         <textarea required rows={4} value={form.review_text} onChange={(event) => setForm((value) => ({ ...value, review_text: event.target.value }))} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm" placeholder="Tell us about this product" />
                       </label>
                       <button type="submit" disabled={saving} className="mt-5 bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Submitting..." : "Submit Review"}</button>
                     </form>
                   </div>
                 )}
               </>
             ) : (
               <Link href="/login" className="text-sm font-semibold text-neutral-900 underline underline-offset-4">Sign in to write a review</Link>
             )}
             {message && <p className="mt-3 text-sm text-neutral-600">{message}</p>}
           </div>
         </>
      )}
    </section>
  );
}
