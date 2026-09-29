"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiCached, resolveUploadUrl } from "@/lib/api";
import ProductDetail from "./ProductDetail";
import { PLACEHOLDER_IMAGE } from "./ProductCard";

// Fallback renderer for product pages.
//
// Why this exists: the product route first tries to build the page on the
// server (fast, ISR-friendly). When the backend is slow or a server-side
// catalog fetch comes back empty, the server can't produce the product and
// used to call notFound() — which turned a temporary data problem into a
// hard 500 (and before the not-found boundary existed, a broken page).
//
// Instead, the route renders this component. The browser CAN reach the API
// (the admin panel proves it), so we re-fetch client-side with a skeleton,
// and the product shows. If the product genuinely doesn't exist, we say so
// instead of crashing.

function mapProduct(p, media) {
  const primary =
    media.find((m) => m.product_id === p.product_id && (m.isprimary === 1 || m.isprimary === true)) ||
    media.find((m) => m.product_id === p.product_id);
  return {
    id: p.product_id || p.product_slug,
    slug: p.product_slug,
    name: p.product_name,
    price: Number(p.base_price) || 0,
    currency: p.currency_code || "INR",
    image: resolveUploadUrl(primary?.media_url) || null,
    description: p.short_description || "",
    fullDescription: p.description || p.short_description || "",
  };
}

