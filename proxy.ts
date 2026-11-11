import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token from cookies
  const sessionToken = request.cookies.get("authjs.session-token")?.value ||
                      request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;
  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");
  const isPublicPage = pathname === "/" || pathname === "/test-ai" || pathname === "/test-voice";

  let response: NextResponse;

  if (isAuthPage && isLoggedIn) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (!pathname.startsWith("/api/") && !isLoggedIn && !isPublicPage && !isAuthPage) {
    response = NextResponse.redirect(new URL("/signin", request.url));
  } else {
    response = NextResponse.next();
  }

  return applySecurityHeaders(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|pdf|txt|xml|json|css|js|map)$).*)",
  ],
};
