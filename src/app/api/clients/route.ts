import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    
    let result;
    if (search) {
      result = await db.select().from(clients)
        .where(or(ilike(clients.name, `%${search}%`), ilike(clients.phone, `%${search}%`)));
    } else {
      result = await db.select().from(clients).orderBy(clients.name);
    }
    return NextResponse.json({ clients: result });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle bulk import
    if (Array.isArray(body.clients)) {
      const newClients = body.clients as { name: string; phone: string; email?: string; address?: string }[];
      let imported = 0;
      for (const c of newClients) {
        if (!c.name) continue;
        // Check for duplicate by name
        const existing = await db.select().from(clients).where(eq(clients.name, c.name)).limit(1);
        if (existing.length === 0) {
          await db.insert(clients).values({
            name: c.name,
            phone: c.phone ?? "",
            email: c.email ?? "",
            address: c.address ?? "",
          });
          imported++;
        }
      }
      return NextResponse.json({ imported });
    }
    
    // Single client
    const created = await db.insert(clients).values({
      name: body.name,
      phone: body.phone ?? "",
      email: body.email ?? "",
      address: body.address ?? "",
    }).returning();
    return NextResponse.json({ client: created[0] });
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.delete(clients).where(eq(clients.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/clients error:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
