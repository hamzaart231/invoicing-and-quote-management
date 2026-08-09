"use client";

import React from "react";

import {
  DocumentItem,
  calcSubtotal,
  calcDiscount,
  calcTax,
  calcTotal,
} from "@/lib/types";

import {
  t,
  formatDate,
  Language,
} from "@/lib/i18n";

import { formatCurrency } from "@/lib/formatCurrency";
import { DocumentTemplateProps } from "./types";

export default function ElegantTemplate({
  doc,
  company,
}: DocumentTemplateProps) {
  const lang = doc.language as Language;

  const dir =
    lang === "ar" ? "rtl" : "ltr";

  const currency =
    doc.currency ||
    company.currency ||
    "USD";

  const items =
    doc.items as DocumentItem[];

  const subtotal =
    calcSubtotal(items);

  const discountAmount =
    calcDiscount(
      subtotal,
      doc.discount,
      doc.discountType
    );

  const taxAmount =
    calcTax(
      subtotal,
      discountAmount,
      doc.taxRate
    );

  const total =
    calcTotal(
      subtotal,
      discountAmount,
      taxAmount
    );

  const isInvoice =
    doc.type === "invoice";

  const getStatusLabel = () => {
    const statusMap: Record<string, string> = {
      draft: t(lang, "draft"),
      sent: t(lang, "sent"),
      paid: t(lang, "paid"),
      overdue: t(lang, "overdue"),
      expired: t(lang, "expired"),
    };

    return (
      statusMap[doc.status] ??
      doc.status
    );
  };

  return (
    <div
      dir={dir}
      style={{
        fontFamily:
          lang === "ar"
            ? "'Noto Sans Arabic', Arial, sans-serif"
            : "Georgia, 'Times New Roman', serif",
      }}
      className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-[#fffdf8] text-stone-800 print:min-h-0"
    >
      <div className="p-10">

        {/* Elegant Header */}
        <header className="border-b border-amber-700/40 pb-8">

          <div className="flex items-start justify-between gap-10">

            {/* Company */}
            <div className="flex-1">

              {company.logo && (
                <img
                  src={company.logo}
                  alt="Company Logo"
                  className="mb-5 h-20 max-w-[190px] object-contain"
                />
              )}

              <h1 className="text-3xl font-semibold tracking-wide text-stone-900">
                {company.name}
              </h1>

              <div className="mt-4 space-y-1 text-sm leading-6 text-stone-500">

                {company.address && (
                  <p>{company.address}</p>
                )}

                {company.phone && (
                  <p>{company.phone}</p>
                )}

                {company.email && (
                  <p>{company.email}</p>
                )}

                {company.ice && (
                  <p>ICE: {company.ice}</p>
                )}

              </div>

            </div>

            {/* Document Title */}
            <div
              className={
                dir === "rtl"
                  ? "text-left"
                  : "text-right"
              }
            >

              <div className="mb-3 inline-block border-b-2 border-amber-700 pb-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-800">
                {isInvoice
                  ? t(lang, "invoice")
                  : t(lang, "quote")}
              </div>

              <h2 className="text-4xl font-light tracking-tight text-stone-900">
                {doc.number}
              </h2>

              <div className="mt-5 space-y-2 text-sm text-stone-500">

                <p>
                  {t(lang, "date")}:{" "}
                  {formatDate(
                    doc.date,
                    lang
                  )}
                </p>

                {doc.dueDate && (
                  <p>
                    {t(lang, "dueDate")}:{" "}
                    {formatDate(
                      doc.dueDate,
                      lang
                    )}
                  </p>
                )}

                <p>
                  {t(lang, "status")}:{" "}
                  <span className="font-semibold text-amber-800">
                    {getStatusLabel()}
                  </span>
                </p>

              </div>

            </div>

          </div>

        </header>

      </div>
    </div>
  );
      }
