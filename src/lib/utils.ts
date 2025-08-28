import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix for hydration mismatch - server/client consistent formatting
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('hu-HU').format(value)
}

// Adds two numbers (pure function for testing)
export function addNumbers(a: number, b: number): number {
  return a + b
}
