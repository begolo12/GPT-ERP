"use client";

import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme, type Theme } from "@/lib/theme";
import styles from "./Topbar.module.css";

interface Company {
  id: string;
  code: string;
  name: string;
}

interface CurrentCompany extends Company {
  isGroup?: boolean;
}

interface TopbarProps {
  currentCompany: CurrentCompany;
  availableCompanies: Company[];
  user: { name: string; email: string; role: string };
  onMobileMenuToggle: () => void;
  onCompanyChange: (companyId: string) => void;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "Sun" },
  { value: "dark", label: "Dark", icon: "Moon" },
  { value: "system", label: "System", icon: "Monitor" },
];

export function Topbar({
  currentCompany,
  availableCompanies,
  user,
  onMobileMenuToggle,
  onCompanyChange,
}: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [companyOpen, setCompanyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      setCompanyOpen(false);
      setUserOpen(false);
      setThemeOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
        >
          <Icons.Menu size={20} />
        </button>

        {/* Company switcher */}
        <div className={styles.dropdown}>
          <button
            type="button"
            className={cn(styles.companyBtn, currentCompany.isGroup && styles.companyGroup)}
            onClick={(e) => {
              e.stopPropagation();
              setCompanyOpen(!companyOpen);
              setUserOpen(false);
              setThemeOpen(false);
            }}
          >
            {currentCompany.isGroup && <Icons.Layers size={14} />}
            <div className={styles.companyInfo}>
              <div className={styles.companyName}>{currentCompany.name}</div>
              <div className={styles.companyCode}>{currentCompany.code}</div>
            </div>
            <Icons.ChevronDown size={14} />
          </button>
          {companyOpen && (
            <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
              <div className={styles.menuHeader}>Pilih Perusahaan</div>
              {availableCompanies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cn(styles.menuItem, c.id === currentCompany.id && styles.menuItemActive)}
                  onClick={() => {
                    onCompanyChange(c.id);
                    setCompanyOpen(false);
                  }}
                >
                  <div>
                    <div className={styles.menuItemTitle}>{c.name}</div>
                    <div className={styles.menuItemSub}>{c.code}</div>
                  </div>
                  {c.id === currentCompany.id && <Icons.Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.right}>
        {/* Theme switcher */}
        <div className={styles.dropdown}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              setThemeOpen(!themeOpen);
              setCompanyOpen(false);
              setUserOpen(false);
            }}
            aria-label="Toggle theme"
          >
            {theme === "light" && <Icons.Sun size={18} />}
            {theme === "dark" && <Icons.Moon size={18} />}
            {theme === "system" && <Icons.Monitor size={18} />}
          </button>
          {themeOpen && (
            <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
              {THEME_OPTIONS.map((opt) => {
                const Icon = (Icons as any)[opt.icon];
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(styles.menuItem, theme === opt.value && styles.menuItemActive)}
                    onClick={() => {
                      setTheme(opt.value);
                      setThemeOpen(false);
                    }}
                  >
                    <Icon size={14} />
                    <span>{opt.label}</span>
                    {theme === opt.value && <Icons.Check size={14} className={styles.mlAuto} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications (stub) */}
        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <Icons.Bell size={18} />
        </button>

        {/* User menu */}
        <div className={styles.dropdown}>
          <button
            type="button"
            className={styles.userBtn}
            onClick={(e) => {
              e.stopPropagation();
              setUserOpen(!userOpen);
              setCompanyOpen(false);
              setThemeOpen(false);
            }}
          >
            <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
            <Icons.ChevronDown size={14} />
          </button>
          {userOpen && (
            <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
              <div className={styles.menuHeader}>{user.email}</div>
              <button type="button" className={styles.menuItem}>
                <Icons.User size={14} />
                <span>Profil</span>
              </button>
              <div className={styles.divider} />
              <button type="button" className={cn(styles.menuItem, styles.menuItemDanger)}>
                <Icons.LogOut size={14} />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}