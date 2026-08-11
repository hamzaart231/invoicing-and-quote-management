"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Download,
  Edit2,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { useLang } from "@/lib/LanguageContext";

import {
  t,
  formatCurrency,
} from "@/lib/i18n";

import {
  DocumentItem,
  calcSubtotal,
  calcDiscount,
  calcTax,
  calcTotal,
} from "@/lib/types";

interface Doc {
  id: number;

  type: "invoice" | "quote";

  number: string;
  date: string;

  clientName: string;
  clientPhone: string;

  status:
    | "draft"
    | "sent"
    | "paid"
    | "overdue"
    | "expired";

  items: DocumentItem[];

  taxRate: string | number;
  discount: string | number;

  discountType:
    | "fixed"
    | "percentage"
    | "percent";

  template: string;
  language: string;

  currency?: string;
  convertedFrom?: number;
}

export default function DocumentsPage() {
  const { lang } = useLang();

  const [docs, setDocs] =
    useState<Doc[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [convertingId, setConvertingId] =
    useState<number | null>(null);

  const fetchDocs = useCallback(
    async () => {
      setLoading(true);

      try {
        const params =
          new URLSearchParams();

        if (search) {
          params.set(
            "search",
            search
          );
        }

        if (typeFilter !== "all") {
          params.set(
            "type",
            typeFilter
          );
        }

        if (statusFilter !== "all") {
          params.set(
            "status",
            statusFilter
          );
        }

        const response =
          await fetch(
            `/api/documents?${params.toString()}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        setDocs(
          data.documents ?? []
        );
      } catch (error) {
        console.error(
          "Failed to load documents:",
          error
        );

        setDocs([]);
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      typeFilter,
      statusFilter,
    ]
  );

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const getDocumentTotal = (
    doc: Doc
  ) => {
    const items =
      doc.items ?? [];

    const subtotal =
      calcSubtotal(items);

    const discountType =
      doc.discountType === "percentage" ||
      doc.discountType === "percent"
        ? "percentage"
        : "fixed";

    const discountAmount =
      calcDiscount(
        subtotal,
        Number(
          doc.discount ?? 0
        ),
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

  const handleDelete =
    async (id: number) => {
      if (
        !window.confirm(
          t(
            lang,
            "deleteConfirm"
          )
        )
      ) {
        return;
      }

      setDeletingId(id);

      try {
        const response =
          await fetch(
            `/api/documents/${id}`,
            {
              method: "DELETE",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Delete failed"
          );
        }

        setDocs(
          (previous) =>
            previous.filter(
              (doc) =>
                doc.id !== id
            )
        );
      } catch (error) {
        console.error(
          "Delete failed:",
          error
        );
      } finally {
        setDeletingId(null);
      }
    };

  const handleConvert =
    async (doc: Doc) => {
      if (
        !window.confirm(
          t(
            lang,
            "convertConfirm"
          )
        )
      ) {
        return;
      }

      setConvertingId(doc.id);

      try {
        const numberResponse =
          await fetch(
            "/api/documents/next-number?type=invoice"
          );

        if (!numberResponse.ok) {
          throw new Error(
            "Unable to create number"
          );
        }

        const { number } =
          await numberResponse.json();

        const body = {
          ...doc,
          type: "invoice",
          number,
          status: "draft",
          convertedFrom: doc.id,
        };

        const response =
          await fetch(
            "/api/documents",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  body
                ),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Conversion failed"
          );
        }

        await fetchDocs();
      } catch (error) {
        console.error(
          "Convert failed:",
          error
        );
      } finally {
        setConvertingId(null);
      }
    };

  const statusColors:
    Record<string, string> = {
    draft:
      "bg-slate-100 text-slate-600",

    sent:
      "bg-blue-50 text-blue-600",

    paid:
      "bg-emerald-50 text-emerald-600",

    overdue:
      "bg-red-50 text-red-600",

    expired:
      "bg-orange-50 text-orange-600",
  };

  const title =
    lang === "ar"
      ? "الفواتير وعروض الأسعار"
      : lang === "fr"
        ? "Factures et devis"
        : "Invoices & Quotes";

  const subtitle =
    lang === "ar"
      ? "إدارة وتتبع جميع وثائقك من مكان واحد."
      : lang === "fr"
        ? "Gérez et suivez tous vos documents depuis un seul endroit."
        : "Manage and track all your documents in one place.";

  return (
        <div className="min-h-screen">

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Page Header */}

        <section className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">

              <FileText size={16} />

              {t(
                lang,
                "invoices"
              )}

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {subtitle}
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <Link
              href="/documents/new?type=invoice"
              className="flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              <Plus size={17} />

              {t(
                lang,
                "newInvoice"
              )}
            </Link>

            <Link
              href="/documents/new?type=quote"
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <Plus size={17} />

              {t(
                lang,
                "newQuote"
              )}
            </Link>

            <a
              href="/api/export/excel"
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <Download size={17} />

              Excel
            </a>

          </div>

        </section>

        {/* Filters */}

        <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative min-w-0 flex-1">

              <Search
                size={17}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={t(
                  lang,
                  "search"
                )}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 ps-10 pe-4 text-sm text-slate-700 outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50"
              />

            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">

              <div className="relative">

                <Filter
                  size={15}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value
                    )
                  }
                  className="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white ps-9 pe-8 text-sm font-medium text-slate-600 outline-none sm:w-40"
                >
                  <option value="all">
                    {t(lang, "all")}
                  </option>

                  <option value="invoice">
                    {t(
                      lang,
                      "invoice"
                    )}
                  </option>

                  <option value="quote">
                    {t(
                      lang,
                      "quote"
                    )}
                  </option>
                </select>

              </div>

              <div className="relative">

                <SlidersHorizontal
                  size={15}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white ps-9 pe-8 text-sm font-medium text-slate-600 outline-none sm:w-40"
                >
                  <option value="all">
                    {t(lang, "all")}
                  </option>

                  <option value="draft">
                    {t(
                      lang,
                      "draft"
                    )}
                  </option>

                  <option value="sent">
                    {t(
                      lang,
                      "sent"
                    )}
                  </option>

                  <option value="paid">
                    {t(
                      lang,
                      "paid"
                    )}
                  </option>

                  <option value="overdue">
                    {t(
                      lang,
                      "overdue"
                    )}
                  </option>

                  <option value="expired">
                    {t(
                      lang,
                      "expired"
                    )}
                  </option>

                </select>

              </div>

            </div>

          </div>

          {!loading && (
            <p className="mt-3 px-1 text-xs text-slate-400">
              {docs.length}{" "}
              {lang === "ar"
                ? "وثيقة"
                : "documents"}
            </p>
          )}

        </section>

        {/* Loading */}

        {loading && (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          </div>
        )}

        {/* Empty */}

        {!loading &&
          docs.length === 0 && (

          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-300">

              <FileText
                size={29}
              />

            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              {t(
                lang,
                "noDocuments"
              )}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {t(
                lang,
                "createFirst"
              )}
            </p>

            <Link
              href="/documents/new?type=invoice"
              className="mt-6 flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white"
            >
              <Plus size={17} />

              {t(
                lang,
                "newInvoice"
              )}
            </Link>

          </div>

        )}

        {/* Documents */}

        {!loading &&
          docs.length > 0 && (
          <>

            {/* Desktop */}

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b border-slate-100 bg-slate-50">

                    <tr>

                      <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400">
                        {t(
                          lang,
                          "number"
                        )}
                      </th>

                      <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400">
                        {t(
                          lang,
                          "type"
                        )}
                      </th>

                      <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400">
                        {t(
                          lang,
                          "client"
                        )}
                      </th>

                      <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400">
                        {t(
                          lang,
                          "date"
                        )}
                      </th>

                      <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400">
                        {t(
                          lang,
                          "status"
                        )}
                      </th>

                      <th className="px-5 py-3 text-end text-xs font-semibold text-slate-400">
                        {t(
                          lang,
                          "total"
                        )}
                      </th>

                      <th className="px-5 py-3 text-end text-xs font-semibold text-slate-400">
                        {t(
                          lang,
                          "actions"
                        )}
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {docs.map((doc) => (

                      <tr
                        key={doc.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <Link
                            href={`/documents/${doc.id}`}
                            dir="ltr"
                            className="font-semibold text-slate-900 hover:text-violet-600"
                          >
                            {doc.number}
                          </Link>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              doc.type ===
                              "invoice"
                                ? "bg-violet-50 text-violet-600"
                                : "bg-cyan-50 text-cyan-600"
                            }`}
                          >

                            {doc.type ===
                            "invoice" ? (
                              <FileText size={13} />
                            ) : (
                              <FileCheck2 size={13} />
                            )}

                            {doc.type ===
                            "invoice"
                              ? t(
                                  lang,
                                  "invoice"
                                )
                              : t(
                                  lang,
                                  "quote"
                                )}

                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <p className="max-w-48 truncate text-sm font-medium text-slate-800">
                            {doc.clientName ||
                              "—"}
                          </p>

                          {doc.clientPhone && (
                            <p
                              dir="ltr"
                              className="mt-1 text-xs text-slate-400"
                            >
                              {doc.clientPhone}
                            </p>
                          )}

                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {doc.date}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusColors[
                                doc.status
                              ] ??
                              statusColors.draft
                            }`}
                          >
                            {t(
                              lang,
                              doc.status
                            )}
                          </span>

                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-end">

                          <span
                            dir="ltr"
                            className="text-sm font-bold text-slate-900"
                          >
                            {formatCurrency(
                              getDocumentTotal(
                                doc
                              ),
                              lang
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-1">

                            <Link
                              href={`/documents/${doc.id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                            >
                              <Eye size={16} />
                            </Link>

                            <Link
                              href={`/documents/${doc.id}/edit`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit2 size={16} />
                            </Link>

                            {doc.type ===
                              "quote" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleConvert(
                                    doc
                                  )
                                }
                                disabled={
                                  convertingId ===
                                  doc.id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-cyan-50 hover:text-cyan-600"
                              >
                                <RefreshCw
                                  size={16}
                                  className={
                                    convertingId ===
                                    doc.id
                                      ? "animate-spin"
                                      : ""
                                  }
                                />
                              </button>

                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  doc.id
                                )
                              }
                              disabled={
                                deletingId ===
                                doc.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
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

            </div>

            {/* Mobile */}

            <div className="space-y-3 md:hidden">

                            {docs.map((doc) => (

                <article
                  key={doc.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >

                  <div className="p-4">

                    <div className="flex items-start justify-between gap-4">

                      {/* Document info */}

                      <div className="min-w-0">

                        <Link
                          href={`/documents/${doc.id}`}
                          dir="ltr"
                          className="font-bold text-slate-900"
                        >
                          {doc.number}
                        </Link>

                        <div className="mt-2 flex flex-wrap gap-1.5">

                          {/* Type */}

                          <span
                            className={
                              doc.type === "invoice"
                                ? "rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-600"
                                : "rounded-lg bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-600"
                            }
                          >
                            {doc.type === "invoice"
                              ? t(lang, "invoice")
                              : t(lang, "quote")}
                          </span>

                          {/* Status */}

                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                              statusColors[doc.status] ??
                              statusColors.draft
                            }`}
                          >
                            {t(
                              lang,
                              doc.status
                            )}
                          </span>

                        </div>

                      </div>

                      {/* Amount */}

                      <div
                        className={
                          lang === "ar"
                            ? "text-left"
                            : "text-right"
                        }
                      >
                        <p
                          dir="ltr"
                          className="whitespace-nowrap font-bold text-slate-950"
                        >
                          {formatCurrency(
                            getDocumentTotal(doc),
                            lang
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {doc.date}
                        </p>
                      </div>

                    </div>

                    {/* Client */}

                    <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">

                      <p className="truncate text-sm font-medium text-slate-700">
                        {doc.clientName || "—"}
                      </p>

                      {doc.clientPhone && (
                        <p
                          dir="ltr"
                          className="mt-1 text-xs text-slate-400"
                        >
                          {doc.clientPhone}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* Mobile Actions */}

                  <div
                    className={`grid border-t border-slate-100 ${
                      doc.type === "quote"
                        ? "grid-cols-4"
                        : "grid-cols-3"
                    }`}
                  >

                    {/* View */}

                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex min-h-12 items-center justify-center gap-1 border-e border-slate-100 text-xs font-semibold text-violet-600"
                    >
                      <Eye size={15} />

                      {lang === "ar"
                        ? "عرض"
                        : lang === "fr"
                          ? "Voir"
                          : "View"}
                    </Link>

                    {/* Edit */}

                    <Link
                      href={`/documents/${doc.id}/edit`}
                      className="flex min-h-12 items-center justify-center gap-1 border-e border-slate-100 text-xs font-semibold text-blue-600"
                    >
                      <Edit2 size={15} />

                      {t(
                        lang,
                        "edit"
                      )}
                    </Link>

                    {/* Convert */}

                    {doc.type === "quote" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleConvert(doc)
                        }
                        disabled={
                          convertingId === doc.id
                        }
                        className="flex min-h-12 items-center justify-center gap-1 border-e border-slate-100 text-xs font-semibold text-cyan-600 disabled:opacity-50"
                      >
                        <RefreshCw
                          size={15}
                          className={
                            convertingId === doc.id
                              ? "animate-spin"
                              : ""
                          }
                        />

                        {lang === "ar"
                          ? "تحويل"
                          : lang === "fr"
                            ? "Convertir"
                            : "Convert"}
                      </button>
                    )}

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(doc.id)
                      }
                      disabled={
                        deletingId === doc.id
                      }
                      className="flex min-h-12 items-center justify-center gap-1 text-xs font-semibold text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={15} />

                      {t(
                        lang,
                        "delete"
                      )}
                    </button>

                  </div>

                </article>

              ))}

            </div>

          </>
        )}

      </div>

    </div>
  );
}
