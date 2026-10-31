// Types partagés par toute l'application.
// Rien n'est connu à l'avance des colonnes : tout est décrit à partir de la première ligne du Sheet.

/** Type détecté automatiquement pour une colonne. */
export type ColumnType = "text" | "number" | "date";

/** Une colonne découverte dans un Sheet (ou produite par une jointure). */
export interface Column {
  /** Identifiant stable dans le jeu de données : "c0", "c1"… (ou "a0", "b3" pour une jointure). */
  id: string;
  /** Libellé affiché : l'en-tête du Sheet, dédoublonné si nécessaire. */
  label: string;
  /** Numéro de rubrique affiché à côté du libellé : "01", "02"… ou "A·06" / "B·01". */
  rubric: string;
  /** Position de la valeur dans chaque ligne. */
  index: number;
  type: ColumnType;
}

/** Un tableau de données prêt à afficher. Les lignes sont des tableaux de chaînes. */
export interface Dataset {
  columns: Column[];
  rows: string[][];
}

/** Une base connectée, sauvegardée en localStorage. */
export interface SheetSource {
  id: string;
  name: string;
  spreadsheetId: string;
  sheetTitle: string;
  createdAt: number;
}

export type JoinType = "inner" | "left" | "anti";

/** Façon de comparer les clés d'une jointure. */
export type KeyMode = "auto" | "phone" | "text";

/** Un croisement de deux bases, sauvegardé en localStorage. */
export interface JoinConfig {
  id: string;
  name: string;
  sourceA: string;
  sourceB: string;
  /** Libellés des colonnes clés (plus robustes qu'un index si le Sheet bouge). */
  keyA: string;
  keyB: string;
  type: JoinType;
  mode: KeyMode;
  createdAt: number;
}

/** Ce qui est affiché dans la vue principale. */
export type Selection = { kind: "source"; id: string } | { kind: "join"; id: string } | null;

/** Codes d'erreur renvoyés par /api/sheets. */
export type SheetsErrorCode =
  | "INVALID_ID"
  | "MISSING_KEY"
  | "INVALID_KEY"
  | "NOT_SHARED"
  | "NOT_FOUND"
  | "TAB_NOT_FOUND"
  | "EMPTY_TAB"
  | "QUOTA"
  | "NETWORK"
  | "UNKNOWN";

export interface SheetTab {
  sheetId: number;
  title: string;
}

export interface SpreadsheetInfo {
  title: string;
  tabs: SheetTab[];
}
