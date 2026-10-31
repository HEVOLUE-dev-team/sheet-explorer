// Construction d'un jeu de données à partir des valeurs brutes d'un Sheet, et caches associés.

import { detectColumnType, parseByType } from "./column-types";
import { buildSearchText } from "./normalize";
import type { Column, Dataset } from "./types";

/** Numéro de rubrique sur deux chiffres : 1 → « 01 ». */
export function rubricNumber(position: number): string {
  return String(position + 1).padStart(2, "0");
}

/**
 * Transforme la réponse de l'API (tableau de lignes, la première étant les en-têtes)
 * en Dataset. Les en-têtes vides deviennent « Colonne N », les doublons sont suffixés « (2) ».
 * Les lignes sont complétées à la largeur des en-têtes et les lignes entièrement vides retirées.
 */
export function buildDataset(values: string[][]): Dataset {
  const headerRow = values[0] ?? [];
  // Pas de Math.max(...lignes) : au-delà de ~100 000 lignes, l'étalement dépasse la pile du navigateur.
  let width = headerRow.length;
  for (let r = 1; r < values.length; r++) if (values[r].length > width) width = values[r].length;

  const seen = new Map<string, number>();
  const labels = Array.from({ length: width }, (_, i) => {
    const base = (headerRow[i] ?? "").toString().trim() || `Colonne ${i + 1}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count > 1 ? `${base} (${count})` : base;
  });

  const rows: string[][] = [];
  for (let r = 1; r < values.length; r++) {
    const raw = values[r];
    const row = Array.from({ length: width }, (_, i) => (raw[i] ?? "").toString());
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  const columns: Column[] = labels.map((label, index) => ({
    id: `c${index}`,
    label,
    rubric: rubricNumber(index),
    index,
    type: detectColumnType(rows.map((r) => r[index])),
  }));

  return { columns, rows };
}

// --- Caches calculés une seule fois par jeu de données -------------------------------
// Ils évitent de replier les accents ou de relire les dates à chaque frappe ou tri.

const searchCache = new WeakMap<Dataset, string[]>();
const parsedCache = new WeakMap<Dataset, Map<number, Float64Array>>();

/** Texte de recherche replié de chaque ligne (voir buildSearchText). */
export function getSearchIndex(dataset: Dataset): string[] {
  let index = searchCache.get(dataset);
  if (!index) {
    index = dataset.rows.map(buildSearchText);
    searchCache.set(dataset, index);
  }
  return index;
}

/**
 * Valeurs numériques d'une colonne nombre ou date (NaN quand la cellule est vide ou illisible).
 * Utilisé par le tri et les filtres de plage.
 */
export function getParsedColumn(dataset: Dataset, column: Column): Float64Array {
  let byColumn = parsedCache.get(dataset);
  if (!byColumn) {
    byColumn = new Map();
    parsedCache.set(dataset, byColumn);
  }
  let parsed = byColumn.get(column.index);
  if (!parsed) {
    parsed = new Float64Array(dataset.rows.length);
    for (let i = 0; i < dataset.rows.length; i++) {
      parsed[i] = parseByType(dataset.rows[i][column.index], column.type) ?? Number.NaN;
    }
    byColumn.set(column.index, parsed);
  }
  return parsed;
}

/** Retrouve une colonne par son libellé, sans tenir compte de la casse ni des accents. */
export function findColumnByLabel(dataset: Dataset, label: string): Column | undefined {
  const target = label.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  return (
    dataset.columns.find((c) => c.label === label) ??
    dataset.columns.find(
      (c) => c.label.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim() === target,
    )
  );
}
