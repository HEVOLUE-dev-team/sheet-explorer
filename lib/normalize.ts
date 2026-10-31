// Normalisation des valeurs : recherche insensible aux accents et clés de jointure.

/** Minuscules, sans accents, espaces de bord retirés. « Élodie » → « elodie ». */
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Ne garde que les chiffres. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Nombre de chiffres comparés pour un téléphone (ignore l'indicatif et le 0 initial). */
export const PHONE_DIGITS = 9;

/** Une valeur ressemble à un téléphone : 9 à 15 chiffres et seulement des séparateurs usuels. */
export function looksLikePhone(value: string): boolean {
  const v = value.trim();
  if (!/^[+\d][\d\s.\-()/]*$/.test(v)) return false;
  const n = digitsOnly(v).length;
  return n >= PHONE_DIGITS && n <= 15;
}

/** Clé de téléphone : les 9 derniers chiffres. « +33 6 39 98 12 34 » et « 06.39.98.12.34 » → « 639981234 ». */
export function phoneKey(value: string): string {
  const digits = digitsOnly(value);
  return digits.length >= PHONE_DIGITS ? digits.slice(-PHONE_DIGITS) : "";
}

/** Clé texte : minuscules, sans accents, sans espaces, points ni tirets. */
export function textKey(value: string): string {
  return foldText(value).replace(/[\s.\-]+/g, "");
}

/**
 * Une colonne est « téléphonique » si au moins 80 % de ses valeurs non vides ressemblent à un
 * téléphone. On regarde un échantillon pour rester rapide sur 20 000 lignes.
 */
export function isPhoneColumn(values: string[], sampleSize = 400): boolean {
  let seen = 0;
  let phones = 0;
  for (const value of values) {
    if (!value || !value.trim()) continue;
    seen++;
    if (looksLikePhone(value)) phones++;
    if (seen >= sampleSize) break;
  }
  return seen > 0 && phones / seen >= 0.8;
}

/**
 * Texte de recherche d'une ligne : toutes les cellules repliées, plus les chiffres seuls des
 * cellules téléphoniques, pour qu'une recherche « 0639981234 » trouve « 06 39 98 12 34 ».
 */
export function buildSearchText(cells: string[]): string {
  const parts: string[] = [];
  for (const cell of cells) {
    if (!cell) continue;
    parts.push(foldText(cell));
    if (looksLikePhone(cell)) parts.push(digitsOnly(cell));
  }
  return parts.join("\u0001");
}

/**
 * Découpe la saisie de recherche en morceaux à trouver tous (ET).
 * Un morceau d'au moins 9 chiffres est réduit à ses 9 derniers chiffres (« +33639981234 »).
 */
export function searchTokens(query: string): string[] {
  return foldText(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const digits = digitsOnly(token);
      if (/^[+\d][\d.\-()/]*$/.test(token) && digits.length >= PHONE_DIGITS) {
        return digits.slice(-PHONE_DIGITS);
      }
      return token;
    });
}
