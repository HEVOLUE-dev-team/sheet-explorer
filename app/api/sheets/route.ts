// Route serveur de lecture des Google Sheets. La clé d'API ne quitte jamais le serveur.
//
//   GET /api/sheets?id={spreadsheetId}              → { title, tabs: [{ sheetId, title }] }
//   GET /api/sheets?id={spreadsheetId}&tab={onglet} → { values: string[][] }
//   GET /api/sheets?demo                           → { demo: boolean } (bases de démonstration disponibles ?)

import type { NextRequest } from "next/server";

import { getSheetsSource, isDemoEnabled, SheetsError } from "@/lib/sheets-source";
import { isValidSpreadsheetId } from "@/lib/sheet-url";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.has("demo")) return Response.json({ demo: isDemoEnabled() });

  const id = params.get("id")?.trim() ?? "";
  const tab = params.get("tab");

  try {
    if (!isValidSpreadsheetId(id)) {
      throw new SheetsError("INVALID_ID", "Ce lien ne ressemble pas à un lien Google Sheets (…/spreadsheets/d/…).", 400);
    }
    const source = getSheetsSource(id);

    if (tab === null) {
      const info = await source.getSpreadsheet(id);
      if (info.tabs.length === 0) throw new SheetsError("EMPTY_TAB", "Ce fichier ne contient aucun onglet.", 422);
      return Response.json(info);
    }

    const values = await source.getValues(id, tab);
    if (values.length === 0 || values.every((row) => row.every((cell) => !String(cell ?? "").trim()))) {
      throw new SheetsError("EMPTY_TAB", `L'onglet « ${tab} » est vide : la première ligne doit contenir les en-têtes.`, 422);
    }
    return Response.json({ values });
  } catch (error) {
    if (error instanceof SheetsError) {
      return Response.json({ error: { code: error.code, message: error.message } }, { status: error.httpStatus });
    }
    console.error("[api/sheets]", error);
    return Response.json(
      { error: { code: "UNKNOWN", message: "Erreur inattendue pendant la lecture du Sheet." } },
      { status: 500 },
    );
  }
}
