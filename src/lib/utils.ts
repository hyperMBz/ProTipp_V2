import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix for hydration mismatch - server/client consistent formatting
export function formatNumber(num: number): string {
  if (typeof window === 'undefined') {
    // Server side - use simple formatting
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  // Client side - use locale string
  return num.toLocaleString('hu-HU');
}
