export const DateFormatter = {
  format: (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
};

/**
 * Format a date string to a more user-friendly format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    // Format as: "Jan 1, 2023"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
}

export const formatCurrency = (amount: number | undefined | null, currency = 'USD') => {
  if (amount === undefined || amount === null) return "—";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};
