// src/services/export-service.ts
import "server-only";
import { exportHistory } from "./history-service";
import { exportAllThemes } from "./theme-service";

export async function exportAllData() {
  const [history, themes] = await Promise.all([exportHistory(), exportAllThemes()]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    history,
    themes,
  };
}
