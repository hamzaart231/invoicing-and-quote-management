"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { t, formatCurrency } from "@/lib/i18n";
import { CompanyData, DocumentItem } from "@/lib/types";
import { FileText, Plus, AlertTriangle, TrendingUp, FileCheck, Clock, BarChart3 } from "lucide-react";

interface DocSummary {
  id: number;
  type: string;
  number: string;
  clientName: string;
  status: string;
  items: DocumentItem[];
  taxRate: string;
  discount: string;
  discountType: string;
  date: string;
}

export default function DashboardPage() {
  const { lang } = useLang();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/company").then(r => r.json()),
      fetch("/api/documents").then(r => r.json()),
    ]).then(([comp, docsData]) => {
      setCompany(comp.company);
      setDocs(docsData.documents ?? []);
      setLoading(false);
    });
  }, []);

  const companyIncomplete = !company || !company.name;

  const invoices = docs.filter(d => d.type === "invoice");
  const quotes = docs.filter(d => d.type === "quote");

  const calcTotal = (doc: DocSummary) => {
    const items = doc.items ?? [];
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const disc = parseFloat(doc.discount) || 0;
    const discAmt = doc.discountType === "percent" ? (subtotal * disc) / 100 : disc;
    const tax = parseFloat(doc.taxRate) || 0;
    const taxAmt = ((subtotal - discAmt) * tax) / 100;
    return subtotal - discAmt + taxAmt;
  };

  const totalAmount = docs.reduce((s, d) => s + calcTotal(d), 0);
  const paidAmount = docs.filter(d => d.status === "paid").reduce((s, d) => s + calcTotal(d), 0);
  const pendingDocs = docs.filter(d => d.status === "sent" || d.status === "draft").length;

  const recentDocs = docs.slice(0, 5);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    expired: "bg-orange-100 text-orange-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Company warning */}
      {companyIncomplete && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-amber-800 text-sm font-medium">{t(lang, "companyWarning")}</p>
          </div>
          <Link
            href="/settings"
            className="shrink-0 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition"
          >
            {t(lang, "completeNow")}
          </Link>
        </div>
      )}

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {lang === "ar" ? "مرحباً 👋" : lang === "fr" ? "Bienvenue 👋" : "Welcome 👋"}
        </h1>
        <p className="text-gray-500 mt-1">
          {company?.name
            ? (lang === "ar" ? `${company.name}` : company.name)
            : (lang === "ar" ? "تطبيق إدارة الفواتير" : lang === "fr" ? "Gestion des factures" : "Invoice management")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{docs.length}</p>
          <p className="text-sm text-gray-500 mt-1">{t(lang, "total_documents")}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          <p className="text-sm text-gray-500 mt-1">{t(lang, "total_invoices")}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <FileCheck size={20} className="text-teal-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
          <p className="text-sm text-gray-500 mt-1">{t(lang, "total_quotes")}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 text-sm leading-tight">{formatCurrency(totalAmount, lang)}</p>
          <p className="text-sm text-gray-500 mt-1">{t(lang, "total_amount")}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/documents/new?type=invoice"
          className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition shadow-md"
        >
          <Plus size={18} />
          {t(lang, "newInvoice")}
        </Link>
        <Link
          href="/documents/new?type=quote"
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition shadow-md"
        >
          <Plus size={18} />
          {t(lang, "newQuote")}
        </Link>
        <a
          href="/api/export/excel"
          className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-md"
        >
          📊 {t(lang, "exportExcel")}
        </a>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            {lang === "ar" ? "آخر الوثائق" : lang === "fr" ? "Derniers documents" : "Recent Documents"}
          </h2>
          <Link href="/documents" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            {lang === "ar" ? "عرض الكل" : lang === "fr" ? "Voir tout" : "View all"} →
          </Link>
        </div>
        {recentDocs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">{t(lang, "noDocuments")}</p>
            <p className="text-gray-300 text-sm mt-1">{t(lang, "createFirst")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentDocs.map(doc => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.type === "invoice" ? "bg-amber-100" : "bg-teal-100"}`}>
                  <FileText size={18} className={doc.type === "invoice" ? "text-amber-600" : "text-teal-600"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{doc.number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[doc.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {t(lang, doc.status as "draft" | "sent" | "paid" | "overdue" | "expired")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{doc.clientName || "—"}</p>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="font-bold text-gray-900 text-sm">{formatCurrency(calcTotal(doc), lang)}</p>
                  <p className="text-xs text-gray-400">{doc.date}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
