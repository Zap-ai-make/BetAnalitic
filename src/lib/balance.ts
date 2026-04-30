export interface Balance { amount: number; currency: "FCFA" | "USD" | "EUR" }

export const BALANCE_KEY = "betanalytic-virtual-balance"
export const COUPONS_KEY = "betanalytic-local-coupons"

const DEFAULT_BALANCE: Balance = { amount: 50000, currency: "FCFA" }

export function readBalance(): Balance {
  if (typeof window === "undefined") return DEFAULT_BALANCE
  try {
    const raw = localStorage.getItem(BALANCE_KEY)
    return raw ? (JSON.parse(raw) as Balance) : DEFAULT_BALANCE
  } catch {
    return DEFAULT_BALANCE
  }
}

export function writeBalance(b: Balance): void {
  localStorage.setItem(BALANCE_KEY, JSON.stringify(b))
}

export function fmtAmount(n: number, currency: string): string {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} ${currency}`
}
