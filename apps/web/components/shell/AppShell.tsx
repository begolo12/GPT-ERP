"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: React.ReactNode;
  currentCompany: {
    id: string;
    code: string;
    name: string;
    isGroup?: boolean;
  };
  availableCompanies: { id: string; code: string; name: string; isGroup?: boolean }[];
  user: { id: string; name: string; email: string; role: string; divisionCode: string | null };
  isKonsolidasi: boolean;
}

export function AppShell({ children, currentCompany, availableCompanies, user, isKonsolidasi }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <div
        className={styles.backdrop}
        data-open={mobileOpen}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div data-mobile-open={mobileOpen}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} isKonsolidasi={isKonsolidasi} userRole={user.role} />
      </div>
      <div className={styles.main} data-sidebar-collapsed={collapsed}>
        <Topbar
          currentCompany={currentCompany}
          availableCompanies={availableCompanies}
          user={user}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          onCompanyChange={() => {}}
        />
        <main id="main-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}