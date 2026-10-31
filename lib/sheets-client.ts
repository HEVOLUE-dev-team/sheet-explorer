// Appels du navigateur vers la route serveur /api/sheets.

import type { SheetsErrorCode, SpreadsheetInfo } from "./types";

/** Erreur renvoyée par /api/sheets, avec un message déjà rédigé pour l'utilisateur. */
export class SheetsClientError extends Error {
  constructor(
    public code: SheetsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SheetsClientError";
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal, cache: "no-store" });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new SheetsClientError("NETWORK", "Le serveur de l'application ne répond pas. Vérifiez votre connexion.");
  }
  const body = (await response.json().catch(() => null)) as
    | (T & { error?: { code: SheetsErrorCode; message: string } })
    | null;
  if (!response.ok || !body || body.error) {
    throw new SheetsClientError(
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `Réponse inattendue du serveur (${response.status}).`,
    );
  }
  return body;
}

export function fetchSpreadsheet(spreadsheetId: string, signal?: AbortSignal) {
  return getJson<SpreadsheetInfo>(`/api/sheets?id=${encodeURIComponent(spreadsheetId)}`, signal);
}

export async function fetchValues(spreadsheetId: string, sheetTitle: string, signal?: AbortSignal) {
  const { values } = await getJson<{ values: string[][] }>(
    `/api/sheets?id=${encodeURIComponent(spreadsheetId)}&tab=${encodeURIComponent(sheetTitle)}`,
    signal,
  );
  return values;
}

export async function fetchDemoAvailable(): Promise<boolean> {
  try {
    const { demo } = await getJson<{ demo: boolean }>("/api/sheets?demo");
    return demo;
  } catch {
    return false;
  }
}
