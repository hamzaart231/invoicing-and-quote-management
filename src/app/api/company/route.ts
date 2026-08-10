import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  eq,
} from "drizzle-orm";

import { db } from "@/db";
import { company } from "@/db/schema";

import {
  getCurrentUser,
} from "@/lib/auth";

/* =========================================
   GET COMPANY
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
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================
       GET CURRENT USER COMPANY
    ===================================== */

    const result =
      await db
        .select()
        .from(company)
        .where(
          eq(
            company.userId,
            user.id
          )
        )
        .limit(1);

    if (
      result.length === 0
    ) {
      return NextResponse.json({
        company: null,
      });
    }

    return NextResponse.json({
      company: result[0],
    });
  } catch (error) {
    console.error(
      "GET /api/company error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch company",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   CREATE / UPDATE COMPANY
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
       FIND CURRENT USER COMPANY
    ===================================== */

    const existing =
      await db
        .select()
        .from(company)
        .where(
          eq(
            company.userId,
            user.id
          )
        )
        .limit(1);

    /* =====================================
       UPDATE
    ===================================== */

    if (
      existing.length > 0
    ) {
      const updated =
        await db
          .update(company)
          .set({
            name:
              body.name ?? "",

            address:
              body.address ?? "",

            phone:
              body.phone ?? "",

            email:
              body.email ?? "",

            ice:
              body.ice ?? "",

            logo:
              body.logo ?? "",

            /*
             * Preserve currency support.
             */
            currency:
              body.currency ??
              existing[0].currency ??
              "USD",

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              company.id,
              existing[0].id
            )
          )
          .returning();

      return NextResponse.json({
        company:
          updated[0],
      });
    }

    /* =====================================
       CREATE
    ===================================== */

    const created =
      await db
        .insert(company)
        .values({
          /*
           * Never accept userId from
           * the browser.
           */
          userId:
            user.id,

          name:
            body.name ?? "",

          address:
            body.address ?? "",

          phone:
            body.phone ?? "",

          email:
            body.email ?? "",

          ice:
            body.ice ?? "",

          logo:
            body.logo ?? "",

          currency:
            body.currency ??
            "USD",
        })
        .returning();

    return NextResponse.json(
      {
        company:
          created[0],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/company error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to save company",
      },
      {
        status: 500,
      }
    );
  }
      }
