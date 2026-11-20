export function formatTaka(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount < 0) {
    return "Price unavailable";
  }

  return `৳${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
