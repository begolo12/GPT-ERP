// Edge-safe auth config (dipakai middleware)
// Tidak boleh import Prisma, argon2, atau native modules
import type { NextAuthConfig } from "next-auth";
import type { UserRole, DivisionCode } from "@shared/enums";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [], // diisi di auth.ts (Node runtime)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
        token.companyId = user.companyId as string;
        token.companyCode = user.companyCode as string;
        token.divisionCode = user.divisionCode as DivisionCode | null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.companyId = token.companyId as string;
        session.user.companyCode = token.companyCode as string;
        session.user.divisionCode = token.divisionCode as DivisionCode | null;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isOnLogin = path.startsWith("/login");
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/operasi") ||
        path.startsWith("/keuangan") ||
        path.startsWith("/ga") ||
        path.startsWith("/hr") ||
        path.startsWith("/pengaturan");

      if (isProtected && !isLoggedIn) return false;
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
  },
};