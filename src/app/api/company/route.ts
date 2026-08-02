import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { company } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(company).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ company: null });
    }
    return NextResponse.json({ company: result[0] });
  } catch (error) {
    console.error("GET /api/company error:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await db.select().from(company).limit(1);
    
    if (existing.length > 0) {
      const updated = await db
        .update(company)
        .set({
          name: body.name ?? "",
          address: body.address ?? "",
          phone: body.phone ?? "",
          email: body.email ?? "",
          ice: body.ice ?? "",
          logo: body.logo ?? "",
          updatedAt: new Date(),
        })
        .where(eq(company.id, existing[0].id))
        .returning();
      return NextResponse.json({ company: updated[0] });
    } else {
      const created = await db
        .insert(company)
        .values({
          name: body.name ?? "",
          address: body.address ?? "",
          phone: body.phone ?? "",
          email: body.email ?? "",
          ice: body.ice ?? "",
          logo: body.logo ?? "",
        })
        .returning();
      return NextResponse.json({ company: created[0] });
    }
  } catch (error) {
    console.error("POST /api/company error:", error);
    return NextResponse.json({ error: "Failed to save company" }, { status: 500 });
  }
}
