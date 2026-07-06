import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Public routes that never require auth at the edge (app enforces JWT client-side). */
const PUBLIC_PREFIXES = ["/login", "/register", "/welcome", "/r"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPublic) return NextResponse.next();
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
