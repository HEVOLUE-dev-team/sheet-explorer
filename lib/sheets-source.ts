// Abstraction de la source de données Google Sheets (côté serveur uniquement).
//
// v1 : ApiKeySource lit les Sheets partagés « Toute personne disposant du lien » avec une clé
// d'API (GOOGLE_SHEETS_API_KEY). Pour ajouter plus tard un compte de service, il suffit d'écrire
// une classe ServiceAccountSource qui implémente SheetsSource (même interface, mais un en-tête
// « Authorization: Bearer <jeton OAuth> » au lieu du paramètre « key ») et de la retourner depuis
// getSheetsSource() quand les variables du compte de service sont présentes.
//
// DemoCsvSource sert les CSV de /sample-data sous les ID « demo-… », pour essayer l'application
// sans clé. Elle n'est active qu'en développement ou avec SHEETS_DEMO_MODE=true.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { parseCsv } from "./csv";
import { isDemoId } from "./sheet-url";
import type { SheetsErrorCode, SpreadsheetInfo } from "./types";

export interface SheetsSource {
  /** Titre du classeur et liste de ses onglets. */
  getSpreadsheet(spreadsheetId: string): Promise<SpreadsheetInfo>;
  /** Toutes les valeurs d'un onglet, ligne par ligne (la première ligne = les en-têtes). */
  getValues(spreadsheetId: string, sheetTitle: string): Promise<string[][]>;
}

/** Erreur métier avec un message en français prêt à afficher. */
export class SheetsError extends Error {
  constructor(
    public code: SheetsErrorCode,
    message: string,
    public httpStatus = 400,
  ) {
    super(message);
    this.name = "SheetsError";
  }
}

// --- Clé d'API (v1) ------------------------------------------------------------------

const API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

interface GoogleErrorBody {
  error?: { code?: number; message?: string; status?: string; details?: { reason?: string }[] };
}

export class ApiKeySource implements SheetsSource {
  constructor(private apiKey: string) {}

  async getSpreadsheet(spreadsheetId: string): Promise<SpreadsheetInfo> {
    const fields = "properties.title,sheets.properties(sheetId,title)";
    const data = await this.request<{
      properties?: { title?: string };
      sheets?: { properties: { sheetId: number; title: string } }[];
    }>(`${API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=${encodeURIComponent(fields)}`);

    return {
      title: data.properties?.title ?? "",
      tabs: (data.sheets ?? []).map((s) => ({ sheetId: s.properties.sheetId, title: s.properties.title })),
    };
  }

  async getValues(spreadsheetId: string, sheetTitle: string): Promise<string[][]> {
    // Le nom d'onglet est cité ('Feuille 1') pour supporter espaces et caractères spéciaux.
    const range = `'${sheetTitle.replace(/'/g, "''")}'`;
    const data = await this.request<{ values?: string[][] }>(
      `${API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
    );
    return data.values ?? [];
  }

  private async request<T>(url: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${url}&key=${encodeURIComponent(this.apiKey)}`, { cache: "no-store" });
    } catch {
      throw new SheetsError("NETWORK", "Impossible de joindre Google Sheets. Vérifiez la connexion du serveur.", 502);
    }
    if (response.ok) return (await response.json()) as T;

    const body = (await response.json().catch(() => ({}))) as GoogleErrorBody;
    throw toSheetsError(response.status, body);
  }
}

/** Traduit une erreur de l'API Google en message compréhensible. */
function toSheetsError(status: number, body: GoogleErrorBody): SheetsError {
  const message = body.error?.message ?? "";
  const reasons = body.error?.details?.map((d) => d.reason) ?? [];

  if (reasons.includes("API_KEY_INVALID") || /API key not valid/i.test(message)) {
    return new SheetsError("INVALID_KEY", "La clé d'API Google est invalide. Vérifiez GOOGLE_SHEETS_API_KEY dans .env.local.", 500);
  }
  if (reasons.includes("SERVICE_DISABLED") || /has not been used|is disabled/i.test(message)) {
    return new SheetsError("INVALID_KEY", "L'API Google Sheets n'est pas activée pour ce projet Google Cloud. Activez-la dans la console, puis réessayez.", 500);
  }
  if (/Unable to parse range/i.test(message)) {
    return new SheetsError("TAB_NOT_FOUND", "Cet onglet n'existe plus dans le fichier. Il a peut-être été renommé.", 404);
  }
  if (status === 403) {
    return new SheetsError("NOT_SHARED", "Ce fichier n'est pas partagé. Dans Google Sheets : Partager → Accès général → « Tous les utilisateurs disposant du lien ».", 403);
  }
  if (status === 404) {
    return new SheetsError("NOT_FOUND", "Aucun Google Sheet ne correspond à ce lien. Vérifiez qu'il est complet.", 404);
  }
  if (status === 429) {
    return new SheetsError("QUOTA", "Trop de requêtes vers Google Sheets. Patientez une minute puis réessayez.", 429);
  }
  return new SheetsError("UNKNOWN", `Google Sheets a répondu par une erreur (${status}). ${message}`.trim(), 502);
}

// --- Démonstration (CSV locaux) --------------------------------------------------------

const DEMO_FILES: Record<string, { file: string; title: string }> = {
  "demo-recovery": { file: "recovery.csv", title: "Recouvrement (démo)" },
  "demo-clients": { file: "clients.csv", title: "Clients (démo)" },
  "demo-residents": { file: "residents.csv", title: "Résidents (démo)" },
  "demo-suivi": { file: "suivi.csv", title: "Suivi relances (démo)" },
};

export function isDemoEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.SHEETS_DEMO_MODE === "true";
}

export class DemoCsvSource implements SheetsSource {
  async getSpreadsheet(spreadsheetId: string): Promise<SpreadsheetInfo> {
    const demo = this.find(spreadsheetId);
    return { title: demo.title, tabs: [{ sheetId: 0, title: demo.file.replace(".csv", "") }] };
  }

  async getValues(spreadsheetId: string): Promise<string[][]> {
    const demo = this.find(spreadsheetId);
    const text = await readFile(join(process.cwd(), "sample-data", demo.file), "utf8");
    return parseCsv(text);
  }

  private find(spreadsheetId: string) {
    const demo = DEMO_FILES[spreadsheetId];
    if (!demo) throw new SheetsError("NOT_FOUND", "Cette base de démonstration n'existe pas.", 404);
    return demo;
  }
}

// --- Choix de la source ---------------------------------------------------------------

export function getSheetsSource(spreadsheetId: string): SheetsSource {
  if (isDemoId(spreadsheetId)) {
    if (!isDemoEnabled()) {
      throw new SheetsError("NOT_FOUND", "Les bases de démonstration sont désactivées sur ce serveur.", 404);
    }
    return new DemoCsvSource();
  }

  // Emplacement prévu pour un compte de service :
  // if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) return new ServiceAccountSource(...);

  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey) {
    throw new SheetsError(
      "MISSING_KEY",
      "Aucune clé d'API n'est configurée. Ajoutez GOOGLE_SHEETS_API_KEY (.env.local en local, variables d'environnement en production) puis redémarrez le serveur.",
      500,
    );
  }
  return new ApiKeySource(apiKey);
}
