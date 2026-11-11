# Database Schema

**Provider:** SQLite
**ORM:** Prisma 6
**Database file:** `db/custom.db` (configured via `DATABASE_URL` env var)

## Models

### `CalculationHistory`

Stores every completed calculation.

| Field       | Type      | Constraints               | Description                          |
| ----------- | --------- | ------------------------- | ------------------------------------ |
| `id`        | String    | `@id @default(cuid())`    | Primary key                          |
| `expression`| String    | not null                  | Original expression                  |
| `result`    | String    | not null                  | Computed result (string for precision)|
| `mode`      | String    | not null                  | `standard` \| `scientific` \| `advanced` |
| `angleUnit` | String?   | nullable                  | `deg` \| `rad` (null for standard)   |
| `error`     | String?   | nullable                  | Error message if calculation failed  |
| `starred`   | Boolean   | `@default(false)`         | User-marked favorite                 |
| `createdAt` | DateTime  | `@default(now())`         | Creation timestamp                   |

**Indexes:**
- `@@index([createdAt])` — sort by date
- `@@index([mode])` — filter by mode
- `@@index([starred])` — filter starred

---

### `UserPreference`

Key/value store for user-scoped settings.

| Field       | Type     | Constraints               | Description                          |
| ----------- | -------- | ------------------------- | ------------------------------------ |
| `id`        | String   | `@id @default(cuid())`    | Primary key                          |
| `key`       | String   | `@unique`                 | Setting key (e.g. `settings`)        |
| `value`     | String   | not null                  | JSON-serialized value                |
| `updatedAt` | DateTime | `@updatedAt`              | Last update timestamp                |

The composite `Settings` object is stored under the key `settings` as a single JSON string.

---

### `Theme`

Persisted calculator themes (built-in + user-created).

| Field           | Type     | Constraints               | Description                          |
| --------------- | -------- | ------------------------- | ------------------------------------ |
| `id`            | String   | `@id @default(cuid())`    | Primary key                          |
| `name`          | String   | `@unique`                 | Theme name                           |
| `description`   | String?  | nullable                  | Optional description                 |
| `configuration` | String   | not null                  | JSON: `{ colors, sizing, fonts }`    |
| `isDefault`     | Boolean  | `@default(false)`         | Applied at startup if true           |
| `isBuiltIn`    | Boolean  | `@default(false)`         | Cannot be deleted if true            |
| `category`     | String   | `@default("personal")`    | `official` \| `developer` \| `community` \| `personal` |
| `createdAt`    | DateTime | `@default(now())`         | Creation timestamp                   |
| `updatedAt`    | DateTime | `@updatedAt`              | Last update timestamp                |

**Indexes:**
- `@@index([category])`
- `@@index([isDefault])`

**Configuration JSON schema** (validated by `themeConfigSchema`):
```typescript
{
  name: string;
  description?: string;
  configuration: {
    colors: {
      primary, secondary, background, button, buttonHover?, operator,
      display, displayText, text, border: string (hex or rgba)
    };
    sizing: {
      cornerRadius: number (0–32);
      buttonSize: number (24–96);
      displaySize: number (12–48);
      fontSize: number (10–32);
      iconSize: number (10–32);
      spacing: number (0–16);
      blur: number (0–40);
      transparency: number (0–1);
      shadow: string;
    };
    fonts: {
      fontFamily: string;
      fontWeight: number (100–900);
      displayFontFamily: string;
    };
  };
  category: "official" | "developer" | "community" | "personal";
  isDefault: boolean;
}
```

---

### `UploadedImage`

Metadata for uploaded background images. Files live in `storage/uploads/`.

| Field           | Type     | Constraints               | Description                          |
| --------------- | -------- | ------------------------- | ------------------------------------ |
| `id`            | String   | `@id @default(cuid())`    | Primary key                          |
| `filename`      | String   | `@unique`                 | Randomized internal filename         |
| `originalName`  | String   | not null                  | Sanitized user-provided name          |
| `mimeType`      | String   | not null                  | Verified MIME type (png/jpeg/webp/gif) |
| `fileSize`      | Int      | not null                  | File size in bytes                   |
| `width`         | Int?     | nullable                  | Image width in pixels                |
| `height`        | Int?     | nullable                  | Image height in pixels               |
| `transforms`    | String?  | nullable                  | JSON of applied transforms           |
| `createdAt`     | DateTime | `@default(now())`         | Upload timestamp                     |

