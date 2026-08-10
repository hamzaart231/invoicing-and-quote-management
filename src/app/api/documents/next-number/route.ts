import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  and,
  desc,
  eq,
  like,
} from "drizzle-orm";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/* =========================================
   GET NEXT DOCUMENT NUMBER
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
       DOCUMENT TYPE
    ===================================== */

    const { searchParams } =
      new URL(req.url);

    const requestedType =
      searchParams.get(
        "type"
      );

    const type =
      requestedType === "quote"
        ? "quote"
        : "invoice";

    /* =====================================
       YEAR + PREFIX
    ===================================== */

    const year =
      new Date().getFullYear();

    const prefix =
      type === "invoice"
        ? "F"
        : "D";

    const numberPrefix =
      `${prefix}-${year}-`;

    /* =====================================
       FIND LATEST NUMBER FOR THIS USER
    ===================================== */

    const latest =
      await db
        .select({
          number:
            documents.number,
        })
        .from(documents)
        .where(
          and(
            /*
             * Critical SaaS isolation:
             * only this user's documents.
             */
            eq(
              documents.userId,
              user.id
            ),

            eq(
              documents.type,
              type
            ),

            /*
             * Only current-year numbers.
             */
            like(
              documents.number,
              `${numberPrefix}%`
            )
          )
        )
        .orderBy(
          desc(
            documents.number
          )
        )
        .limit(1);

    /* =====================================
       CALCULATE NEXT NUMBER
    ===================================== */

    let nextNum = 1;

    if (
      latest.length > 0
    ) {
      const lastNumber =
        latest[0].number;

      const parts =
        lastNumber.split("-");

      const numericPart =
        parts[
          parts.length - 1
        ];

      const parsed =
        Number.parseInt(
          numericPart,
          10
        );

      if (
        Number.isInteger(
          parsed
        ) &&
        parsed >= 0
      ) {
        nextNum =
          parsed + 1;
      }
    }

    /* =====================================
       RESULT
    ===================================== */

    const number =
      `${prefix}-${year}-${String(
        nextNum
      ).padStart(3, "0")}`;

    return NextResponse.json({
      number,
    });
  } catch (error) {
    console.error(
      "GET /api/documents/next-number error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to get number",
      },
      {
        status: 500,
      }
    );
  }
      }
