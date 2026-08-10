import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users } from "@/db/schema";
import { setSession } from "@/lib/auth";

/* =========================================
   REGISTER
========================================= */

export async function POST(
  request: Request
) {
  try {
    /* =====================================
       READ BODY
    ===================================== */

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

    /* =====================================
       VALIDATION
    ===================================== */

    if (!name) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          error: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Basic email validation.
     */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Minimum password length.
     */

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 8 characters",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================
       CHECK EXISTING USER
    ===================================== */

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
          success: false,
          error:
            "Email already registered",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================
       PASSWORD HASH
    ===================================== */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    /* =====================================
       CREATE USER
    ===================================== */

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

    if (!user) {
      throw new Error(
        "User was not created"
      );
    }

    /* =====================================
       CREATE SESSION
    ===================================== */

    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    /* =====================================
       RESPONSE
    ===================================== */

    return NextResponse.json(
      {
        success: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt:
            user.createdAt,
        },
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
        success: false,
        error:
          "Unable to create account",
      },
      {
        status: 500,
      }
    );
  }
        }
