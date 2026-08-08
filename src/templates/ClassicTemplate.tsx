"use client";
// Classic invoice template

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

  {/* Header */}

  <header className="border-b-2 border-slate-700 pb-8">

    <div className="flex items-start justify-between">

      <div>

        {company.logo && (
          <img
            src={company.logo}
            alt="Company Logo"
            className="mb-4 h-20 object-contain"
          />
        )}

        <h1 className="text-3xl font-bold tracking-wide">
          {company.name}
        </h1>

        <div className="mt-4 space-y-1 text-sm text-slate-600">

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

      <div className="text-right">

        <h2 className="text-5xl font-bold uppercase tracking-widest text-slate-800">

          {isInvoice
            ? t(lang, "invoice")
            : t(lang, "quote")}

        </h2>

        <div className="mt-6 space-y-2 text-sm">

          <p>
            <strong>{t(lang, "number")}:</strong>{" "}
            {doc.number}
          </p>

          <p>
            <strong>{t(lang, "date")}:</strong>{" "}
            {formatDate(doc.date, lang)}
          </p>

          {doc.dueDate && (
            <p>
              <strong>{t(lang, "dueDate")}:</strong>{" "}
              {formatDate(doc.dueDate, lang)}
            </p>
          )}

          <p>
            <strong>{t(lang, "status")}:</strong>{" "}
            {getStatusLabel()}
          </p>

        </div>

      </div>

    </div>

  </header>
              {/* Client Details */}
      <section className="mt-8 grid grid-cols-2 gap-10 border-b border-slate-300 pb-8">

        <div>
          <h3 className="mb-3 border-b border-slate-400 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            {t(lang, "client")}
          </h3>

          <p className="text-lg font-bold">
            {doc.clientName}
          </p>

          <div className="mt-3 space-y-1 text-sm text-slate-700">
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

        <div>
          <h3 className="mb-3 border-b border-slate-400 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            {isInvoice
              ? t(lang, "invoice")
              : t(lang, "quote")}
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-6">
              <span className="font-bold">
                {t(lang, "number")}
              </span>
              <span>{doc.number}</span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="font-bold">
                {t(lang, "date")}
              </span>
              <span>{formatDate(doc.date, lang)}</span>
            </div>

            {doc.dueDate && (
              <div className="flex justify-between gap-6">
                <span className="font-bold">
                  {t(lang, "dueDate")}
                </span>
                <span>{formatDate(doc.dueDate, lang)}</span>
              </div>
            )}

            <div className="flex justify-between gap-6">
              <span className="font-bold">
                {t(lang, "status")}
              </span>
              <span>{getStatusLabel()}</span>
            </div>
          </div>
        </div>

      </section>
              {/* Items Table */}
      <section className="mt-8">

        <table className="w-full border-collapse text-sm">

          <thead>
            <tr className="bg-slate-700 text-white">

              <th
                className={`border border-slate-500 px-4 py-3 font-bold ${
                  dir === "rtl" ? "text-right" : "text-left"
                }`}
              >
                {t(lang, "description")}
              </th>

              <th className="border border-slate-500 px-4 py-3 text-center font-bold">
                {t(lang, "quantity")}
              </th>

              <th className="border border-slate-500 px-4 py-3 text-center font-bold">
                {t(lang, "unitPrice")}
              </th>

              <th className="border border-slate-500 px-4 py-3 text-center font-bold">
                {t(lang, "tax")}
              </th>

              <th
                className={`border border-slate-500 px-4 py-3 font-bold ${
                  dir === "rtl" ? "text-left" : "text-right"
                }`}
              >
                {t(lang, "lineTotal")}
              </th>

            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id || index}
                className="bg-white"
              >

                <td
                  className={`border border-slate-300 px-4 py-3 ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {item.description}
                </td>

                <td className="border border-slate-300 px-4 py-3 text-center">
                  {item.quantity}
                </td>

                <td className="border border-slate-300 px-4 py-3 text-center">
                  {formatCurrency(
                    Number(item.unitPrice),
                    currency
                  )}
                </td>

                <td className="border border-slate-300 px-4 py-3 text-center">
                  {doc.taxRate}%
                </td>

                <td
                  className={`border border-slate-300 px-4 py-3 font-semibold ${
                    dir === "rtl" ? "text-left" : "text-right"
                  }`}
                >
                  {formatCurrency(
                    Number(item.total),
                    currency
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </section>
              {/* Totals */}
      <section
        className={`mt-8 flex ${
          dir === "rtl" ? "justify-start" : "justify-end"
        }`}
      >
        <div className="w-full max-w-sm text-sm">

          {/* Subtotal */}
          <div className="flex justify-between border-b border-slate-300 px-4 py-3">
            <span className="font-semibold">
              {t(lang, "subtotal")}
            </span>

            <span>
              {formatCurrency(Number(subtotal), currency)}
            </span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between border-b border-slate-300 px-4 py-3">
              <span>
                {t(lang, "discount")}
                {doc.discountType === "percentage"
                  ? ` (${doc.discount}%)`
                  : ""}
              </span>

              <span>
                - {formatCurrency(Number(discountAmount), currency)}
              </span>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between border-b border-slate-300 px-4 py-3">
            <span>
              {t(lang, "tax")} ({doc.taxRate}%)
            </span>

            <span>
              {formatCurrency(Number(taxAmount), currency)}
            </span>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between bg-slate-700 px-4 py-4 text-lg font-bold text-white">
            <span>
              {t(lang, "total")}
            </span>

            <span>
              {formatCurrency(Number(total), currency)}
            </span>
          </div>

        </div>
      </section>

</div>
          </div>
  );
      }
