import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  and,
  eq,
} from "drizzle-orm";

import { db } from "@/db";
import { documents } from "@/db/schema";

import {
  getCurrentUser,
} from "@/lib/auth";

/* =========================================
   ROUTE CONTEXT
========================================= */

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================
   GET DOCUMENT
========================================= */

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    /* Authentication */

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

    /* Document ID */

    const { id } =
      await params;

    const documentId =
      Number.parseInt(
        id,
        10
      );

    if (
      !Number.isInteger(
        documentId
      ) ||
      documentId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid document id",
        },
        {
          status: 400,
        }
      );
    }

    /* Tenant-safe query */

    const result =
      await db
        .select()
        .from(documents)
        .where(
          and(
            eq(
              documents.id,
              documentId
            ),
            eq(
              documents.userId,
              user.id
            )
          )
        )
        .limit(1);

    if (
      result.length === 0
    ) {
      /*
       * Return 404 even when the document
       * exists for another user.
       *
       * This avoids leaking information.
       */
      return NextResponse.json(
        {
          error: "Not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      document: result[0],
    });
  } catch (error) {
    console.error(
      "GET /api/documents/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch document",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   UPDATE DOCUMENT
========================================= */

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    /* Authentication */

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

    /* Document ID */

    const { id } =
      await params;

    const documentId =
      Number.parseInt(
        id,
        10
      );

    if (
      !Number.isInteger(
        documentId
      ) ||
      documentId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid document id",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await req.json();

    /* Tenant-safe update */

    const updated =
      await db
        .update(documents)
        .set({
          type:
            body.type,

          number:
            body.number,

          date:
            body.date,

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

          taxRate:
            String(
              body.taxRate ??
                20
            ),

          discount:
            String(
              body.discount ??
                0
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
           * Preserve currency support.
           */
          currency:
            body.currency ??
            "USD",

          notes:
            body.notes ?? "",

          convertedFrom:
            body.convertedFrom ??
            0,

          updatedAt:
            new Date(),
        })
        .where(
          and(
            eq(
              documents.id,
              documentId
            ),
            eq(
              documents.userId,
              user.id
            )
          )
        )
        .returning();

    if (
      updated.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      document: updated[0],
    });
  } catch (error) {
    console.error(
      "PUT /api/documents/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update document",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   DELETE DOCUMENT
========================================= */

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    /* Authentication */

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

    /* Document ID */

    const { id } =
      await params;

    const documentId =
      Number.parseInt(
        id,
        10
      );

    if (
      !Number.isInteger(
        documentId
      ) ||
      documentId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid document id",
        },
        {
          status: 400,
        }
      );
    }

    /* Tenant-safe delete */

    const deleted =
      await db
        .delete(documents)
        .where(
          and(
            eq(
              documents.id,
              documentId
            ),
            eq(
              documents.userId,
              user.id
            )
          )
        )
        .returning({
          id: documents.id,
        });

    if (
      deleted.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/documents/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete document",
      },
      {
        status: 500,
      }
    );
  }
      }
