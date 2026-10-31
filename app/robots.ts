import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Seule la landing est publique : le back office et l'API ne sont pas à explorer.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
