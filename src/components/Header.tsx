"use client";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { languages } from "@/lib/i18n";
import { FileText, Settings, LayoutDashboard, Menu, X, Users } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { lang, setLang, dir } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: t(lang, "dashboard"), icon: <LayoutDashboard size={18} /> },
    { href: "/documents", label: t(lang, "invoices"), icon: <FileText size={18} /> },
    { href: "/clients", label: t(lang, "clients"), icon: <Users size={18} /> },
    { href: "/settings", label: t(lang, "settings"), icon: <Settings size={18} /> },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FileText size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t(lang, "appName")}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Lang switcher + mobile menu */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    lang === l.code
                      ? "bg-amber-400 text-slate-900 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/10">
            <nav className="flex flex-col gap-1 mt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
