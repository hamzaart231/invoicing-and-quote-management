import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(documents).where(eq(documents.id, parseInt(id)));
    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ document: result[0] });
  } catch (error) {
    console.error("GET /api/documents/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db
      .update(documents)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(documents.id, parseInt(id)))
      .returning();
    return NextResponse.json({ document: updated[0] });
  } catch (error) {
    console.error("PUT /api/documents/[id] error:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(documents).where(eq(documents.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/documents/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
