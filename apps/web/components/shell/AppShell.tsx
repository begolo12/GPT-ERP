"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import * as Icons from "lucide-react";
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
  availableCompanies: { id: string; code: string; name: string }[];
  user: { id: string; name: string; email: string; role: string; divisionCode: string | null };
}

export function AppShell({ children, currentCompany, availableCompanies, user }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ redirect: false });
      router.push("/login");
    });
  };

  return (
    <div className={styles.shell}>
      <div
        className={styles.backdrop}
        data-open={mobileOpen}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div data-mobile-open={mobileOpen}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div className={styles.main} data-sidebar-collapsed={collapsed}>
        <Topbar
          currentCompany={currentCompany}
          availableCompanies={availableCompanies}
          user={user}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          onCompanyChange={() => {
            // Phase 8: real company switching
            router.refresh();
          }}
        />
        <main id="main-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}