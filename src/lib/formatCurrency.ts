import { getCurrency } from "./currencies";

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode || "MAD");
  const value = Number.isFinite(amount) ? amount : 0;
  return `${currency.symbol} ${value.toFixed(2)}`;
}
