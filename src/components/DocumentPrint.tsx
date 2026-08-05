"use client";
import React from "react";
import { DocumentData, DocumentItem, calcSubtotal, calcDiscount, calcTax, calcTotal } from "@/lib/types";
import { CompanyData } from "@/lib/types";
import { t, formatDate, Language } from "@/lib/i18n";
import { formatCurrency } from "@/lib/formatCurrency";

interface DocumentPrintProps {
  doc: DocumentData;
  company: CompanyData;
}

export default function DocumentPrint({ doc, company }: DocumentPrintProps) {
  const lang = doc.language as Language;
  const dir = lang === "ar" ? "rtl" : "ltr";

  // ✅ نستخدم عملة الفاتورة وإذا لم توجد نستخدم عملة الشركة
  const currency = doc.currency || company.currency || "USD";

  const items = doc.items as DocumentItem[];
  const subtotal = calcSubtotal(items);
  const discountAmount = calcDiscount(subtotal, doc.discount, doc.discountType);
  const taxAmount = calcTax(subtotal, discountAmount, doc.taxRate);
  const total = calcTotal(subtotal, discountAmount, taxAmount);

  const isInvoice = doc.type === "invoice";
  const template = doc.template;

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
      style={{ fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "'Inter', Arial, sans-serif" }}
      className="bg-white min-h-[297mm] print:min-h-0 w-full max-w-[210mm] mx-auto text-gray-800"
    >{/* Header */}
<div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-10 py-8 print:px-8 rounded-t-xl">
  <div className="flex justify-between items-start gap-8">

    {/* Company */}
    <div className="flex-1">

      {company.logo && (
        <img
          src={company.logo}
          alt="logo"
          className="h-20 object-contain mb-4"
        />
      )}

      <h1 className="text-3xl font-bold tracking-wide">
        {company.name || "Company Name"}
      </h1>

      <div className="mt-4 space-y-1 text-sm opacity-90">

        {company.address && (
          <p>{company.address}</p>
        )}

        {company.phone && (
          <p>☎ {company.phone}</p>
        )}

        {company.email && (
          <p>✉ {company.email}</p>
        )}

        {company.ice && (
          <p>ICE : {company.ice}</p>
        )}

      </div>

    </div>

    {/* Invoice Info */}
    <div className="bg-white text-slate-800 rounded-xl p-6 min-w-[270px] shadow-lg">

      <h2 className="text-2xl font-bold mb-4 text-center">

        {isInvoice
          ? t(lang, "invoice")
          : t(lang, "quote")}

      </h2>

      <div className="space-y-2 text-sm">

        <div className="flex justify-between">
          <span className="font-semibold">
            {t(lang, "number")}
          </span>
          <span>{doc.number}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">
            {t(lang, "date")}
          </span>
          <span>
            {formatDate(doc.date, lang)}
          </span>
        </div>

        {doc.dueDate && (

          <div className="flex justify-between">

            <span className="font-semibold">
              {t(lang, "dueDate")}
            </span>

            <span>
              {formatDate(doc.dueDate, lang)}
            </span>

          </div>

        )}

        <div className="pt-3">

          <span className="inline-block px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold">

            {getStatusLabel()}

          </span>

        </div>

      </div>

    </div>

  </div>
</div>
      {/* Items Table */}
      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden text-sm">

  <thead>

    <tr className="bg-slate-800 text-white">

      <th className="border border-gray-300 px-4 py-3 text-left font-bold">
        {t(lang,"description")}
      </th>

      <th className="border border-gray-300 px-4 py-3 text-center font-bold">
        {t(lang,"quantity")}
      </th>

      <th className="border border-gray-300 px-4 py-3 text-center font-bold">
        {t(lang,"unitPrice")}
      </th>

      <th className="border border-gray-300 px-4 py-3 text-center font-bold">
        {t(lang,"tax")}
      </th>

      <th className="border border-gray-300 px-4 py-3 text-right font-bold">
        {t(lang,"lineTotal")}
      </th>

    </tr>

  </thead>

  <tbody>

    {items.map((item,index)=>(

      <tr
        key={item.id || index}
        className={
          index%2===0
          ? "bg-white"
          : "bg-gray-50"
        }
      >

        <td className="border border-gray-200 px-4 py-3">
          {item.description}
        </td>

        <td className="border border-gray-200 text-center">
          {item.quantity}
        </td>

        <td className="border border-gray-200 text-center">
          {formatCurrency(Number(item.unitPrice),currency)}
        </td>

        <td className="border border-gray-200 text-center">
          {doc.taxRate}%
        </td>

        <td className="border border-gray-200 text-right font-semibold">
          {formatCurrency(Number(item.total),currency)}
        </td>

      </tr>

    ))}

  </tbody>

</table>

          {/* Totals */}
        <div className={`mt-8 flex ${dir === "rtl" ? "justify-start" : "justify-end"}`}>
          <div className="w-full max-w-md border rounded-xl shadow-sm overflow-hidden">

            <div className="bg-slate-800 text-white px-5 py-3 font-bold text-lg">
              {t(lang, "total")}
            </div>

            <div className="bg-white p-5 space-y-3">

              <div className="flex justify-between">
                <span>{t(lang,"subtotal")}</span>
                <strong>{formatCurrency(Number(subtotal),currency)}</strong>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>
                    {t(lang,"discount")}
                    {doc.discountType==="percentage"
                      ? ` (${doc.discount}%)`
                      : ""}
                  </span>

                  <strong>
                    - {formatCurrency(Number(discountAmount),currency)}
                  </strong>
                </div>
              )}

              <div className="flex justify-between">
                <span>
                  {t(lang,"tax")} ({doc.taxRate}%)
                </span>

                <strong>
                  {formatCurrency(Number(taxAmount),currency)}
                </strong>
              </div>

              <hr />

              <div className="flex justify-between text-2xl font-bold text-slate-900">
                <span>{t(lang,"total")}</span>

                <span>
                  {formatCurrency(Number(total),currency)}
                </span>
              </div>

            </div>
          </div>
        </div>

                {/* Notes */}
        {doc.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <p className="text-xs font-bold uppercase tracking-wider mb-2">
              {t(lang, "notes")}
            </p>

            <p className="text-sm whitespace-pre-wrap">
              {doc.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-4 border-t text-center">
          <p className="text-xs text-gray-400">
            {company.name}
            {company.ice ? ` — ICE: ${company.ice}` : ""}
          </p>
        </div>

    </div>
  );
  }
