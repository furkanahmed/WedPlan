export const WEDDING_CATEGORIES = [
  { name: "Photography & Videography", slug: "photography-videography" },
  { name: "Wedding Venues", slug: "wedding-venues" },
  { name: "Decoration & Florist", slug: "decoration-florist" },
  { name: "Catering Services", slug: "catering-services" },
  { name: "Makeup & Styling", slug: "makeup-styling" },
  { name: "Wedding Fashion", slug: "wedding-fashion" },
];

export function getWeddingCategory(value) {
  return WEDDING_CATEGORIES.find(
    (category) => category.slug === value || category.name === value,
  )?.name ?? "";
}
