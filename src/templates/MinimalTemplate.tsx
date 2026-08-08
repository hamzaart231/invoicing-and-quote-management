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

export default function MinimalTemplate({
  doc,
  company,
}: DocumentTemplateProps) {
  const lang = doc.language as Language;

  const dir = lang === "ar" ? "rtl" : "ltr";

  const currency =
    doc.currency ||
    company.currency ||
    "USD";

  const items = doc.items as DocumentItem[];

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
            : "'Inter', Arial, sans-serif",
      }}
      className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white text-slate-900 print:min-h-0"
    >
      <div className="p-10">

        {/* Header */}
        <header className="flex items-start justify-between gap-10 border-b border-slate-200 pb-8">

          <div className="flex-1">

            {company.logo && (
              <img
                src={company.logo}
                alt="Company Logo"
                className="mb-5 h-16 max-w-[180px] object-contain"
              />
            )}

            <h1 className="text-2xl font-semibold tracking-tight">
              {company.name}
            </h1>

            <div className="mt-3 space-y-1 text-sm text-slate-500">

              {company.address && (
                <p>
                  {company.address}
                </p>
              )}

              {company.phone && (
                <p>
                  {company.phone}
                </p>
              )}

              {company.email && (
                <p>
                  {company.email}
                </p>
              )}

              {company.ice && (
                <p>
                  ICE: {company.ice}
                </p>
              )}

            </div>

          </div>

          <div
            className={
              dir === "rtl"
                ? "text-left"
                : "text-right"
            }
          >

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              {isInvoice
                ? t(lang, "invoice")
                : t(lang, "quote")}
            </p>

            <h2 className="mt-2 text-3xl font-light tracking-tight">
              {doc.number}
            </h2>

            <div className="mt-5 space-y-1 text-sm text-slate-500">

              <p>
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
                {getStatusLabel()}
              </p>

            </div>

          </div>

        </header>

      </div>
    </div>
  );
      }
