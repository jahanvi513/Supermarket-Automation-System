import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

// Calculate discount
export function calculateDiscount(
  price: number,
  discount: number,
  type: "percentage" | "fixed" = "percentage",
): number {
  if (type === "percentage") {
    return price * (discount / 100)
  }
  return discount
}

// Calculate total with tax
export function calculateTotalWithTax(subtotal: number, taxRate = 0.08): number {
  return subtotal * (1 + taxRate)
}

// Generate random ID
export function generateId(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}`
}

// Check if a value is empty
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}

// Truncate text
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
