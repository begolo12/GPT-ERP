"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "gpt-erp-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolvedState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
    setThemeState(stored);
    const next = applyTheme(stored);
    setResolvedState(next);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const r = applyTheme(next);
    setResolvedState(r);
  };

  return { theme, resolved, setTheme };
}

function applyTheme(theme: Theme): "light" | "dark" {
  const root = document.documentElement;
  let resolved: "light" | "dark";

  if (theme === "system") {
    resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } else {
    resolved = theme;
  }

  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  return resolved;
}