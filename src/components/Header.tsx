"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  FileText,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Users,
  LogOut,
  User,
} from "lucide-react";

import {
  useLang,
} from "@/lib/LanguageContext";

import {
  t,
  languages,
} from "@/lib/i18n";

/* =========================================
   USER TYPE
========================================= */

interface CurrentUser {
  id: number;
  name: string;
  email: string;
}

/* =========================================
   HEADER
========================================= */

export default function Header() {
  const {
    lang,
    setLang,
  } = useLang();

  const router =
    useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [user, setUser] =
    useState<CurrentUser | null>(
      null
    );

  const [checkingUser, setCheckingUser] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  /* =====================================
     LOAD CURRENT USER
  ===================================== */

  useEffect(() => {
    let active = true;

    const loadUser =
      async () => {
        try {
          const response =
            await fetch(
              "/api/auth/me",
              {
                cache: "no-store",
              }
            );

          if (!response.ok) {
            if (active) {
              setUser(null);
            }

            return;
          }

          const data =
            await response.json();

          if (
            active &&
            data.authenticated &&
            data.user
          ) {
            setUser(
              data.user
            );
          }
        } catch (error) {
          console.error(
            "Failed to load user:",
            error
          );

          if (active) {
            setUser(null);
          }
        } finally {
          if (active) {
            setCheckingUser(
              false
            );
          }
        }
      };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      setLoggingOut(true);

      try {
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          }
        );

        setUser(null);

        setMenuOpen(false);

        router.replace(
          "/login"
        );

        router.refresh();
      } catch (error) {
        console.error(
          "Logout failed:",
          error
        );
      } finally {
        setLoggingOut(false);
      }
    };

  /* =====================================
     NAVIGATION
  ===================================== */

  const navItems = [
    {
      href: "/",

      label:
        t(
          lang,
          "dashboard"
        ),

      icon: (
        <LayoutDashboard
          size={18}
        />
      ),
    },

    {
      href: "/documents",

      label:
        t(
          lang,
          "invoices"
        ),

      icon: (
        <FileText
          size={18}
        />
      ),
    },

    {
      href: "/clients",

      label:
        t(
          lang,
          "clients"
        ),

      icon: (
        <Users
          size={18}
        />
      ),
    },

    {
      href: "/settings",

      label:
        t(
          lang,
          "settings"
        ),

      icon: (
        <Settings
          size={18}
        />
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">

      <div className="mx-auto max-w-7xl px-4">

        <div className="flex h-16 items-center justify-between">

          {/* =================================
              LOGO
          ================================== */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg transition-transform group-hover:scale-105">

              <FileText
                size={20}
                className="text-white"
              />

            </div>

            <span className="text-xl font-bold tracking-tight">

              {t(
                lang,
                "appName"
              )}

            </span>

          </Link>

          {/* =================================
              DESKTOP NAV
          ================================== */}

          {user && (
            <nav className="hidden items-center gap-1 md:flex">

              {navItems.map(
                (item) => (

                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                  >

                    {item.icon}

                    {item.label}

                  </Link>

                )
              )}

            </nav>
          )}

          {/* =================================
              ACTIONS
          ================================== */}

          <div className="flex items-center gap-3">

            {/* Language */}

            <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">

              {languages.map(
                (language) => (

                  <button
                    type="button"
                    key={
                      language.code
                    }
                    onClick={() =>
                      setLang(
                        language.code
                      )
                    }
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                      lang ===
                      language.code
                        ? "bg-amber-400 text-slate-900 shadow"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >

                    {
                      language.label
                    }

                  </button>

                )
              )}

            </div>

            {/* Desktop User */}

            {!checkingUser &&
              user && (

              <div className="hidden items-center gap-2 md:flex">

                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">

                  <User
                    size={16}
                    className="text-amber-400"
                  />

                  <span className="max-w-32 truncate text-sm font-medium">

                    {user.name}

                  </span>

                </div>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    loggingOut
                  }
                  title="Logout"
                  className="rounded-lg p-2 text-slate-300 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                >

                  <LogOut
                    size={18}
                  />

                </button>

              </div>

            )}

            {/* Mobile Menu */}

            {user && (
              <button
                type="button"
                className="rounded-lg p-2 transition hover:bg-white/10 md:hidden"
                onClick={() =>
                  setMenuOpen(
                    !menuOpen
                  )
                }
                aria-label="Menu"
              >

                {menuOpen ? (
                  <X
                    size={20}
                  />
                ) : (
                  <Menu
                    size={20}
                  />
                )}

              </button>
            )}

          </div>

        </div>

        {/* =================================
            MOBILE NAV
        ================================== */}

        {menuOpen &&
          user && (

          <div className="border-t border-white/10 pb-4 pt-2 md:hidden">

            {/* User */}

            <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-slate-900">

                <User
                  size={17}
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold">

                  {user.name}

                </p>

                <p className="truncate text-xs text-slate-400">

                  {user.email}

                </p>

              </div>

            </div>

            {/* Navigation */}

            <nav className="mt-2 flex flex-col gap-1">

              {navItems.map(
                (item) => (

                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    onClick={() =>
                      setMenuOpen(
                        false
                      )
                    }
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                  >

                    {item.icon}

                    {item.label}

                  </Link>

                )
              )}

              {/* Logout */}

              <button
                type="button"
                onClick={
                  handleLogout
                }
                disabled={
                  loggingOut
                }
                className="mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
              >

                <LogOut
                  size={18}
                />

                <span>
                  {loggingOut
                    ? "..."
                    : "Logout"}
                </span>

              </button>

            </nav>

          </div>

        )}

      </div>

    </header>
  );
    }
