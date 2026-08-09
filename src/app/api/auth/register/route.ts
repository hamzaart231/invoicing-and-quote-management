import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    /* Validation */

    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !email.includes("@")
    ) {
      return NextResponse.json(
        {
          error: "Invalid email",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters",
        },
        {
          status: 400,
        }
      );
    }

    /* Check duplicate email */

    const existingUsers =
      await db
        .select({
          id: users.id,
        })
        .from(users)
        .where(
          eq(
            users.email,
            email
          )
        )
        .limit(1);

    if (
      existingUsers.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Email already registered",
        },
        {
          status: 409,
        }
      );
    }

    /* Hash password */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    /* Create user */

    const createdUsers =
      await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt:
            users.createdAt,
        });

    const user =
      createdUsers[0];

    return NextResponse.json(
      {
        success: true,
        user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create account",
      },
      {
        status: 500,
      }
    );
  }
}
