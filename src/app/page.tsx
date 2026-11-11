// src/app/page.tsx
// Single-page calculator application. All calculator UI lives here (modes are
// switched via tabs inside <Calculator />). Header provides access to history,
// settings, themes; a sticky footer credits the stack.

"use client";

import { useEffect, useState } from "react";
import { Calculator } from "@/components/calculator/Calculator";
import { Calculator as CalcIcon, History, Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { ThemePicker } from "@/components/themes/ThemePicker";
import { HistoryPanel } from "@/components/history/HistoryPanel";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Register the service worker (offline shell caching).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration is best-effort; ignore failures.
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <CalcIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h1 className="flex-1 text-base font-semibold tracking-tight">
            Calculator Platform
          </h1>
          <span
            className="hidden sm:inline-flex items-center gap-1 text-xs rounded-full border px-2 py-0.5"
            aria-label={online ? "Online" : "Offline"}
          >
            {online ? <Wifi className="h-3 w-3 text-emerald-600" /> : <WifiOff className="h-3 w-3 text-rose-500" />}
            {online ? "Online" : "Offline"}
          </span>
          <ThemePicker />
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Open history">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0">
              <SheetHeader className="border-b px-3 py-2">
                <SheetTitle className="text-sm">History</SheetTitle>
              </SheetHeader>
              <HistoryPanel onClose={() => setHistoryOpen(false)} />
            </SheetContent>
          </Sheet>
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 flex items-start justify-center">
        <Calculator />
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <footer className="mt-auto border-t bg-background/80">
        <div className="mx-auto max-w-5xl px-4 py-3 text-center text-xs opacity-70">
          Professional Multi-Mode Calculator · Next.js 16 · TypeScript · Pure-TS math engine ·{" "}
          {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
