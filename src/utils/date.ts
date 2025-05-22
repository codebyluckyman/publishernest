
import { format, parseISO } from "date-fns";

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @param formatStr - Format string (defaults to 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null | undefined, formatStr: string = 'MMM d, yyyy'): string => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date string to a localized date-time format
 * @param dateString - ISO date string
 * @returns Formatted date-time string
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return dateString;
  }
};

/**
 * Format a date to just the year
 * @param dateString - ISO date string
 * @returns Year string
 */
export const formatYear = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'yyyy');
  } catch (error) {
    console.error('Error formatting year:', error);
    return dateString;
  }
};
