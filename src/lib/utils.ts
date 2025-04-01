
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // If the date is invalid, return "Invalid date"
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    // Option 1: Shorter format like "MMM d, yyyy"
    const shortFormat = format(dateObj, "MMM d, yyyy");
    
    // Option 2: Longer format with full month name
    const longFormat = dateObj.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return shortFormat; // You can toggle between shortFormat and longFormat
  } catch (err) {
    console.error("Error formatting date:", err);
    return 'Invalid date';
  }
}

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (err) {
    console.error("Error formatting currency:", err);
    return `${amount} ${currencyCode}`;
  }
};
