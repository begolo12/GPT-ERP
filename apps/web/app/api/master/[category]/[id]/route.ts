import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { masterCategorySchema, masterItemSchema } from "@/lib/schemas/master";

async function loadItem(id: string, category: string, companyId: string) {
  const item = await prisma.masterDataItem.findUnique({ where: { id } });
  if (!item || item.category !== category || item.companyId !== companyId) return null;
  return item;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string; id: string }> },
) {
  const user = await requireSession();
  const { category, id } = await params;
  const catParsed = masterCategorySchema.safeParse(category);
  if (!catParsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const item = await loadItem(id, catParsed.data, user.companyId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ category: string; id: string }> },
) {
  const user = await requireSession();
  const { category, id } = await params;
  const catParsed = masterCategorySchema.safeParse(category);
  if (!catParsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const item = await loadItem(id, catParsed.data, user.companyId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = masterItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.code && parsed.data.code !== item.code) {
    const dup = await prisma.masterDataItem.findFirst({
      where: { companyId: user.companyId, category: catParsed.data, code: parsed.data.code, NOT: { id } },
    });
    if (dup) return NextResponse.json({ error: `Kode "${parsed.data.code}" sudah ada` }, { status: 409 });
  }

  const updated = await prisma.masterDataItem.update({
    where: { id },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.code && { code: parsed.data.code }),
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.metadata && { metadata: { ...(item.metadata as any ?? {}), ...parsed.data.metadata } }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string; id: string }> },
) {
  const user = await requireSession();
  const { category, id } = await params;
  const catParsed = masterCategorySchema.safeParse(category);
  if (!catParsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const item = await loadItem(id, catParsed.data, user.companyId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.masterDataItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}