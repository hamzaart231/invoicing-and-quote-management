export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: Currency[] = [
  { code: "MAD", symbol: "د.م", name: "Moroccan Dirham" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar" },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
];

export function getCurrency(code: string): Currency {
  return currencies.find(c => c.code === code) ?? currencies[0];
}
