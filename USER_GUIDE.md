# User Guide

## Calculator Modes

Switch between modes using the three tabs above the calculator body: **Standard**, **Scientific**, **Advanced**.

### Standard Mode

A classic calculator for everyday arithmetic.

**Layout (8 rows):**
- Row 1: Memory keys (MC, MR, M+, M-, M-)
- Row 2: AC, CE, Backspace, ÷
- Rows 3–5: Digits and operators (+, -, ×, ÷)
- Row 6: ±, 0, ., %
- Row 7: x², √x, 1/x, MS
- Row 8: = (full width)

**Memory keys:**
| Key | Action                              |
| --- | ----------------------------------- |
| MC  | Memory Clear (set memory to 0)      |
| MR  | Memory Recall (insert memory value) |
| M+  | Add current result to memory        |
| M-  | Subtract current result from memory |
| MS  | Memory Store (set memory = result)  |

The `M` indicator appears in the display when memory is non-zero.

**Repeat equals:** After pressing `=`, pressing `=` again repeats the last operation. For example, `5 + 3 = = =` gives 8, 11, 14.

### Scientific Mode

Adds trigonometric, logarithmic, exponential, factorial, and power functions.

**Angle unit toggle:** The first button in the top row toggles between DEG and RAD. The current unit is shown in the display header.

**Available functions:**

| Category        | Functions                                                      |
| --------------- | -------------------------------------------------------------- |
| Powers & roots  | `^` (x^y), `x²`, `x³`, `√`, `∛`, `ⁿ√`                          |
| Trigonometric   | `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2(y,x)`      |
| Hyperbolic      | `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh`              |
| Logarithms      | `logₙ(x, base)`, `log₁₀`, `ln`, `exp` (e^x)                   |
| Other           | `n!`, `\|x\|`, `1/x`, `mod`, `π`, `e`, `φ`, `γ`               |

