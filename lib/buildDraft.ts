import type { GameTarget, Resolution } from "./types";

/**
 * The in-progress manual build. Persisted to localStorage (not React state alone) because
 * picking a part happens on its own page (`/build/[category]/`) — a real navigation, not a
 * modal — so the selection has to survive the round trip back to `/build/`.
 */
export interface BuildDraft {
  gpuId: string | null;
  cpuId: string | null;
  coolerId: string | null;
  motherboardId: string | null;
  ramId: string | null;
  storageId: string | null;
  psuId: string | null;
  caseId: string | null;
  resolution: Resolution;
  games: GameTarget[];
}

export const emptyDraft: BuildDraft = {
  gpuId: null,
  cpuId: null,
  coolerId: null,
  motherboardId: null,
  ramId: null,
  storageId: null,
  psuId: null,
  caseId: null,
  resolution: "1440p",
  games: [],
};

const STORAGE_KEY = "pc-build-draft";

export function loadDraft(): BuildDraft {
  if (typeof window === "undefined") return emptyDraft;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDraft;
    return { ...emptyDraft, ...JSON.parse(raw) };
  } catch {
    return emptyDraft;
  }
}

export function saveDraft(draft: BuildDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Private browsing / storage disabled — the draft just won't survive navigation.
  }
}
