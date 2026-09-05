/**
 * Common formatting utilities for Urban Furniture Accounting System
 */

/**
 * Format a number or numeric string as currency in Indian Rupees format.
 * Example: 25000 -> "Rs. 25,000"
 */
export const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return "Rs. " + num.toLocaleString();
};

/**
 * Format date string into readable US format (e.g.,"Sep 5, 2026").
 * Falls back to displayStr or raw string if parsing fails.
 */
export const formatDate = (dateStr, displayStr) => {
  if (displayStr) return displayStr;
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};
