// Aide à l'affichage d'une ligne : titre de la fiche et liens utiles.

import { textKey } from "./normalize";
import type { Column } from "./types";

const FIRST = ["prenom", "firstname", "givenname"];
const LAST = ["nom", "lastname", "surname", "familyname"];
const FULL = ["name", "nomcomplet", "fullname", "client", "contact"];

const base = (label: string) => textKey(label.replace(/^[AB]\./, "")).replace(/[^a-z]/g, "");

/**
 * Colonnes qui identifient la personne d'une ligne (Prénom puis Nom, ou un nom complet).
 * Elles sont épinglées à gauche du tableau pour rester visibles en défilant.
 */
export function identityColumns(columns: Column[]): Column[] {
  const find = (words: string[]) => columns.find((c) => words.includes(base(c.label)));
  const first = find(FIRST);
  const last = find(LAST);
  if (first || last) return [first, last].filter((c): c is Column => Boolean(c));
  const full = find(FULL);
  return full ? [full] : [];
}

/** Titre lisible d'une fiche : « Prénom Nom » si ces colonnes existent, sinon la première valeur texte. */
export function recordTitle(columns: Column[], row: string[]): string {
  const find = (words: string[]) => columns.find((c) => words.includes(base(c.label)) && row[c.index]?.trim());
  const first = find(FIRST);
  const last = find(LAST);
  if (first || last) return [first && row[first.index], last && row[last.index]].filter(Boolean).join(" ");
  const full = find(FULL);
  if (full) return row[full.index];
  const text = columns.find((c) => c.type === "text" && row[c.index]?.trim() && c.id !== "match" && c.id !== "key");
  return text ? row[text.index] : "Ligne sans titre";
}

/** Lien cliquable pour un e-mail ou un téléphone, sinon null. */
export function valueHref(value: string): string | null {
  const v = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  if (/^[+\d][\d\s.\-()]{7,}$/.test(v) && v.replace(/\D/g, "").length >= 9) return `tel:${v.replace(/[^\d+]/g, "")}`;
  return null;
}
