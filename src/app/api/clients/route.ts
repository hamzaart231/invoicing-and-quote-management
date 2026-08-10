import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  and,
  eq,
  ilike,
  or,
} from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/* =========================================
   GET CLIENTS
========================================= */

export async function GET(
  req: NextRequest
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

    const { searchParams } =
      new URL(req.url);

    const search =
      searchParams
        .get("search")
        ?.trim() ?? "";

    /* =====================================
       Tenant-safe search
    ===================================== */

    if (search) {
      const searchCondition =
        or(
          ilike(
            clients.name,
            `%${search}%`
          ),
          ilike(
            clients.phone,
            `%${search}%`
          )
        );

      const result =
        await db
          .select()
          .from(clients)
          .where(
            and(
              eq(
                clients.userId,
                user.id
              ),
              searchCondition
            )
          )
          .orderBy(
            clients.name
          );

      return NextResponse.json({
        clients: result,
      });
    }

    /* =====================================
       Tenant-safe list
    ===================================== */

    const result =
      await db
        .select()
        .from(clients)
        .where(
          eq(
            clients.userId,
            user.id
          )
        )
        .orderBy(
          clients.name
        );

    return NextResponse.json({
      clients: result,
    });
  } catch (error) {
    console.error(
      "GET /api/clients error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch clients",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   CREATE / IMPORT CLIENTS
========================================= */

export async function POST(
  req: NextRequest
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

    const body =
      await req.json();

    /* =====================================
       BULK IMPORT
    ===================================== */

    if (
      Array.isArray(
        body.clients
      )
    ) {
      const newClients =
        body.clients as {
          name: string;
          phone?: string;
          email?: string;
          address?: string;
        }[];

      let imported = 0;

      for (
        const client of newClients
      ) {
        const name =
          typeof client.name ===
          "string"
            ? client.name.trim()
            : "";

        if (!name) {
          continue;
        }

        /*
         * Duplicate checking is scoped
         * to the authenticated user.
         *
         * Another account is allowed
         * to have a client with the
         * same name.
         */
        const existing =
          await db
            .select({
              id: clients.id,
            })
            .from(clients)
            .where(
              and(
                eq(
                  clients.userId,
                  user.id
                ),
                eq(
                  clients.name,
                  name
                )
              )
            )
            .limit(1);

        if (
          existing.length > 0
        ) {
          continue;
        }

        await db
          .insert(clients)
          .values({
            userId:
              user.id,

            name,

            phone:
              client.phone ?? "",

            email:
              client.email ?? "",

            address:
              client.address ?? "",
          });

        imported++;
      }

      return NextResponse.json({
        imported,
      });
    }

    /* =====================================
       SINGLE CLIENT
    ===================================== */

    const name =
      typeof body.name ===
      "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Client name is required",
        },
        {
          status: 400,
        }
      );
    }

    const created =
      await db
        .insert(clients)
        .values({
          /*
           * Ownership always comes
           * from the server session.
           */
          userId:
            user.id,

          name,

          phone:
            body.phone ?? "",

          email:
            body.email ?? "",

          address:
            body.address ?? "",
        })
        .returning();

    return NextResponse.json(
      {
        client:
          created[0],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/clients error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create client",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   DELETE CLIENT
========================================= */

export async function DELETE(
  req: NextRequest
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

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get(
        "id"
      );

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing id",
        },
        {
          status: 400,
        }
      );
    }

    const clientId =
      Number.parseInt(
        id,
        10
      );

    if (
      !Number.isInteger(
        clientId
      ) ||
      clientId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid client id",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Critical:
     *
     * A user can delete only a client
     * owned by that same user.
     */
    const deleted =
      await db
        .delete(clients)
        .where(
          and(
            eq(
              clients.id,
              clientId
            ),
            eq(
              clients.userId,
              user.id
            )
          )
        )
        .returning({
          id: clients.id,
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
      "DELETE /api/clients error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete client",
      },
      {
        status: 500,
      }
    );
  }
      }
