import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { listApprovalQueue } from "@/server/services/approval.service";

export async function GET(
  req: NextRequest,
) {
  const user = await requireSession();
  const { searchParams } = new URL(req.url);
  const result = await listApprovalQueue(user, {
    page: parseInt(searchParams.get("page") ?? "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") ?? "20", 10),
    divisionCode: searchParams.get("division") ?? undefined,
  });
  return NextResponse.json(result);
}