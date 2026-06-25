import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { getPurchaseReport } from "@/server/services/report.service";

export async function GET(req: NextRequest) {
  const user = await requireSession();
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
  const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
  const vendorCode = searchParams.get("vendorCode") ?? undefined;
  const projectCode = searchParams.get("projectCode") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const result = await getPurchaseReport({
    user,
    startDate,
    endDate,
    vendorCode,
    projectCode,
    status,
  });
  return NextResponse.json(result);
}