export default function ProductDetailLoader({ id }) {
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [products, media, variants, sizes, clothTypes, reviews, ratingSummary, attrs, attrValues] = await Promise.all([
          apiCached("/Products", { params: { pageSize: 200 } }).catch(() => []),
          apiCached("/Products-Media", { params: { pageSize: 200 } }).catch(() => []),
          apiCached("/Products-Variants", { params: { pageSize: 200 } }).catch(() => []),
          apiCached("/Products-Sizes").catch(() => []),
          apiCached("/Products-Cloth-Types").catch(() => []),
          apiCached("/Reviews").catch(() => []),
          apiCached("/Product-Rating-Summary").catch(() => []),
          apiCached("/Products-Attributes").catch(() => []),
          apiCached("/Products-Attributes-Values", { params: { pageSize: 200 } }).catch(() => []),
        ]);
        if (!live) return;

        const p = (Array.isArray(products) ? products : []).find(
          (x) => x.product_id === id || x.product_slug === id
        );
        if (!p) {
          setStatus("missing");
          return;
        }
        const mediaList = Array.isArray(media) ? media : [];
        const allProductMedia = mediaList.filter((m) => m.product_id === p.product_id);
        const productLevelMedia = allProductMedia.filter((m) => !m.product_variant_id);
        const variantMedia = allProductMedia.filter((m) => m.product_variant_id);
        const gallery = productLevelMedia
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map((m) => resolveUploadUrl(m.media_url))
          .filter(Boolean);
        const sizesList = Array.isArray(sizes) ? sizes : [];
        const clothList = Array.isArray(clothTypes) ? clothTypes : [];

        const builtVariants = (Array.isArray(variants) ? variants : [])
          .filter((v) => v.product_id === p.product_id)
          .map((v, idx) => {
            const sizeRow = sizesList.find((s) => s.size_id === v.size_id);
            const clothRow = clothList.find((c) => c.cloth_type_id === v.cloth_type_id);
            const ownMedia = variantMedia.filter((m) => m.product_variant_id === v.product_variant_id);
            return {
              ...v,
              key: v.product_variant_id || v.size_id || `${v.variant_name || "size"}-${idx}`,
              label: sizeRow?.size_name || v.variant_name || "M",
              sizeName: sizeRow?.size_name || "",
              clothName: clothRow?.cloth_type_name || "",
              available:
                v.stock_qty === undefined || v.stock_qty === null
                  ? true
                  : Number(v.stock_qty) > 0,
              image: resolveUploadUrl(ownMedia[0]?.media_url) || null,
            };
          });

        const reviewsList = Array.isArray(reviews) ? reviews : [];
        const price = Number(p.base_price) || 0;
        const related = (Array.isArray(products) ? products : [])
          .filter((x) => x.product_id !== p.product_id && x.isdeleted !== true && x.isactive !== false)
          .map((x) => ({ x, diff: Math.abs((Number(x.base_price) || 0) - price) }))
          .sort((a, b) => a.diff - b.diff)
          .slice(0, 4)
          .map(({ x }) => mapProduct(x, mediaList));

        // Color variants
        const LUXURY_PALETTE = {
          black: { name: "Black", hex: "#111111" },
          white: { name: "White", hex: "#fcfcfc", border: "#dcd6c8" },
          ivory: { name: "Ivory", hex: "#f7f4ec", border: "#dcd6c8" },
          cream: { name: "Cream", hex: "#f5f0e6", border: "#dcd6c8" },
          navy: { name: "Navy", hex: "#152238" },
          "royal blue": { name: "Royal Blue", hex: "#1e3a8a" },
          "midnight blue": { name: "Midnight Blue", hex: "#1c3150" },
          blue: { name: "Blue", hex: "#2563eb" },
          beige: { name: "Beige", hex: "#d8cebe" },
          brown: { name: "Brown", hex: "#4a2f1c" },
          "mocha brown": { name: "Mocha Brown", hex: "#4a2f1c" },
          "emerald green": { name: "Emerald Green", hex: "#1e3d2f" },
          emerald: { name: "Emerald", hex: "#124032" },
          green: { name: "Green", hex: "#234a36" },
          red: { name: "Red", hex: "#8a1c1c" },
          "crimson red": { name: "Crimson Red", hex: "#8a1c1c" },
          burgundy: { name: "Burgundy", hex: "#4f111e" },
          wine: { name: "Wine", hex: "#441019" },
          grey: { name: "Grey", hex: "#42454a" },
          gray: { name: "Grey", hex: "#42454a" },
          charcoal: { name: "Charcoal", hex: "#292a2d" },
          gold: { name: "Gold", hex: "#c6a15b" },
          "champagne gold": { name: "Champagne Gold", hex: "#c6a15b" },
          silver: { name: "Silver", hex: "#c4c8cc" },
          violet: { name: "Violet", hex: "#3e1c4a" },
          purple: { name: "Purple", hex: "#361842" },
          yellow: { name: "Yellow", hex: "#d4a017" },
          olive: { name: "Olive", hex: "#4d533c" },
          khaki: { name: "Khaki", hex: "#c3b091" },
        };
        const COLOR_KEYS = Object.keys(LUXURY_PALETTE).sort((a, b) => b.length - a.length);
        const COLOR_REGEX = new RegExp(`\\b(${COLOR_KEYS.join("|")})\\b`, "gi");

        const detectColor = (text) => {
          if (!text) return null;
          const low = String(text).toLowerCase();
          for (const k of COLOR_KEYS) {
            if (new RegExp(`\\b${k}\\b`, "i").test(low)) return LUXURY_PALETTE[k];
          }
          return null;
        };

        const getCollectionFamily = (title) => {
          if (!title) return null;
          const low = title.toLowerCase();
          if (low.includes("church affair")) return "church affair";
          if (low.includes("sangeet soiree")) return "sangeet soiree";
          if (low.includes("linen") && low.includes("shirt")) return "linen shirt";
          if (low.includes("extreme poppins")) return "extreme poppins";
          if (low.includes("velvet") && low.includes("suit")) return "velvet suit";
          const core = low
            .replace(COLOR_REGEX, "")
            .replace(/\b(casual|designer|smart|wedding|outfit|suit|shirt|trouser|3pcs|2pcs)\b/gi, "")
            .replace(/[-–—/\\|]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          return core.length >= 4 ? core : null;
        };

        const currentFamily = getCollectionFamily(p.product_name);
        const siblingProducts = currentFamily
          ? (Array.isArray(products) ? products : []).filter(
              (other) =>
                other.product_id !== p.product_id &&
                other.isdeleted !== true &&
                other.isactive !== false &&
                getCollectionFamily(other.product_name) === currentFamily
            )
          : [];

        const selfColorMeta = detectColor(p.product_name);
        const selfColorName = selfColorMeta?.name || "Original";

        const colorAttr = (Array.isArray(attrs) ? attrs : []).find(
          (a) => a.attribute_slug?.toLowerCase() === "color" || a.attribute_name?.toLowerCase() === "color"
        );
        let rawColors = [];
        if (colorAttr) {
          const pVals = (Array.isArray(attrValues) ? attrValues : []).filter(
            (v) => v.product_id === p.product_id && v.attribute_id === colorAttr.attribute_id
          );
          for (const v of pVals) {
            if (v.attribute_value && v.attribute_value !== "nil" && v.attribute_value !== "f") {
              const parts = String(v.attribute_value).split(/[\\/|,]+/).map((s) => s.trim()).filter(Boolean);
              rawColors.push(...parts);
            }
          }
        }
        if (selfColorMeta && !rawColors.some((c) => c.toLowerCase() === selfColorMeta.name.toLowerCase())) {
          rawColors.unshift(selfColorMeta.name);
        }
        for (const sib of siblingProducts) {
          const sibColor = detectColor(sib.product_name);
          if (sibColor && !rawColors.some((c) => c.toLowerCase() === sibColor.name.toLowerCase())) {
            rawColors.push(sibColor.name);
          }
        }

        const uniqueColorNames = [...new Set(rawColors.map((c) => c.trim()).filter(Boolean))];
        const colorList = uniqueColorNames.length > 0 ? uniqueColorNames : [selfColorName];

        const colorVariants = colorList.map((colName, cIdx) => {
          const key = colName.toLowerCase();
          const meta = LUXURY_PALETTE[key] || { name: colName.charAt(0).toUpperCase() + colName.slice(1), hex: "#333333" };
          const isCurrent = colName.toLowerCase() === selfColorName.toLowerCase();
          if (isCurrent) {
            return {
              name: meta.name || colName,
              hex: meta.hex || "#333333",
              border: meta.border || null,
              slug: p.product_slug,
              productId: p.product_id,
              title: p.product_name,
              price,
              images: gallery,
              variants: builtVariants,
            };
          }
          const matchingSib = siblingProducts.find((sib) => {
            const sCol = detectColor(sib.product_name);
            return sCol?.name.toLowerCase() === key || new RegExp(`\\b${key}\\b`, "i").test(sib.product_name);
          });
          if (matchingSib) {
            const sibMedia = mediaList
              .filter((m) => m.product_id === matchingSib.product_id && !m.product_variant_id)
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((m) => resolveUploadUrl(m.media_url))
              .filter(Boolean);
            return {
              name: meta.name || colName,
              hex: meta.hex || "#333333",
              border: meta.border || null,
              slug: matchingSib.product_slug,
              productId: matchingSib.product_id,
              title: matchingSib.product_name,
              price: Number(matchingSib.base_price) || price,
              images: sibMedia.length > 0 ? sibMedia : gallery,
              variants: builtVariants,
            };
          }
          return {
            name: meta.name || colName,
            hex: meta.hex || "#333333",
            border: meta.border || null,
            slug: p.product_slug,
            productId: p.product_id,
            title: p.product_name,
            price,
            images: gallery,
            variants: builtVariants,
          };
        });

        setProduct({
          ...mapProduct(p, mediaList),
          gallery,
          variants: builtVariants,
          colors: colorVariants.map((c) => c.name),
          colorVariants,
          reviews: reviewsList.filter(
            (r) => r.product_id === p.product_id && r.is_approved !== false && r.isdeleted !== true
          ),
          ratingSummary: (Array.isArray(ratingSummary) ? ratingSummary : []).find(
            (s) => s.product_id === p.product_id
          ) || null,
          related,
        });
        setStatus("ready");
      } catch {
        if (live) setStatus("missing");
      }
    })();
    return () => {
      live = false;
    };
  }, [id]);

  if (status === "ready" && product) {
    return <ProductDetail product={product} />;
  }

  if (status === "missing") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Image src="/brand/logo-black.png" alt="Harry Clinton" width={180} height={48} className="mx-auto" />
        <h1 className="mt-8 font-display text-3xl font-bold">Product Not Available</h1>
        <p className="mt-3 max-w-md text-neutral-500">
          This product may have been removed or is temporarily unavailable.
        </p>
        <Link href="/suits" className="mt-8 bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
          Browse the Collection
        </Link>
      </div>
    );
  }

  // Loading skeleton — matches the detail layout so the shift on load is minimal.
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid items-start gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-[4/5] w-full animate-pulse bg-neutral-100" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square w-full animate-pulse bg-neutral-100" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-9 w-2/3 animate-pulse bg-neutral-100" />
          <div className="mt-4 h-4 w-1/2 animate-pulse bg-neutral-100" />
          <div className="mt-6 h-7 w-1/3 animate-pulse bg-neutral-100" />
          <div className="mt-8 h-11 w-full animate-pulse bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
