// Jointure de deux bases : intersection (inner), tout A (left), différence (anti).
// Fonctions pures, testables sans navigateur (voir scripts/test-join.ts).

import { isPhoneColumn, phoneKey, textKey } from "./normalize";
import type { Column, Dataset, JoinType, KeyMode } from "./types";

export const JOIN_LABELS: Record<JoinType, { title: string; description: string }> = {
  inner: { title: "Intersection", description: "Les lignes présentes dans A et dans B." },
  left: { title: "Tout A", description: "Toutes les lignes de A, complétées par B quand elles correspondent." },
  anti: { title: "Différence", description: "Les lignes de A absentes de B." },
};

/** Libellés des valeurs de la colonne « Correspondance ». */
export const MATCH_FOUND = "Trouvé dans B";
export const MATCH_MISSING = "Absent de B";

export interface JoinOptions {
  a: Dataset;
  b: Dataset;
  keyA: Column;
  keyB: Column;
  type: JoinType;
  mode: KeyMode;
}

export interface JoinStats {
  rowsA: number;
  rowsB: number;
  /** Lignes de A ayant au moins une correspondance dans B. */
  matchedA: number;
  unmatchedA: number;
  /** Lignes de A dont la clé est vide après normalisation (jamais rapprochées). */
  emptyKeysA: number;
  /** Clés qui apparaissent plusieurs fois dans B (une ligne de A peut alors en produire plusieurs). */
  duplicateKeysB: number;
  resultRows: number;
  /** Mode réellement utilisé après la détection automatique. */
  mode: Exclude<KeyMode, "auto">;
}

export interface JoinResult {
  dataset: Dataset;
  stats: JoinStats;
}

/** Choisit la comparaison : téléphones si les deux colonnes clés sont téléphoniques. */
export function resolveKeyMode(options: Pick<JoinOptions, "a" | "b" | "keyA" | "keyB" | "mode">) {
  if (options.mode !== "auto") return options.mode;
  const valuesA = options.a.rows.map((r) => r[options.keyA.index]);
  const valuesB = options.b.rows.map((r) => r[options.keyB.index]);
  return isPhoneColumn(valuesA) && isPhoneColumn(valuesB) ? "phone" : "text";
}

/** Fonction de normalisation d'une clé selon le mode. */
export function keyNormalizer(mode: Exclude<KeyMode, "auto">): (value: string) => string {
  return mode === "phone" ? phoneKey : textKey;
}

export function joinDatasets(options: JoinOptions): JoinResult {
  const { a, b, keyA, keyB, type } = options;
  const mode = resolveKeyMode(options);
  const normalize = keyNormalizer(mode);

  // Index de B : clé normalisée → lignes de B.
  const indexB = new Map<string, number[]>();
  for (let r = 0; r < b.rows.length; r++) {
    const key = normalize(b.rows[r][keyB.index]);
    if (!key) continue;
    const list = indexB.get(key);
    if (list) list.push(r);
    else indexB.set(key, [r]);
  }
  let duplicateKeysB = 0;
  for (const list of indexB.values()) if (list.length > 1) duplicateKeysB++;

  // Colonnes du résultat : statut (tout A), clé normalisée, puis A.* et B.*.
  const columns: Column[] = [];
  const withStatus = type === "left";
  const withB = type !== "anti";
  if (withStatus) columns.push({ id: "match", label: "Correspondance", rubric: "", index: 0, type: "text" });
  columns.push({ id: "key", label: "Clé comparée", rubric: "", index: columns.length, type: "text" });
  const offsetA = columns.length;
  for (const col of a.columns) {
    columns.push({ ...col, id: `a${col.index}`, label: `A.${col.label}`, rubric: `A·${col.rubric}`, index: offsetA + col.index });
  }
  const offsetB = columns.length;
  if (withB) {
    for (const col of b.columns) {
      columns.push({ ...col, id: `b${col.index}`, label: `B.${col.label}`, rubric: `B·${col.rubric}`, index: offsetB + col.index });
    }
  }
  const emptyB = new Array<string>(b.columns.length).fill("");

  const rows: string[][] = [];
  let matchedA = 0;
  let emptyKeysA = 0;
  for (const rowA of a.rows) {
    const key = normalize(rowA[keyA.index]);
    if (!key) emptyKeysA++;
    const matches = key ? indexB.get(key) : undefined;
    if (matches) matchedA++;

    const head = (status: string) => (withStatus ? [status, key] : [key]);
    if (type === "anti") {
      if (!matches) rows.push([...head(""), ...rowA]);
    } else if (matches) {
      for (const r of matches) rows.push([...head(MATCH_FOUND), ...rowA, ...b.rows[r]]);
    } else if (type === "left") {
      rows.push([...head(MATCH_MISSING), ...rowA, ...emptyB]);
    }
  }

  return {
    dataset: { columns, rows },
    stats: {
      rowsA: a.rows.length,
      rowsB: b.rows.length,
      matchedA,
      unmatchedA: a.rows.length - matchedA,
      emptyKeysA,
      duplicateKeysB,
      resultRows: rows.length,
      mode,
    },
  };
}

/**
 * Propose une colonne clé de B correspondant à celle choisie dans A : même nom une fois
 * normalisé (« Phone » / « phone » / « Téléphone »), sinon une colonne du même genre.
 */
export function suggestKeyColumn(keyA: Column, b: Dataset, a?: Dataset): Column | undefined {
  const norm = (s: string) => textKey(s);
  const same = b.columns.find((c) => norm(c.label) === norm(keyA.label));
  if (same) return same;

  const families = [
    ["telephone", "phone", "tel", "mobile", "portable", "gsm"],
    ["email", "mail", "courriel", "emailaddress"],
    ["nom", "name", "lastname", "fullname", "nomcomplet"],
  ];
  const family = families.find((f) => f.some((word) => norm(keyA.label).includes(word)));
  if (family) {
    const found = b.columns.find((c) => family.some((word) => norm(c.label).includes(word)));
    if (found) return found;
  }
  if (a && isPhoneColumn(a.rows.map((r) => r[keyA.index]))) {
    return b.columns.find((c) => isPhoneColumn(b.rows.map((r) => r[c.index])));
  }
  return undefined;
}
