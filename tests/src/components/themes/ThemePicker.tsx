// src/components/themes/ThemePicker.tsx
// Quick dropdown to switch between available themes.

"use client";

import { Palette, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useThemes } from "@/hooks/useThemes";

export function ThemePicker() {
  const { themes, activeName, applyTheme } = useThemes();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Switch theme">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{activeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => applyTheme(t.name)}
            className="flex items-center gap-2"
          >
            <span
              className="h-3 w-3 rounded-full border"
              style={{
                background: t.configuration
                  ? (JSON.parse(t.configuration).colors?.background ?? "#888")
                  : "#888",
              }}
            />
            <span className="flex-1">{t.name}</span>
            {t.name === activeName && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
