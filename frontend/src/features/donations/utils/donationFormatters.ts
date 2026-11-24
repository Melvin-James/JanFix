/**
 * Formats a monetary amount in paise to Indian Rupees string (e.g. ₹500)
 */
export function formatINRFromPaise(amountPaise: number): string {
  const rupees = amountPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Formats an ISO date string or Date object into a localized readable date-time string
 */
export function formatDonationDateTime(dateValue?: string | Date): string {
  if (!dateValue) return "N/A";
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
