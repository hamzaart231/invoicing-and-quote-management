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

  /*
   * Keep the existing calculation logic.
   */
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

        {/* =====================================
            HEADER
        ====================================== */}

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

            {/* Document heading */}

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

        {/* =====================================
            CLIENT
        ====================================== */}

        <section className="grid grid-cols-2 gap-12 border-b border-amber-700/20 py-8">

          <div>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-amber-800">
              {t(lang, "client")}
            </p>

            <h3 className="text-xl font-semibold text-stone-900">
              {doc.clientName}
            </h3>

            <div className="mt-4 space-y-1 text-sm leading-6 text-stone-500">

              {doc.clientAddress && (
                <p>
                  {doc.clientAddress}
                </p>
              )}

              {doc.clientPhone && (
                <p>
                  {doc.clientPhone}
                </p>
              )}

              {doc.clientEmail && (
                <p>
                  {doc.clientEmail}
                </p>
              )}

            </div>

          </div>

          {/* Invoice Details */}

          <div className="border-s border-amber-700/20 ps-8">

            <div className="space-y-3 text-sm">

              <div className="flex justify-between gap-8">

                <span className="text-stone-400">
                  {t(lang, "number")}
                </span>

                <span className="font-semibold text-stone-800">
                  {doc.number}
                </span>

              </div>

              <div className="flex justify-between gap-8">

                <span className="text-stone-400">
                  {t(lang, "date")}
                </span>

                <span>
                  {formatDate(
                    doc.date,
                    lang
                  )}
                </span>

              </div>

              {doc.dueDate && (
                <div className="flex justify-between gap-8">

                  <span className="text-stone-400">
                    {t(lang, "dueDate")}
                  </span>

                  <span>
                    {formatDate(
                      doc.dueDate,
                      lang
                    )}
                  </span>

                </div>
              )}

              <div className="flex justify-between gap-8">

                <span className="text-stone-400">
                  {t(lang, "status")}
                </span>

                <span className="font-semibold text-amber-800">
                  {getStatusLabel()}
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            ITEMS
        ====================================== */}

        <section className="py-8">

          <table className="w-full border-collapse text-sm">

            <thead>

              <tr className="border-b-2 border-amber-700 text-amber-900">

                <th
                  className={`py-4 font-semibold ${
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

                <th className="px-3 py-4 text-center font-semibold">
                  {t(
                    lang,
                    "quantity"
                  )}
                </th>

                <th className="px-3 py-4 text-center font-semibold">
                  {t(
                    lang,
                    "unitPrice"
                  )}
                </th>

                <th className="px-3 py-4 text-center font-semibold">
                  {t(
                    lang,
                    "tax"
                  )}
                </th>

                <th
                  className={`py-4 font-semibold ${
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
                    className="border-b border-amber-700/15"
                  >

                    <td
                      className={`py-4 ${
                        dir === "rtl"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {item.description}
                    </td>

                    <td className="px-3 py-4 text-center text-stone-500">
                      {item.quantity}
                    </td>

                    <td className="px-3 py-4 text-center text-stone-500">

                      {formatCurrency(
                        Number(
                          item.unitPrice
                        ),
                        currency
                      )}

                    </td>

                    <td className="px-3 py-4 text-center text-stone-500">
                      {doc.taxRate}%
                    </td>

                    <td
                      className={`py-4 font-semibold text-stone-800 ${
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
        ====================================== */}

        <section
          className={`flex ${
            dir === "rtl"
              ? "justify-start"
              : "justify-end"
          }`}
        >

          <div className="w-full max-w-sm">

            {/* Subtotal */}

            <div className="flex justify-between border-b border-amber-700/15 px-3 py-3 text-sm">

              <span className="text-stone-500">
                {t(
                  lang,
                  "subtotal"
                )}
              </span>

              <span className="font-medium">
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

              <div className="flex justify-between border-b border-amber-700/15 px-3 py-3 text-sm">

                <span className="text-stone-500">

                  {t(
                    lang,
                    "discount"
                  )}

                  {doc.discountType ===
                  "percentage"
                    ? ` (${doc.discount}%)`
                    : ""}

                </span>

                <span>
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

            <div className="flex justify-between border-b border-amber-700/15 px-3 py-3 text-sm">

              <span className="text-stone-500">

                {t(lang, "tax")} (
                {doc.taxRate}%)

              </span>

              <span>
                {formatCurrency(
                  Number(
                    taxAmount
                  ),
                  currency
                )}
              </span>

            </div>

            {/* Total */}

            <div className="mt-2 flex justify-between border-y-2 border-amber-700 px-3 py-4 text-xl font-semibold text-amber-900">

              <span>
                {t(
                  lang,
                  "total"
                )}
              </span>

              <span>

                {formatCurrency(
                  Number(total),
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

          <section className="mt-10 border-t border-amber-700/20 pt-6">

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-800">

              {t(
                lang,
                "notes"
              )}

            </p>

            <p className="whitespace-pre-wrap text-sm leading-7 text-stone-600">

              {doc.notes}

            </p>

          </section>

        )}

        {/* =====================================
            FOOTER
        ====================================== */}

        <footer className="mt-12 border-t border-amber-700/30 pt-6 text-center">

          <div className="mx-auto mb-4 h-px w-16 bg-amber-700" />

          <p className="text-sm font-semibold tracking-wide text-stone-800">

            {company.name}

          </p>

          <p className="mt-2 text-xs leading-5 text-stone-400">

            {[
              company.address,
              company.phone,
              company.email,
            ]
              .filter(Boolean)
              .join(" • ")}

          </p>

          {company.ice && (

            <p className="mt-1 text-xs text-stone-400">

              ICE: {company.ice}

            </p>

          )}

        </footer>

      </div>
    </div>
  );
      }
