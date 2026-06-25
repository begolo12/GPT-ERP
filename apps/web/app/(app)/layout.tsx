import { AppShell } from "@/components/shell/AppShell";

// Stub data (Phase 3: ambil dari session)
const STUB_USER = { name: "Admin", email: "admin@gpt-erp.local", role: "ADMIN" };
const STUB_COMPANIES = [
  { id: "group", code: "GROUP", name: "Konsolidasi Group" },
  { id: "gas", code: "GAS", name: "PT. Ganendra Arsyila Semesta" },
  { id: "djp", code: "DJP", name: "PT. Daniswara Jaya Perkasa" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      user={STUB_USER}
      currentCompany={STUB_COMPANIES[0]}
      availableCompanies={STUB_COMPANIES}
    >
      {children}
    </AppShell>
  );
}