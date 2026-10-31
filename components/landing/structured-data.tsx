// Données structurées (JSON-LD) de la landing : l'application, son éditeur et la vidéo tutoriel.
// Aucune note, aucun prix ni chiffre inventé.

import { LAST_UPDATED, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const data = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hevolue.com/#organization",
      name: "Hevolue",
      url: "https://hevolue.com/",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "fr-FR",
      publisher: { "@id": "https://hevolue.com/#organization" },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      browserRequirements: "Navigateur récent avec JavaScript",
      inLanguage: "fr-FR",
      publisher: { "@id": "https://hevolue.com/#organization" },
      featureList: [
        "Connexion à un Google Sheet par son lien",
        "Recherche sans accents ni majuscules",
        "Filtres par colonne, tri et pagination",
        "Fiche détaillée de chaque ligne",
        "Croisement de deux fichiers (téléphones comparés sur 9 chiffres)",
        "Export CSV",
      ],
    },
    {
      "@type": "VideoObject",
      name: "Sheet Explorer : connecter un Google Sheet, chercher, croiser",
      description:
        "Tutoriel en 8 étapes : partager le Sheet, copier le lien, le coller, chercher une personne, ouvrir sa fiche et croiser deux bases.",
      thumbnailUrl: `${SITE_URL}/landing/demo-poster.jpg`,
      contentUrl: `${SITE_URL}/landing/demo.mp4`,
      uploadDate: LAST_UPDATED,
      duration: "PT45S",
      inLanguage: "fr-FR",
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // Échappe « < » pour qu'aucune valeur ne puisse fermer la balise script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
