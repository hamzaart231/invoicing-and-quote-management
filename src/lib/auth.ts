import { cookies } from "next/headers";
import {
  SignJWT,
  jwtVerify,
} from "jose";

const SESSION_COOKIE =
  "invoicing_session";

const SESSION_DURATION =
  60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

function getSecret() {
  const secret =
    process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not configured"
    );
  }

  return new TextEncoder().encode(
    secret
  );
}

/* Create signed session token */

export async function createSessionToken(
  user: SessionUser
): Promise<string> {
  return new SignJWT({
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(
      String(user.id)
    )
    .setIssuedAt()
    .setExpirationTime(
      `${SESSION_DURATION}s`
    )
    .sign(getSecret());
}

/* Verify session token */

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } =
      await jwtVerify(
        token,
        getSecret()
      );

    const id =
      Number(payload.sub);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return null;
    }

    if (
      typeof payload.name !==
        "string" ||
      typeof payload.email !==
        "string"
    ) {
      return null;
    }

    return {
      id,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

/* Save session to HttpOnly cookie */

export async function setSession(
  user: SessionUser
) {
  const token =
    await createSessionToken(
      user
    );

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    }
  );
}

/* Read current authenticated user */

export async function getCurrentUser():
  Promise<SessionUser | null> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(
    token
  );
}

/* Delete session */

export async function clearSession() {
  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );
}
