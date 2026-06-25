import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const user = await requireSession();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang bisa akses" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") ?? "").trim();
  const role = searchParams.get("role") ?? "";

  const where: any = { companyId: user.companyId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;

  const data = await prisma.user.findMany({
    where,
    include: { company: { select: { code: true, name: true } }, division: { select: { code: true, name: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data });
}