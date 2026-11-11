# Contributing

Thanks for your interest in improving the Calculator Platform! This document describes the development workflow and code style conventions.

## Development setup

```bash
git clone <repo-url>
cd calculator-platform
bun install
cp .env.example .env
bun run db:push
bun run db:seed
bun run test
bun run dev
```

See [INSTALLATION.md](./INSTALLATION.md) for full setup details.

## Branching model

- `main` — production-ready code. Always passes tests and lint.
- `feature/<short-name>` — new features.
- `fix/<short-name>` — bug fixes.
- `docs/<short-name>` — documentation improvements.

Open a pull request against `main`. Squash-merge is the default.

## Code style

### TypeScript
- **Strict mode** enabled (`"strict": true` in `tsconfig.json`).
- Prefer `interface` for object shapes, `type` for unions and intersections.
- Use `unknown` over `any` — narrow with type guards or Zod.
- All API payloads validated with Zod before use.

### File organization
- **Engine modules** (`src/engine/`): pure TypeScript, no React/Next/Prisma imports, no browser APIs.
- **Server-only modules** (`src/services/`, `src/repositories/`): start with `import "server-only"`.
- **Client components** (`src/components/`): start with `"use client"`.
- **API routes** (`src/app/api/`): Route Handlers with `export const dynamic = "force-dynamic"` for mutable endpoints.

### Naming conventions
- **Files**: `kebab-case.ts` for modules, `PascalCase.tsx` for React components.
- **Components**: `PascalCase` (e.g. `CalculatorButton`).
- **Functions**: `camelCase` (e.g. `formatResult`).
- **Types/interfaces**: `PascalCase` (e.g. `EvaluateOptions`).
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g. `MAX_IMAGE_SIZE_BYTES`).
- **CSS variables**: `--calc-*` prefix for calculator-scoped variables (avoids collision with shadcn's `--background` etc.).

### React patterns
- **Reducer pattern** for stateful logic (`CalculatorContext`).
- **Custom hooks** for reusable side-effect logic (`useKeyboard`, `useAudio`, `useRecovery`, `useThemes`, `useSettings`).
- **shadcn/ui** components preferred over custom-built equivalents.
- Avoid `useEffect` for derived state — compute during render.
- When `setState` must happen in `useEffect` (loading from localStorage, fetching from API), use `// eslint-disable-next-line react-hooks/set-state-in-effect` if necessary.

### Math engine
- **Never use `eval()` or `new Function()`** — extend the tokenizer/parser/evaluator instead.
- **All arithmetic routes through Decimal.js** (configured in `src/engine/precision/decimal-config.ts`).
- **Transcendental functions** (sin, cos, log) use native `Math.*` — document the tolerance.
- **New functions** go in `src/engine/evaluator/functions.ts` and must be added to the `FUNCTIONS` registry.
- **New operators** go in `src/engine/evaluator/operators.ts` with a precedence entry in `src/engine/parser/parser.ts`.
- **New constants** go in `src/engine/evaluator/constants.ts`.
- **Add a test** for every new function/constant in the appropriate `__tests__/` file.

### Database
- **Schema changes** go in `prisma/schema.prisma`. Run `bun run db:push` to apply.
- **Migrations** for production: switch to `bun run db:migrate` and commit the generated migration files.
- **Never expose Prisma Client** to Client Components. All DB access goes through `src/repositories/` → `src/services/` → API routes.
- **Never construct raw SQL** from user input. Use Prisma's parameterized query APIs.

### Security
- **Validate all API payloads** with Zod, even when the client also validates.
- **Never trust client MIME types** — verify file magic bytes.
- **Never render untrusted HTML** — React escapes by default, but avoid `dangerouslySetInnerHTML`.
- **Never execute imported theme code** — only JSON is accepted.
- **Rate-limit** sensitive endpoints.
- **Document security-relevant decisions** in `SECURITY.md`.

### Testing
- Add a test for every new math engine function.
- Run `bun run test` before committing — all 109+ tests must pass.
- Run `bun run lint` before committing — 0 errors required.
- For UI changes, manually verify in the browser via the preview panel.

## Pull request process

1. **Open an issue** describing the bug or feature (skip for trivial changes).
2. **Branch** from `main`: `git checkout -b feature/my-feature`.
3. **Write code + tests**. Keep commits focused (one logical change per commit).
4. **Run** `bun run test && bun run lint` — both must pass.
5. **Update documentation** if your change affects the public API, user flow, or architecture.
6. **Open a PR** with a clear description: what changed, why, and how to verify.
7. **Address review feedback** — push additional commits to the same branch.
8. **Squash-merge** once approved.

## Commit message conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add tanh inverse function
fix: correct modulo for negative dividends
docs: expand security.md with CSRF section
test: add property-based tests for gcd
refactor: extract token-bucket into shared helper
chore: bump decimal.js to 10.6.0
```

## Performance considerations

- **Memoize** expensive computations (`useMemo`, `useCallback`).
- **Debounce** writes to localStorage / API (500 ms for recovery snapshots).
- **Paginate** list endpoints (default 20 items, max 100).
- **Index** database columns used in WHERE / ORDER BY clauses.
- **Lazy-load** non-critical UI via `next/dynamic` if bundle size becomes a concern.
- **Avoid unnecessary Client Components** — default to Server Components, opt into `"use client"` only when needed.

## Accessibility

- Every interactive element needs an `aria-label` (or visible text content).
- Keyboard navigation must work for every feature.
- Color contrast must meet WCAG 2.2 AA (the High Contrast theme exceeds AAA).
- Respect `prefers-reduced-motion`.
- Test with a screen reader (NVDA on Windows, VoiceOver on macOS) at least once per major UI change.

## Adding a new calculator function

1. **Implement** in `src/engine/evaluator/functions.ts`:
   ```typescript
   myFunc: {
     name: "myFunc",
     arity: 1,
     description: "What it does",
     apply: ([x], _unit) => x.times(2),
   },
   ```
2. **Add a UI button** in the appropriate calculator component (`StandardCalculator.tsx`, `ScientificCalculator.tsx`, or `AdvancedCalculator.tsx`).
3. **Add tests** in `src/engine/__tests__/scientific.test.ts` (or appropriate file):
   ```typescript
   it("myFunc(5) = 10", () => {
     const r = calculate("myFunc(5)");
     expect(r.ok).toBe(true);
     if (r.ok) expect(r.value.toString()).toBe("10");
   });
   ```
4. **Run** `bun run test` to confirm the new test passes.
5. **Document** the function in `USER_GUIDE.md` if it's user-facing.

## License

By contributing, you agree that your contributions are licensed under the same terms as the project.
