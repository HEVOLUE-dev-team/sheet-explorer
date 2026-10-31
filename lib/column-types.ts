// Détection automatique du type des colonnes (nombre, date, texte) et lecture des valeurs.

import type { ColumnType } from "./types";

/**
 * Lit un nombre écrit à la française ou à l'anglaise : « 1 150,00 », « 1,150.00 », « 420.5 »,
 * « 12 % », « 89,90 € ». Renvoie null si la valeur n'est pas un nombre.
 *
 * Les valeurs qui commencent par « 0 » suivi d'un chiffre (06…, 01000) ou par « + » sont
 * refusées : ce sont des téléphones ou des codes, pas des quantités.
 */
export function parseNumber(raw: string): number | null {
  let v = raw.trim();
  if (!v) return null;
  v = v.replace(/[€$£%  ]/g, (c) => (c === " " || c === " " ? " " : "")).trim();
  if (!v || v.startsWith("+") || /^-?0\d/.test(v)) return null;
  if (!/^-?[\d\s.,]+$/.test(v)) return null;

  const compact = v.replace(/\s/g, "");
  if (digitsCount(compact) > 15) return null;

  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  let normalized: string;
  if (lastComma > -1 && lastDot > -1) {
    // Le dernier séparateur est le séparateur décimal.
    normalized =
      lastComma > lastDot
        ? compact.replace(/\./g, "").replace(",", ".")
        : compact.replace(/,/g, "");
  } else if (lastComma > -1) {
    // « 1,150 » est ambigu : on le lit comme un décimal français (1,15), sauf groupes de milliers multiples.
    normalized = /^-?\d{1,3}(,\d{3}){2,}$/.test(compact) ? compact.replace(/,/g, "") : compact.replace(",", ".");
  } else if (lastDot > -1 && /^-?\d{1,3}(\.\d{3}){2,}$/.test(compact)) {
    normalized = compact.replace(/\./g, "");
  } else {
    normalized = compact;
  }
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function digitsCount(v: string): number {
  let n = 0;
  for (const c of v) if (c >= "0" && c <= "9") n++;
  return n;
}

/**
 * Lit une date et renvoie un horodatage (ms, à minuit UTC) ou null.
 * Formats reconnus : JJ/MM/AAAA (aussi avec - ou .), AAAA-MM-JJ, avec heure facultative.
 * Si le jour dépasse 12 en deuxième position, on suppose le format américain MM/JJ/AAAA.
 */
export function parseDate(raw: string): number | null {
  const v = raw.trim();
  if (!v) return null;

  let y: number, m: number, d: number;
  let match = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]\d{1,2}:\d{2}(?::\d{2})?.*)?$/);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    match = v.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2}|\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
    if (!match) return null;
    let a = Number(match[1]);
    let b = Number(match[2]);
    if (b > 12 && a <= 12) [a, b] = [b, a];
    d = a;
    m = b;
    y = Number(match[3]);
    if (y < 100) y += y < 70 ? 2000 : 1900;
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const t = Date.UTC(y, m - 1, d);
  // Refuse les dates impossibles (31/02…).
  const check = new Date(t);
  if (check.getUTCDate() !== d) return null;
  return t;
}

/** Une date ISO « AAAA-MM-JJ » (valeur d'un <input type="date">) → horodatage. */
export function parseIsoInput(value: string): number | null {
  return value ? parseDate(value) : null;
}

/**
 * Devine le type d'une colonne à partir d'un échantillon de valeurs non vides :
 * nombre ou date si au moins 90 % des valeurs s'y prêtent, texte sinon.
 */
export function detectColumnType(values: string[], sampleSize = 500): ColumnType {
  let seen = 0;
  let numbers = 0;
  let dates = 0;
  for (const value of values) {
    if (!value || !value.trim()) continue;
    seen++;
    if (parseNumber(value) !== null) numbers++;
    else if (parseDate(value) !== null) dates++;
    if (seen >= sampleSize) break;
  }
  if (seen === 0) return "text";
  if (numbers / seen >= 0.9) return "number";
  if (dates / seen >= 0.9) return "date";
  return "text";
}

/** Valeur comparable pour le tri et les plages, selon le type de la colonne. */
export function parseByType(value: string, type: ColumnType): number | null {
  if (type === "number") return parseNumber(value);
  if (type === "date") return parseDate(value);
  return null;
}
