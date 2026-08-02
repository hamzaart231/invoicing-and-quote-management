"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import { t, Language } from "@/lib/i18n";
import { DocumentData, DocumentItem, CompanyData, ClientData, calcSubtotal, calcDiscount, calcTax, calcTotal } from "@/lib/types";
import { Plus, Trash2, Save, Eye, ArrowLeft, ChevronDown } from "lucide-react";
import DocumentPrint from "./DocumentPrint";

interface DocumentFormProps {
  initial?: Partial<DocumentData>;
  mode: "create" | "edit";
}

const emptyItem = (): DocumentItem => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

const defaultDoc = (): DocumentData => ({
  type: "invoice",
  number: "",
  date: new Date().toISOString().split("T")[0],
  dueDate: "",
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  clientAddress: "",
  items: [emptyItem()],
  taxRate: 20,
  discount: 0,
  discountType: "fixed",
  status: "draft",
  template: "classic",
  language: "ar",
  notes: "",
});

export default function DocumentForm({ initial, mode }: DocumentFormProps) {
  const { lang } = useLang();
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentData>({ ...defaultDoc(), ...initial });
  const [company, setCompany] = useState<CompanyData>({ name: "", address: "", phone: "", email: "", ice: "", logo: "" });
  const [clients, setClients] = useState<ClientData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<ClientData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/company").then(r => r.json()).then(d => { if (d.company) setCompany(d.company); });
    fetch("/api/clients").then(r => r.json()).then(d => { if (d.clients) setClients(d.clients); });
    
    if (mode === "create" && !initial?.number) {
      const type = initial?.type ?? "invoice";
      fetch(`/api/documents/next-number?type=${type}`).then(r => r.json()).then(d => {
        if (d.number) setDoc(prev => ({ ...prev, number: d.number }));
      });
    }
  }, [mode, initial?.number, initial?.type]);

  const updateItem = (id: string, field: keyof DocumentItem, value: string | number) => {
    setDoc(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }),
    }));
  };

  const addItem = () => setDoc(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (id: string) => setDoc(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const subtotal = calcSubtotal(doc.items);
  const discountAmount = calcDiscount(subtotal, doc.discount, doc.discountType);
  const taxAmount = calcTax(subtotal, discountAmount, doc.taxRate);
  const total = calcTotal(subtotal, discountAmount, taxAmount);

  const handleClientSearch = (value: string) => {
    setDoc(prev => ({ ...prev, clientName: value }));
    if (value.length > 1) {
      const filtered = clients.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
      setClientSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (c: ClientData) => {
    setDoc(prev => ({ ...prev, clientName: c.name, clientPhone: c.phone ?? "", clientEmail: c.email ?? "", clientAddress: c.address ?? "" }));
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = mode === "edit" && doc.id ? `/api/documents/${doc.id}` : "/api/documents";
      const method = mode === "edit" && doc.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (res.ok) router.push("/documents");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-area");
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html dir="${doc.language === "ar" ? "rtl" : "ltr"}" lang="${doc.language}">
        <head>
          <meta charset="UTF-8" />
          <title>${doc.number}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: ${doc.language === "ar" ? "'Noto Sans Arabic'" : "'Inter'"}, Arial, sans-serif; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            @media print { body { margin: 0; } }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const statusOptions: Array<{ value: DocumentData["status"]; label: string }> = [
    { value: "draft", label: t(lang, "draft") },
    { value: "sent", label: t(lang, "sent") },
    { value: "paid", label: t(lang, "paid") },
    ...(doc.type === "invoice"
      ? [{ value: "overdue" as const, label: t(lang, "overdue") }]
      : [{ value: "expired" as const, label: t(lang, "expired") }]),
  ];
  const templateOptions: Array<{ value: string; label: string }> = [
    { value: "classic", label: t(lang, "classic") },
    { value: "modern", label: t(lang, "modern") },
    { value: "minimal", label: t(lang, "minimal") },
  ];
  const langOptions: Array<{ value: Language; label: string }> = [
    { value: "ar", label: "العربية" },
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
  ];

  const dirClass = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => router.push("/documents")} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft size={18} className={lang === "ar" ? "rotate-180" : ""} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">
          {mode === "create"
            ? (doc.type === "invoice" ? t(lang, "newInvoice") : t(lang, "newQuote"))
            : (doc.type === "invoice" ? t(lang, "invoices") : t(lang, "quotes"))}
        </h1>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium transition"
        >
          <Eye size={16} />
          {t(lang, "previewInvoice")}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition shadow"
        >
          <Save size={16} />
          {saving ? "..." : t(lang, "save")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Document Type & Number */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t(lang, "type")}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDoc(p => ({ ...p, type: "invoice" }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${doc.type === "invoice" ? "bg-amber-500 text-white border-amber-500" : "bg-white border-gray-200 text-gray-600 hover:border-amber-300"}`}
                  >
                    {t(lang, "invoice")}
                  </button>
                  <button
                    onClick={() => setDoc(p => ({ ...p, type: "quote" }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${doc.type === "quote" ? "bg-teal-600 text-white border-teal-600" : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"}`}
                  >
                    {t(lang, "quote")}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {doc.type === "invoice" ? t(lang, "invoiceNumber") : t(lang, "quoteNumber")}
                </label>
                <input
                  type="text"
                  value={doc.number}
                  onChange={e => setDoc(p => ({ ...p, number: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t(lang, "date")}</label>
                <input
                  type="date"
                  value={doc.date}
                  onChange={e => setDoc(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t(lang, "dueDate")}</label>
                <input
                  type="date"
                  value={doc.dueDate}
                  onChange={e => setDoc(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">{t(lang, "client")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientName")}</label>
                <input
                  type="text"
                  value={doc.clientName}
                  onChange={e => handleClientSearch(e.target.value)}
                  onFocus={() => doc.clientName.length > 1 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder={t(lang, "clientName")}
                />
                {showSuggestions && clientSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                    {clientSuggestions.map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => selectClient(c)}
                        className="w-full px-3 py-2 text-left hover:bg-amber-50 text-sm flex justify-between"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-gray-400 text-xs">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientPhone")}</label>
                <input
                  type="tel"
                  value={doc.clientPhone}
                  onChange={e => setDoc(p => ({ ...p, clientPhone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientEmail")}</label>
                <input
                  type="email"
                  value={doc.clientEmail}
                  onChange={e => setDoc(p => ({ ...p, clientEmail: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientAddress")}</label>
                <input
                  type="text"
                  value={doc.clientAddress}
                  onChange={e => setDoc(p => ({ ...p, clientAddress: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">{t(lang, "description")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 font-semibold text-gray-500 text-left rtl:text-right pr-2 min-w-[150px]">{t(lang, "description")}</th>
                    <th className="pb-2 font-semibold text-gray-500 text-center w-20">{t(lang, "quantity")}</th>
                    <th className="pb-2 font-semibold text-gray-500 text-center w-28">{t(lang, "unitPrice")}</th>
                    <th className="pb-2 font-semibold text-gray-500 text-center w-24">{t(lang, "lineTotal")}</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {doc.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(item.id, "description", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder={t(lang, "description")}
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-gray-700">
                        {item.total.toFixed(2)}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-semibold"
            >
              <Plus size={16} />
              {t(lang, "addItem")}
            </button>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-2">{t(lang, "notes")}</label>
            <textarea
              value={doc.notes}
              onChange={e => setDoc(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">{t(lang, "subtotal")}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "taxRate")} (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={doc.taxRate}
                  onChange={e => setDoc(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "discountType")}</label>
                <select
                  value={doc.discountType}
                  onChange={e => setDoc(p => ({ ...p, discountType: e.target.value as "fixed" | "percent" }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="fixed">{t(lang, "fixed")}</option>
                  <option value="percent">{t(lang, "percent")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "discount")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={doc.discount}
                  onChange={e => setDoc(p => ({ ...p, discount: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{t(lang, "subtotal")}</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>{t(lang, "discount")}</span>
                  <span>- {discountAmount.toFixed(2)} MAD</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>{t(lang, "tax")} ({doc.taxRate}%)</span>
                <span>{taxAmount.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>{t(lang, "total")}</span>
                <span className="text-amber-600">{total.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">الإعدادات / Options</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "status")}</label>
                <select
                  value={doc.status}
                  onChange={e => setDoc(p => ({ ...p, status: e.target.value as DocumentData["status"] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {statusOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "template")}</label>
                <select
                  value={doc.template}
                  onChange={e => setDoc(p => ({ ...p, template: e.target.value as DocumentData["template"] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {templateOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t(lang, "documentLanguage")}</label>
                <select
                  value={doc.language}
                  onChange={e => setDoc(p => ({ ...p, language: e.target.value as Language }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {langOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition shadow text-sm"
          >
            🖨️ {t(lang, "print")}
          </button>
        </div>
      </div>

      {/* Print preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8">
          <div className="w-full max-w-3xl mx-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 no-print">
                <h3 className="font-bold text-gray-900">{t(lang, "previewInvoice")}</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition">
                    🖨️ {t(lang, "print")}
                  </button>
                  <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                    ✕
                  </button>
                </div>
              </div>
              <div id="print-area">
                <DocumentPrint doc={doc} company={company} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print area (always rendered) */}
      <div style={{ display: "none" }}>
        <div id="print-area-hidden">
          <DocumentPrint doc={doc} company={company} />
        </div>
      </div>
    </div>
  );
}
