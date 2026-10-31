// Le nom de Sheet Explorer en serif, dans la barre de la landing et la sidebar.
// Le monogramme (« S » en cellules) est réservé à l'icône d'onglet (app/icon.svg).

import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("inline-flex items-center font-serif text-xl tracking-tight", className)}>Sheet Explorer</span>;
}
