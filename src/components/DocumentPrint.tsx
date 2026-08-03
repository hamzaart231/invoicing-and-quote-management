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
    >
      {/* Header */}
      <div className="bg-gray-800 text-white p-8 print:p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {company.logo && (
              <img
                src={company.logo}
                alt="logo"
                className="h-16 w-auto object-contain mb-3 rounded"
              />
            )}
            <h1 className="text-2xl font-bold">{company.name || "شركتك"}</h1>
            {company.address && <p className="text-sm opacity-80 mt-1">{company.address}</p>}
            {company.phone && <p className="text-sm opacity-80">{company.phone}</p>}
            {company.email && <p className="text-sm opacity-80">{company.email}</p>}
            {company.ice && <p className="text-xs opacity-70 mt-1">ICE: {company.ice}</p>}
          </div>

          <div className="text-right rtl:text-left min-w-[180px]">
            <div className="border-b-2 border-gray-400 pb-2 mb-3 inline-block">
              <span className="font-semibold text-lg">
                {isInvoice ? t(lang, "invoice") : t(lang, "quote")}
              </span>
            </div>
            <div>
              <p className="text-xl font-bold">{doc.number}</p>
              <p className="text-sm opacity-80">
                {t(lang, "date")}: {formatDate(doc.date, lang)}
              </p>
              {doc.dueDate && (
                <p className="text-sm opacity-80">
                  {t(lang, "dueDate")}: {formatDate(doc.dueDate, lang)}
                </p>
              )}
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white opacity-90">
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-8 py-5 print:px-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className={`px-3 py-3 ${dir === "rtl" ? "text-right" : "text-left"} font-semibold`}>
                {t(lang, "description")}
              </th>
              <th className="px-3 py-3 text-center font-semibold">{t(lang, "quantity")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t(lang, "unitPrice")}</th>
              <th className={`px-3 py-3 ${dir === "rtl" ? "text-left" : "text-right"} font-semibold`}>
                {t(lang, "lineTotal")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className={`px-3 py-3 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                  {item.description}
                </td>
                <td className="px-3 py-3 text-center">{item.quantity}</td>
                <td className="px-3 py-3 text-center">
                  {formatCurrency(Number(item.unitPrice), currency)}
                </td>
                <td className={`px-3 py-3 ${dir === "rtl" ? "text-left" : "text-right"} font-medium`}>
                  {formatCurrency(Number(item.total), currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className={`mt-6 ${dir === "rtl" ? "mr-auto" : "ml-auto"} max-w-xs`}>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t(lang, "subtotal")}</span>
              <span className="font-medium">
                {formatCurrency(Number(subtotal), currency)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>
                  {t(lang, "discount")}{" "}
                  {doc.discountType === "percent" ? `(${doc.discount}%)` : ""}
                </span>
                <span>
                  - {formatCurrency(Number(discountAmount), currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>{t(lang, "tax")} ({doc.taxRate}%)</span>
              <span className="font-medium">
                {formatCurrency(Number(taxAmount), currency)}
              </span>
            </div>

            <div className="border-t pt-2 flex justify-between">
              <span className="font-bold text-base">
                {t(lang, "total")}
              </span>
              <span className="font-bold text-base">
                {formatCurrency(Number(total), currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {doc.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <p className="text-xs font-bold uppercase tracking-wider mb-2">
              {t(lang, "notes")}
            </p>
            <p className="text-sm whitespace-pre-wrap">{doc.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t text-center">
        <p className="text-xs text-gray-400">
          {company.name} {company.ice ? `— ICE: ${company.ice}` : ""}
        </p>
      </div>
    </div>
  );
}
