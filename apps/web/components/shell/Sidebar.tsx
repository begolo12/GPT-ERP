"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { NAV_SECTIONS, SECTION_COLORS, type NavItem } from "@/lib/nav";
import { filterNav } from "@/lib/nav-filter";
import { cn } from "@/lib/cn";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isKonsolidasi?: boolean;
  userRole?: string;
}

function NavItemRow({ item, collapsed, depth = 0 }: { item: NavItem; collapsed: boolean; depth?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = (Icons as any)[item.icon] || Icons.Circle;
  const active = item.href ? pathname === item.href : false;
  const sectionKey = NAV_SECTIONS.find((s) => s.items.some((i) => i.key === item.key || i.children?.some((c) => c.key === item.key)))?.key;
  const accent = sectionKey ? SECTION_COLORS[sectionKey] : "var(--text)";

  if (hasChildren && !collapsed) {
    return (
      <div className={styles.group}>
        <button
          type="button"
          className={cn(styles.item, styles.itemParent)}
          onClick={() => setOpen(!open)}
          style={{ "--accent": accent } as React.CSSProperties}
        >
          <Icon size={18} aria-hidden />
          <span className={styles.label}>{item.label}</span>
          <Icons.ChevronRight
            size={14}
            className={cn(styles.chev, open && styles.chevOpen)}
            aria-hidden
          />
        </button>
        {open && (
          <div className={styles.children}>
            {item.children!.map((child) => (
              <NavItemRow key={child.key} item={child} collapsed={collapsed} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={cn(styles.item, active && styles.itemActive)}
      style={{ "--accent": accent, paddingLeft: collapsed ? 0 : 12 + depth * 16 } as React.CSSProperties}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} aria-hidden />
      {!collapsed && <span className={styles.label}>{item.label}</span>}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle, isKonsolidasi = false, userRole = "STAFF" }: SidebarProps) {
  const sections = filterNav({ isKonsolidasi, userRole });

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)} aria-label="Main navigation">
      <div className={styles.brand}>
        <div className={styles.logo}>GPT</div>
        {!collapsed && (
          <div className={styles.brandText}>
            <div className={styles.brandName}>GPT-ERP</div>
            <div className={styles.brandSub}>{isKonsolidasi ? "Konsolidasi" : "Daniswara Group"}</div>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {sections.map((section) => (
          <div key={section.key} className={styles.section}>
            {!collapsed && <div className={styles.sectionLabel}>{section.label}</div>}
            <div className={styles.items}>
              {section.items.map((item) => (
                <NavItemRow key={item.key} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className={styles.toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <Icons.ChevronRight size={16} /> : <Icons.ChevronLeft size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}