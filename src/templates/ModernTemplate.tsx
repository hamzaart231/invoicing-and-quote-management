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

export default function ModernTemplate({
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
            : "'Inter', Arial, sans-serif",
      }}
      className="mx-auto w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-800 print:min-h-0"
    >
      {/* Header */}
      <header className="border-b border-slate-200 px-10 py-8">
        <div className="flex items-start justify-between gap-8">

          {/* Company */}

          <div className="flex-1">

            {company.logo && (
              <img
                src={company.logo}
                alt="Company Logo"
                className="mb-6 h-20 object-contain"
              />
            )}

            <h1 className="text-3xl font-bold text-slate-900">
              {company.name}
            </h1>

            <div className="mt-5 space-y-2 text-sm text-slate-600">

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
                <p>ICE : {company.ice}</p>
              )}

            </div>

          </div>

          {/* Invoice Card */}

          <div className="w-[320px] rounded-2xl bg-slate-900 p-7 text-white shadow-xl">

            <h2 className="mb-6 text-3xl font-bold">

              {isInvoice
                ? t(lang, "invoice")
                : t(lang, "quote")}

            </h2>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">

                <span className="opacity-80">
                  {t(lang, "number")}
                </span>

                <strong>{doc.number}</strong>

              </div>

              <div className="flex justify-between">

                <span className="opacity-80">
                  {t(lang, "date")}
                </span>

                <strong>
                  {formatDate(doc.date, lang)}
                </strong>

              </div>

              {doc.dueDate && (

                <div className="flex justify-between">

                  <span className="opacity-80">
                    {t(lang, "dueDate")}
                  </span>

                  <strong>
                    {formatDate(doc.dueDate, lang)}
                  </strong>

                </div>

              )}

              <div className="pt-4">

                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900">

                  {getStatusLabel()}

                </span>

              </div>

            </div>

          </div>

        </div>
      </header>
      <main className="px-10 py-8 space-y-8">

  {/* Customer & Invoice Details */}

  <section className="grid grid-cols-2 gap-8">

    {/* Customer */}

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {t(lang, "client")}
      </p>

      <h2 className="text-xl font-semibold text-slate-900">
        {doc.clientName}
      </h2>

      <div className="mt-5 space-y-2 text-sm text-slate-600">

        {doc.clientAddress && (
          <p>{doc.clientAddress}</p>
        )}

        {doc.clientPhone && (
          <p>{doc.clientPhone}</p>
        )}

        {doc.clientEmail && (
          <p>{doc.clientEmail}</p>
        )}

      </div>

    </div>

    {/* Invoice Summary */}

    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {t(lang, "invoice")}
      </p>

      <div className="space-y-4">

        <div className="flex justify-between">

          <span className="text-slate-500">
            {t(lang, "number")}
          </span>

          <strong>{doc.number}</strong>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-500">
            {t(lang, "date")}
          </span>

          <strong>
            {formatDate(doc.date, lang)}
          </strong>

        </div>

        {doc.dueDate && (

          <div className="flex justify-between">

            <span className="text-slate-500">
              {t(lang, "dueDate")}
            </span>

            <strong>
              {formatDate(doc.dueDate, lang)}
            </strong>

          </div>

        )}

        <div className="flex justify-between">

          <span className="text-slate-500">
            {t(lang, "status")}
          </span>

          <strong>
            {getStatusLabel()}
          </strong>

        </div>

      </div>

    </div>

  </section>

</main>
