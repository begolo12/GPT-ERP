import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import type { UserRole, DivisionCode } from "@shared/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      companyId: string;
      companyCode: string;
      divisionCode: DivisionCode | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    companyId: string;
    companyCode: string;
    divisionCode: DivisionCode | null;
  }
}

const credentialsSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const parsed = credentialsSchema.safeParse(creds);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true, division: true },
        });

        if (!user || !user.isActive) return null;

        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyCode: user.company.code,
          divisionCode: user.division?.code ?? null,
        };
      },
    }),
  ],
});