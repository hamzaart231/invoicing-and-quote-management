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

</div>
          </div>
  );
      }
