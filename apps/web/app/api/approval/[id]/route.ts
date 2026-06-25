import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import {
  submitForApproval,
  approveTransaction,
  rejectTransaction,
  reviseTransaction,
  ApprovalError,
} from "@/server/services/approval.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  const { id } = await params;
  const body = await req.json();
  const action = body.action as string;
  const note = body.note as string | undefined;

  try {
    let result;
    switch (action) {
      case "submit":
        result = await submitForApproval(user, id, note);
        break;
      case "approve":
        result = await approveTransaction(user, id, note);
        break;
      case "reject":
        result = await rejectTransaction(user, id, note ?? "");
        break;
      case "revise":
        result = await reviseTransaction(user, id, note ?? "");
        break;
      default:
        return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e: any) {
    if (e instanceof ApprovalError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: e.message ?? "Gagal" }, { status: 500 });
  }
}