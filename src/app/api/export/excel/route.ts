import {
  NextResponse,
} from "next/server";

import {
  desc,
  eq,
} from "drizzle-orm";

import * as XLSX from "xlsx";

import { db } from "@/db";

import {
  documents,
} from "@/db/schema";

import {
  DocumentItem,
  calcSubtotal,
  calcDiscount,
  calcTax,
  calcTotal,
} from "@/lib/types";

import {
  getCurrentUser,
} from "@/lib/auth";

/* =========================================
   EXPORT EXCEL
========================================= */

export async function GET() {
  try {
    /* =====================================
       AUTHENTICATION
    ===================================== */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================
       USER DOCUMENTS ONLY
    ===================================== */

    const docs =
      await db
        .select()
        .from(documents)
        .where(
          eq(
            documents.userId,
            user.id
          )
        )
        .orderBy(
          desc(
            documents.createdAt
          )
        );

    /* =====================================
       EXCEL ROWS
    ===================================== */

    const rows =
      docs.map((doc) => {
        const items =
          (
            doc.items as DocumentItem[]
          ) ?? [];

        /*
         * Use the same calculation
         * functions as invoices.
         */
        const subtotal =
          calcSubtotal(
            items
          );

        const discount =
          Number(
            doc.discount ?? 0
          );

        /*
         * Support old "percent" data
         * while keeping the current
         * "percentage" format.
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

        const taxRate =
          Number(
            doc.taxRate ?? 0
          );

        const taxAmount =
          calcTax(
            subtotal,
            discountAmount,
            taxRate
          );

        const total =
          calcTotal(
            subtotal,
            discountAmount,
            taxAmount
          );

        return {
          "النوع / Type":
            doc.type ===
            "invoice"
              ? "فاتورة / Facture"
              : "عرض سعر / Devis",

          "الرقم / Numéro":
            doc.number,

          "التاريخ / Date":
            doc.date,

          "الزبون / Client":
            doc.clientName,

          "الهاتف / Téléphone":
            doc.clientPhone ??
            "",

          "الحالة / Statut":
            doc.status,

          "المجموع الفرعي / Sous-total":
            subtotal.toFixed(
              2
            ),

          "الضريبة / TVA":
            taxAmount.toFixed(
              2
            ),

          "الخصم / Remise":
            discountAmount.toFixed(
              2
            ),

          "المجموع الكلي / Total":
            total.toFixed(
              2
            ),

          /*
           * Use each document's actual
           * currency instead of forcing MAD.
           */
          "العملة / Devise":
            doc.currency ||
            "USD",
        };
      });

    /* =====================================
       WORKBOOK
    ===================================== */

    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );

    /*
     * Better default column widths.
     */
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 16 },
      { wch: 26 },
      { wch: 20 },
      { wch: 16 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 },
      { wch: 16 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Documents"
    );

    const buffer =
      XLSX.write(
        workbook,
        {
          type: "buffer",
          bookType:
            "xlsx",
        }
      );

    /* =====================================
       DOWNLOAD
    ===================================== */

    const date =
      new Date()
        .toISOString()
        .split("T")[0];

    return new NextResponse(
      buffer,
      {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="fawatiri-export-${date}.xlsx"`,

          /*
           * Avoid caching another user's
           * export in intermediary caches.
           */
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/export/excel error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to export",
      },
      {
        status: 500,
      }
    );
  }
}
