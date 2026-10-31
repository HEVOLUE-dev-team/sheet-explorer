"use client";

// Croisement de deux bases : charge A et B, retrouve les colonnes clés et calcule la jointure.

import { useMemo } from "react";

import { findColumnByLabel } from "@/lib/dataset";
import { joinDatasets, type JoinResult } from "@/lib/join";
import type { Column, JoinConfig, SheetSource } from "@/lib/types";

import { useSheetData } from "./use-sheet-data";

export interface JoinState {
  status: "loading" | "ready" | "error";
  result: JoinResult | null;
  /** Message à afficher si le croisement ne peut pas être calculé. */
  error: string | null;
  sourceA?: SheetSource;
  sourceB?: SheetSource;
  keyA?: Column;
  keyB?: Column;
  reload: () => void;
}

export function useJoin(config: JoinConfig | undefined, sources: SheetSource[]): JoinState {
  const sourceA = sources.find((s) => s.id === config?.sourceA);
  const sourceB = sources.find((s) => s.id === config?.sourceB);
  const dataA = useSheetData(sourceA);
  const dataB = useSheetData(sourceB);

  const keyA = dataA.dataset && config ? findColumnByLabel(dataA.dataset, config.keyA) : undefined;
  const keyB = dataB.dataset && config ? findColumnByLabel(dataB.dataset, config.keyB) : undefined;

  const result = useMemo(() => {
    if (!config || !dataA.dataset || !dataB.dataset || !keyA || !keyB) return null;
    return joinDatasets({ a: dataA.dataset, b: dataB.dataset, keyA, keyB, type: config.type, mode: config.mode });
  }, [config, dataA.dataset, dataB.dataset, keyA, keyB]);

  const reload = () => {
    dataA.reload();
    dataB.reload();
  };

  if (!config || !sourceA || !sourceB) {
    return { status: "error", result: null, error: "Une des deux bases de ce croisement a été supprimée.", reload };
  }
  if (dataA.status === "error" || dataB.status === "error") {
    const failed = dataA.status === "error" ? sourceA : sourceB;
    const message = (dataA.error ?? dataB.error)?.message ?? "";
    return { status: "error", result: null, error: `Base « ${failed.name} » : ${message}`, sourceA, sourceB, reload };
  }
  if (!dataA.dataset || !dataB.dataset) {
    return { status: "loading", result: null, error: null, sourceA, sourceB, reload };
  }
  if (!keyA || !keyB) {
    const missing = !keyA ? `« ${config.keyA} » dans ${sourceA.name}` : `« ${config.keyB} » dans ${sourceB.name}`;
    return {
      status: "error",
      result: null,
      error: `La colonne clé ${missing} n'existe plus. Modifiez le croisement pour en choisir une autre.`,
      sourceA,
      sourceB,
      reload,
    };
  }
  return { status: "ready", result, error: null, sourceA, sourceB, keyA, keyB, reload };
}
