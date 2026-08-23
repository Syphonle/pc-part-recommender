"use client";

import { useSyncExternalStore } from "react";
import { emptyDraft, loadDraft, saveDraft, type BuildDraft } from "./buildDraft";

/**
 * A single module-scoped draft shared by every component that calls this hook — exactly one
 * in-progress build at a time, which is what we want since `/build/` and `/build/[category]/`
 * are really views onto the same draft, reached via real page navigations rather than shared
 * component state. useSyncExternalStore (rather than an effect) is what makes the localStorage
 * read hydration-safe: it renders `emptyDraft` (matching the server) until React re-checks the
 * snapshot right after mount, at which point `cached` is lazily loaded from localStorage.
 */
let cached: BuildDraft | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): BuildDraft {
  if (cached === null) cached = loadDraft();
  return cached;
}

function getServerSnapshot(): BuildDraft {
  return emptyDraft;
}

export function useBuildDraft() {
  const draft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setDraft(update: BuildDraft | ((d: BuildDraft) => BuildDraft)) {
    const prev = cached ?? emptyDraft;
    const next = typeof update === "function" ? (update as (d: BuildDraft) => BuildDraft)(prev) : update;
    cached = next;
    saveDraft(next);
    for (const listener of listeners) listener();
  }

  return { draft, setDraft };
}
