"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadPresets,
  savePresets,
  type ScreenerPreset,
} from "@/lib/screener-presets";
import type { ScreenerFilters } from "@/types/screener";

export function useScreenerPresets() {
  const [presets, setPresets] = useState<ScreenerPreset[]>([]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const save = useCallback((name: string, filters: ScreenerFilters): boolean => {
    const existing = presets.find((p) => p.name === name);
    if (existing) {
      if (!window.confirm(`"${name}" 프리셋이 이미 존재합니다. 덮어쓰시겠습니까?`)) {
        return false;
      }
      const next = presets.map((p) =>
        p.name === name ? { ...p, filters, createdAt: new Date().toISOString() } : p
      );
      savePresets(next);
      setPresets(next);
    } else {
      const next = [
        ...presets,
        {
          id: crypto.randomUUID(),
          name,
          filters,
          createdAt: new Date().toISOString(),
        },
      ];
      savePresets(next);
      setPresets(next);
    }
    return true;
  }, [presets]);

  const remove = useCallback((id: string) => {
    const next = presets.filter((p) => p.id !== id);
    savePresets(next);
    setPresets(next);
  }, [presets]);

  return { presets, save, remove };
}
