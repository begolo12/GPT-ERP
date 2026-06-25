import { NextRequest, NextResponse } from "next/server";
import { DocType, ApprovalStatus } from "@prisma/client";
import { requireSession } from "@/lib/auth-server";
import { listTransactions, createTransaction } from "@/server/services/transaction.service";
import { lineItemSchema, transactionBaseSchema } from "@/lib/schemas/transaction";

const VALID_TYPES: DocType[] = ["PR", "PO", "DO", "GR", "FAKTUR"];

function parseType(t: string): DocType | null {
  return VALID_TYPES.includes(t as DocType) ? (t as DocType) : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const user = await requireSession();
  const { type } = await params;
  const docType = parseType(type);
  if (!docType) return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const result = await listTransactions({
    user,
    type: docType,
    page: parseInt(searchParams.get("page") ?? "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") ?? "20", 10),
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as ApprovalStatus) || undefined,
    projectCode: searchParams.get("projectCode") ?? undefined,
    vendorCode: searchParams.get("vendorCode") ?? undefined,
  });

  return NextResponse.json(result);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const user = await requireSession();
  const { type } = await params;
  const docType = parseType(type);
  if (!docType) return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });

  const body = await req.json();

  // Validasi: items minimal 1, qty > 0
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Minimal 1 item" }, { status: 400 });
  }

  try {
    const tx = await createTransaction(user, {
      type: docType,
      date: body.date,
      description: body.description,
      vendorCode: body.vendorCode,
      vendorName: body.vendorName,
      projectCode: body.projectCode,
      projectName: body.projectName,
      hasPPN: body.hasPPN ?? false,
      notes: body.notes,
      items: body.items,
      parentId: body.parentId,
      refType: body.refType,
      refId: body.refId,
      refCode: body.refCode,
      extraMetadata: body.extraMetadata,
    });
    return NextResponse.json(tx, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal membuat" }, { status: 400 });
  }
}