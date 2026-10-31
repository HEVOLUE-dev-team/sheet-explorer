// Extraction de l'identifiant d'un Google Sheet à partir du lien collé par l'utilisateur.

/** Un ID de Google Sheet : lettres, chiffres, tirets et soulignés, généralement 44 caractères. */
const ID_PATTERN = /^[a-zA-Z0-9_-]{20,}$/;

/** Préfixe des bases de démonstration servies depuis /sample-data (voir lib/sheets-source.ts). */
export const DEMO_PREFIX = "demo-";

export interface ParsedSheetUrl {
  spreadsheetId: string;
  /** Identifiant de l'onglet présent dans le lien (#gid=…), s'il y en a un. */
  gid: number | null;
}

/**
 * Lit un lien du type https://docs.google.com/spreadsheets/d/{ID}/edit#gid=0
 * Accepte aussi un ID seul. Renvoie null si rien d'exploitable n'est trouvé.
 */
export function parseSheetUrl(input: string): ParsedSheetUrl | null {
  const value = input.trim();
  if (!value) return null;

  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  const spreadsheetId = match ? match[1] : value;
  if (!isValidSpreadsheetId(spreadsheetId)) return null;

  const gidMatch = value.match(/[#&?]gid=(\d+)/);
  return { spreadsheetId, gid: gidMatch ? Number(gidMatch[1]) : null };
}

export function isValidSpreadsheetId(id: string): boolean {
  return ID_PATTERN.test(id) || isDemoId(id);
}

export function isDemoId(id: string): boolean {
  return /^demo-[a-z]+$/.test(id);
}
