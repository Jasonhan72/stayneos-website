"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DRAFT_STORAGE_KEY,
  EMPTY_DRAFT,
  type ListingDraft,
} from "@/types/listing-draft";

function readDraft(): ListingDraft {
  if (typeof window === "undefined") return { ...EMPTY_DRAFT };
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return { ...EMPTY_DRAFT };
    const parsed = JSON.parse(raw) as ListingDraft;
    if (parsed && typeof parsed === "object") return { ...EMPTY_DRAFT, ...parsed };
    return { ...EMPTY_DRAFT };
  } catch {
    return { ...EMPTY_DRAFT };
  }
}

function writeDraft(next: ListingDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * localStorage-backed draft for the new-listing wizard.
 * Returns draft, updateDraft (merge), replaceDraft (overwrite), clearDraft, and hydrated flag.
 */
export function useListingDraft() {
  const [draft, setDraft] = useState<ListingDraft>(() => ({ ...EMPTY_DRAFT }));
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatches
  useEffect(() => {
    setDraft(readDraft());
    setHydrated(true);
  }, []);

  // Listen for cross-tab updates
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== DRAFT_STORAGE_KEY) return;
      setDraft(readDraft());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateDraft = useCallback((updates: Partial<ListingDraft>) => {
    setDraft((prev) => {
      const next: ListingDraft = { ...prev, ...updates };
      writeDraft(next);
      return next;
    });
  }, []);

  const replaceDraft = useCallback((next: ListingDraft) => {
    const merged: ListingDraft = { ...EMPTY_DRAFT, ...next };
    writeDraft(merged);
    setDraft(merged);
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setDraft({ ...EMPTY_DRAFT });
  }, []);

  return { draft, hydrated, updateDraft, replaceDraft, clearDraft };
}
