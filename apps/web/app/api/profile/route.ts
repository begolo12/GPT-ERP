import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import argon2 from "argon2";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password minimal 8 karakter").optional(),
}).refine((d) => !(d.newPassword && !d.currentPassword), {
  message: "Password lama wajib diisi untuk ganti password",
});

export async function PATCH(req: NextRequest) {
  const user = await requireSession();
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const data: any = {};
  if (parsed.data.name) data.name = parsed.data.name;

  if (parsed.data.newPassword) {
    const valid = await argon2.verify(dbUser.passwordHash, parsed.data.currentPassword ?? "");
    if (!valid) return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
    data.passwordHash = await argon2.hash(parsed.data.newPassword, { type: argon2.argon2id });
  }

  await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ ok: true });
}