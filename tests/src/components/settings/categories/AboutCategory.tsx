// src/components/settings/categories/AboutCategory.tsx
"use client";

import { SectionTitle } from "./shared";

export function AboutCategory() {
  return (
    <div className="space-y-3">
      <SectionTitle title="About" description="Professional Multi-Mode Calculator Platform." />
      <div className="rounded-md border p-3 text-sm space-y-1">
        <div><span className="opacity-70">Version:</span> 0.1.0</div>
        <div><span className="opacity-70">Stack:</span> Next.js 16, TypeScript 5, Tailwind CSS 4, shadcn/ui, Prisma + SQLite</div>
        <div><span className="opacity-70">Math engine:</span> Pure-TS tokenizer + recursive-descent parser + AST evaluator (Decimal.js arithmetic)</div>
        <div><span className="opacity-70">Tests:</span> <code>bun run test</code> (vitest)</div>
      </div>
      <p className="text-xs opacity-70">
        All arithmetic is exact via Decimal.js. Transcendental functions
        (sin/cos/log/exp) use IEEE-754 doubles and carry ~15-16 significant
        digits of precision.
      </p>
    </div>
  );
}
