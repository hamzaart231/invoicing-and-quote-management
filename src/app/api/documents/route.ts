import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const type = searchParams.get("type") ?? "";
    const status = searchParams.get("status") ?? "";

    const conditions = [];
    if (type && type !== "all") conditions.push(eq(documents.type, type));
    if (status && status !== "all") conditions.push(eq(documents.status, status));
    if (search) {
      conditions.push(
        or(
          ilike(documents.clientName, `%${search}%`),
          ilike(documents.number, `%${search}%`)
        )
      );
    }

    const result = conditions.length > 0
      ? await db.select().from(documents).where(and(...conditions)).orderBy(desc(documents.createdAt))
      : await db.select().from(documents).orderBy(desc(documents.createdAt));

    return NextResponse.json({ documents: result });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.insert(documents).values({
      type: body.type,
      number: body.number,
      date: body.date,
      dueDate: body.dueDate ?? "",
      clientName: body.clientName ?? "",
      clientPhone: body.clientPhone ?? "",
      clientEmail: body.clientEmail ?? "",
      clientAddress: body.clientAddress ?? "",
      items: body.items ?? [],
      taxRate: String(body.taxRate ?? 20),
      discount: String(body.discount ?? 0),
      discountType: body.discountType ?? "fixed",
      status: body.status ?? "draft",
      template: body.template ?? "classic",
      language: body.language ?? "ar",
      notes: body.notes ?? "",
      convertedFrom: body.convertedFrom ?? 0,
    }).returning();
    return NextResponse.json({ document: created[0] });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