**Constants:**
- π (pi) ≈ 3.141592653589793
- e (Euler's number) ≈ 2.718281828459045
- φ (golden ratio) ≈ 1.618033988749895
- γ (Euler-Mascheroni) ≈ 0.5772156649015329

**Implicit multiplication:** Type `2π` (no operator) and the engine treats it as `2 * π`. Same for `2(3+1)` → `2 * (3+1)`.

**Function composition:** `sqrt(pow(3, 2) + pow(4, 2))` evaluates to 5 (Pythagorean).

### Advanced Mode

Categorized into expandable sections.

#### Number Theory
- **GCD(a, b)** — greatest common divisor
- **LCM(a, b)** — least common multiple
- **isPrime(n)** — primality test
- **Factorise(n)** — prime factorization (e.g. 360 → 2³ × 3² × 5)
- **P(n, k)** — permutations (nPk)
- **C(n, k)** — combinations (nCk)

#### Statistics
Enter comma- or space-separated values. Computes count, sum, mean, median, mode, min, max, range, sample variance/σ, population variance/σ.

#### Fractions
Convert any decimal to a fraction using continued-fraction expansion. Examples:
- `0.75` → 3/4
- `0.333...` → 1/3 (within denominator cap of 1,000,000)
- `2.5` (mixed) → 2 1/2

#### Programmer Mode
- 32-bit signed integer operations
- Convert between BIN / OCT / DEC / HEX
- Input accepts `0x`, `0b`, `0o` prefixes
- Bitwise: AND, OR, XOR, NOT, `<<`, `>>`
- Negative numbers shown as their two's-complement form in non-decimal bases

#### Unit Conversion
- **Length:** mm, cm, m, km, in, ft, yd, mi
- **Mass:** mg, g, kg, t, oz, lb
- **Temperature:** C, F, K

#### Date Calculation
Compute days between two dates.

#### Random Number
Generate a random integer in [min, max] (inclusive).

## Keyboard Shortcuts

| Key              | Action                          |
| ---------------- | ------------------------------- |
| `0`–`9`, `.`     | Digits + decimal point          |
| `+`, `-`, `*`, `/` | Operators                     |
| `%`, `^`, `!`    | Modulo, power, factorial        |
| `(`, `)`, `,`    | Parens, comma                   |
| `Enter` or `=`   | Evaluate                        |
| `Escape`         | All Clear (AC)                  |
| `Backspace`      | Delete last character           |
| `p`              | Insert π                        |
| `e`              | Insert e                        |
| `m`              | Memory Recall (MR)              |

## History Panel

Open the History panel via the **History** button in the header.

- **Search** by expression text or result.
- **Filter** by mode (Standard / Scientific / Advanced).
- **Sort** newest-first or oldest-first.
- **Star** entries to mark them as favorites.
- **Reuse** an entry — loads its expression into the calculator.
- **Copy** the result to the clipboard.
- **Delete** individual entries, or **Clear** all.
- **Export** the full history as JSON.
- **Pagination** — 20 entries per page.

## Themes

Click the theme name in the header (next to the palette icon) to open the theme picker. All 10 built-in themes are listed.

To create a custom theme:
1. Open **Settings** (gear icon in header).
2. Navigate to the **Themes** category.
3. Use the **Theme Editor** to customize colors, sizing, fonts.
4. Save the theme. It will appear in the picker alongside the built-ins.

To share a theme:
1. Use **Export** in the theme editor to download a JSON file.
2. On another instance, open the theme editor → **Import** and upload the JSON.

**Security:** Imported themes are strictly JSON-validated with Zod. No JavaScript, CSS, or HTML inside the JSON is ever executed.

## Settings

Open settings via the gear icon in the header. Settings are organized into 15 categories:

1. **General** — angle unit, default mode, thousands separator, auto-save history
2. **Calculator Modes** — enable/disable individual modes
3. **Calculator Behavior** — repeat-equals, implicit multiplication, rounding mode, display precision
4. **Display** — appearance (LCD style), expression line visibility, scientific notation policy
5. **Appearance** — quick appearance overrides
6. **Themes** — theme editor and management
7. **Background Images** — upload, edit, and apply background images
8. **Audio** — sound effects + TTS configuration
9. **Accessibility** — reduced motion, high contrast, large text, screen reader announcements
10. **History** — history retention policy, export/import
11. **Data Recovery** — view and clear recovery snapshots
12. **Keyboard Shortcuts** — view and customize key bindings
13. **Privacy & Security** — what data is saved, analytics opt-in
14. **Import & Export** — bulk export/import of all data (history + themes + settings)
15. **About** — version, links

Use **Save** to commit changes, **Cancel** to discard, **Reset all to defaults** to restore factory settings.

## Background Images

Upload a custom background image:
1. Settings → Background Images → choose a file (PNG/JPEG/WebP/GIF, ≤5MB, ≤4000×4000).
2. The file is validated (magic-byte check, dimension limits, MIME-type verification).
3. Apply transforms (crop, rotate, brightness, blur, fit mode).
4. Preview before saving.
5. Apply as the calculator background.

Uploaded images are stored in `storage/uploads/` (never in `public/`). They are served via `/api/images/[id]` with proper content-type and cache headers.

## Recovery

The calculator automatically saves a recovery snapshot (debounced 500 ms) of:
- Current expression
- Current result
- Selected mode
- Angle unit
- Memory registers
- Last operator (for repeat-equals)

Snapshots are persisted both to SQLite (`RecoverySnapshot` table) and to `localStorage`. On app load:
- If `localStorage` has a newer timestamp than the server, the local copy is restored.
- Otherwise, the server snapshot is restored.

## Offline Mode

When the network drops:
- An **Offline** badge appears in the header.
- The calculator continues to work (math engine is client-side).
- History writes are queued in `localStorage` and flushed when the network returns.
- Theme switching uses cached data.
- Settings changes are cached locally and synced on reconnect.

The service worker caches the application shell (HTML, CSS, JS bundles) so the UI loads even without a network.
