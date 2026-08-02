import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as XLSX from "xlsx";
import { DocumentItem } from "@/lib/types";

export async function GET() {
  try {
    const docs = await db.select().from(documents).orderBy(desc(documents.createdAt));

    const rows = docs.map((doc) => {
      const items = (doc.items as DocumentItem[]) ?? [];
      const subtotal = items.reduce((s, i) => s + i.total, 0);
      const discount = parseFloat(String(doc.discount)) || 0;
      const discountType = doc.discountType;
      const discountAmount = discountType === "percent" ? (subtotal * discount) / 100 : discount;
      const taxRate = parseFloat(String(doc.taxRate)) || 0;
      const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
      const total = subtotal - discountAmount + taxAmount;

      return {
        "النوع / Type": doc.type === "invoice" ? "فاتورة / Facture" : "عرض سعر / Devis",
        "الرقم / Numéro": doc.number,
        "التاريخ / Date": doc.date,
        "الزبون / Client": doc.clientName,
        "الهاتف / Téléphone": doc.clientPhone,
        "الحالة / Statut": doc.status,
        "المجموع الفرعي / Sous-total": subtotal.toFixed(2),
        "الضريبة / TVA": taxAmount.toFixed(2),
        "الخصم / Remise": discountAmount.toFixed(2),
        "المجموع الكلي / Total": total.toFixed(2),
        "العملة / Devise": "MAD",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Documents");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="fawatiri-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export/excel error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
