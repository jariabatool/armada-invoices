const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export const formatCurrency = (amount: number): string => currencyFormatter.format(amount);

/** "2026-10-15" -> "Oct 15, 2026" (treated as a calendar date, no timezone shift). */
export const formatDate = (isoDate: string): string => dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));

export const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
