// src/components/settings/categories/KeyboardShortcutsCategory.tsx
"use client";

import { SectionTitle } from "./shared";

const SHORTCUTS: { key: string; action: string }[] = [
  { key: "0-9", action: "Digit input" },
  { key: ".", action: "Decimal point" },
  { key: "+ - * /", action: "Arithmetic operators" },
  { key: "%", action: "Modulo" },
  { key: "^", action: "Power" },
  { key: "!", action: "Factorial (postfix)" },
  { key: "( )", action: "Parentheses" },
  { key: ",", action: "Function argument separator" },
  { key: "Enter / =", action: "Evaluate" },
  { key: "Escape", action: "All clear (AC)" },
  { key: "Backspace", action: "Delete last token" },
  { key: "p", action: "Insert π" },
  { key: "e", action: "Insert e" },
  { key: "m", action: "Memory recall (MR)" },
];

export function KeyboardShortcutsCategory() {
  return (
    <div className="space-y-4">
      <SectionTitle title="Keyboard Shortcuts" description="Global bindings (ignored while typing in inputs)." />
      <table className="w-full text-sm">
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr key={s.key} className="border-b">
              <td className="py-1.5 pr-4"><code className="rounded bg-muted px-1.5 py-0.5">{s.key}</code></td>
              <td className="py-1.5 opacity-80">{s.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
