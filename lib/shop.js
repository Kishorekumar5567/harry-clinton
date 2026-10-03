import { apiGet, unwrap, resolveUploadUrl } from "./api";
import { keywordsFor } from "./catalog";

// Server-side shop data. All pages render from the live backend —
// no hardcoded catalog anywhere in v2.

// Fetch-once helper: catalog endpoints in parallel, tolerant of single failures.
// /Products is paged server-side (default pageSize 50) — without an explicit
// large page size, anything past the first 50 products silently disappears
// from every storefront list and the admin table.
async function catalogBundle() {
  const [products, media, variants, attrValues, attributes, sizes, clothTypes, collections] =
    await Promise.all([
      apiGet("/Products", { params: { pageSize: 200 }, revalidate: 0 }).then(unwrap).catch(() => []),
      apiGet("/Products-Media", { params: { pageSize: 200 }, revalidate: 0 }).then(unwrap).catch(() => []),
      apiGet("/Products-Variants", { params: { pageSize: 200 }, revalidate: 0 }).then(unwrap).catch(() => []),
      apiGet("/Products-Attributes-Values", { params: { pageSize: 200 }, revalidate: 0 }).then(unwrap).catch(() => []),
      apiGet("/Products-Attributes").then(unwrap).catch(() => []),
      apiGet("/Products-Sizes").then(unwrap).catch(() => []),
      apiGet("/Products-Cloth-Types").then(unwrap).catch(() => []),
      apiGet("/Style-Collections").then(unwrap).catch(() => []),
    ]);
  return { products, media, variants, attrValues, attributes, sizes, clothTypes, collections };
}

export function mapProduct(p, media) {
  const primary =
    media.find((m) => m.product_id === p.product_id && (m.isprimary === 1 || m.isprimary === true)) ||
    media.find((m) => m.product_id === p.product_id);
  return {
    id: p.product_id || p.product_slug,
    slug: p.product_slug,
    name: p.product_name,
    subtitle: p.short_description || "",
    price: Number(p.base_price) || 0,
    originalPrice: Number(p.original_price) || null,
    collectionDisplayOrder: Number(p.collection_display_order) || 0,
    styleCollectionId: p.style_collection_id || null,
    currency: p.currency_code || "INR",
    image: resolveUploadUrl(primary?.media_url) || null,
    description: p.short_description || "",
    fullDescription: p.description || p.short_description || "",
  };
}

export function filterByKeywords(products, keywords) {
  const lowered = keywords.map((k) => k.toLowerCase());
  if (lowered.length === 0) return products;
  return products.filter((p) => {
    const text =
      `${p.product_name || ""} ${p.product_slug || ""} ${p.short_description || ""} ${p.description || ""} ${p.category || ""}`.toLowerCase();
    return lowered.some((k) => text.includes(k));
  });
}

