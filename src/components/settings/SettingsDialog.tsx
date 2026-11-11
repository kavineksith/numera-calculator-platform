// src/components/settings/SettingsDialog.tsx
// Main settings modal with sidebar tabs. Persists to UserPreference via
// /api/settings. Includes Save / Reset / Reset-all.

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/hooks/useSettings";
import { GeneralCategory } from "./categories/GeneralCategory";
import { DisplayCategory } from "./categories/DisplayCategory";
import { AudioCategory } from "./categories/AudioCategory";
import { AccessibilityCategory } from "./categories/AccessibilityCategory";
import { ThemesCategory } from "./categories/ThemesCategory";
import { HistoryCategory } from "./categories/HistoryCategory";
import { DataRecoveryCategory } from "./categories/DataRecoveryCategory";
import { BackgroundImagesCategory } from "./categories/BackgroundImagesCategory";
import { AboutCategory } from "./categories/AboutCategory";
import { BehaviorCategory } from "./categories/BehaviorCategory";
import { KeyboardShortcutsCategory } from "./categories/KeyboardShortcutsCategory";
import { PrivacyCategory } from "./categories/PrivacyCategory";
import { ImportExportCategory } from "./categories/ImportExportCategory";
import { toast } from "sonner";
import { Settings as SettingsIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryId =
  | "general"
  | "modes"
  | "behavior"
  | "display"
  | "appearance"
  | "themes"
  | "backgrounds"
  | "audio"
  | "accessibility"
  | "history"
  | "recovery"
  | "shortcuts"
  | "privacy"
  | "importexport"
  | "about";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "modes", label: "Calculator Modes" },
  { id: "behavior", label: "Calculator Behavior" },
  { id: "display", label: "Display" },
  { id: "appearance", label: "Appearance" },
  { id: "themes", label: "Themes" },
  { id: "backgrounds", label: "Background Images" },
  { id: "audio", label: "Audio" },
  { id: "accessibility", label: "Accessibility" },
  { id: "history", label: "History" },
  { id: "recovery", label: "Data Recovery" },
  { id: "shortcuts", label: "Keyboard Shortcuts" },
  { id: "privacy", label: "Privacy & Security" },
  { id: "importexport", label: "Import & Export" },
  { id: "about", label: "About" },
];

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { settings, loaded, dirty, save, reset, update } = useSettings();
  const [active, setActive] = useState<CategoryId>("general");

  useEffect(() => {
    if (open && loaded) {
      // sync local copy from server-backed settings
    }
  }, [open, loaded]);

  const onSave = async () => {
    await save(settings);
    toast.success("Settings saved");
    onOpenChange(false);
  };

  const onResetAll = async () => {
    await reset();
    toast.success("Settings reset to defaults");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4" /> Settings
            {dirty && (
              <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                unsaved
              </span>
            )}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onOpenChange(false)}
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <nav
            aria-label="Settings categories"
            className="w-44 shrink-0 border-r overflow-y-auto py-2"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm transition-colors",
                  active === c.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50",
                )}
              >
                {c.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {active === "general" && (
                <GeneralCategory settings={settings} update={update} />
              )}
              {active === "modes" && (
                <GeneralCategory settings={settings} update={update} />
              )}
              {active === "behavior" && (
                <BehaviorCategory settings={settings} update={update} />
              )}
              {active === "display" && (
                <DisplayCategory settings={settings} update={update} />
              )}
              {active === "appearance" && (
                <DisplayCategory settings={settings} update={update} />
              )}
              {active === "themes" && <ThemesCategory />}
              {active === "backgrounds" && <BackgroundImagesCategory />}
              {active === "audio" && (
                <AudioCategory settings={settings} update={update} />
              )}
              {active === "accessibility" && (
                <AccessibilityCategory settings={settings} update={update} />
              )}
              {active === "history" && <HistoryCategory />}
              {active === "recovery" && <DataRecoveryCategory />}
              {active === "shortcuts" && <KeyboardShortcutsCategory />}
              {active === "privacy" && (
                <PrivacyCategory settings={settings} update={update} />
              )}
              {active === "importexport" && <ImportExportCategory />}
              {active === "about" && <AboutCategory />}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t px-4 py-3 flex-row justify-between">
          <Button variant="ghost" onClick={onResetAll} size="sm">
            Reset all to defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={onSave} size="sm">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
