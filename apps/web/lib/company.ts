/**
 * Company Context
 * - Determine active company from cookie or session
 * - Untuk ADMIN: bisa switch ke company apapun via cookie
 * - Untuk user biasa: terkunci ke company sendiri
 * - GROUP company = virtual "konsolidasi" view
 */
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@shared/types";

const COOKIE_NAME = "gpt_active_company_id";

export interface CompanyContext {
  user: SessionUser;
  activeCompany: {
    id: string;
    code: string;
    name: string;
    isGroup: boolean;
  };
  accessibleCompanyIds: string[]; // untuk filter query
  isKonsolidasi: boolean; // aktif di GROUP view
}

export async function getCompanyContext(user: SessionUser): Promise<CompanyContext> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;

  // Fetch all companies
  const allCompanies = await prisma.company.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  const groupCompany = allCompanies.find((c) => c.code === "GROUP");
  const userCompany = allCompanies.find((c) => c.id === user.companyId);

  // Determine accessible companies
  let accessibleCompanyIds: string[] = [];
  if (user.role === "ADMIN" || user.companyCode === "GROUP") {
    // Admin / Group user: akses semua
    accessibleCompanyIds = allCompanies.map((c) => c.id);
  } else {
    // User biasa: hanya company sendiri
    accessibleCompanyIds = [user.companyId];
  }

  // Determine active company
  let activeCompany: CompanyContext["activeCompany"] | null = null;
  let isKonsolidasi = false;

  if (cookieValue && accessibleCompanyIds.includes(cookieValue)) {
    const c = allCompanies.find((x) => x.id === cookieValue);
    if (c) {
      if (c.code === "GROUP") {
        isKonsolidasi = true;
        activeCompany = { ...c, isGroup: true };
      } else {
        activeCompany = { ...c, isGroup: false };
      }
    }
  }

  // Fallback
  if (!activeCompany) {
    if (user.companyCode === "GROUP" && groupCompany) {
      isKonsolidasi = true;
      activeCompany = { ...groupCompany, isGroup: true };
    } else if (userCompany) {
      activeCompany = { ...userCompany, isGroup: false };
    } else if (allCompanies[0]) {
      activeCompany = { ...allCompanies[0], isGroup: allCompanies[0].code === "GROUP" };
    }
  }

  return {
    user,
    activeCompany: activeCompany!,
    accessibleCompanyIds,
    isKonsolidasi,
  };
}

export async function setActiveCompany(companyId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, companyId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}