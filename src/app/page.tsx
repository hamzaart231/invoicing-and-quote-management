"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Plus,
  ReceiptText,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import {
  useLang,
} from "@/lib/LanguageContext";

import {
  t,
  formatCurrency,
} from "@/lib/i18n";

import {
  CompanyData,
  DocumentItem,
  calcSubtotal,
  calcDiscount,
  calcTax,
  calcTotal,
} from "@/lib/types";

/* =========================================
   TYPES
========================================= */

interface DocSummary {
  id: number;

  type:
    | "invoice"
    | "quote";

  number: string;

  clientName: string;

  status:
    | "draft"
    | "sent"
    | "paid"
    | "overdue"
    | "expired";

  items: DocumentItem[];

  taxRate:
    | string
    | number;

  discount:
    | string
    | number;

  discountType:
    | "fixed"
    | "percentage"
    | "percent";

  date: string;
}

/* =========================================
   DASHBOARD
========================================= */

export default function DashboardPage() {
  const { lang } =
    useLang();

  const [company, setCompany] =
    useState<CompanyData | null>(
      null
    );

  const [docs, setDocs] =
    useState<DocSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  /* =====================================
     LOAD DATA
  ===================================== */

  useEffect(() => {
    let active = true;

    const loadDashboard =
      async () => {
        try {
          const [
            companyResponse,
            documentsResponse,
          ] = await Promise.all([
            fetch(
              "/api/company",
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/documents",
              {
                cache:
                  "no-store",
              }
            ),
          ]);

          if (
            !companyResponse.ok ||
            !documentsResponse.ok
          ) {
            throw new Error(
              "Dashboard request failed"
            );
          }

          const companyData =
            await companyResponse.json();

          const documentsData =
            await documentsResponse.json();

          if (!active) {
            return;
          }

          setCompany(
            companyData.company ??
              null
          );

          setDocs(
            documentsData.documents ??
              []
          );
        } catch (error) {
          console.error(
            "Dashboard load error:",
            error
          );

          if (active) {
            setError(true);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  /* =====================================
     DOCUMENT TOTAL
  ===================================== */

  const getDocumentTotal = (
    doc: DocSummary
  ) => {
    const items =
      doc.items ?? [];

    const subtotal =
      calcSubtotal(items);

    const discount =
      Number(
        doc.discount ?? 0
      );

    /*
     * Older data may contain "percent".
     * Internally the calculation function
     * continues to use "percentage".
     */
    const discountType =
      doc.discountType ===
        "percentage" ||
      doc.discountType ===
        "percent"
        ? "percentage"
        : "fixed";

    const discountAmount =
      calcDiscount(
        subtotal,
        discount,
        discountType
      );

    const taxAmount =
      calcTax(
        subtotal,
        discountAmount,
        Number(
          doc.taxRate ?? 0
        )
      );

    return calcTotal(
      subtotal,
      discountAmount,
      taxAmount
    );
  };

  /* =====================================
     STATISTICS
  ===================================== */

  const stats =
    useMemo(() => {
      const invoices =
        docs.filter(
          (doc) =>
            doc.type ===
            "invoice"
        );

      const quotes =
        docs.filter(
          (doc) =>
            doc.type ===
            "quote"
        );

      const paid =
        invoices.filter(
          (doc) =>
            doc.status ===
            "paid"
        );

      const pending =
        invoices.filter(
          (doc) =>
            doc.status ===
              "sent" ||
            doc.status ===
              "draft" ||
            doc.status ===
              "overdue"
        );

      const invoiceAmount =
        invoices.reduce(
          (sum, doc) =>
            sum +
            getDocumentTotal(
              doc
            ),
          0
        );

      const paidAmount =
        paid.reduce(
          (sum, doc) =>
            sum +
            getDocumentTotal(
              doc
            ),
          0
        );

      const outstanding =
        Math.max(
          0,
          invoiceAmount -
            paidAmount
        );

      return {
        invoices,
        quotes,
        paid,
        pending,
        invoiceAmount,
        paidAmount,
        outstanding,
      };
    }, [docs]);

  const recentDocuments =
    docs.slice(0, 6);

  const companyIncomplete =
    !company ||
    !company.name;

  /* =====================================
     LABELS
  ===================================== */

  const labels = {
    overview:
      lang === "ar"
        ? "نظرة عامة على أعمالك"
        : lang === "fr"
          ? "Vue d’ensemble de votre activité"
          : "Your business overview",

    subtitle:
      lang === "ar"
        ? "تابع فواتيرك ومدفوعاتك من مكان واحد."
        : lang === "fr"
          ? "Suivez vos factures et paiements depuis un seul endroit."
          : "Track invoices and payments from one place.",

    revenue:
      lang === "ar"
        ? "إجمالي الفواتير"
        : lang === "fr"
          ? "Total facturé"
          : "Total invoiced",

    paid:
      lang === "ar"
        ? "المدفوع"
        : lang === "fr"
          ? "Payé"
          : "Paid",

    outstanding:
      lang === "ar"
        ? "المتبقي"
        : lang === "fr"
          ? "À recevoir"
          : "Outstanding",

    pending:
      lang === "ar"
        ? "قيد الانتظار"
        : lang === "fr"
          ? "En attente"
          : "Pending",

    recent:
      lang === "ar"
        ? "أحدث الوثائق"
        : lang === "fr"
          ? "Documents récents"
          : "Recent documents",

    viewAll:
      lang === "ar"
        ? "عرض الكل"
        : lang === "fr"
          ? "Voir tout"
          : "View all",

    profile:
      lang === "ar"
        ? "أكمل بيانات شركتك لتظهر بشكل احترافي على الفواتير."
        : lang === "fr"
          ? "Complétez votre entreprise pour l’afficher correctement sur vos factures."
          : "Complete your company profile so it appears correctly on invoices.",

    complete:
      lang === "ar"
        ? "إكمال البيانات"
        : lang === "fr"
          ? "Compléter"
          : "Complete profile",

    noDocuments:
      lang === "ar"
        ? "لا توجد وثائق بعد"
        : lang === "fr"
          ? "Aucun document"
          : "No documents yet",

    createFirst:
      lang === "ar"
        ? "أنشئ أول فاتورة لبدء متابعة أعمالك."
        : lang === "fr"
          ? "Créez votre première facture pour commencer."
          : "Create your first invoice to get started.",

    welcome:
      lang === "ar"
        ? "مرحباً"
        : lang === "fr"
          ? "Bonjour"
          : "Welcome back",
  };

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="flex flex-col items-center gap-4">

          <div className="h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="text-sm text-slate-400">
            Loading...
          </p>

        </div>

      </div>
    );
  }

  /* =====================================
     ERROR
  ===================================== */

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-5 lg:p-8">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

          <div className="flex items-center gap-3">

            <AlertCircle
              size={20}
            />

            <p className="font-medium">
              Unable to load dashboard.
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================
     RENDER
  ===================================== */

  return (
    <div className="min-h-screen">

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================
            TOP
        ================================== */}

        <section className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <p className="mb-1 text-sm font-semibold text-violet-600">
              {labels.welcome}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">

              {company?.name ||
                labels.overview}

            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {labels.subtitle}
            </p>

          </div>

          {/* Quick actions */}

          <div className="flex flex-wrap gap-2">

            <Link
              href="/documents/new?type=invoice"
              className="flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              <Plus
                size={17}
              />

              {t(
                lang,
                "newInvoice"
              )}
            </Link>

            <Link
              href="/documents/new?type=quote"
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
            >
              <Plus
                size={17}
              />

              {t(
                lang,
                "newQuote"
              )}
            </Link>

          </div>

        </section>

        {/* =================================
            COMPANY WARNING
        ================================== */}

        {companyIncomplete && (
          <section className="mb-6">

            <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 sm:flex-row sm:items-center">

              <div className="flex min-w-0 flex-1 items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                  <AlertCircle
                    size={19}
                  />

                </div>

                <p className="pt-1 text-sm leading-6 text-amber-900">
                  {labels.profile}
                </p>

              </div>

              <Link
                href="/settings"
                className="flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                {labels.complete}
              </Link>

            </div>

          </section>
        )}

        {/* =================================
            KPI CARDS
        ================================== */}

        <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">

          {/* Total invoiced */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">

            <div className="mb-5 flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                <WalletCards
                  size={19}
                />

              </div>

              <ArrowUpRight
                size={16}
                className="text-slate-300"
              />

            </div>

            <p className="text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
              {formatCurrency(
                stats.invoiceAmount,
                lang
              )}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              {labels.revenue}
            </p>

          </div>

          {/* Paid */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">

            <div className="mb-5 flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                <CheckCircle2
                  size={19}
                />

              </div>

            </div>

            <p className="text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
              {formatCurrency(
                stats.paidAmount,
                lang
              )}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              {labels.paid}
            </p>

          </div>

          {/* Outstanding */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">

            <div className="mb-5 flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                <TrendingUp
                  size={19}
                />

              </div>

            </div>

            <p className="text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
              {formatCurrency(
                stats.outstanding,
                lang
              )}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              {labels.outstanding}
            </p>

          </div>

          {/* Pending */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">

            <div className="mb-5 flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <Clock3
                  size={19}
                />

              </div>

            </div>

            <p className="text-2xl font-bold tracking-tight text-slate-950">
              {
                stats.pending
                  .length
              }
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              {labels.pending}
            </p>

          </div>

        </section>

        {/* =================================
            SECONDARY INFORMATION
        ================================== */}

        <section className="mb-6 grid gap-4 lg:grid-cols-3">

          {/* Business summary */}

          <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-violet-600 to-purple-700 p-5 text-white lg:col-span-2">

            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                  Business summary
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {docs.length}{" "}
                  {t(
                    lang,
                    "total_documents"
                  )}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-violet-100">
                  {stats.invoices.length}{" "}
                  {t(
                    lang,
                    "total_invoices"
                  )}
                  {" • "}
                  {stats.quotes.length}{" "}
                  {t(
                    lang,
                    "total_quotes"
                  )}
                </p>

              </div>

              <div className="flex gap-3">

                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">

                  <p className="text-xs text-violet-200">
                    Paid
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {
                      stats.paid
                        .length
                    }
                  </p>

                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">

                  <p className="text-xs text-violet-200">
                    Quotes
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {
                      stats.quotes
                        .length
                    }
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Clients shortcut */}

          <Link
            href="/clients"
            className="group flex min-h-40 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-violet-200"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">

              <Users
                size={20}
              />

            </div>

            <div className="mt-7">

              <div className="flex items-center justify-between">

                <p className="font-semibold text-slate-900">
                  {t(
                    lang,
                    "clients"
                  )}
                </p>

                <ArrowUpRight
                  size={17}
                  className="text-slate-300 transition group-hover:text-violet-600"
                />

              </div>

              <p className="mt-1 text-xs text-slate-400">
                Manage your customers
              </p>

            </div>

          </Link>

        </section>

        {/* =================================
            RECENT DOCUMENTS
        ================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">

          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">

            <div>

              <h2 className="font-bold text-slate-900">
                {labels.recent}
              </h2>

              <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                Your latest invoices and quotes
              </p>

            </div>

            <Link
              href="/documents"
              className="flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
            >
              {labels.viewAll}

              <ArrowUpRight
                size={15}
              />
            </Link>

          </div>

          {recentDocuments.length ===
          0 ? (

            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">

                <ReceiptText
                  size={25}
                />

              </div>

              <p className="mt-4 font-semibold text-slate-600">
         
