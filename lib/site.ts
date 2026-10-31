// Informations publiques du site, utilisées par les métadonnées, le sitemap et les données structurées.

/** Adresse publique du site (sans barre finale). Surchargeable par NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sheetexplorer.hevolue.com").replace(/\/$/, "");

export const SITE_NAME = "Sheet Explorer";

export const SITE_TITLE = "Sheet Explorer · Explorez et croisez vos Google Sheets";

export const SITE_DESCRIPTION =
  "Collez le lien d'un Google Sheet et retrouvez un contact en quelques secondes : recherche sans accents, filtres, fiche détaillée, croisement de deux fichiers et export CSV, sans configuration.";

/** Date de la dernière mise à jour éditoriale de la landing (sitemap, données structurées). */
export const LAST_UPDATED = "2026-10-31";
