"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import {
  DocumentData,
  DocumentItem,
  CompanyData,
  ClientData,
  calcSubtotal,
  calcDiscount,
  calcTax,
  calcTotal,
} from "@/lib/types";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { currencies } from "@/lib/currencies";
import { formatCurrency } from "@/lib/formatCurrency";

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
  discountType: "percentage",
  status: "draft",
  template: "classic",
  language: "ar",
  currency: "USD",
  notes: "",
});

export default function DocumentForm({ initial, mode }: DocumentFormProps) {
  const { lang } = useLang();
  const router = useRouter();

  const [doc, setDoc] = useState<DocumentData>({
    ...defaultDoc(),
    ...initial,
  });

  const [company, setCompany] = useState<CompanyData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    ice: "",
    logo: "",
    currency: "USD",
  });
  const [clients, setClients] = useState<ClientData[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<ClientData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/company")
      .then((r) => r.json())
      .then((d) => {
        if (d.company) {
          setCompany(d.company);
          if (mode === "create") {
            setDoc((prev) => ({
              ...prev,
              currency: d.company.currency || "USD",
            }));
          }
        }
      })
      .catch((err) => console.error("Error fetching company:", err));

    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => {
        if (d.clients) setClients(d.clients);
      })
      .catch((err) => console.error("Error fetching clients:", err));

    if (mode === "create" && !initial?.number) {
      const type = initial?.type ?? "invoice";
      fetch(`/api/documents/next-number?type=${type}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.number) {
            setDoc((prev) => ({ ...prev, number: d.number }));
          }
        })
        .catch((err) => console.error("Error fetching number:", err));
    }
  }, [mode, initial?.type, initial?.number]);

  const updateItem = (id: string, field: keyof DocumentItem, value: string | number) => {
    setDoc((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }),
    }));
  };

  const addItem = () => setDoc((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (id: string) => setDoc((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));

  const handleClientSearch = (value: string) => {
    setDoc((prev) => ({ ...prev, clientName: value }));
    if (value.length > 1) {
      const filtered = clients.filter((c) => c.name.toLowerCase().includes(value.toLowerCase()));
      setClientSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (c: ClientData) => {
    setDoc((prev) => ({
      ...prev,
      clientName: c.name,
      clientPhone: c.phone ?? "",
      clientEmail: c.email ?? "",
      clientAddress: c.address ?? "",
    }));
    setShowSuggestions(false);
  };

  const subtotal = calcSubtotal(doc.items);
  const discountAmount = calcDiscount(subtotal, doc.discount, doc.discountType);
  const taxAmount = calcTax(subtotal, discountAmount, doc.taxRate);
  const total = calcTotal(subtotal, discountAmount, taxAmount);

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
      if (res.ok) {
        router.push("/documents");
      } else {
        const error = await res.json();
        console.error("Save failed:", error);
        alert("Failed to save document");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/documents")} className="p-2 border rounded hover:bg-gray-50" type="button">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex-1">
          {mode === "create" ? t(lang, "newInvoice") : t(lang, "invoices")}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded bg-amber-500 text-white font-bold hover:bg-amber-600 disabled:opacity-50"
          type="button"
        >
          <Save size={16} className="inline mr-2" />
          {saving ? "..." : t(lang, "save")}
        </button>
      </div>

      {/* Document Type & Number */}
      <div className="bg-white rounded-2xl border p-5 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">{t(lang, "type")}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDoc((p) => ({ ...p, type: "invoice" }))}
                className={`flex-1 py-2 rounded text-sm font-semibold border ${doc.type === "invoice" ? "bg-amber-500 text-white border-amber-500" : "bg-white border-gray-200"}`}
              >
                {t(lang, "invoice")}
              </button>
              <button
                type="button"
                onClick={() => setDoc((p) => ({ ...p, type: "quote" }))}
                className={`flex-1 py-2 rounded text-sm font-semibold border ${doc.type === "quote" ? "bg-teal-600 text-white border-teal-600" : "bg-white border-gray-200"}`}
              >
                {t(lang, "quote")}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t(lang, "invoiceNumber")}</label>
            <input
              type="text"
              value={doc.number}
              onChange={(e) => setDoc((p) => ({ ...p, number: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t(lang, "date")}</label>
            <input
              type="date"
              value={doc.date}
              onChange={(e) => setDoc((p) => ({ ...p, date: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t(lang, "dueDate")}</label>
            <input
              type="date"
              value={doc.dueDate}
              onChange={(e) => setDoc((p) => ({ ...p, dueDate: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-2xl border p-5 mb-4">
        <h3 className="text-sm font-bold mb-3">{t(lang, "client")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <label className="block text-xs mb-1">{t(lang, "clientName")}</label>
            <input
              type="text"
              value={doc.clientName}
              onChange={(e) => handleClientSearch(e.target.value)}
              onFocus={() => doc.clientName.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {showSuggestions && clientSuggestions.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-white border rounded shadow-lg mt-1 overflow-hidden">
                {clientSuggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
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
            <label className="block text-xs mb-1">{t(lang, "clientPhone")}</label>
            <input
              type="tel"
              value={doc.clientPhone}
              onChange={(e) => setDoc((p) => ({ ...p, clientPhone: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">{t(lang, "clientEmail")}</label>
            <input
              type="email"
              value={doc.clientEmail}
              onChange={(e) => setDoc((p) => ({ ...p, clientEmail: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">{t(lang, "clientAddress")}</label>
            <input
              type="text"
              value={doc.clientAddress}
              onChange={(e) => setDoc((p) => ({ ...p, clientAddress: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border p-5 mb-4">
        <h3 className="text-sm font-bold mb-3">{t(lang, "description")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left pr-2 min-w-[150px]">{t(lang, "description")}</th>
                <th className="pb-2 text-center w-20">{t(lang, "quantity")}</th>
                <th className="pb-2 text-center w-28">{t(lang, "unitPrice")}</th>
                <th className="pb-2 text-center w-24">{t(lang, "lineTotal")}</th>
                <th className="pb-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-full border rounded px-2 py-1.5 text-sm text-center"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full border rounded px-2 py-1.5 text-sm text-center"
                    />
                  </td>
                  <td className="py-2 px-1 text-center font-medium">{item.total.toFixed(2)}</td>
                  <td className="py-2">
                    <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addItem} className="mt-3 flex items-center gap-2 text-sm text-amber-600 font-semibold">
          <Plus size={16} />
          {t(lang, "addItem")}
        </button>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border p-5 mb-4">
        <label className="block text-xs font-medium mb-2">{t(lang, "notes")}</label>
        <textarea
          value={doc.notes}
          onChange={(e) => setDoc((p) => ({ ...p, notes: e.target.value }))}
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm resize-none"
        />
      </div>

      {/* Totals & Currency */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs mb-1">{t(lang, "currency")}</label>
            <select
              value={doc.currency}
              onChange={(e) => setDoc((p) => ({ ...p, currency: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">{t(lang, "taxRate")} (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={doc.taxRate}
              onChange={(e) => setDoc((p) => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">{t(lang, "discountType")}</label>
            <select
              value={doc.discountType}
              onChange={(e) => setDoc((p) => ({ ...p, discountType: e.target.value as "fixed" | "percentage" }))}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="fixed">{t(lang, "fixed")}</option>
              <option value="percentage">{t(lang, "percent")}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">{t(lang, "discount")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={doc.discount}
              onChange={(e) => setDoc((p) => ({ ...p, discount: parseFloat(e.target.value) || 0 }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="text-sm space-y-1 border-t pt-3">
          <p className="flex justify-between">
            <span>{t(lang, "subtotal")}:</span>
            <span className="font-medium">{formatCurrency(subtotal, doc.currency)}</span>
          </p>
          {discountAmount > 0 && (
            <p className="flex justify-between text-red-500">
              <span>{t(lang, "discount")}:</span>
              <span>- {formatCurrency(discountAmount, doc.currency)}</span>
            </p>
          )}
          <p className="flex justify-between">
            <span>{t(lang, "tax")} ({doc.taxRate}%):</span>
            <span className="font-medium">{formatCurrency(taxAmount, doc.currency)}</span>
          </p>
          <p className="flex justify-between text-lg font-bold border-t pt-2">
            <span>{t(lang, "total")}:</span>
            <span>{formatCurrency(total, doc.currency)}</span>
          </p>
        </div>
      </div>
    </div>
  );
    }
