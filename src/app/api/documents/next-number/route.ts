import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "invoice";
    const year = new Date().getFullYear();
    const prefix = type === "invoice" ? "F" : "D";

    const latest = await db
      .select()
      .from(documents)
      .where(eq(documents.type, type))
      .orderBy(desc(documents.id))
      .limit(1);

    let nextNum = 1;
    if (latest.length > 0) {
      const lastNum = latest[0].number;
      const parts = lastNum.split("-");
      const num = parseInt(parts[parts.length - 1]);
      if (!isNaN(num)) nextNum = num + 1;
    }

    const number = `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
    return NextResponse.json({ number });
  } catch (error) {
    console.error("GET /api/documents/next-number error:", error);
    return NextResponse.json({ error: "Failed to get number" }, { status: 500 });
  }
}
