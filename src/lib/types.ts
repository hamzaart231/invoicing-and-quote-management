export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DocumentData {
  id?: number;
  type: "invoice" | "quote";
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  items: DocumentItem[];
  taxRate: number;
  discount: number;
  discountType: "fixed" | "percentage";
  status: "draft" | "sent" | "paid" | "overdue" | "expired";
  template: "classic" | "modern" | "minimal";
  language: "ar" | "fr" | "en";
  notes: string;
  currency: string;
  convertedFrom?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyData {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  ice: string;
  logo: string;
  currency: string;
}

export interface ClientData {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export function calcSubtotal(items: DocumentItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

export function calcDiscount(subtotal: number, discount: number, discountType: "fixed" | "percentage"): number {
  if (discountType === "percentage") {
    return (subtotal * discount) / 100;
  }
  return discount;
}

export function calcTax(subtotal: number, discountAmount: number, taxRate: number): number {
  return ((subtotal - discountAmount) * taxRate) / 100;
}

export function calcTotal(subtotal: number, discountAmount: number, taxAmount: number): number {
  return subtotal - discountAmount + taxAmount;
}
