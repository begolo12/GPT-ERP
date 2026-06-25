import { NextRequest, NextResponse } from "next/server";
import { DocType } from "@prisma/client";
import { requireSession } from "@/lib/auth-server";
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/server/services/transaction.service";

const VALID_TYPES: DocType[] = ["PR", "PO", "DO", "GR", "FAKTUR", "QUOTATION", "SO", "SURAT_JALAN", "PEMBAYARAN", "JURNAL_MEMORIAL", "HUTANG", "PENGADAAN_GA", "PERAWATAN_KENDARAAN", "PENGGAJIAN"];

function parseType(t: string): DocType | null {
  return VALID_TYPES.includes(t as DocType) ? (t as DocType) : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const user = await requireSession();
  const { type, id } = await params;
  const docType = parseType(type);
  if (!docType) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  const tx = await getTransaction(user, docType, id);
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tx);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const user = await requireSession();
  const { type, id } = await params;
  const docType = parseType(type);
  if (!docType) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const body = await req.json();
  try {
    const tx = await updateTransaction(user, docType, id, body);
    return NextResponse.json(tx);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const user = await requireSession();
  const { type, id } = await params;
  const docType = parseType(type);
  if (!docType) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  try {
    await deleteTransaction(user, docType, id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}