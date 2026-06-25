import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-server";
import { getCompanyContext } from "@/lib/company";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const ctx = await getCompanyContext(user);

  // Available companies untuk switcher
  const allCompanies = await prisma.company.findMany({
    where: { id: { in: ctx.accessibleCompanyIds } },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  const availableCompanies = allCompanies.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    isGroup: c.code === "GROUP",
  }));

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        divisionCode: user.divisionCode,
      }}
      currentCompany={ctx.activeCompany}
      availableCompanies={availableCompanies}
      isKonsolidasi={ctx.isKonsolidasi}
    >
      {children}
    </AppShell>
  );
}