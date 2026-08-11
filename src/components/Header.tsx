"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  FileText,
  LayoutDashboard,
  Menu,
  X,
  Users,
  Settings,
  LogOut,
  User,
  Plus,
  ChevronLeft,
} from "lucide-react";

import {
  useLang,
} from "@/lib/LanguageContext";

import {
  t,
  languages,
} from "@/lib/i18n";

/* =========================================
   USER
========================================= */

interface CurrentUser {
  id: number;
  name: string;
  email: string;
}

/* =========================================
   HEADER / SAAS APP SHELL
========================================= */

export default function Header() {
  const {
    lang,
    setLang,
  } = useLang();

  const router =
    useRouter();

  const pathname =
    usePathname();

  const [user, setUser] =
    useState<CurrentUser | null>(
      null
    );

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    checkingUser,
    setCheckingUser,
  ] = useState(true);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";

  /* =====================================
     CURRENT USER
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
  }, [pathname]);

  /* =====================================
     CLOSE MENUS ON NAVIGATION
  ===================================== */

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

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
        setProfileOpen(false);

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
     AUTH PAGES
  ===================================== */

  if (isAuthPage) {
    return null;
  }

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

      icon:
        LayoutDashboard,
    },

    {
      href: "/documents",

      label:
        t(
          lang,
          "invoices"
        ),

      icon:
        FileText,
    },

    {
      href: "/clients",

      label:
        t(
          lang,
          "clients"
        ),

      icon:
        Users,
    },

    {
      href: "/settings",

      label:
        t(
          lang,
          "settings"
        ),

      icon:
        Settings,
    },
  ];

  const isActive = (
    href: string
  ) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href
    );
  };

  /* =====================================
     SIDEBAR CONTENT
  ===================================== */

  const SidebarContent = () => (
    <div className="flex h-full flex-col">

      {/* Brand */}

      <div className="flex h-20 items-center px-6">

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-950/30">

            <FileText
              size={22}
              className="text-white"
            />

          </div>

          <div>

            <p className="text-lg font-bold tracking-tight text-white">
              {t(
                lang,
                "appName"
              )}
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              SaaS
            </p>

          </div>

        </Link>

      </div>

      {/* New Invoice */}

      <div className="px-4 pb-5">

        <Link
          href="/documents/new?type=invoice"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:from-violet-500 hover:to-purple-500"
        >

          <Plus
            size={17}
          />

          {t(
            lang,
            "newInvoice"
          )}

        </Link>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-1 px-3">

        {navItems.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              isActive(
                item.href
              );

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >

                <Icon
                  size={18}
                  className={
                    active
                      ? "text-white"
                      : "text-slate-500 transition group-hover:text-violet-300"
                  }
                />

                <span className="flex-1">
                  {
                    item.label
                  }
                </span>

                {active && (
                  <ChevronLeft
                    size={14}
                    className="opacity-70"
                  />
                )}

              </Link>
            );
          }
        )}

      </nav>

      {/* Languages */}

      <div className="px-4 pb-4">

        <div className="flex rounded-xl bg-white/5 p-1">

          {languages.map(
            (language) => (

              <button
                key={
                  language.code
                }
                type="button"
                onClick={() =>
                  setLang(
                    language.code
                  )
                }
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${
                  lang ===
                  language.code
                    ? "bg-violet-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >

                {
                  language.label
                }

              </button>

            )
          )}

        </div>

      </div>

      {/* User */}

      {!checkingUser &&
        user && (

        <div className="border-t border-white/10 p-4">

          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">

              <User
                size={18}
              />

            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user.email}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            disabled={
              loggingOut
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
          >

            <LogOut
              size={16}
            />

            {loggingOut
              ? "..."
              : "Logout"}

          </button>

        </div>

      )}

    </div>
  );

  return (
    <>
      {/* =====================================
          DESKTOP SIDEBAR
      ====================================== */}

      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 bg-[#0c1027] shadow-2xl lg:block">

        <SidebarContent />

      </aside>

      {/* =====================================
          MOBILE TOP BAR
      ====================================== */}

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur lg:hidden">

        {/* Menu */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
          aria-label="Open menu"
        >

          <Menu
            size={21}
          />

        </button>

        {/* Brand */}

        <Link
          href="/"
          className="flex items-center gap-2"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700">

            <FileText
              size={18}
              className="text-white"
            />

          </div>

          <span className="font-bold text-slate-900">
            {t(
              lang,
              "appName"
            )}
          </span>

        </Link>

        {/* =================================
            MOBILE PROFILE
        ================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                !profileOpen
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition active:scale-95"
            aria-label="Account"
          >

            <User
              size={18}
            />

          </button>

          {profileOpen &&
            user && (

            <>
              {/* Overlay */}

              <button
                type="button"
                aria-label="Close profile menu"
                onClick={() =>
                  setProfileOpen(
                    false
                  )
                }
                className="fixed inset-0 z-40"
              />

              {/* Dropdown */}

              <div className="absolute end-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                {/* Account */}

                <div className="border-b border-slate-100 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

                      <User
                        size={19}
                      />

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {user.email}
                      </p>

                    </div>

                  </div>

                </div>

                {/* Actions */}

                <div className="p-2">

                  <Link
                    href="/settings"
                    onClick={() =>
                      setProfileOpen(
                        false
                      )
                    }
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >

                    <Settings
                      size={17}
                    />

                    {t(
                      lang,
                      "settings"
                    )}

                  </Link>

                  <button
                    type="button"
                    onClick={
                      async () => {
                        setProfileOpen(
                          false
                        );

                        await handleLogout();
                      }
                    }
                    disabled={
                      loggingOut
                    }
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >

                    <LogOut
                      size={17}
                    />

                    {loggingOut
                      ? "..."
                      : "Logout"}

                  </button>

                </div>

              </div>

            </>

          )}

        </div>

      </header>

      {/* =====================================
          MOBILE SIDEBAR OVERLAY
      ====================================== */}

      {menuOpen && (

        <button
          type="button"
          aria-label="Close menu"
          onClick={() =>
            setMenuOpen(false)
          }
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm lg:hidden"
        />

      )}

      {/* =====================================
          MOBILE DRAWER
      ====================================== */}

      <aside
        className={`fixed inset-y-0 start-0 z-[60] w-[285px] max-w-[85vw] bg-[#0c1027] shadow-2xl transition-transform duration-300 lg:hidden ${
          menuOpen
            ? "translate-x-0"
            : lang === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
      >

        <button
          type="button"
          onClick={() =>
            setMenuOpen(false)
          }
          className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:text-white"
          aria-label="Close menu"
        >

          <X
            size={19}
          />

        </button>

        <SidebarContent />

      </aside>
    </>
  );
}
