# API Documentation

All endpoints are relative to the application root (e.g. `http://localhost:3000`). All responses include security headers (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

Rate-limited endpoints return `429 Too Many Requests` with a `Retry-After` header when the per-IP budget (default 60 req/min) is exceeded.

## Health

### `GET /api/health`
Returns service status and pings the database.

**Response 200:**
```json
{
  "status": "ok",
  "service": "calculator-platform",
  "time": "2026-11-10T12:00:00.000Z",
  "version": "0.1.0"
}
```

**Response 503** (database unreachable):
```json
{ "status": "degraded", "error": "database unreachable" }
```

---

## History

### `GET /api/history`
List calculation history entries with pagination, search, filter, sort.

**Query parameters:**
| Param       | Type    | Default | Description                              |
| ----------- | ------- | ------- | ---------------------------------------- |
| `page`      | integer | 1       | Page number (1-indexed)                  |
| `pageSize`  | integer | 20      | Items per page (max 100)                 |
| `search`    | string  | —       | Full-text search on expression + result  |
| `mode`      | enum    | —       | `standard` \| `scientific` \| `advanced` |
| `starred`   | bool    | —       | `true` to filter starred entries         |
| `sort`      | enum    | `desc`  | `asc` (oldest first) \| `desc` (newest)   |

**Response 200:**
```json
{
  "items": [
    {
      "id": "cmwaruqsn0000nhxisvpidkv4",
      "expression": "2+3",
      "result": "5",
      "mode": "standard",
      "angleUnit": null,
      "error": null,
      "starred": false,
      "createdAt": "2026-11-10T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

### `POST /api/history`
Evaluate an expression with the math engine and store the result.

**Request body:**
```json
{
  "expression": "2+3",
  "mode": "standard",
  "angleUnit": "rad"
}
```

**Response 201:** The created history entry (with computed `result` and `error`).

**Response 400:** `{ "error": "Invalid request body" }`

### `PUT /api/history`
Bulk-import history entries.

**Request body:** array of:
```json
{
  "expression": "2+3",
  "result": "5",
  "mode": "standard",
  "angleUnit": null,
  "error": null,
  "createdAt": "2026-11-10T12:00:00.000Z"
}
```

**Response 200:** `{ "imported": 5 }`

### `GET /api/history/[id]`
Fetch a single history entry.

**Response 200:** The entry. **Response 404:** `{ "error": "Not found" }`

### `PATCH /api/history/[id]`
Toggle the `starred` flag.

**Request body:** `{ "starred": true }`

**Response 200:** The updated entry. **Response 404:** `{ "error": "Not found" }`

### `DELETE /api/history/[id]`
Delete one entry, or all entries if `id` is `"all"`.

**Response 200:** `{ "deleted": "id" }` or `{ "cleared": true }`

### `GET /api/history/export`
Download all history as a JSON attachment.

**Response 200:** `application/json` attachment named `calculator-history-<timestamp>.json`:
```json
{
  "version": 1,
  "exportedAt": "2026-11-10T12:00:00.000Z",
  "history": [ ... ]
}
```

---

## Settings

### `GET /api/settings`
Fetch the composite settings object.

**Response 200:**
```json
{
  "general": { "angleUnit": "deg", "defaultMode": "standard", ... },
  "behavior": { ... },
  "display": { ... },
  "audio": { ... },
  "accessibility": { ... },
  "privacy": { ... }
}
```

### `PUT /api/settings`
Replace the entire settings object (validated with `settingsSchema`).

**Request body:** the full settings object (same shape as the GET response).

**Response 200:** The saved settings.

**Response 400:** `{ "error": "Invalid settings", "issues": [...] }`

### `DELETE /api/settings`
Reset all settings to defaults.

**Response 200:** `{ "reset": true }`

---

## Themes

### `GET /api/themes`
List all themes (built-in + user-created).

**Response 200:**
```json
{
  "themes": [
    {
      "id": "...",
      "name": "Light",
      "description": "Clean light theme",
      "isBuiltIn": true,
      "category": "official",
      "configuration": "{...JSON string...}"
    }
  ]
}
```

The first call to this endpoint seeds the 10 built-in themes if they don't exist yet.

### `POST /api/themes`
Create a custom theme.

**Request body:** A `themeConfigSchema`-shaped object:
```json
{
  "name": "My Custom Theme",
  "description": "A personal theme",
  "category": "personal",
  "isDefault": false,
  "configuration": {
    "colors": { "primary": "#0f172a", "secondary": "#475569", ... },
    "sizing": { "cornerRadius": 12, "buttonSize": 56, ... },
    "fonts": { "fontFamily": "'Inter', system-ui, sans-serif", ... }
  }
}
```

**Response 201:** The created theme row.

**Response 400:** `{ "error": "Invalid theme", "issues": [...] }`

### `GET /api/themes/[id]`
Fetch one theme. **Response 200:** theme row. **Response 404:** `{ "error": "Not found" }`

### `PUT /api/themes/[id]`
Update an existing theme. **Request body:** same shape as POST.

### `DELETE /api/themes/[id]`
Delete a theme. Built-in themes cannot be deleted.

**Response 200:** `{ "deleted": "id" }` · **Response 400:** `{ "error": "Built-in themes cannot be deleted" }`

### `POST /api/themes/import`
Import a theme from a JSON payload.

**Request body:**
```json
{
  "theme": { ...themeConfigSchema shape... },
  "overwrite": false
}
```

**Response 201:** `{ "imported": true, "theme": { ... } }` · **Response 400:** `{ "imported": false, "error": "..." }`

### `GET /api/themes/export`
Download all themes as a JSON attachment.

---

## Images

### `GET /api/images`
List uploaded images.

**Response 200:**
```json
{
  "images": [
    {
      "id": "...",
      "filename": "abc123.png",
      "originalName": "wallpaper.png",
      "mimeType": "image/png",
      "fileSize": 102400,
      "width": 1920,
      "height": 1080,
      "createdAt": "..."
    }
  ]
}
```

### `POST /api/images`
Upload an image.

**Request body:** `multipart/form-data` with a `file` field.

Validation:
- File size ≤ 5 MB (configurable via `MAX_IMAGE_SIZE_BYTES`)
- Dimensions ≤ 4000 × 4000
- Total pixels ≤ 16 M
- MIME type verified by **magic byte check** (not by client-provided header)
- Internal filename is randomized (16-byte hex)
- File stored in `storage/uploads/` (NEVER in `public/`)

**Response 201:** The created image metadata row.

**Response 400:** `{ "error": "..." }` (with details: file too large, invalid magic bytes, decode failure, etc.)

### `GET /api/images/[id]`
Serve an image file. Sets `Content-Type`, `Content-Disposition: inline; filename=...`, `Cache-Control: private, max-age=3600`.

**Response 200:** Raw image bytes. **Response 404:** `{ "error": "Not found" }`

### `DELETE /api/images/[id]`
Delete an image (removes the file from disk and the row from the DB).

---

## Recovery

### `GET /api/recovery`
Fetch the most recent recovery snapshot.

**Response 200:**
```json
{
  "snapshot": {
    "expression": "2+3",
    "result": "5",
    "mode": "standard",
    "angleUnit": "deg",
    "memory": 0,
    "lastOperator": null,
    "version": 1,
    "updatedAt": "2026-11-10T12:00:00.000Z"
  },
  "found": true
}
```

If no snapshot exists: `{ "snapshot": null, "found": false }`

### `POST /api/recovery`
Save a new recovery snapshot.

**Request body:** A `snapshotPayloadSchema`-shaped object (validated with Zod).

**Response 200:** `{ "saved": true }`

### `DELETE /api/recovery`
Clear all recovery snapshots.

**Response 200:** `{ "cleared": true }`

---

## Export

### `GET /api/export`
Download all user data (history + themes) as a single JSON attachment.

**Response 200:** `application/json` attachment named `calculator-export-<timestamp>.json`:
```json
{
  "version": 1,
  "exportedAt": "...",
  "history": [ ... ],
  "themes": [ ... ]
}
```

---

## Stateless Evaluation

### `POST /api/evaluate`
Evaluate an expression WITHOUT persisting to history. Used for live previews.

**Request body:**
```json
{
  "expression": "2+3",
  "angleUnit": "rad"
}
```

**Response 200 (success):**
```json
{ "ok": true, "result": "5" }
```

**Response 200 (failure):**
```json
{ "ok": false, "error": { "code": "DIVISION_BY_ZERO", "message": "Division by zero is undefined" } }
```

---

## Error responses

All error responses follow a consistent shape:
```json
{ "error": "Human-readable message", "issues": [...] }
```

Status codes used:
- `200 OK` — successful GET
- `201 Created` — successful POST that created a resource
- `400 Bad Request` — validation failure (with `issues` array)
- `404 Not Found` — resource does not exist
- `429 Too Many Requests` — rate limit exceeded (with `Retry-After` header)
- `500 Internal Server Error` — unexpected server error (logged; no stack trace exposed)
- `503 Service Unavailable` — health check failed (database unreachable)
