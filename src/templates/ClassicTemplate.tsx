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

export default function ClassicTemplate({
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

  /* =========================================
     EXISTING CALCULATIONS
     DO NOT CHANGE
  ========================================= */

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

  /* =========================================
     STATUS
  ========================================= */

  const getStatusLabel = () => {
    const statusMap: Record<
      string,
      string
    > = {
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
            : "'Times New Roman', Georgia, serif",
      }}
      className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white text-slate-900 print:min-h-0"
    >
      <div className="p-10 print:p-[10mm]">

        {/* =====================================
            HEADER
        ====================================== */}

        <header className="border-b-2 border-slate-700 pb-7">

          <div className="flex items-start justify-between gap-10">

            {/* Company */}

            <div className="min-w-0 flex-1">

              {company.logo && (
                <img
                  src={company.logo}
                  alt="Company Logo"
                  className="mb-4 h-20 max-w-[190px] object-contain"
                />
              )}

              <h1 className="text-3xl font-bold tracking-wide text-slate-900">
                {company.name}
              </h1>

              <div className="mt-4 space-y-1 text-sm leading-6 text-slate-600">

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

            {/* Document Heading */}

            <div
              className={`shrink-0 ${
                dir === "rtl"
                  ? "text-left"
                  : "text-right"
              }`}
            >

              <h2 className="text-4xl font-bold uppercase tracking-wider text-slate-800">

                {isInvoice
                  ? t(
                      lang,
                      "invoice"
                    )
                  : t(
                      lang,
                      "quote"
                    )}

              </h2>

              <p
                className="mt-4 whitespace-nowrap text-lg font-semibold"
                dir="ltr"
              >
                {doc.number}
              </p>

              <div className="mt-3 space-y-1 text-sm text-slate-600">

                <p className="whitespace-nowrap">
                  {formatDate(
                    doc.date,
                    lang
                  )}
                </p>

                {doc.dueDate && (
                  <p className="whitespace-nowrap">
                    {t(
                      lang,
                      "dueDate"
                    )}
                    :{" "}
                    {formatDate(
                      doc.dueDate,
                      lang
                    )}
                  </p>
                )}

                <p className="font-semibold">
                  {getStatusLabel()}
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* =====================================
            CLIENT / DOCUMENT DETAILS
        ====================================== */}

        <section className="grid grid-cols-2 gap-10 border-b border-slate-300 py-8">

          {/* Client */}

          <div className="min-w-0">

            <h3 className="mb-4 border-b border-slate-400 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
              {t(
                lang,
                "client"
              )}
            </h3>

            <p className="text-lg font-bold text-slate-900">
              {doc.clientName}
            </p>

            <div className="mt-3 space-y-1 text-sm leading-6 text-slate-600">

              {doc.clientAddress && (
                <p>
                  {doc.clientAddress}
                </p>
              )}

              {doc.clientPhone && (
                <p dir="ltr">
                  {doc.clientPhone}
                </p>
              )}

              {doc.clientEmail && (
                <p className="break-all">
                  {doc.clientEmail}
                </p>
              )}

            </div>

          </div>

          {/* Document Details */}

          <div className="min-w-0">

            <h3 className="mb-4 border-b border-slate-400 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">

              {isInvoice
                ? t(
                    lang,
                    "invoice"
                  )
                : t(
                    lang,
                    "quote"
                  )}

            </h3>

            <div className="space-y-3 text-sm">

              <div className="flex items-start justify-between gap-6">

                <span className="font-bold">
                  {t(
                    lang,
                    "number"
                  )}
                </span>

                <span
                  dir="ltr"
                  className="whitespace-nowrap"
                >
                  {doc.number}
                </span>

              </div>

              <div className="flex items-start justify-between gap-6">

                <span className="font-bold">
                  {t(
                    lang,
                    "date"
                  )}
                </span>

                <span className="whitespace-nowrap">
                  {formatDate(
                    doc.date,
                    lang
                  )}
                </span>

              </div>

              {doc.dueDate && (
                <div className="flex items-start justify-between gap-6">

                  <span className="font-bold">
                    {t(
                      lang,
                      "dueDate"
                    )}
                  </span>

                  <span className="whitespace-nowrap">
                    {formatDate(
                      doc.dueDate,
                      lang
                    )}
                  </span>

                </div>
              )}

              <div className="flex items-start justify-between gap-6">

                <span className="font-bold">
                  {t(
                    lang,
                    "status"
                  )}
                </span>

                <span>
                  {getStatusLabel()}
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            ITEMS TABLE
        ====================================== */}

        <section className="mt-8">

          <table className="w-full table-fixed border-collapse text-sm">

            <thead>
              <tr className="bg-slate-700 text-white">

                <th
                  className={`w-[32%] border border-slate-500 px-3 py-3 font-bold ${
                    dir === "rtl"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {t(
                    lang,
                    "description"
                  )}
                </th>

                <th className="w-[13%] border border-slate-500 px-2 py-3 text-center font-bold">
                  {t(
                    lang,
                    "quantity"
                  )}
                </th>

                <th className="w-[20%] border border-slate-500 px-2 py-3 text-center font-bold">
                  {t(
                    lang,
                    "unitPrice"
                  )}
                </th>

                <th className="w-[15%] border border-slate-500 px-2 py-3 text-center font-bold">
                  {t(
                    lang,
                    "tax"
                  )}
                </th>

                <th
                  className={`w-[20%] border border-slate-500 px-3 py-3 font-bold ${
                    dir === "rtl"
                      ? "text-left"
                      : "text-right"
                  }`}
                >
                  {t(
                    lang,
                    "lineTotal"
                  )}
                </th>

              </tr>
            </thead>

            <tbody>

              {items.map(
                (item, index) => (

                  <tr
                    key={
                      item.id ||
                      index
                    }
                    className="bg-white"
                  >

                    <td
                      className={`break-words border border-slate-300 px-3 py-3 ${
                        dir === "rtl"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {item.description}
                    </td>

                    <td className="border border-slate-300 px-2 py-3 text-center">
                      {item.quantity}
                    </td>

                    <td
                      dir="ltr"
                      className="border border-slate-300 px-2 py-3 text-center"
                    >
                      {formatCurrency(
                        Number(
                          item.unitPrice
                        ),
                        currency
                      )}
                    </td>

                    <td
                      dir="ltr"
                      className="border border-slate-300 px-2 py-3 text-center"
                    >
                      {doc.taxRate}%
                    </td>

                    <td
                      dir="ltr"
                      className={`border border-slate-300 px-3 py-3 font-semibold ${
                        dir === "rtl"
                          ? "text-left"
                          : "text-right"
                      }`}
                    >
                      {formatCurrency(
                        Number(
                          item.total
                        ),
                        currency
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </section>

        {/* =====================================
            TOTALS
            IMPORTANT: ONLY ONE TOTALS SECTION
        ====================================== */}

        <section
          className={`mt-8 flex ${
            dir === "rtl"
              ? "justify-start"
              : "justify-end"
          }`}
        >

          <div className="w-full max-w-sm text-sm">

            {/* Subtotal */}

            <div className="flex justify-between gap-6 border-b border-slate-300 px-4 py-3">

              <span className="font-semibold">
                {t(
                  lang,
                  "subtotal"
                )}
              </span>

              <span
                dir="ltr"
                className="whitespace-nowrap"
              >
                {formatCurrency(
                  Number(
                    subtotal
                  ),
                  currency
                )}
              </span>

            </div>

            {/* Discount */}

            {discountAmount >
              0 && (

              <div className="flex justify-between gap-6 border-b border-slate-300 px-4 py-3">

                <span>

                  {t(
                    lang,
                    "discount"
                  )}

                  {doc.discountType ===
                  "percentage"
                    ? ` (${doc.discount}%)`
                    : ""}

                </span>

                <span
                  dir="ltr"
                  className="whitespace-nowrap"
                >
                  -{" "}
                  {formatCurrency(
                    Number(
                      discountAmount
                    ),
                    currency
                  )}
                </span>

              </div>

            )}

            {/* Tax */}

            <div className="flex justify-between gap-6 border-b border-slate-300 px-4 py-3">

              <span>
                {t(
                  lang,
                  "tax"
                )}{" "}
                ({doc.taxRate}%)
              </span>

              <span
                dir="ltr"
                className="whitespace-nowrap"
              >
                {formatCurrency(
                  Number(
                    taxAmount
                  ),
                  currency
                )}
              </span>

            </div>

            {/* Grand Total */}

            <div className="flex justify-between gap-6 bg-slate-700 px-4 py-4 text-lg font-bold text-white">

              <span>
                {t(
                  lang,
                  "total"
                )}
              </span>

              <span
                dir="ltr"
                className="whitespace-nowrap"
              >
                {formatCurrency(
                  Number(
                    total
                  ),
                  currency
                )}
              </span>

            </div>

          </div>

        </section>

        {/* =====================================
            NOTES
        ====================================== */}

        {doc.notes && (

          <section className="mt-10 border-t border-slate-300 pt-6">

            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
              {t(
                lang,
                "notes"
              )}
            </h3>

            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {doc.notes}
            </p>

          </section>

        )}

        {/* =====================================
            FOOTER
        ====================================== */}

        <footer className="mt-12 border-t-2 border-slate-700 pt-5 text-center text-xs text-slate-600">

          <p className="font-bold text-slate-800">
            {company.name}
          </p>

          <p className="mt-2">

            {[
              company.address,
              company.phone,
              company.email,
            ]
              .filter(Boolean)
              .join(" • ")}

          </p>

          {company.ice && (

            <p className="mt-1">
              ICE: {company.ice}
            </p>

          )}

        </footer>

      </div>
    </div>
  );
}
