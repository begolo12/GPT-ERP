import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Fetch all companies for switcher
  const companies = await prisma.company.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  // For now: only show companies the user has access to
  // Phase 8: ADMIN/GROUP role gets all, others only own
  const userCompany = companies.find((c) => c.id === user.companyId);
  const availableCompanies = userCompany ? [userCompany] : [];

  // Map to Topbar shape
  const currentCompany = {
    id: user.companyId,
    code: user.companyCode,
    name: userCompany?.name ?? user.companyCode,
    isGroup: user.companyCode === "GROUP",
  };

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        divisionCode: user.divisionCode,
      }}
      currentCompany={currentCompany}
      availableCompanies={availableCompanies}
    >
      {children}
    </AppShell>
  );
}