// Products for a category/occasion/collection page + filter metadata.
// overrideKeywords lets DB-driven pages (admin-editable slugs with no
// hardcoded entry in catalog.js) reuse the same grid pipeline.
export async function getCategoryData(resolved, overrideKeywords) {
  const bundle = await catalogBundle();
  const keywords = overrideKeywords || keywordsFor(resolved);
  const collection = resolved?.type === "collection"
    ? (Array.isArray(bundle.collections) ? bundle.collections : []).find((row) =>
        String(row.collection_slug || row.collection_name?.toLowerCase().replace(/\s+/g, "-")) === String(resolved.collection)
      )
    : null;
  const collectionProducts = collection
    ? await apiGet("/Products", {
        params: { style_collection_id: collection.style_collection_id, pageSize: 200 },
        revalidate: 0,
      }).then(unwrap).catch(() => [])
    : bundle.products;
  const sourceProducts = collection
    ? collectionProducts
    : filterByKeywords(bundle.products, keywords);
  const filtered = sourceProducts
    .filter((p) => p.isdeleted !== true)
    .sort((a, b) => (a.collection_display_order || 0) - (b.collection_display_order || 0));
  const colorAttr = bundle.attributes.find(
    (a) => a.attribute_slug?.toLowerCase() === "color" || a.attribute_name?.toLowerCase() === "color"
  );
  const colors = colorAttr
    ? [...new Set(bundle.attrValues.filter((v) => v.attribute_id === colorAttr.attribute_id).map((v) => v.attribute_value).filter(Boolean))]
    : [];
  // Per-product colors from attribute values (Color attribute → product),
  // keyed by the ORIGINAL product_id (the mapped id may fall back to slug).
  const colorsByProduct = {};
  if (colorAttr) {
    for (const v of bundle.attrValues) {
      if (v.attribute_id === colorAttr.attribute_id && v.attribute_value && v.product_id) {
        (colorsByProduct[v.product_id] ||= []).push(v.attribute_value);
      }
    }
  }
  const products = filtered.map((p) => {
    const mapped = mapProduct(p, bundle.media);
    const pv = bundle.variants.filter((v) => v.product_id === p.product_id);
    // Resolve IDs to human-readable names so CategoryView's filter compares
    // apples to apples (sizeName / clothName strings, not UUIDs).
    const sizeNameById = Object.fromEntries(
      bundle.sizes.map((s) => [s.size_id, s.size_name])
    );
    const clothNameById = Object.fromEntries(
      bundle.clothTypes.map((c) => [c.cloth_type_id, c.cloth_type_name])
    );
    const productColors = colorsByProduct[p.product_id] || [];
    return {
      ...mapped,
      sizes: [
        ...new Set(
          pv.map((v) => sizeNameById[v.size_id]).filter(Boolean)
        ),
      ],
      clothTypes: [
        ...new Set(
          pv.map((v) => clothNameById[v.cloth_type_id]).filter(Boolean)
        ),
      ],
      colors: productColors,
      color: productColors[0] || null,
    };
  });
  return {
    products,
    sizes: bundle.sizes.map((s) => s.size_name).filter(Boolean),
    clothTypes: bundle.clothTypes.map((c) => c.cloth_type_name).filter(Boolean),
    colors,
  };
}

