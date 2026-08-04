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
import { Save, ArrowLeft } from "lucide-react";
import { currencies } from "@/lib/currencies";

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
  });

  const [clients, setClients] = useState<ClientData[]>([]);
  const [saving, setSaving] = useState(false);

  // ✅ إصلاح dependency array
  useEffect(() => {
    // جلب بيانات الشركة
    fetch("/api/company")
      .then((r) => r.json())
      .then((d) => {
        if (d.company) {
          setCompany(d.company);

          // تعيين عملة الشركة للفواتير الجديدة
          if (mode === "create") {
            setDoc((prev) => ({
              ...prev,
              currency: d.company.currency || "USD",
            }));
          }
        }
      })
      .catch((err) => console.error("Error fetching company:", err));

    // جلب العملاء
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => {
        if (d.clients) setClients(d.clients);
      })
      .catch((err) => console.error("Error fetching clients:", err));

    // توليد رقم تلقائي للفواتير الجديدة
    if (mode === "create" && !initial?.number) {
      const type = initial?.type ?? "invoice";

      fetch(`/api/documents/next-number?type=${type}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.number) {
            setDoc((prev) => ({
              ...prev,
              number: d.number,
            }));
          }
        })
        .catch((err) => console.error("Error fetching number:", err));
    }
  }, [mode, initial?.type, initial?.number]); // ✅ إضافة dependencies

  const subtotal = calcSubtotal(doc.items);
  const discountAmount = calcDiscount(subtotal, doc.discount, doc.discountType);
  const taxAmount = calcTax(subtotal, discountAmount, doc.taxRate);
  const total = calcTotal(subtotal, discountAmount, taxAmount);

  const handleSave = async () => {
    setSaving(true);

    try {
      const url =
        mode === "edit" && doc.id
          ? `/api/documents/${doc.id}`
          : "/api/documents";

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
        <button
          onClick={() => router.push("/documents")}
          className="p-2 border rounded hover:bg-gray-50"
          type="button"
        >
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

      <div className="bg-white rounded-2xl border p-5">
        <div className="mb-4">
          <label className="block text-xs mb-1 font-medium">
            {t(lang, "currency")}
          </label>

          <select
            value={doc.currency}
            onChange={(e) =>
              setDoc((p) => ({
                ...p,
                currency: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm mt-4 space-y-1">
          <p className="flex justify-between">
            <span>{t(lang, "subtotal")}:</span>
            <span className="font-medium">{subtotal.toFixed(2)} {doc.currency}</span>
          </p>
          <p className="flex justify-between text-lg font-bold">
            <span>{t(lang, "total")}:</span>
            <span>{total.toFixed(2)} {doc.currency}</span>
          </p>
        </div>
      </div>
    </div>
  );
    }
