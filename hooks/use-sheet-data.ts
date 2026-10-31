"use client";

// Chargement des données d'une base, avec un cache mémoire partagé : basculer d'une base à
// l'autre (ou l'utiliser dans un croisement) ne relance pas la requête.

import { useCallback, useEffect, useState } from "react";

import { buildDataset } from "@/lib/dataset";
import { fetchValues, SheetsClientError } from "@/lib/sheets-client";
import type { Dataset, SheetSource } from "@/lib/types";

export interface SheetData {
  status: "idle" | "loading" | "ready" | "error";
  dataset: Dataset | null;
  error: SheetsClientError | null;
  /** Date du dernier chargement réussi. */
  loadedAt: number | null;
  reload: () => void;
}

interface CacheEntry {
  promise: Promise<Dataset>;
  loadedAt: number;
}

const cache = new Map<string, CacheEntry>();
const cacheKey = (s: Pick<SheetSource, "spreadsheetId" | "sheetTitle">) => `${s.spreadsheetId}::${s.sheetTitle}`;

/** Lance (ou réutilise) le chargement d'une base. */
export function loadDataset(source: Pick<SheetSource, "spreadsheetId" | "sheetTitle">, force = false): CacheEntry {
  const key = cacheKey(source);
  const cached = cache.get(key);
  if (cached && !force) return cached;

  const promise = fetchValues(source.spreadsheetId, source.sheetTitle).then(buildDataset);
  const entry = { promise, loadedAt: Date.now() };
  cache.set(key, entry);
  // Une erreur ne reste pas en cache : la prochaine visite réessaie.
  promise.catch(() => {
    if (cache.get(key) === entry) cache.delete(key);
  });
  return entry;
}

type LoadState = Omit<SheetData, "reload"> & { key: string | null; version: number };

const IDLE: Omit<SheetData, "reload"> = { status: "idle", dataset: null, error: null, loadedAt: null };

export function useSheetData(source: SheetSource | undefined): SheetData {
  const key = source ? cacheKey(source) : null;
  const [state, setState] = useState<LoadState | null>(null);
  // Demande d'actualisation : elle ne vaut que pour la base sur laquelle elle a été faite.
  const [reloadRequest, setReloadRequest] = useState<{ key: string | null; n: number }>({ key: null, n: 0 });
  const version = reloadRequest.key === key ? reloadRequest.n : 0;

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    const entry = loadDataset(source, version > 0);
    entry.promise.then(
      (dataset) => {
        if (!cancelled) setState({ key, version, status: "ready", dataset, error: null, loadedAt: entry.loadedAt });
      },
      (error: unknown) => {
        if (cancelled) return;
        const err =
          error instanceof SheetsClientError ? error : new SheetsClientError("UNKNOWN", "Lecture du Sheet impossible.");
        setState({ key, version, status: "error", dataset: null, error: err, loadedAt: null });
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la clé suffit à identifier la base
  }, [key, version]);

  const reload = useCallback(() => setReloadRequest((r) => ({ key, n: r.key === key ? r.n + 1 : 1 })), [key]);

  if (!source) return { ...IDLE, reload };
  const sameBase = state?.key === key;
  if (!state || !sameBase || state.version !== version) {
    // Chargement en cours ; pendant une actualisation, on garde l'ancien tableau affiché.
    return {
      status: "loading",
      dataset: sameBase ? (state?.dataset ?? null) : null,
      error: null,
      loadedAt: sameBase ? (state?.loadedAt ?? null) : null,
      reload,
    };
  }
  return { status: state.status, dataset: state.dataset, error: state.error, loadedAt: state.loadedAt, reload };
}
