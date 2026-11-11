// src/hooks/useRecovery.ts
// On mount, attempts to restore the most recent calculator state. Prefers a
// localStorage snapshot if it is newer than the server snapshot.

"use client";

import { useEffect, useRef } from "react";

interface RecoveryPayload {
  expression: string;
  result: string;
  mode: string;
  angleUnit: string;
  memory: number;
  lastOperator: string | null;
  ts: number;
}

export function useRecovery(onRestore: (payload: RecoveryPayload) => void) {
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    let localTs = 0;
    let localPayload: RecoveryPayload | null = null;
    try {
      const raw = localStorage.getItem("calc.recovery");
      if (raw) {
        localPayload = JSON.parse(raw) as RecoveryPayload;
        localTs = localPayload?.ts ?? 0;
      }
    } catch {
      /* ignore */
    }
    fetch("/api/recovery")
      .then((r) => r.json())
      .then((data) => {
        const server = data.snapshot as (RecoveryPayload & { createdAt?: string }) | null;
        if (localPayload && localTs > 0) {
          const serverTs = server?.ts ?? 0;
          if (localTs >= serverTs) {
            onRestore(localPayload);
            return;
          }
        }
        if (server) onRestore(server as RecoveryPayload);
      })
      .catch(() => {
        if (localPayload) onRestore(localPayload);
      });
  }, [onRestore]);
}
