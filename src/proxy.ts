import {
  NextRequest,
  NextResponse,
} from "next/server";

const SESSION_COOKIE =
  "invoicing_session";

const PUBLIC_PATHS = [
  "/login",
  "/register",
];

export function proxy(
  request: NextRequest
) {
  const { pathname } =
    request.nextUrl;

  /* =====================================
     PUBLIC ROUTES
  ===================================== */

  if (
    PUBLIC_PATHS.some(
      (path) =>
        pathname === path ||
        pathname.startsWith(
          `${path}/`
        )
    )
  ) {
    /*
     * Logged-in users do not need
     * login/register pages.
     */
    const session =
      request.cookies.get(
        SESSION_COOKIE
      )?.value;

    if (session) {
      return NextResponse.redirect(
        new URL(
          "/",
          request.url
        )
      );
    }

    return NextResponse.next();
  }

  /* =====================================
     AUTH API
  ===================================== */

  if (
    pathname.startsWith(
      "/api/auth/"
    )
  ) {
    return NextResponse.next();
  }

  /* =====================================
     OTHER APIs
     
     API authorization is handled inside
     each API route, not with redirects.
  ===================================== */

  if (
    pathname.startsWith(
      "/api/"
    )
  ) {
    return NextResponse.next();
  }

  /* =====================================
     PRIVATE APPLICATION
  ===================================== */

  const session =
    request.cookies.get(
      SESSION_COOKIE
    )?.value;

  if (!session) {
    const loginUrl =
      new URL(
        "/login",
        request.url
      );

    return NextResponse.redirect(
      loginUrl
    );
  }

  return NextResponse.next();
}

/*
 * Ignore Next.js static assets,
 * image optimizer, favicon and common
 * public files.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
