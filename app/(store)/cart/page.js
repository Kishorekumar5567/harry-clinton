"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { inr } from "@/lib/api";
import { PLACEHOLDER_IMAGE } from "@/components/ProductCard";
import "./cart-page.css";

// Cart: same structure/texts as the previous UI —
// "Shopping Bag", item cards, "Order Summary" with coupon + shipping rows.
export default function CartPage() {
  const cart = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  // Item key awaiting remove-confirmation (popup), null when closed.
  const [pendingRemove, setPendingRemove] = useState(null);

  if (!cart?.ready) return <p className="mx-auto max-w-4xl px-4 py-14 text-center">Loading cart...</p>;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <h2 className="font-display text-4xl font-bold">Your bag is empty</h2>
        <p className="mt-3 text-neutral-500">Add items to your cart to see them here.</p>
        <Link href="/" className="mt-6 inline-block bg-neutral-950 px-8 py-3 text-sm font-semibold text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    setCouponError("");
    try {
      await cart.applyCoupon(couponCode);
      setCouponCode("");
    } catch (e) {
      setCouponError(e.message);
    }
  };

  return (
    <main className="cart-page">
      <div className="cart-page__header">
        <p className="cart-page__eyebrow">Your Selection</p>
        <h1>Shopping Bag</h1>
        <p className="cart-page__count">{cart.count} {cart.count === 1 ? "item" : "items"}</p>
      </div>
      <div className="cart-page__layout">
        <section className="cart-page__items" aria-label="Shopping bag items">
          {cart.items.map((i) => (
            <article key={i.key || i.id} className="cart-page__item">
              <Link
                href={`/product/${i.slug || i.product_id || i.id}`}
                className="cart-page__image"
                aria-label={i.name}
              >
                {/* Cart images come from backend uploads; bypass Next image optimization. */}
                <img src={i.image || PLACEHOLDER_IMAGE} alt={i.name} />
              </Link>
              <div className="cart-page__item-details">
                <div className="cart-page__item-heading">
                  <div>
                    <Link href={`/product/${i.slug || i.product_id || i.id}`} className="cart-page__item-name">{i.name}</Link>
                    {i.size && <p className="cart-page__meta">Size: {i.size}</p>}
                  </div>
                  <p className="cart-page__line-total">₹{(Number(i.price) * (i.qty || 1)).toLocaleString("en-IN")}</p>
                </div>
                <p className="cart-page__unit-price">₹{Number(i.price).toLocaleString("en-IN")} per piece</p>
                <div className="cart-page__item-footer">
                  <div className="cart-page__quantity" aria-label="Quantity">
                  <button
                    onClick={() => cart.updateQty(i.key || i.id, (i.qty || 1) - 1)}
                    disabled={(i.qty || 1) <= 1}
                    aria-label="Decrease quantity"
                    className="cart-page__quantity-button disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="cart-page__quantity-value">{i.qty || 1}</span>
                  <button onClick={() => cart.updateQty(i.key || i.id, (i.qty || 1) + 1)} className="cart-page__quantity-button">+</button>
                  </div>
                  <button onClick={() => setPendingRemove(i.key || i.id)} className="cart-page__remove">Remove</button>
                </div>
              </div>
            </article>
          ))}
        </section>
        <aside className="cart-page__summary">
          <p className="cart-page__summary-eyebrow">Order Summary</p>
          <h2>Your order</h2>
          <p className="cart-page__summary-row"><span>Subtotal</span><span>₹{cart.subtotal.toLocaleString("en-IN")}</span></p>
          {cart.coupon && (
            <p className="cart-page__summary-row cart-page__discount">
              <span>Discount ({cart.coupon.coupon_code})</span>
              <button onClick={cart.removeCoupon} className="text-xs underline">Remove</button>
              <span>-{inr(cart.discount)}</span>
            </p>
          )}
          <p className="cart-page__summary-row"><span>Shipping</span><span>Calculated at checkout</span></p>
          <hr />
          <p className="cart-page__total"><span>Total</span><span>{inr(cart.total)}</span></p>
          <div className="cart-page__coupon">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" />
            <button onClick={applyCoupon}>Apply</button>
          </div>
          {couponError && <p className="cart-page__error">{couponError}</p>}
          <Link href="/checkout" className="cart-page__checkout">Proceed to Checkout <span>→</span></Link>
        </aside>
      </div>

      {/* Remove confirmation popup */}
      {pendingRemove && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/60 p-4"
          onClick={() => setPendingRemove(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm  border border-neutral-200 bg-white p-6 shadow-xl"
          >
            <h3 className="font-display text-lg font-bold text-neutral-900">Remove this item?</h3>
            <p className="mt-2 text-sm text-neutral-500">
              {cart.items.find((x) => (x.key || x.id) === pendingRemove)?.name || "This item"} will be
              removed from your bag. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingRemove(null)}
                className=" border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { cart.removeFromCart(pendingRemove); setPendingRemove(null); }}
                className=" bg-red-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
