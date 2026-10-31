"use client";

// Connexions (bases et croisements) sauvegardées en localStorage, partagées par toute l'application.

import { useCallback, useSyncExternalStore } from "react";

import type { JoinConfig, Selection, SheetSource } from "@/lib/types";

const STORAGE_KEY = "sheet-explorer:v1";

interface StoreState {
  sources: SheetSource[];
  joins: JoinConfig[];
  selection: Selection;
}

const EMPTY: StoreState = { sources: [], joins: [], selection: null };

// --- Petit magasin externe : un état, des abonnés, une copie en localStorage ----------

let state: StoreState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as Partial<StoreState>) };
  } catch {
    // Stockage illisible ou bloqué (navigation privée…) : on démarre vide.
  }
}

function setState(update: (prev: StoreState) => StoreState) {
  state = update(state);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota dépassé ou stockage bloqué : l'état reste valable pour la session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Synchronise les onglets ouverts en parallèle.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

/** Côté serveur (et au premier rendu), rien n'est connu : la liste apparaît après hydratation. */
function getServerSnapshot() {
  return EMPTY;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

// --- Hook public ---------------------------------------------------------------------

export function useSources() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const addSource = useCallback((input: Omit<SheetSource, "id" | "createdAt">) => {
    const source: SheetSource = { ...input, id: newId(), createdAt: Date.now() };
    setState((s) => ({ ...s, sources: [...s.sources, source], selection: { kind: "source", id: source.id } }));
    return source;
  }, []);

  const renameSource = useCallback((id: string, name: string) => {
    setState((s) => ({ ...s, sources: s.sources.map((src) => (src.id === id ? { ...src, name } : src)) }));
  }, []);

  /** Supprimer une base supprime aussi les croisements qui l'utilisent. */
  const removeSource = useCallback((id: string) => {
    setState((s) => {
      const joins = s.joins.filter((j) => j.sourceA !== id && j.sourceB !== id);
      const selectionGone =
        (s.selection?.kind === "source" && s.selection.id === id) ||
        (s.selection?.kind === "join" && !joins.some((j) => j.id === s.selection?.id));
      const sources = s.sources.filter((src) => src.id !== id);
      return {
        sources,
        joins,
        selection: selectionGone ? (sources[0] ? { kind: "source", id: sources[0].id } : null) : s.selection,
      };
    });
  }, []);

  const addJoin = useCallback((input: Omit<JoinConfig, "id" | "createdAt">) => {
    const join: JoinConfig = { ...input, id: newId(), createdAt: Date.now() };
    setState((s) => ({ ...s, joins: [...s.joins, join], selection: { kind: "join", id: join.id } }));
    return join;
  }, []);

  const updateJoin = useCallback((id: string, patch: Partial<Omit<JoinConfig, "id">>) => {
    setState((s) => ({ ...s, joins: s.joins.map((j) => (j.id === id ? { ...j, ...patch } : j)) }));
  }, []);

  const removeJoin = useCallback((id: string) => {
    setState((s) => {
      const joins = s.joins.filter((j) => j.id !== id);
      const wasSelected = s.selection?.kind === "join" && s.selection.id === id;
      return {
        ...s,
        joins,
        selection: wasSelected ? (s.sources[0] ? { kind: "source", id: s.sources[0].id } : null) : s.selection,
      };
    });
  }, []);

  const select = useCallback((selection: Selection) => {
    setState((s) => ({ ...s, selection }));
  }, []);

  /** Photo de l'état, pour pouvoir annuler une suppression. */
  const snapshot = useCallback(() => state, []);
  const restore = useCallback((saved: StoreState) => setState(() => saved), []);

  return {
    hydrated,
    sources: current.sources,
    joins: current.joins,
    selection: current.selection,
    addSource,
    renameSource,
    removeSource,
    addJoin,
    updateJoin,
    removeJoin,
    select,
    snapshot,
    restore,
  };
}
