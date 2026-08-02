"use client";
import React from "react";
import { DocumentData, DocumentItem, calcSubtotal, calcDiscount, calcTax, calcTotal } from "@/lib/types";
import { CompanyData } from "@/lib/types";
import { t, formatCurrency, formatDate, Language } from "@/lib/i18n";

interface DocumentPrintProps {
  doc: DocumentData;
  company: CompanyData;
}

export default function DocumentPrint({ doc, company }: DocumentPrintProps) {
  const lang = doc.language as Language;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const items = doc.items as DocumentItem[];
  const subtotal = calcSubtotal(items);
  const discountAmount = calcDiscount(subtotal, doc.discount, doc.discountType);
  const taxAmount = calcTax(subtotal, discountAmount, doc.taxRate);
  const total = calcTotal(subtotal, discountAmount, taxAmount);

  const isInvoice = doc.type === "invoice";
  const template = doc.template;

  const templateStyles = {
    classic: {
      headerBg: "bg-gradient-to-r from-amber-700 to-amber-900",
      accent: "text-amber-700",
      accentBg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-700 text-white",
      tablehead: "bg-amber-700 text-white",
      divider: "border-amber-300",
    },
    modern: {
      headerBg: "bg-gradient-to-r from-teal-700 to-teal-900",
      accent: "text-teal-700",
      accentBg: "bg-teal-50",
      border: "border-teal-200",
      badge: "bg-teal-700 text-white",
      tablehead: "bg-teal-700 text-white",
      divider: "border-teal-300",
    },
    minimal: {
      headerBg: "bg-gray-800",
      accent: "text-gray-700",
      accentBg: "bg-gray-50",
      border: "border-gray-200",
      badge: "bg-gray-800 text-white",
      tablehead: "bg-gray-800 text-white",
      divider: "border-gray-200",
    },
  };

  const s = templateStyles[template] ?? templateStyles.classic;

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
      <div className={`${s.headerBg} text-white p-8 print:p-6`}>
        <div className="flex justify-between items-start gap-4">
          {/* Company Info */}
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

          {/* Document Info */}
          <div className="text-right rtl:text-left min-w-[180px]">
            {/* Template-specific badge */}
            {template === "classic" && (
              <div className="w-20 h-20 rounded-full border-4 border-amber-300 border-opacity-60 flex items-center justify-center mx-auto mb-3">
                <div className="text-center">
                  <div className="text-xs font-semibold opacity-80">{isInvoice ? t(lang, "invoice") : t(lang, "quote")}</div>
                </div>
              </div>
            )}
            {template === "modern" && (
              <div className="border-2 border-teal-300 rounded-lg px-4 py-2 inline-block mb-3">
                <span className="font-bold text-lg">{isInvoice ? t(lang, "invoice") : t(lang, "quote")}</span>
              </div>
            )}
            {template === "minimal" && (
              <div className="border-b-2 border-gray-400 pb-2 mb-3 inline-block">
                <span className="font-semibold text-lg">{isInvoice ? t(lang, "invoice") : t(lang, "quote")}</span>
              </div>
            )}
            <div className="text-white">
              <p className="text-xl font-bold">{doc.number}</p>
              <p className="text-sm opacity-80">{t(lang, "date")}: {formatDate(doc.date, lang)}</p>
              {doc.dueDate && (
                <p className="text-sm opacity-80">{t(lang, "dueDate")}: {formatDate(doc.dueDate, lang)}</p>
              )}
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${s.badge} opacity-90`}>
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Section */}
      <div className={`px-8 py-5 print:px-6 ${s.accentBg} border-b ${s.border}`}>
        <div className="flex justify-between gap-6">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}>{t(lang, "billTo")}</p>
            <p className="font-bold text-gray-900 text-lg">{doc.clientName || "—"}</p>
            {doc.clientPhone && <p className="text-sm text-gray-600">{doc.clientPhone}</p>}
            {doc.clientEmail && <p className="text-sm text-gray-600">{doc.clientEmail}</p>}
            {doc.clientAddress && <p className="text-sm text-gray-600">{doc.clientAddress}</p>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-8 py-5 print:px-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={s.tablehead}>
              <th className={`px-3 py-3 ${dir === "rtl" ? "text-right" : "text-left"} font-semibold rounded-${dir === "rtl" ? "tr" : "tl"}-lg`}>
                {t(lang, "description")}
              </th>
              <th className="px-3 py-3 text-center font-semibold">{t(lang, "quantity")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t(lang, "unitPrice")}</th>
              <th className={`px-3 py-3 ${dir === "rtl" ? "text-left" : "text-right"} font-semibold rounded-${dir === "rtl" ? "tl" : "tr"}-lg`}>
                {t(lang, "lineTotal")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id || idx} className={idx % 2 === 0 ? "bg-white" : s.accentBg}>
                <td className={`px-3 py-3 ${dir === "rtl" ? "text-right" : "text-left"} text-gray-700`}>
                  {item.description}
                </td>
                <td className="px-3 py-3 text-center text-gray-700">{item.quantity}</td>
                <td className="px-3 py-3 text-center text-gray-700">{formatCurrency(item.unitPrice, lang)}</td>
                <td className={`px-3 py-3 ${dir === "rtl" ? "text-left" : "text-right"} font-medium text-gray-900`}>
                  {formatCurrency(item.total, lang)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-400 italic">—</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className={`mt-6 ${dir === "rtl" ? "mr-auto" : "ml-auto"} max-w-xs`}>
          <div className={`border-t ${s.divider} pt-4 space-y-2`}>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t(lang, "subtotal")}</span>
              <span className="font-medium">{formatCurrency(subtotal, lang)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>{t(lang, "discount")} {doc.discountType === "percent" ? `(${doc.discount}%)` : ""}</span>
                <span>- {formatCurrency(discountAmount, lang)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t(lang, "tax")} ({doc.taxRate}%)</span>
              <span className="font-medium">{formatCurrency(taxAmount, lang)}</span>
            </div>
            <div className={`border-t ${s.divider} pt-2 flex justify-between`}>
              <span className={`font-bold text-base ${s.accent}`}>{t(lang, "total")}</span>
              <span className={`font-bold text-base ${s.accent}`}>{formatCurrency(total, lang)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {doc.notes && (
          <div className={`mt-8 p-4 ${s.accentBg} rounded-lg border ${s.border}`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}>{t(lang, "notes")}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`px-8 py-4 border-t ${s.border} text-center`}>
        <p className="text-xs text-gray-400">{company.name} {company.ice ? `— ICE: ${company.ice}` : ""}</p>
      </div>
    </div>
  );
}
