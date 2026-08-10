import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  eq,
  desc,
  ilike,
  or,
  and,
} from "drizzle-orm";

import { db } from "@/db";
import { documents } from "@/db/schema";

import {
  getCurrentUser,
} from "@/lib/auth";

/* =========================================
   GET DOCUMENTS
========================================= */

export async function GET(
  req: NextRequest
) {
  try {
    /* =====================================
       AUTHENTICATION
    ===================================== */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================
       FILTERS
    ===================================== */

    const { searchParams } =
      new URL(req.url);

    const search =
      searchParams.get(
        "search"
      ) ?? "";

    const type =
      searchParams.get(
        "type"
      ) ?? "";

    const status =
      searchParams.get(
        "status"
      ) ?? "";

    /*
     * Critical:
     *
     * Every query starts with userId.
     * This guarantees tenant isolation.
     */

    const conditions = [
      eq(
        documents.userId,
        user.id
      ),
    ];

    if (
      type &&
      type !== "all"
    ) {
      conditions.push(
        eq(
          documents.type,
          type
        )
      );
    }

    if (
      status &&
      status !== "all"
    ) {
      conditions.push(
        eq(
          documents.status,
          status
        )
      );
    }

    if (search) {
      const searchCondition =
        or(
          ilike(
            documents.clientName,
            `%${search}%`
          ),

          ilike(
            documents.number,
            `%${search}%`
          )
        );

      if (searchCondition) {
        conditions.push(
          searchCondition
        );
      }
    }

    /* =====================================
       QUERY
    ===================================== */

    const result =
      await db
        .select()
        .from(documents)
        .where(
          and(
            ...conditions
          )
        )
        .orderBy(
          desc(
            documents.createdAt
          )
        );

    return NextResponse.json({
      documents: result,
    });
  } catch (error) {
    console.error(
      "GET /api/documents error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch documents",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   CREATE DOCUMENT
========================================= */

export async function POST(
  req: NextRequest
) {
  try {
    /* =====================================
       AUTHENTICATION
    ===================================== */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================
       BODY
    ===================================== */

    const body =
      await req.json();

    /* =====================================
       CREATE DOCUMENT
    ===================================== */

    const created =
      await db
        .insert(documents)
        .values({
          /*
           * Never accept userId from
           * the browser.
           *
           * The authenticated session
           * determines ownership.
           */
          userId: user.id,

          type: body.type,

          number: body.number,

          date: body.date,

          dueDate:
            body.dueDate ?? "",

          clientName:
            body.clientName ?? "",

          clientPhone:
            body.clientPhone ?? "",

          clientEmail:
            body.clientEmail ?? "",

          clientAddress:
            body.clientAddress ?? "",

          items:
            body.items ?? [],

          taxRate: String(
            body.taxRate ?? 20
          ),

          discount: String(
            body.discount ?? 0
          ),

          discountType:
            body.discountType ??
            "fixed",

          status:
            body.status ??
            "draft",

          template:
            body.template ??
            "classic",

          language:
            body.language ??
            "ar",

          /*
           * Keep currency support.
           *
           * Your previous route did not
           * explicitly save it, although
           * the schema supports it.
           */
          currency:
            body.currency ??
            "USD",

          notes:
            body.notes ?? "",

          convertedFrom:
            body.convertedFrom ??
            0,
        })
        .returning();

    return NextResponse.json(
      {
        document:
          created[0],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/documents error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create document",
      },
      {
        status: 500,
      }
    );
  }
  }
