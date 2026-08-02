"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { t, formatCurrency } from "@/lib/i18n";
import { DocumentItem } from "@/lib/types";
import { Plus, Search, FileText, Trash2, Edit2, Eye, RefreshCw, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

interface Doc {
  id: number;
  type: string;
  number: string;
  date: string;
  clientName: string;
  clientPhone: string;
  status: string;
  items: DocumentItem[];
  taxRate: string;
  discount: string;
  discountType: string;
  template: string;
  language: string;
}

export default function DocumentsPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/documents?${params}`);
    const data = await res.json();
    setDocs(data.documents ?? []);
    setLoading(false);
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const calcTotal = (doc: Doc) => {
    const items = doc.items ?? [];
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const disc = parseFloat(doc.discount) || 0;
    const discAmt = doc.discountType === "percent" ? (subtotal * disc) / 100 : disc;
    const tax = parseFloat(doc.taxRate) || 0;
    const taxAmt = ((subtotal - discAmt) * tax) / 100;
    return subtotal - discAmt + taxAmt;
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t(lang, "deleteConfirm"))) return;
    setDeletingId(id);
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocs(prev => prev.filter(d => d.id !== id));
    setDeletingId(null);
  };

  const handleConvert = async (doc: Doc) => {
    if (!window.confirm(t(lang, "convertConfirm"))) return;
    setConvertingId(doc.id);
    const res = await fetch(`/api/documents/next-number?type=invoice`);
    const { number } = await res.json();
    const body = {
      ...doc,
      type: "invoice",
      number,
      status: "draft",
      convertedFrom: doc.id,
    };
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setConvertingId(null);
    fetchDocs();
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
    expired: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t(lang, "invoices")} & {t(lang, "quotes")}</h1>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/documents/new?type=invoice"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition text-sm shadow"
          >
            <Plus size={16} />
            {t(lang, "newInvoice")}
          </Link>
          <Link
            href="/documents/new?type=quote"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition text-sm shadow"
          >
            <Plus size={16} />
            {t(lang, "newQuote")}
          </Link>
          <a
            href="/api/export/excel"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition text-sm shadow"
          >
            📊 Excel
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t(lang, "search")}
              className="w-full border border-gray-200 rounded-xl ps-9 pe-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">{t(lang, "all")}</option>
            <option value="invoice">{t(lang, "invoice")}</option>
            <option value="quote">{t(lang, "quote")}</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">{t(lang, "all")}</option>
            <option value="draft">{t(lang, "draft")}</option>
            <option value="sent">{t(lang, "sent")}</option>
            <option value="paid">{t(lang, "paid")}</option>
            <option value="overdue">{t(lang, "overdue")}</option>
            <option value="expired">{t(lang, "expired")}</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <FileText size={56} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">{t(lang, "noDocuments")}</p>
          <p className="text-gray-300 text-sm mt-2 mb-6">{t(lang, "createFirst")}</p>
          <Link
            href="/documents/new?type=invoice"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition"
          >
            <Plus size={18} />
            {t(lang, "newInvoice")}
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(lang, "number")}</th>
                  <th className="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(lang, "type")}</th>
                  <th className="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(lang, "client")}</th>
                  <th className="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(lang, "date")}</th>
                  <th className="px-5 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(lang, "status")}</th>
                  <th className="px-5 py-3 text-end text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(lang, "total")}</th>
                  <th className="px-5 py-3 text-end text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(lang, "actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono font-semibold text-gray-900 text-sm">{doc.number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${doc.type === "invoice" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                        {doc.type === "invoice" ? t(lang, "invoice") : t(lang, "quote")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.clientName || "—"}</p>
                        {doc.clientPhone && <p className="text-xs text-gray-400">{doc.clientPhone}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{doc.date}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[doc.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {t(lang, doc.status as "draft" | "sent" | "paid" | "overdue" | "expired")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-end">
                      <span className="font-bold text-gray-900">{formatCurrency(calcTotal(doc), lang)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title={t(lang, "previewInvoice")}
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/documents/${doc.id}/edit`}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title={t(lang, "edit")}
                        >
                          <Edit2 size={16} />
                        </Link>
                        {doc.type === "quote" && (
                          <button
                            onClick={() => handleConvert(doc)}
                            disabled={convertingId === doc.id}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title={t(lang, "convertToInvoice")}
                          >
                            <RefreshCw size={16} className={convertingId === doc.id ? "animate-spin" : ""} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title={t(lang, "delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono font-bold text-gray-900">{doc.number}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${doc.type === "invoice" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                        {doc.type === "invoice" ? t(lang, "invoice") : t(lang, "quote")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[doc.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {t(lang, doc.status as "draft" | "sent" | "paid" | "overdue" | "expired")}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(calcTotal(doc), lang)}</span>
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  <span className="font-medium text-gray-700">{doc.clientName || "—"}</span>
                  {doc.clientPhone && <span className="text-gray-400"> · {doc.clientPhone}</span>}
                </div>
                <div className="flex items-center gap-2 border-t border-gray-50 pt-3">
                  <Link href={`/documents/${doc.id}`} className="flex-1 text-center py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                    {t(lang, "previewInvoice")}
                  </Link>
                  <Link href={`/documents/${doc.id}/edit`} className="flex-1 text-center py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                    {t(lang, "edit")}
                  </Link>
                  {doc.type === "quote" && (
                    <button onClick={() => handleConvert(doc)} className="flex-1 text-center py-1.5 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition">
                      {t(lang, "convertToInvoice")}
                    </button>
                  )}
                  <button onClick={() => handleDelete(doc.id)} className="flex-1 text-center py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                    {t(lang, "delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
