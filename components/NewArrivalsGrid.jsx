"use client";

import Link from "next/link";
import { CollectionCard } from "./CollectionView";
import "./collection-view.css";

// New Arrivals uses the same product-card treatment as collection pages:
// shared image ratio, hover view panel, pricing, swatches, and wishlist heart.
export default function NewArrivalsGrid({ products }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {products.length} {products.length === 1 ? "Piece" : "Pieces"}
        </p>
        <select disabled aria-label="Sort" className="border border-neutral-300 bg-white px-3 py-2 text-sm">
          <option>Newest First</option>
        </select>
      </div>
      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🧵</p>
          <p className="mt-4 text-neutral-500">New pieces are being crafted. Check back soon.</p>
          <Link href="/" className="mt-6 inline-block bg-neutral-950 px-8 py-3 text-sm font-semibold text-white">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="collection-grid collection-grid--four">
          {products.map((product) => (
            <div key={product.id} className="new-arrivals-card">
              <span className="new-arrivals-card__badge">New</span>
              <CollectionCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
