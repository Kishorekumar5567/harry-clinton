"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function NewArrivalsLanding({ products }) {
  const gridRef = useRef(null);
  const cart = useCart();
  const [added, setAdded] = useState({});
  const words = ["NEW ARRIVALS", "·", "JUST DROPPED", "·", "LATEST CUTS", "·", "FRESH STYLES", "·", "HARRY CLINTON", "·"];
  const add = (event, product) => {
    event.preventDefault(); event.stopPropagation();
    cart?.addToCart({ id: product.id, slug: product.slug, name: product.name, price: product.price || 0, image: product.image });
    setAdded((state) => ({ ...state, [product.id]: true }));
    setTimeout(() => setAdded((state) => ({ ...state, [product.id]: false })), 1800);
  };
  return <><section className="na-hero"><img src="/editorial-media/style-hero.jpeg" alt="New Arrivals" className="na-hero__bg" /><div className="na-hero__content"><p className="na-hero__eyebrow">Just Dropped</p><h1 className="na-hero__title">New Arrivals</h1><p className="na-hero__sub">The latest additions,crafted for the modern gentleman.</p><button className="na-hero__cta" onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}>Explore Now</button></div></section><div className="na-marquee"><div className="na-marquee__track">{Array(4).fill(words).flat().map((word, i) => <span key={i} className={word === "·" ? "na-marquee__dot" : "na-marquee__word"}>{word}</span>)}</div></div><div className="container-fluid px-4 px-md-5 py-5" ref={gridRef}><div className="na-toolbar"><span className="na-toolbar__count">{products.length} Piece{products.length !== 1 ? "s" : ""}</span><select className="na-toolbar__sort" defaultValue="new"><option value="new">Newest First</option></select></div><div className="na-grid">{products.length === 0 ? <div className="na-empty"><span className="na-empty__icon">🧵</span><p>New pieces are being crafted. Check back soon.</p></div> : products.map((product) => <div className="na-card" key={product.id}><div className="na-card__img-wrap"><Link href={`/product/${product.slug || product.id}`}><img src={product.image || "/brand/logo-black.png"} alt={product.name} className="na-card__img" /></Link><span className="na-card__badge">New</span><button className={`na-card__quick-add${added[product.id] ? " na-card__quick-add--added" : ""}`} onClick={(event) => add(event, product)}>{added[product.id] ? "Added to Bag ✓" : "Quick Add"}</button></div><div className="na-card__body"><Link href={`/product/${product.slug || product.id}`} className="na-card__name">{product.name}</Link><p className="na-card__price">{product.price ? `₹${Number(product.price).toLocaleString("en-IN")}` : "Price on request"}</p></div></div>)}</div></div></>;
}
