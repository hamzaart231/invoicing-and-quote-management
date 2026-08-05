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
              {/* Items Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200">

        <table className="w-full border-collapse">

          <thead className="bg-slate-900 text-white">

            <tr>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                {t(lang, "description")}
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold">
                {t(lang, "quantity")}
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold">
                {t(lang, "unitPrice")}
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold">
                {t(lang, "tax")}
              </th>

              <th className="px-5 py-4 text-right text-sm font-semibold">
                {t(lang, "lineTotal")}
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((item, index) => (

              <tr
                key={item.id || index}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >

                <td className="border-t border-slate-200 px-5 py-4">
                  {item.description}
                </td>

                <td className="border-t border-slate-200 px-5 py-4 text-center">
                  {item.quantity}
                </td>

                <td className="border-t border-slate-200 px-5 py-4 text-center">
                  {formatCurrency(Number(item.unitPrice), currency)}
                </td>

                <td className="border-t border-slate-200 px-5 py-4 text-center">
                  {doc.taxRate}%
                </td>

                <td className="border-t border-slate-200 px-5 py-4 text-right font-semibold">
                  {formatCurrency(Number(item.total), currency)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>
              {/* Totals */}
      <section className={`flex ${dir === "rtl" ? "justify-start" : "justify-end"}`}>

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="rounded-t-2xl bg-slate-900 px-6 py-4 text-lg font-bold text-white">
            {t(lang, "total")}
          </div>

          <div className="space-y-4 p-6">

            <div className="flex justify-between">

              <span>{t(lang, "subtotal")}</span>

              <strong>
                {formatCurrency(Number(subtotal), currency)}
              </strong>

            </div>

            {discountAmount > 0 && (

              <div className="flex justify-between text-red-600">

                <span>
                  {t(lang, "discount")}
                  {doc.discountType === "percentage"
                    ? ` (${doc.discount}%)`
                    : ""}
                </span>

                <strong>
                  - {formatCurrency(Number(discountAmount), currency)}
                </strong>

              </div>

            )}

            <div className="flex justify-between">

              <span>
                {t(lang, "tax")} ({doc.taxRate}%)
              </span>

              <strong>
                {formatCurrency(Number(taxAmount), currency)}
              </strong>

            </div>

            <div className="border-t pt-4">

              <div className="flex justify-between text-2xl font-bold">

                <span>{t(lang, "total")}</span>

                <span>
                  {formatCurrency(Number(total), currency)}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>
              {/* Notes */}
      {doc.notes && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
            {t(lang, "notes")}
          </h3>

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {doc.notes}
          </p>

        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-8 text-center">

        <h3 className="text-lg font-semibold text-slate-900">
          {company.name}
        </h3>

        <div className="mt-3 space-y-1 text-sm text-slate-500">

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

      </footer>

</main>
          </div>
  );
}
        