**Indexes:**
- `@@index([createdAt])`

---

### `MemoryRegister`

Named calculator memory registers (M, M1, etc.).

| Field          | Type     | Constraints               | Description                          |
| -------------- | -------- | ------------------------- | ------------------------------------ |
| `id`           | String   | `@id @default(cuid())`    | Primary key                          |
| `registerName` | String   | `@unique`                 | e.g. `M`, `M1`                       |
| `value`        | String   | not null                  | Stored as string for precision        |
| `label`        | String?  | nullable                  | Optional user label                  |
| `updatedAt`    | DateTime | `@updatedAt`              | Last update timestamp                |

The default seed creates a single `M` register with value `"0"`.

---

### `ApplicationSetting`

Generic application-level key/value store (not user-scoped).

| Field       | Type     | Constraints               | Description                          |
| ----------- | -------- | ------------------------- | ------------------------------------ |
| `id`        | String   | `@id @default(cuid())`    | Primary key                          |
| `key`       | String   | `@unique`                 | Setting key                          |
| `value`     | String   | not null                  | Setting value (may be JSON)          |
| `updatedAt` | DateTime | `@updatedAt`              | Last update timestamp                |

---

### `RecoverySnapshot`

Versioned snapshots for crash/refresh recovery.

| Field       | Type     | Constraints               | Description                          |
| ----------- | -------- | ------------------------- | ------------------------------------ |
| `id`        | String   | `@id @default(cuid())`    | Primary key                          |
| `snapshot`  | String   | not null                  | JSON of full calculator state         |
| `version`   | Int      | not null                  | Schema version of the snapshot payload |
| `source`    | String   | `@default("auto")`        | `auto` \| `manual` \| `import`        |
| `createdAt` | DateTime | `@default(now())`         | Creation timestamp                   |

**Indexes:**
- `@@index([createdAt])` — fetch latest
- `@@index([version])` — filter by schema version

**Snapshot JSON schema** (validated by `snapshotPayloadSchema`):
```typescript
{
  expression: string;
  result: string;
  mode: "standard" | "scientific" | "advanced";
  angleUnit: "deg" | "rad";
  memory: Record<string, string>;
  lastOperator: string | null;
  version: number;
  updatedAt: string (ISO date);
}
```

Current schema version: `1`.

## Relationships

This schema is intentionally denormalized for a single-user calculator application:
- No foreign keys between models (each model is independent).
- `UserPreference` and `ApplicationSetting` use key/value patterns for flexibility.
- JSON fields (`Theme.configuration`, `UploadedImage.transforms`, `RecoverySnapshot.snapshot`) store structured data with Zod-validated schemas.

## Migrations

The project uses `prisma db push` (not `prisma migrate`) for development simplicity. For production, switch to `prisma migrate dev` to generate migration files.

```bash
bun run db:push    # Apply schema to SQLite
bun run db:seed    # Seed built-in themes + default memory register
```

## Backup & Restore

The database file (`db/custom.db`) and the `storage/` directory must be backed up together. To restore:
1. Stop the server.
2. Replace `db/custom.db` with the backup.
3. Replace `storage/uploads/` with the backup.
4. Restart the server.

The `/api/export` endpoint produces a JSON dump of history + themes (not images, not settings — those can be re-exported individually via `/api/history/export`, `/api/themes/export`, and the settings are stored in `UserPreference`).

## Query optimization

Indexes are placed on:
- `CalculationHistory.createdAt` (history list sorted by date)
- `CalculationHistory.mode` (mode filter)
- `CalculationHistory.starred` (starred filter)
- `Theme.category` (filter by category)
- `Theme.isDefault` (find default theme quickly)
- `UploadedImage.createdAt` (recent images first)
- `RecoverySnapshot.createdAt` (latest snapshot lookup)
- `RecoverySnapshot.version` (filter by schema version)

All unique fields (`UserPreference.key`, `Theme.name`, `UploadedImage.filename`, `MemoryRegister.registerName`, `ApplicationSetting.key`) are indexed automatically via `@unique`.

For performance-critical queries, inspect with:
```sql
EXPLAIN QUERY PLAN SELECT * FROM CalculationHistory WHERE mode = 'standard' ORDER BY createdAt DESC LIMIT 20;
```
