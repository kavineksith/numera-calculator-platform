// src/hooks/useSettings.ts
// Loads + persists the user settings via /api/settings, with a localStorage
// cache so the UI is usable while offline.

"use client";

import { useEffect, useState, useCallback } from "react";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/validation/settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        localStorage.setItem("calc.settings", JSON.stringify(data));
      }
    } catch {
      const cached = localStorage.getItem("calc.settings");
      if (cached) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(cached) });
        } catch {
          /* ignore */
        }
    }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (next: Settings) => {
    setSettings(next);
    setDirty(false);
    localStorage.setItem("calc.settings", JSON.stringify(next));
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch {
      // offline — cached locally, will sync later
    }
  }, []);

  const reset = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    setDirty(false);
    try {
      await fetch("/api/settings", { method: "DELETE" });
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback(
    <K extends keyof Settings>(section: K, value: Partial<Settings[K]>) => {
      setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...value } }));
      setDirty(true);
    },
    [],
  );

  return { settings, loaded, dirty, save, reset, update, refresh };
}
