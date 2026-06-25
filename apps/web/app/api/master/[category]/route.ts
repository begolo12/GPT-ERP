import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { masterCategorySchema, masterItemSchema } from "@/lib/schemas/master";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const user = await requireSession();
  const { category } = await params;

  const parsed = masterCategorySchema.safeParse(category);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const search = (searchParams.get("search") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim();

  const where: any = {
    companyId: user.companyId,
    category: parsed.data,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "AKTIF" || status === "NONAKTIF") {
    where.status = status;
  }

  const [data, total] = await Promise.all([
    prisma.masterDataItem.findMany({
      where,
      orderBy: { code: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.masterDataItem.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const user = await requireSession();
  const { category } = await params;

  const catParsed = masterCategorySchema.safeParse(category);
  if (!catParsed.success) {
    return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = masterItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.masterDataItem.findFirst({
    where: { companyId: user.companyId, category: catParsed.data, code: parsed.data.code },
  });
  if (existing) {
    return NextResponse.json({ error: `Kode "${parsed.data.code}" sudah ada` }, { status: 409 });
  }

  const item = await prisma.masterDataItem.create({
    data: {
      companyId: user.companyId,
      category: catParsed.data,
      code: parsed.data.code,
      name: parsed.data.name,
      status: parsed.data.status,
      metadata: parsed.data.metadata ?? {},
    },
  });

  return NextResponse.json(item, { status: 201 });
}