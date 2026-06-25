import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth: middleware } = NextAuth(authConfig);

// Rate limit (basic - per IP, 200 req/min untuk global, 30 req/min untuk API)
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  api: { limit: 200, windowMs: 60_000 },
  auth: { limit: 10, windowMs: 60_000 },
};

const buckets = new Map<string, { count: number; resetAt: number }>();

function checkRate(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0 };
  b.count += 1;
  return { ok: true, remaining: limit - b.count };
}

export default middleware((req) => {
  const path = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  // Apply rate limit ke API
  if (path.startsWith("/api/")) {
    const config = path.startsWith("/api/auth") ? RATE_LIMITS.auth : RATE_LIMITS.api;
    const result = checkRate(`${ip}:${path.split("/").slice(0, 3).join("/")}`, config.limit, config.windowMs);
    if (!result.ok) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }
  }

  const isLoggedIn = !!req.auth;
  const isOnLogin = path.startsWith("/login");
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/operasi") ||
    path.startsWith("/keuangan") ||
    path.startsWith("/ga") ||
    path.startsWith("/hr") ||
    path.startsWith("/pengaturan");

  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};