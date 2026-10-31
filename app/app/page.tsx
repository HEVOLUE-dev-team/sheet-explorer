import type { Metadata } from "next";

import { Explorer } from "@/components/explorer";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Back office · Sheet Explorer",
};

// Le back office : bases, tableau, fiches et croisements.
export default function BackOffice() {
  return <Explorer whatsappUrl={whatsappUrl()} />;
}
