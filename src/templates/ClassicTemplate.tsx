"use client";

import React from "react";

import {
  DocumentItem,
  calcSubtotal,
  calcDiscount,
  calcTax,
  calcTotal,
} from "@/lib/types";

import { t, formatDate, Language } from "@/lib/i18n";
import { formatCurrency } from "@/lib/formatCurrency";

import { DocumentTemplateProps } from "./types";

export default function ClassicTemplate({
  doc,
  company,
}: DocumentTemplateProps) {
  const lang = doc.language as Language;

  const dir = lang === "ar" ? "rtl" : "ltr";

  const currency =
    doc.currency || company.currency || "USD";

  const items = doc.items as DocumentItem[];

  const subtotal = calcSubtotal(items);

  const discountAmount = calcDiscount(
    subtotal,
    doc.discount,
    doc.discountType
  );

  const taxAmount = calcTax(
    subtotal,
    discountAmount,
    doc.taxRate
  );

  const total = calcTotal(
    subtotal,
    discountAmount,
    taxAmount
  );

  const isInvoice = doc.type === "invoice";

  const getStatusLabel = () => {
    const statusMap: Record<string, string> = {
      draft: t(lang, "draft"),
      sent: t(lang, "sent"),
      paid: t(lang, "paid"),
      overdue: t(lang, "overdue"),
      expired: t(lang, "expired"),
    };

    return statusMap[doc.status] ?? doc.status;
  };

  return (
    <div
      dir={dir}
      style={{
        fontFamily:
          lang === "ar"
            ? "'Noto Sans Arabic', Arial, sans-serif"
            : "'Times New Roman', serif",
      }}
      className="mx-auto w-full max-w-[210mm] min-h-[297mm] bg-white text-black print:min-h-0"
    >
      <div className="p-10">
        <h1 className="text-3xl font-bold">
          Classic Template
        </h1>

        <p className="mt-3 text-gray-600">
          {company.name}
        </p>

        <p className="mt-2">
          {isInvoice
            ? t(lang, "invoice")
            : t(lang, "quote")}
        </p>

        <p className="mt-2">
          {doc.number}
        </p>

        <p className="mt-2">
          {formatDate(doc.date, lang)}
        </p>

        <p className="mt-2">
          {getStatusLabel()}
        </p>
      </div>
    </div>
  );
}
