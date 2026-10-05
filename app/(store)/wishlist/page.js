"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { PLACEHOLDER_IMAGE } from "@/components/ProductCard";
import { inr } from "@/lib/api";
import "./wishlist-page.css";

// Wishlist: same structure/texts as the previous UI.
export default function WishlistPage() {
  const cart = useCart();
  if (!cart?.ready) return <p className="mx-auto max-w-4xl px-4 py-14 text-center">Loading wishlist...</p>;

  if (cart.wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <h2 className="font-display text-4xl font-bold">Your wishlist is empty</h2>
        <p className="mt-3 text-neutral-500">Save items you love to see them here.</p>
        <Link href="/" className="mt-6 inline-block bg-neutral-950 px-8 py-3 text-sm font-semibold text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="mb-4 font-display text-4xl font-bold">Your Wishlist</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cart.wishlist.map((item) => (
          <div key={item.wishlist_item_id || item.id} className="border-0 bg-white shadow-sm">
            <Link href={`/product/${item.slug || item.product_id || item.id}`} className="wishlist-product-link">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image || PLACEHOLDER_IMAGE}
                alt={item.name}
                loading="lazy"
                style={{ height: "280px", width: "100%", objectFit: "cover" }}
              />
            </Link>
            <div className="p-4 text-center">
              <h5 className="font-medium"><Link href={`/product/${item.slug || item.product_id || item.id}`} className="wishlist-product-name">{item.name}</Link></h5>
              <p className="mt-1 text-sm font-bold">{inr(item.price)}</p>
                <div className="wishlist-actions">
                {(() => {
                  const productId = item.product_id || item.id;
                  const cartLine = cart.items.find((line) => String(line.id) === String(productId));
                  const cartProduct = {
                    id: productId,
                    name: item.name,
                    price: item.unit_price || item.price || 0,
                    image: item.image,
                    slug: item.slug,
                    size: item.size_label,
                    color: item.color,
                  };
                  return (
                    <button
                      onClick={() => (cartLine ? cart.removeFromCart(cartLine.key || productId) : cart.addToCart(cartProduct, 1))}
                      className={`btn-primary wishlist-add${cartLine ? " is-in-cart" : ""}`}
                    >
                      {cartLine ? "Remove from Cart" : "Add to Cart"}
                    </button>
                  );
                })()}
                <button
                  onClick={() => cart.toggleWishlist(item)}
                  className="wishlist-remove"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
