import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["ADMIN", "FINANCE", "OP", "GA", "HR", "SPV", "MANAGER", "DIREKTUR"]).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
  divisionId: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang bisa edit" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.companyId !== user.companyId) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const updated = await prisma.user.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ id: updated.id, role: updated.role, isActive: updated.isActive });
}