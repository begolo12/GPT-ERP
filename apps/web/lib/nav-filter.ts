// Add helper: filter nav based on company context
import type { DivisionCode } from "@shared/enums";
import { NAV_SECTIONS, type NavItem, type NavSection } from "./nav";

export function filterNav(opts: {
  isKonsolidasi: boolean;
  userRole: string;
}): NavSection[] {
  // Konsolidasi: hanya Dashboard + Laporan
  if (opts.isKonsolidasi) {
    return [
      NAV_SECTIONS.find((s) => s.key === "dashboard")!,
      {
        key: "laporan",
        label: "LAPORAN",
        items: [
          { key: "konsolidasi", label: "Konsolidasi Group", href: "/laporan/konsolidasi", icon: "Layers" },
          { key: "l-op", label: "Pembelian", href: "/laporan/pembelian", icon: "BarChart3" },
          { key: "history-op", label: "History", href: "/history/operasi", icon: "History" },
        ],
      },
    ];
  }

  // Regular: tampilkan semua sesuai role
  return NAV_SECTIONS;
}