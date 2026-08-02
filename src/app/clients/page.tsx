"use client";
import { useEffect, useState, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { ClientData } from "@/lib/types";
import { Users, Plus, Trash2, Upload, Search, UserPlus } from "lucide-react";
import * as XLSX from "xlsx";

export default function ClientsPage() {
  const { lang } = useLang();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "", address: "" });
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchClients = async (q?: string) => {
    setLoading(true);
    const url = q ? `/api/clients?search=${encodeURIComponent(q)}` : "/api/clients";
    const res = await fetch(url);
    const data = await res.json();
    setClients(data.clients ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchClients(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm(lang === "ar" ? "هل تريد حذف هذا الزبون؟" : "Supprimer ce client ?")) return;
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = async () => {
    if (!newClient.name) return;
    setAdding(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });
    const data = await res.json();
    if (data.client) {
      setClients(prev => [data.client, ...prev]);
      setNewClient({ name: "", phone: "", email: "", address: "" });
      setShowAddForm(false);
    }
    setAdding(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg("");

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

      const normalized = rows.map(row => {
        // Try to detect name and phone columns
        const keys = Object.keys(row);
        const nameKey = keys.find(k => /name|nom|اسم|client/i.test(k)) ?? keys[0];
        const phoneKey = keys.find(k => /phone|tel|هاتف|mobile/i.test(k)) ?? keys[1];
        const emailKey = keys.find(k => /email|mail/i.test(k));
        const addressKey = keys.find(k => /address|adresse|عنوان/i.test(k));
        return {
          name: String(row[nameKey] ?? "").trim(),
          phone: String(row[phoneKey] ?? "").trim(),
          email: emailKey ? String(row[emailKey] ?? "").trim() : "",
          address: addressKey ? String(row[addressKey] ?? "").trim() : "",
        };
      }).filter(r => r.name);

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: normalized }),
      });
      const result = await res.json();
      setImportMsg(`✅ ${t(lang, "importSuccess")}: ${result.imported}`);
      fetchClients();
    } catch {
      setImportMsg(`❌ ${t(lang, "importError")}`);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const inputClass = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-teal-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{t(lang, "clients")}</h1>
          <p className="text-sm text-gray-500">{clients.length} {lang === "ar" ? "زبون" : lang === "fr" ? "clients" : "clients"}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition"
          >
            <UserPlus size={16} />
            {t(lang, "addClient")}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition"
          >
            <Upload size={16} />
            {importing ? "..." : t(lang, "importClients")}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {importMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${importMsg.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {importMsg}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-bold text-gray-700 mb-4 text-sm">{t(lang, "addClient")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientName")} *</label>
              <input type="text" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientPhone")}</label>
              <input type="tel" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientEmail")}</label>
              <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t(lang, "clientAddress")}</label>
              <input type="text" value={newClient.address} onChange={e => setNewClient(p => ({ ...p, address: e.target.value }))} className={`${inputClass} w-full`} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={adding || !newClient.name} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
              {adding ? "..." : t(lang, "save")}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition">
              {t(lang, "cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t(lang, "search")}
            className="w-full border border-gray-200 rounded-xl ps-9 pe-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 text-sm text-blue-700">
        <p className="font-semibold mb-1">
          {lang === "ar" ? "📋 كيفية استيراد الزبائن:" : lang === "fr" ? "📋 Comment importer les clients :" : "📋 How to import clients:"}
        </p>
        <p className="text-xs text-blue-600">
          {lang === "ar"
            ? "حمّل ملف Excel أو CSV يحتوي على عمودي الاسم (Name/اسم) والهاتف (Phone/هاتف). يدعم التطبيق أي تسمية لهاذين العمودين."
            : lang === "fr"
            ? "Téléchargez un fichier Excel ou CSV avec les colonnes Nom (Name/nom) et Téléphone (Phone/tel). L'application détecte automatiquement les colonnes."
            : "Upload an Excel or CSV file with Name (Name/nom) and Phone (Phone/tel) columns. The app auto-detects column names."}
        </p>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Users size={56} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">{t(lang, "noClients")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {clients.map(client => (
              <div key={client.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-teal-700 font-bold text-sm">{client.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {client.phone && <span className="text-sm text-gray-500">📞 {client.phone}</span>}
                    {client.email && <span className="text-sm text-gray-400">✉️ {client.email}</span>}
                  </div>
                  {client.address && <p className="text-xs text-gray-400 truncate">{client.address}</p>}
                </div>
                <button
                  onClick={() => client.id && handleDelete(client.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
