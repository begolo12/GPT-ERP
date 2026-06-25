import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { getTransactionHistory } from "@/server/services/report.service";

export async function GET(req: NextRequest) {
  const user = await requireSession();
  const { searchParams } = new URL(req.url);
  const result = await getTransactionHistory(user, {
    page: parseInt(searchParams.get("page") ?? "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") ?? "50", 10),
    type: searchParams.get("type") ?? undefined,
    startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
    endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
  });
  return NextResponse.json(result);
}