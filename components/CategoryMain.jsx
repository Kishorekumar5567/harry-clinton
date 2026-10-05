import Link from "next/link";
import { apiGet, unwrap, resolveUploadUrl } from "@/lib/api";
import { CATEGORY_MAINS } from "@/lib/catalog";
import CategoryHero from "@/components/CategoryHero";
import "./category-main.css";

export default async function CategoryMain({ category }) {
  const main = CATEGORY_MAINS[category];
  const [cats, subs, settings] = await Promise.all([
    apiGet("/Menu-Category").then(unwrap).catch(() => []),
    apiGet("/Menu-Sub-Category").then(unwrap).catch(() => []),
    apiGet("/Settings").then(unwrap).catch(() => []),
  ]);

  const settingsList = Array.isArray(settings) ? settings : [];
  const getSetting = (key) => {
    const row = settingsList.find(
      (setting) => setting.setting_key?.toLowerCase() === key || setting.key?.toLowerCase() === key
    );
    return row?.setting_value ?? row?.value ?? "";
  };
  const settingKey = (suffix) => `category_${category.toLowerCase().replace(/\s+/g, "_")}_${suffix}`;
  const parseWords = (value) => {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };
  const categoryMedia = (value) => {
    if (!value) return null;
    // Keep local assets local; uploaded backend media still resolves to its origin.
    if (value.startsWith("/category-pages/")) return value;
    return resolveUploadUrl(value);
  };

  const matchedCategory = (Array.isArray(cats) ? cats : []).find(
    (row) =>
      row.menu_category_slug?.toLowerCase() === category.toLowerCase() ||
      row.menu_category_name?.toLowerCase() === category.toLowerCase()
  );

  const heroImage = categoryMedia(matchedCategory?.hero_image_url) || categoryMedia(getSetting(settingKey("hero_image"))) || main.heroImage;
  const heroTitle = matchedCategory?.hero_title || getSetting(settingKey("hero_title")) || main.heroTitle;
  const heroSubtitle = matchedCategory?.hero_subtitle || getSetting(settingKey("hero_subtitle")) || main.heroSubtitle;
  const rawHeroDescription = matchedCategory?.hero_description || getSetting(settingKey("hero_description")) || "";
  // The reference hero uses the subtitle as its single supporting line. Do
  // not render a duplicate admin description, while preserving any distinct
  // description entered later through the backend.
  const heroDescription = rawHeroDescription.trim() === String(heroSubtitle || "").trim() ? "" : rawHeroDescription;
  const heroCtaText = matchedCategory?.hero_cta_text || getSetting(settingKey("hero_cta_text")) || "Shop Now";
  const heroCtaLink = matchedCategory?.hero_cta_link || getSetting(settingKey("hero_cta_link")) || "#category-grid";
  const marquee = parseWords(matchedCategory?.marquee_words) || parseWords(getSetting(settingKey("marquee_words"))) || main.marquee;

  let subcategories = main.subs;
  if (matchedCategory) {
    const apiSubcategories = (Array.isArray(subs) ? subs : [])
      .filter((row) => String(row.menu_category_id) === String(matchedCategory.menu_category_id))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((row, index) => {
        const fallback = main.subs[index] || {};
        const name = row.menu_subcategory_name || fallback.name || "";
        const slug = row.menu_subcategory_slug || name.toLowerCase().replace(/\s+/g, "-");
        return {
          name,
          link:
            (row.redirect_link || "").replace(/^\/collection\//, "/") ||
            `/${slug}`,
          image: categoryMedia(row.menu_subcategory_image_url || row.image_url) || fallback.image || null,
          video: categoryMedia(row.video_url) || fallback.video || null,
        };
      });
    if (apiSubcategories.length > 0) {
      subcategories = apiSubcategories;
    }
  }
  const displayedSubcategories = subcategories;

  return (
    <>
      <CategoryHero image={heroImage} title={heroTitle} subtitle={heroSubtitle} description={heroDescription} ctaText={heroCtaText} ctaLink={heroCtaLink} />

      <div className="category-marquee" aria-label={marquee.join(" ")}>
        <div className="category-marquee__track" aria-hidden="true">
          {[0, 1, 2, 3].flatMap((copy) =>
            marquee.map((word, index) => (
              <span className="category-marquee__word" key={`${copy}-${index}`}>
                {word}
              </span>
            ))
          )}
        </div>
      </div>

      <section id="category-grid" className="category-cards" aria-label={`${heroTitle} categories`}>
        <div className="category-cards__row category-cards__row--three">
          {displayedSubcategories.slice(0, 3).map((item, index) => (
            <CategoryCard key={`${item.name}-${index}`} item={item} />
          ))}
        </div>
        {displayedSubcategories.length > 3 && (
          <div className="category-cards__row category-cards__row--two">
            {displayedSubcategories.slice(3).map((item, index) => (
              <CategoryCard key={`${item.name}-${index + 3}`} item={item} />
            ))}
          </div>
        )}
      </section>

    </>
  );
}

function CategoryCard({ item }) {
  const content = (
    <>
      {item.video ? (
        <video
          src={item.video}
          className="category-card__media"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={item.name}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image || "/brand/logo-black.png"}
          alt={item.name}
          className="category-card__media"
          loading="lazy"
        />
      )}
      <div className="category-card__shade" />
      <div className="category-card__title">{item.name}</div>
    </>
  );

  return item.link ? (
    <Link href={item.link} className="category-card">
      {content}
    </Link>
  ) : (
    <div className="category-card">{content}</div>
  );
}
