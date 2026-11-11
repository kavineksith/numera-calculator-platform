// src/components/settings/categories/shared.tsx
import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs opacity-70">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-xs opacity-70">{description}</p>}
    </div>
  );
}
