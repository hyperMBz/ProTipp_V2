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

// Smooth scrolling utility function
export function scrollToSection(sectionId: string, offset = 80) {
  const element = document.getElementById(sectionId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Handle hash navigation
export function handleHashNavigation() {
  const hash = window.location.hash
  if (hash) {
    const sectionId = hash.substring(1) // Remove the '#'
    // Wait for components to render and then scroll
    setTimeout(() => scrollToSection(sectionId), 500)
  }
}
