import type { Metadata } from "next";

import { Explorer } from "@/components/explorer";
import { whatsappUrl } from "@/lib/whatsapp";

// Outil personnel (bases gardées dans le navigateur) : rien à indexer.
export const metadata: Metadata = {
  title: "Back office",
  robots: { index: false, follow: false },
  alternates: { canonical: "/app" },
};

// Le back office : bases, tableau, fiches et croisements.
export default function BackOffice() {
  return <Explorer whatsappUrl={whatsappUrl()} />;
}
