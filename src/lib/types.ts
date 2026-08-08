/* =========================================
   DOCUMENT ITEM
========================================= */

export interface DocumentItem {
  id: string;

  description: string;

  quantity: number;

  unitPrice: number;

  total: number;
}

/* =========================================
   DOCUMENT
========================================= */

export interface DocumentData {
  id?: number;

  type:
    | "invoice"
    | "quote";

  number: string;

  date: string;

  dueDate: string;

  /* Client */

  clientName: string;

  clientPhone: string;

  clientEmail: string;

  clientAddress: string;

  /* Items */

  items: DocumentItem[];

  /* Tax */

  taxRate: number;

  /* Discount */

  discount: number;

  discountType:
    | "fixed"
    | "percentage";

  /* Status */

  status:
    | "draft"
    | "sent"
    | "paid"
    | "overdue"
    | "expired";

  /* =====================================
     Invoice Template
  ===================================== */

  template:
    | "classic"
    | "modern"
    | "minimal"
    | "elegant";

  /* =====================================
     Language
  ===================================== */

  language:
    | "ar"
    | "fr"
    | "en";

  /* Notes */

  notes: string;

  /* Currency */

  currency: string;

  /* Quote → Invoice conversion */

  convertedFrom?: number;

  /* Timestamps */

  createdAt?: string;

  updatedAt?: string;
}

/* =========================================
   COMPANY
========================================= */

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

/* =========================================
   CLIENT
========================================= */

export interface ClientData {
  id?: number;

  name: string;

  phone: string;

  email?: string;

  address?: string;
}

/* =========================================
   CALCULATIONS
========================================= */

/*
 * Subtotal
 *
 * Important:
 * Keep the existing document calculation
 * logic unchanged.
 */

export function calcSubtotal(
  items: DocumentItem[]
): number {
  return items.reduce(
    (sum, item) =>
      sum + item.total,
    0
  );
}

/* =========================================
   DISCOUNT
========================================= */

export function calcDiscount(
  subtotal: number,
  discount: number,
  discountType:
    | "fixed"
    | "percentage"
): number {
  if (
    discountType === "percentage"
  ) {
    return (
      subtotal *
      discount
    ) / 100;
  }

  return discount;
}

/* =========================================
   TAX
========================================= */

export function calcTax(
  subtotal: number,
  discountAmount: number,
  taxRate: number
): number {
  return (
    (
      subtotal -
      discountAmount
    ) *
    taxRate
  ) / 100;
}

/* =========================================
   TOTAL
========================================= */

export function calcTotal(
  subtotal: number,
  discountAmount: number,
  taxAmount: number
): number {
  return (
    subtotal -
    discountAmount +
    taxAmount
  );
}
