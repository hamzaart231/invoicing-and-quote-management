"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit2,
  Printer,
  Trash2,
} from "lucide-react";

import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import {
  DocumentData,
  CompanyData,
} from "@/lib/types";

import DocumentPrint from "@/components/DocumentPrint";

export default function DocumentViewPage() {
  const { id } = useParams<{ id: string }>();

  const { lang } = useLang();

  const router = useRouter();

  const [doc, setDoc] =
    useState<DocumentData | null>(null);

  const [company, setCompany] =
    useState<CompanyData>({
      name: "",
      address: "",
      phone: "",
      email: "",
      ice: "",
      logo: "",
      currency: "MAD",
    });

  const [loading, setLoading] =
    useState(true);

  /*
   * Load document and company
   */
  useEffect(() => {
    Promise.all([
      fetch(`/api/documents/${id}`).then(
        (response) => response.json()
      ),

      fetch("/api/company").then(
        (response) => response.json()
      ),
    ])
      .then(([docData, companyData]) => {
        setDoc(docData.document ?? null);

        if (companyData.company) {
          setCompany(companyData.company);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Failed to load document:",
          error
        );

        setLoading(false);
      });
  }, [id]);

  /*
   * Print
   *
   * Important:
   * Do NOT use window.open().
   *
   * Capacitor / Android may interpret
   * a new window as an external URL
   * and open Chrome.
   *
   * Printing the current document also
   * keeps the Tailwind CSS already
   * compiled by Next.js.
   */
  const handlePrint = () => {
    window.print();
  };

  /*
   * Delete document
   */
  const handleDelete = async () => {
    if (
      !window.confirm(
        t(lang, "deleteConfirm")
      )
    ) {
      return;
    }

    await fetch(
      `/api/documents/${id}`,
      {
        method: "DELETE",
      }
    );

    router.push("/documents");
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  /*
   * Document not found
   */
  if (!doc) {
    return (
      <div className="py-16 text-center text-gray-400">
        Document not found
      </div>
    );
  }

  return (
    <>
      {/* Print configuration */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .document-page {
            width: 210mm !important;
            max-width: 210mm !important;
            min-height: 297mm;
            margin: 0 auto !important;
            padding: 0 !important;

            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;

            overflow: visible !important;

            background: white !important;
          }

          .document-page table {
            width: 100%;
            border-collapse: collapse;
          }

          .document-page thead {
            display: table-header-group;
          }

          .document-page tfoot {
            display: table-footer-group;
          }

          .document-page tr,
          .document-page td,
          .document-page th {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .document-page img {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 py-6 print:m-0 print:max-w-none print:p-0">

        {/* Toolbar */}
        <div className="no-print mb-6 flex flex-wrap items-center gap-3">

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              router.push("/documents")
            }
            className="rounded-lg border border-gray-200 bg-white p-2 transition hover:bg-gray-50"
          >
            <ArrowLeft
              size={18}
              className={
                lang === "ar"
                  ? "rotate-180"
                  : ""
              }
            />
          </button>

          {/* Number */}
          <h1 className="flex-1 text-xl font-bold text-gray-900">
            {doc.number}
          </h1>

          {/* Edit */}
          <Link
            href={`/documents/${id}/edit`}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            <Edit2 size={16} />

            {t(lang, "edit")}
          </Link>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            <Printer size={16} />

            {t(lang, "print")}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <Trash2 size={16} />

            {t(lang, "delete")}
          </button>

        </div>

        {/* Printable Document */}
        <div
          id="print-doc"
          className="document-page overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <DocumentPrint
            doc={doc}
            company={company}
          />
        </div>

      </div>
    </>
  );
            }
