import type { MetadataRoute } from "next";

import { LAST_UPDATED, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
      images: [`${SITE_URL}/opengraph-image.png`, `${SITE_URL}/landing/demo-poster.jpg`],
      videos: [
        {
          title: "Sheet Explorer : connecter un Google Sheet, chercher, croiser",
          thumbnail_loc: `${SITE_URL}/landing/demo-poster.jpg`,
          description:
            "Tutoriel en 8 étapes : partager le Sheet, copier le lien, le coller, chercher une personne, ouvrir sa fiche et croiser deux bases.",
          content_loc: `${SITE_URL}/landing/demo.mp4`,
          duration: 45,
          publication_date: LAST_UPDATED,
        },
      ],
    },
  ];
}
