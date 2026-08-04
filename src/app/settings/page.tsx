"use client";
import { useEffect, useState, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { CompanyData } from "@/lib/types";
import { Save, Upload, Building2, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { lang } = useLang();
const [company, setCompany] = useState<CompanyData>({
  name: "", address: "", phone: "", email: "", ice: "", logo: "", currency: "MAD",
});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/company").then(r => r.json()).then(d => {
      if (d.company) setCompany({ ...d.company, logo: d.company.logo ?? "" });
      setLoading(false);
    });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size is 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCompany(prev => ({ ...prev, logo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 focus:bg-white transition";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Building2 size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(lang, "settings")}</h1>
          <p className="text-sm text-gray-500">{t(lang, "companyInfo")}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t(lang, "companyLogo")}</label>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
              {company.logo ? (
                <img src={company.logo} alt="logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 size={28} className="text-gray-300" />
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition"
              >
                <Upload size={16} />
                {t(lang, "uploadLogo")}
              </button>
              <p className="text-xs text-gray-400 mt-2">{t(lang, "logoHint")}</p>
              {company.logo && (
                <button
                  onClick={() => setCompany(p => ({ ...p, logo: "" }))}
                  className="text-xs text-red-400 hover:text-red-600 mt-1"
                >
                  ✕ {lang === "ar" ? "حذف الشعار" : lang === "fr" ? "Supprimer" : "Remove logo"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        </div>

        {/* Company Fields */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t(lang, "companyName")} *</label>
              <input
                type="text"
                value={company.name}
                onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
                className={inputClass}
                placeholder={lang === "ar" ? "اسم شركتك" : lang === "fr" ? "Nom de votre société" : "Your company name"}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t(lang, "companyAddress")}</label>
              <textarea
                value={company.address}
                onChange={e => setCompany(p => ({ ...p, address: e.target.value }))}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder={lang === "ar" ? "العنوان الكامل" : "Adresse complète"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t(lang, "companyPhone")}</label>
              <input
                type="tel"
                value={company.phone}
                onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))}
                className={inputClass}
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t(lang, "companyEmail")}</label>
              <input
                type="email"
                value={company.email}
                onChange={e => setCompany(p => ({ ...p, email: e.target.value }))}
                className={inputClass}
                placeholder="contact@societe.ma"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t(lang, "companyICE")}</label>
              <input
                type="text"
                value={company.ice}
                onChange={e => setCompany(p => ({ ...p, ice: e.target.value }))}
                className={inputClass}
                placeholder="000000000000000"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition shadow ${saved ? "bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
            >
              {saved ? (
                <>
                  <CheckCircle size={18} />
                  {t(lang, "settingsSaved")}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {saving ? "..." : t(lang, "saveSettings")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {company.name && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">
            {lang === "ar" ? "معاينة الترويسة" : lang === "fr" ? "Aperçu en-tête" : "Header Preview"}
          </h3>
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white flex items-center gap-4">
            {company.logo && (
              <img src={company.logo} alt="" className="h-14 w-auto object-contain rounded-lg bg-white/10 p-1" />
            )}
            <div>
              <p className="font-bold text-lg">{company.name}</p>
              {company.address && <p className="text-sm text-white/70">{company.address}</p>}
              {company.phone && <p className="text-sm text-white/70">{company.phone}</p>}
              {company.ice && <p className="text-xs text-white/50">ICE: {company.ice}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
