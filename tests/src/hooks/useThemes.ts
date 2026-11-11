// src/hooks/useThemes.ts
// Fetches available themes and applies the selected theme's CSS variables to
// the document root via the `data-theme` attribute.

"use client";

import { useEffect, useState, useCallback } from "react";

export interface ThemeSummary {
  id: string;
  name: string;
  description: string | null;
  isBuiltIn: boolean;
  category: string;
  configuration: string;
}

export function useThemes() {
  const [themes, setThemes] = useState<ThemeSummary[]>([]);
  const [activeName, setActiveName] = useState<string>("Dark");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/themes");
      const data = await res.json();
      setThemes(data.themes ?? []);
    } catch {
      // offline — keep current
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const saved = localStorage.getItem("calc.theme");
    if (saved) setActiveName(saved);
  }, [refresh]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", activeName);
    localStorage.setItem("calc.theme", activeName);
  }, [activeName]);

  const applyTheme = useCallback(
    (name: string) => {
      setActiveName(name);
    },
    [],
  );

  return { themes, activeName, applyTheme, refresh, loading };
}
