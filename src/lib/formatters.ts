import { format } from 'date-fns';

/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
}

/**
 * Formats a date to a short format (e.g., "Jan 1")
 * @param dateString ISO date string
 * @returns Formatted date
 */
export function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d');
  } catch (error) {
    return dateString;
  }
}

/**
 * Formats a date to include time (e.g., "Jan 1, 2023 3:45 PM")
 * @param dateString ISO date string
 * @returns Formatted date with time
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    return dateString;
  }
}