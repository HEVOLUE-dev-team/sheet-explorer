// Filtres : recherche globale et filtres par colonne, sous forme de fonctions pures.

import { parseIsoInput, parseNumber } from "./column-types";
import { getParsedColumn, getSearchIndex } from "./dataset";
import { foldText, searchTokens } from "./normalize";
import type { Column, Dataset } from "./types";

export type FilterOperator = "contains" | "equals" | "empty" | "notEmpty" | "range";

export interface ColumnFilter {
  /** Identifiant unique du filtre (plusieurs filtres possibles sur une même colonne). */
  id: string;
  columnId: string;
  operator: FilterOperator;
  /** Texte recherché pour « contient » et « égal à ». */
  value?: string;
  /** Bornes de plage, telles que saisies (nombre, ou date AAAA-MM-JJ). Vides = pas de borne. */
  min?: string;
  max?: string;
}

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains: "contient",
  equals: "est égal à",
  empty: "est vide",
  notEmpty: "n'est pas vide",
  range: "entre",
};

/** Opérateurs proposés selon le type de colonne. */
export function operatorsFor(column: Column): FilterOperator[] {
  return column.type === "text"
    ? ["contains", "equals", "empty", "notEmpty"]
    : ["range", "equals", "contains", "empty", "notEmpty"];
}

/** Un filtre incomplet (valeur vide…) est ignoré plutôt que de tout masquer. */
export function isFilterActive(filter: ColumnFilter): boolean {
  switch (filter.operator) {
    case "contains":
    case "equals":
      return Boolean(filter.value?.trim());
    case "range":
      return Boolean(filter.min?.trim() || filter.max?.trim());
    default:
      return true;
  }
}

type RowTest = (rowIndex: number) => boolean;

function compileFilter(dataset: Dataset, filter: ColumnFilter): RowTest | null {
  const column = dataset.columns.find((c) => c.id === filter.columnId);
  if (!column || !isFilterActive(filter)) return null;
  const { rows } = dataset;
  const i = column.index;

  switch (filter.operator) {
    case "contains": {
      const needle = foldText(filter.value ?? "");
      return (r) => foldText(rows[r][i]).includes(needle);
    }
    case "equals": {
      const target = foldText(filter.value ?? "");
      // Sur une colonne numérique, « 420 » est égal à « 420,00 ».
      const targetNumber = column.type === "number" ? parseNumber(filter.value ?? "") : null;
      if (targetNumber !== null) {
        const parsed = getParsedColumn(dataset, column);
        return (r) => parsed[r] === targetNumber || foldText(rows[r][i]) === target;
      }
      return (r) => foldText(rows[r][i]) === target;
    }
    case "empty":
      return (r) => rows[r][i].trim() === "";
    case "notEmpty":
      return (r) => rows[r][i].trim() !== "";
    case "range": {
      const read = column.type === "date" ? parseIsoInput : parseNumber;
      const min = filter.min?.trim() ? read(filter.min) : null;
      const max = filter.max?.trim() ? read(filter.max) : null;
      if (min === null && max === null) return null;
      const parsed = getParsedColumn(dataset, column);
      return (r) => {
        const v = parsed[r];
        if (Number.isNaN(v)) return false;
        return (min === null || v >= min) && (max === null || v <= max);
      };
    }
  }
}

/**
 * Applique recherche globale + filtres (ET logique) et renvoie les index des lignes retenues.
 * La recherche porte sur toutes les colonnes, sans accents ni majuscules.
 */
export function filterRows(dataset: Dataset, query: string, filters: ColumnFilter[]): number[] {
  const tokens = searchTokens(query);
  const tests = filters.map((f) => compileFilter(dataset, f)).filter((t): t is RowTest => t !== null);
  const search = tokens.length ? getSearchIndex(dataset) : null;

  const result: number[] = [];
  for (let r = 0; r < dataset.rows.length; r++) {
    if (search && !tokens.every((t) => search[r].includes(t))) continue;
    if (tests.length && !tests.every((test) => test(r))) continue;
    result.push(r);
  }
  return result;
}

/** Résumé lisible d'un filtre pour la pastille : « Montant entre 100 et 500 ». */
export function describeFilter(filter: ColumnFilter, column: Column | undefined): string {
  const name = column?.label ?? "?";
  switch (filter.operator) {
    case "contains":
      return `${name} contient « ${filter.value} »`;
    case "equals":
      return `${name} = « ${filter.value} »`;
    case "empty":
      return `${name} vide`;
    case "notEmpty":
      return `${name} non vide`;
    case "range": {
      const fmt = (v?: string) =>
        column?.type === "date" && v ? new Date(`${v}T00:00:00`).toLocaleDateString("fr-FR") : v;
      if (filter.min && filter.max) return `${name} entre ${fmt(filter.min)} et ${fmt(filter.max)}`;
      if (filter.min) return `${name} ≥ ${fmt(filter.min)}`;
      return `${name} ≤ ${fmt(filter.max)}`;
    }
  }
}
