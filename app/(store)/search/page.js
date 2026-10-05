"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, unwrap, resolveUploadUrl } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import "./search-page.css";

export const dynamic = "force-dynamic";

function SearchInner() {
  const params = useSearchParams();
  // Initial query comes straight from the URL at render time — no effect sync needed.
  const [q, setQ] = useState(() => params.get("q") || "");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [filters, setFilters] = useState({ size: "", fabric: "", color: "", minPrice: "", maxPrice: "" });
  const [filterData, setFilterData] = useState({ variants: [], values: [], attributes: [], sizes: [], fabrics: [] });

  const handleQueryChange = (e) => {
    const v = e.target.value;
    setQ(v);
    if (!v.trim()) {
      setResults([]);
      setSearched(false);
      setSearching(false);
      setSearchError("");
    }
  };

  const run = async (e, query) => {
    e?.preventDefault();
    const needle = (query ?? q).trim().toLowerCase();
    if (!needle) return;
    setSearching(true);
    setSearchError("");
    try {
      const [products, media, variants, values, attributes, sizes, fabrics] = await Promise.all([
        apiFetch("/Products").then(unwrap),
        apiFetch("/Products-Media").then(unwrap).catch(() => []),
        apiFetch("/Products-Variants").then(unwrap).catch(() => []),
        apiFetch("/Products-Attributes-Values").then(unwrap).catch(() => []),
        apiFetch("/Products-Attributes").then(unwrap).catch(() => []),
        apiFetch("/Products-Sizes").then(unwrap).catch(() => []),
        apiFetch("/Products-Cloth-Types").then(unwrap).catch(() => []),
      ]);
      setFilterData({ variants, values, attributes, sizes, fabrics });
      setResults(
        products
          .filter((p) => p.isdeleted !== true)
          .filter((p) =>
            `${p.product_name || ""} ${p.product_slug || ""} ${p.short_description || ""}`.toLowerCase().includes(needle)
          )
          .map((p) => {
            const m = media.find((x) => x.product_id === p.product_id && (x.isprimary === 1 || x.isprimary === true));
            return {
              id: p.product_id, slug: p.product_slug, name: p.product_name,
              price: Number(p.base_price) || 0, image: resolveUploadUrl(m?.media_url) || null, category: p.category || "",
            };
          })
      );
      setSearched(true);
    } catch {
      setSearchError("Failed to search products");
    } finally {
      setSearching(false);
    }
  };

  const sizeOptions = useMemo(() => filterData.sizes.map((s) => s.size_name || s.size_id).filter(Boolean), [filterData.sizes]);
  const fabricOptions = useMemo(() => filterData.fabrics.map((f) => f.cloth_type_name || f.cloth_type_id).filter(Boolean), [filterData.fabrics]);
  const colorAttributeIds = useMemo(() => filterData.attributes.filter((a) => (a.attribute_name || a.attribute_slug || "").toLowerCase() === "color").map((a) => a.attribute_id), [filterData.attributes]);
  const colorOptions = useMemo(() => [...new Set(filterData.values.filter((v) => !colorAttributeIds.length || colorAttributeIds.includes(v.attribute_id)).map((v) => v.attribute_value).filter(Boolean))], [filterData.values, colorAttributeIds]);
  const priceBounds = useMemo(() => {
    const prices = results.map((p) => p.price).filter((price) => price > 0);
    return { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 };
  }, [results]);
  const filteredResults = useMemo(() => results.filter((p) => {
    const variants = filterData.variants.filter((v) => v.product_id === p.id);
    if (filters.size && !variants.some((v) => String(v.size_id) === String(filters.size) || filterData.sizes.find((s) => String(s.size_id) === String(v.size_id))?.size_name === filters.size)) return false;
    if (filters.fabric && !variants.some((v) => String(v.cloth_type_id) === String(filters.fabric) || filterData.fabrics.find((f) => String(f.cloth_type_id) === String(v.cloth_type_id))?.cloth_type_name === filters.fabric)) return false;
    if (filters.color && !filterData.values.some((v) => v.product_id === p.id && v.attribute_value?.toLowerCase() === filters.color.toLowerCase())) return false;
    if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
    return true;
  }), [results, filters, filterData]);
  const showFilters = searched && filteredResults.length > 1;

  // Auto-run once when landing with ?q= (state updates only in async continuation).
  useEffect(() => {
    const initial = params.get("q");
    if (!initial) return undefined;
    let live = true;
    const needle = initial.trim().toLowerCase();
    Promise.all([
      apiFetch("/Products").then(unwrap),
      apiFetch("/Products-Media").then(unwrap).catch(() => []),
      apiFetch("/Products-Variants").then(unwrap).catch(() => []),
      apiFetch("/Products-Attributes-Values").then(unwrap).catch(() => []),
      apiFetch("/Products-Attributes").then(unwrap).catch(() => []),
      apiFetch("/Products-Sizes").then(unwrap).catch(() => []),
      apiFetch("/Products-Cloth-Types").then(unwrap).catch(() => []),
    ]).then(([products, media, variants, values, attributes, sizes, fabrics]) => {
      if (!live) return;
      setFilterData({ variants, values, attributes, sizes, fabrics });
      setResults(
        products
          .filter((p) => p.isdeleted !== true)
          .filter((p) =>
            `${p.product_name || ""} ${p.product_slug || ""} ${p.short_description || ""}`.toLowerCase().includes(needle)
          )
          .map((p) => {
            const m = media.find((x) => x.product_id === p.product_id && (x.isprimary === 1 || x.isprimary === true));
             return { id: p.product_id, slug: p.product_slug, name: p.product_name, price: Number(p.base_price) || 0, image: resolveUploadUrl(m?.media_url) || null, category: p.category || "" };
          })
      );
      setSearched(true);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="search-page">
      <h2 className="search-page__title">
        {q ? `Search results for "${q}"` : "Search Products"}
      </h2>
      <form onSubmit={run} className="search-page__form">
        <input value={q} onChange={handleQueryChange} placeholder="Suits, shirts, wedding…" />
        <button>Search</button>
      </form>
      <div className={`search-page__layout${showFilters ? " search-page__layout--with-filters" : ""}`}>
       {showFilters && <aside className="search-page__filters">
        <span className="search-page__filters-label">Filter by</span>
         <label>Size<select value={filters.size} onChange={(e) => setFilters((f) => ({ ...f, size: e.target.value }))}><option value="">All sizes</option>{sizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
         <label>Fabric<select value={filters.fabric} onChange={(e) => setFilters((f) => ({ ...f, fabric: e.target.value }))}><option value="">All fabrics</option>{fabricOptions.map((fabric) => <option key={fabric} value={fabric}>{fabric}</option>)}</select></label>
         <label>Color<select value={filters.color} onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))}><option value="">All colors</option>{colorOptions.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
         <span className="search-page__price-label">Price Range</span>
        <input type="number" min="0" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} placeholder="Min price" />
         <input type="number" min="0" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} placeholder="Max price" />
         <span className="search-page__range">Range: ₹{priceBounds.min.toLocaleString("en-IN")} - ₹{priceBounds.max.toLocaleString("en-IN")}</span>
         <button type="button" onClick={() => setFilters({ size: "", fabric: "", color: "", minPrice: "", maxPrice: "" })}>Clear</button>
       </aside>}
       <section className="search-page__results">
       {searchError && <p className="mt-4 text-center text-sm text-red-600">{searchError}</p>}
       {searching && (
        <p className="mt-8 text-center text-sm text-neutral-500">
           Searching...
        </p>
      )}
       {!searching && searched && filteredResults.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
           {filteredResults.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
       {!searching && searched && filteredResults.length === 0 && (
        <div className="search-page__empty">
          <h4>No products found</h4>
          <p>Try adjusting filters or search term.</p>
        </div>
       )}
       </section>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-7xl px-4 py-14">Loading search…</p>}>
      <SearchInner />
    </Suspense>
  );
}
