// src/components/settings/categories/ThemesCategory.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemePicker } from "@/components/themes/ThemePicker";
import { ThemeEditor } from "@/components/themes/ThemeEditor";
import { ThemeImporter } from "@/components/themes/ThemeImporter";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "./shared";

export function ThemesCategory() {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Themes"
        description="10 built-in themes plus custom theme editor and JSON import."
      />
      <Tabs defaultValue="pick">
        <TabsList>
          <TabsTrigger value="pick">Switch</TabsTrigger>
          <TabsTrigger value="edit">Editor</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>
        <TabsContent value="pick" className="space-y-3">
          <p className="text-xs opacity-70">Quick switch:</p>
          <ThemePicker />
          <a href="/api/themes/export" download>
            <Button variant="outline" size="sm">Export all themes (JSON)</Button>
          </a>
        </TabsContent>
        <TabsContent value="edit">
          <ThemeEditor />
        </TabsContent>
        <TabsContent value="import">
          <ThemeImporter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
