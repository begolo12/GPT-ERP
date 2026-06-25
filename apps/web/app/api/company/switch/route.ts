import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { setActiveCompany } from "@/lib/company";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireSession();
  const { companyId } = await req.json();

  if (!companyId) {
    return NextResponse.json({ error: "companyId wajib diisi" }, { status: 400 });
  }

  // Cek akses
  if (user.role !== "ADMIN" && user.companyCode !== "GROUP") {
    if (user.companyId !== companyId) {
      return NextResponse.json({ error: "Tidak punya akses ke company ini" }, { status: 403 });
    }
  }

  // Validasi company exists
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: "Company tidak ditemukan" }, { status: 404 });
  }

  await setActiveCompany(companyId);
  return NextResponse.json({ ok: true, company: { id: company.id, code: company.code, name: company.name } });
}