export async function getProduct(idOrSlug) {
  try {
  // Fetch bundle + reviews in parallel to avoid sequential 10s timeout on Vercel (catalog 7 fetches + 2 more = ~10s serial).
  const [bundle, reviews, ratingSummary] = await Promise.all([
    catalogBundle(),
    apiGet("/Reviews").then(unwrap).catch(() => []),
    apiGet("/Product-Rating-Summary").then(unwrap).catch(() => []),
  ]);
  const p = bundle.products.find(
    (x) => x.product_id === idOrSlug || x.product_slug === idOrSlug
  );
  if (!p) return null;
  const allProductMedia = bundle.media.filter((m) => m.product_id === p.product_id);
  const productLevelMedia = allProductMedia.filter((m) => !m.product_variant_id);
  const variantMedia = allProductMedia.filter((m) => m.product_variant_id);
  const gallery = productLevelMedia
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((m) => resolveUploadUrl(m.media_url))
    .filter(Boolean);
  const sizes = bundle.sizes;
  const variants = bundle.variants
    .filter((v) => v.product_id === p.product_id)
    .map((v) => {
      const sizeRow = sizes.find((s) => s.size_id === v.size_id);
      const clothRow = bundle.clothTypes.find((c) => c.cloth_type_id === v.cloth_type_id);
      const ownMedia = variantMedia.filter((m) => m.product_variant_id === v.product_variant_id);
      return {
        ...v,
        key: v.product_variant_id || v.size_id || `${v.variant_name || "size"}`,
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
  const productReviews = reviews.filter(
    (r) => r.product_id === p.product_id && r.is_approved !== false && r.isdeleted !== true
  );
  const summary = ratingSummary.find((s) => s.product_id === p.product_id) || null;
  const price = Number(p.base_price) || 0;
  const related = bundle.products
    .filter((x) => x.product_id !== p.product_id && x.isdeleted !== true && x.isactive !== false)
    .map((x) => ({ x, diff: Math.abs((Number(x.base_price) || 0) - price) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 4)
    .map(({ x }) => mapProduct(x, bundle.media));

  // --- LUXURY COLORWAY & SIBLING DISCOVERY PIPELINE ---
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
    platinum: { name: "Platinum", hex: "#e5e4e2", border: "#bebebe" },
    ice: { name: "Menthol Ice", hex: "#00ffff", border: "#00ced1" },
    violet: { name: "Violet", hex: "#3e1c4a" },
    purple: { name: "Purple", hex: "#361842" },
    yellow: { name: "Yellow", hex: "#d4a017" },
    olive: { name: "Olive", hex: "#4d533c" },
    khaki: { name: "Khaki", hex: "#c3b091" },
  };

  const COLOR_KEYS = Object.keys(LUXURY_PALETTE).sort((a, b) => b.length - a.length);
  const COLOR_REGEX = new RegExp(`\\b(${COLOR_KEYS.join("|")})\\b`, "gi");

  function detectColor(text) {
    if (!text) return null;
    const low = String(text).toLowerCase();
    for (const k of COLOR_KEYS) {
      if (new RegExp(`\\b${k}\\b`, "i").test(low)) {
        return LUXURY_PALETTE[k];
      }
    }
    return null;
  }

  function getCollectionFamily(title) {
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
  }

  const currentFamily = getCollectionFamily(p.product_name);
  const siblingProducts = currentFamily
    ? bundle.products.filter(
        (other) =>
          other.product_id !== p.product_id &&
          other.isdeleted !== true &&
          other.isactive !== false &&
          getCollectionFamily(other.product_name) === currentFamily
      )
    : [];

  const selfColorMeta = detectColor(p.product_name);
  let selfColorName = selfColorMeta?.name || "Original";

  const colorAttr = bundle.attributes.find(
    (a) => a.attribute_slug?.toLowerCase() === "color" || a.attribute_name?.toLowerCase() === "color"
  );
  let rawColors = [];
  if (colorAttr) {
    const pVals = bundle.attrValues.filter(
      (v) => v.product_id === p.product_id && v.attribute_id === colorAttr.attribute_id
    );
    for (const v of pVals) {
      if (v.attribute_value && v.attribute_value !== "nil" && v.attribute_value !== "f") {
        const parts = String(v.attribute_value)
          .split(/[\\/|,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        rawColors.push(...parts);
      }
    }
  }

  // When an admin assigns a color to a variant, use that as the product's
  // active color instead of inventing an "Original" colorway.
  if (!selfColorMeta && rawColors.length > 0) selfColorName = rawColors[0];

  if (selfColorMeta && !rawColors.some((c) => c.toLowerCase() === selfColorMeta.name.toLowerCase())) {
    rawColors.unshift(selfColorMeta.name);
  }

  for (const sib of siblingProducts) {
    const sibColor = detectColor(sib.product_name);
    if (sibColor && !rawColors.some((c) => c.toLowerCase() === sibColor.name.toLowerCase())) {
      rawColors.push(sibColor.name);
    }
  }

  // Normalize colors list
  const uniqueColorNames = [...new Set(rawColors.map((c) => c.trim()).filter(Boolean))];
  const colorList = uniqueColorNames.length > 0 ? uniqueColorNames : [selfColorName];

  // Helper to build variants for a product
  const variantColor = (variantId) => {
    if (!colorAttr || !variantId) return "";
    return bundle.attrValues.find((v) =>
      v.product_variant_id === variantId && v.attribute_id === colorAttr.attribute_id
    )?.attribute_value || "";
  };

  const buildVariantsForProduct = (prodId, prodPrice, colorFilter = "") => {
    const rawVars = bundle.variants.filter((v) => v.product_id === prodId);
    const filteredVars = colorFilter
      ? rawVars.filter((v) => {
          const value = variantColor(v.product_variant_id).toLowerCase();
          return !value || value === colorFilter.toLowerCase();
        })
      : rawVars;
    if (filteredVars.length === 0) {
      return [{ key: "default", label: "M", price: prodPrice, available: true, image: null, variant: null }];
    }
    return filteredVars.map((v, idx) => {
      const sizeRow = sizes.find((s) => s.size_id === v.size_id);
      const clothRow = bundle.clothTypes.find((c) => c.cloth_type_id === v.cloth_type_id);
      const ownMedia = variantMedia.filter((m) => m.product_variant_id === v.product_variant_id);
      return {
        ...v,
        key: v.product_variant_id || v.size_id || `${v.variant_name || "size"}-${idx}`,
        label: sizeRow?.size_name || v.variant_name || "M",
        sizeName: sizeRow?.size_name || "",
        clothName: clothRow?.cloth_type_name || "",
        color: variantColor(v.product_variant_id) || null,
        price: Number(v.price) || prodPrice,
        available: v.stock_qty === undefined || v.stock_qty === null ? true : Number(v.stock_qty) > 0,
        image: resolveUploadUrl(ownMedia[0]?.media_url) || null,
        variant: v,
      };
    });
  };

  const variantGalleryForProduct = (prodId, colorName) => {
    const variantIds = bundle.variants
      .filter((v) => v.product_id === prodId)
      .filter((v) => variantColor(v.product_variant_id).toLowerCase() === colorName.toLowerCase())
      .map((v) => v.product_variant_id);
    return variantMedia
      .filter((m) => variantIds.includes(m.product_variant_id))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((m) => resolveUploadUrl(m.media_url))
      .filter(Boolean);
  };

  // Build colorVariants with dedicated per-color image galleries and metadata
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
        description: p.short_description || p.description || "",
        images: variantGalleryForProduct(p.product_id, colName).length > 0
          ? variantGalleryForProduct(p.product_id, colName)
          : gallery,
        variants: buildVariantsForProduct(p.product_id, price, colName),
      };
    }

    // Look for matching sibling product
    const matchingSib = siblingProducts.find((sib) => {
      const sCol = detectColor(sib.product_name);
      return sCol?.name.toLowerCase() === key || new RegExp(`\\b${key}\\b`, "i").test(sib.product_name);
    });

    if (matchingSib) {
      const sibMedia = bundle.media
        .filter((m) => m.product_id === matchingSib.product_id && !m.product_variant_id)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map((m) => resolveUploadUrl(m.media_url))
        .filter(Boolean);
      const sibPrice = Number(matchingSib.base_price) || price;
       const sibVariants = buildVariantsForProduct(matchingSib.product_id, sibPrice, colName);
      return {
        name: meta.name || colName,
        hex: meta.hex || "#333333",
        border: meta.border || null,
        slug: matchingSib.product_slug,
        productId: matchingSib.product_id,
        title: matchingSib.product_name,
        price: sibPrice,
        description: matchingSib.short_description || matchingSib.description || "",
         images: variantGalleryForProduct(matchingSib.product_id, colName).length > 0
           ? variantGalleryForProduct(matchingSib.product_id, colName)
           : (sibMedia.length > 0 ? sibMedia : gallery),
        variants: sibVariants,
      };
    }

    // Look for matched media alt or url within the current product
    const matchedMedia = allProductMedia
      .filter((m) => {
        const text = `${m.alt_text || ""} ${m.media_url || ""}`.toLowerCase();
        return new RegExp(`\\b${key}\\b`, "i").test(text);
      })
      .map((m) => resolveUploadUrl(m.media_url))
      .filter(Boolean);

    const variantColorGallery = variantGalleryForProduct(p.product_id, colName);
    let colorGallery = variantColorGallery.length > 0
      ? variantColorGallery
      : (matchedMedia.length > 0 ? matchedMedia : []);
    if (colorGallery.length === 0) {
      if (gallery.length > 1 && colorList.length > 1) {
        const offset = cIdx % gallery.length;
        colorGallery = [...gallery.slice(offset), ...gallery.slice(0, offset)];
      } else {
        colorGallery = gallery;
      }
    }

    return {
      name: meta.name || colName,
      hex: meta.hex || "#333333",
      border: meta.border || null,
      slug: p.product_slug,
      productId: p.product_id,
      title: p.product_name,
      price,
      description: p.short_description || p.description || "",
      images: colorGallery,
       variants: buildVariantsForProduct(p.product_id, price, colName),
    };
  });

  return {
    ...mapProduct(p, bundle.media),
    gallery,
    variants,
    colors: colorVariants.map((c) => c.name),
    colorVariants,
    reviews: productReviews,
    ratingSummary: summary,
    related,
  };
  } catch (e) {
    console.error("getProduct failed", idOrSlug, e);
    return null;
  }
}

/**
 * @deprecated Unused reference — do not import.
 * Home sections now fetch their own data (VideoImageSlider, Spotlight,
 * HomeFaqs, OfferBar). Kept for reference only.
 */
export async function getHomeData() {
  const [sliders, spotlight, styleCollections, faqs, settings, products, media] =
    await Promise.all([
      apiGet("/Image-Sliders").then(unwrap).catch(() => []),
      apiGet("/Spotlight-Entries").then(unwrap).catch(() => []),
      apiGet("/Style-Collections").then(unwrap).catch(() => []),
      apiGet("/FAQs").then(unwrap).catch(() => []),
      apiGet("/Settings").then(unwrap).catch(() => []),
      apiGet("/Products").then(unwrap).catch(() => []),
      apiGet("/Products-Media").then(unwrap).catch(() => []),
    ]);
  const live = products.filter((p) => p.isdeleted !== true && p.isactive !== false).slice(0, 8);
  return {
    sliders: sliders.filter((s) => s.isactive !== false),
    spotlight: spotlight.filter((s) => s.isactive !== false),
    styleCollections: styleCollections.filter((s) => s.isactive !== false),
    faqs: faqs.filter((f) => f.isactive !== false).slice(0, 6),
    settings,
    featured: live.map((p) => mapProduct(p, media)),
  };
}

// DB-slug fallback: single-segment URLs the hardcoded catalog.js keys don't
// know (admin-renamed/added Menu-Category, Menu-Sub-Category,
// Style-Collection, or Product slugs). Returns a renderable descriptor.
// Hardcoded slugs always win — call only when resolveSlug() misses.
// Lookups are always fresh (revalidate: 0): they run only when a cached page
// regenerates, so correctness costs ~4 API calls per regeneration, not per visit.
export async function resolveDbSlug(slugParts) {
  if (!Array.isArray(slugParts) || slugParts.length !== 1) return null;
  const key = String(slugParts[0] || "").toLowerCase();
  if (!key) return null;
  const fresh = { revalidate: 0 };
  try {
    const [cats, subs, cols, prods] = await Promise.all([
      apiGet("/Menu-Category", fresh).then(unwrap).catch(() => []),
      apiGet("/Menu-Sub-Category", fresh).then(unwrap).catch(() => []),
      apiGet("/Style-Collections", fresh).then(unwrap).catch(() => []),
      apiGet("/Products", { params: { pageSize: 200 }, ...fresh }).then(unwrap).catch(() => []),
    ]);
    const cat = (Array.isArray(cats) ? cats : []).find(
      (c) =>
        String(c.menu_category_slug || "").toLowerCase() === key &&
        c.isactive !== false &&
        c.isdeleted !== true
    );
    if (cat) {
      return {
        type: "db-category",
        title: cat.menu_category_name || cat.menu_category_slug,
        keywords: [cat.menu_category_name, cat.menu_category_slug].filter(Boolean),
      };
    }
    const sub = (Array.isArray(subs) ? subs : []).find(
      (s) =>
        String(s.menu_subcategory_slug || "").toLowerCase() === key &&
        s.isactive !== false &&
        s.isdeleted !== true
    );
    if (sub) {
      return {
        type: "db-category",
        title: sub.menu_subcategory_name || sub.menu_subcategory_slug,
        keywords: [sub.menu_subcategory_name, sub.menu_subcategory_slug].filter(Boolean),
        redirect: sub.redirect_link || null,
      };
    }
    const col = (Array.isArray(cols) ? cols : []).find(
      (c) =>
        String(c.collection_slug || "").toLowerCase() === key &&
        c.isactive !== false &&
        c.isdeleted !== true
    );
    if (col) {
      return {
        type: "db-collection",
        title: col.collection_name || col.collection_slug,
        keywords: [col.collection_name, col.collection_slug].filter(Boolean),
        row: col,
      };
    }
    // Top-level product slug (/<product-slug> without the /product/ prefix).
    // Last resort — categories, subs and collections win on collision.
    const prod = (Array.isArray(prods) ? prods : []).find(
      (p) =>
        String(p.product_slug || "").toLowerCase() === key &&
        p.isactive !== false &&
        p.isdeleted !== true
    );
    if (prod) {
      return { type: "product", id: prod.product_slug };
    }
  } catch {
    /* unreachable backend — caller falls through to notFound */
  }
  return null;
}
