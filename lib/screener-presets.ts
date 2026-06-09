import type { ScreenerFilters } from "@/types/screener";

export interface ScreenerPreset {
  id: string;
  name: string;
  filters: ScreenerFilters;
  createdAt: string;
}

const STORAGE_KEY = "screener-presets";

export function loadPresets(): ScreenerPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScreenerPreset[]) : [];
  } catch {
    return [];
  }
}

export function savePresets(presets: ScreenerPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}
