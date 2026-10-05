import { apiGet, unwrap, resolveUploadUrl } from "@/lib/api";
import NewArrivalsLanding from "@/components/NewArrivalsLanding";

export const revalidate = 300;
export const metadata = { title: "New Arrivals" };

// New Arrivals: same structure/texts as the previous UI.
export default async function NewArrivalsPage() {
  const [products, media] = await Promise.all([
    apiGet("/Products", { params: { pageSize: 200 }, revalidate: 0 }).then(unwrap).catch(() => []),
    apiGet("/Products-Media", { params: { pageSize: 200 }, revalidate: 0 }).then(unwrap).catch(() => []),
  ]);
  const latest = products
    .filter((p) => p.isdeleted !== true && (p.isactive === 1 || p.isactive === true || p.is_active === 1 || p.is_active === true))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 24)
    .map((p) => {
      const m =
        media.find((x) => x.product_id === p.product_id && (x.isprimary === 1 || x.isprimary === true)) ||
        media.find((x) => x.product_id === p.product_id);
      return {
        id: p.product_id,
        slug: p.product_slug,
        name: p.product_name,
        subtitle: p.short_description || "",
        price: p.base_price,
        originalPrice: p.original_price,
        colors: p.colors || [],
        image: resolveUploadUrl(m?.media_url || m?.image_url) || null,
      };
    });

  return (
    <NewArrivalsLanding products={latest} />
  );
}
