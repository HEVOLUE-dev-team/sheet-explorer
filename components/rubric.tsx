// Numéro de rubrique encadré (« 01 », « A·06 », « B·01 ») : il identifie une colonne partout
// dans l'interface (en-tête, filtres, fiche, croisement).

import { cn } from "@/lib/utils";

export function Rubric({ value, className }: { value: string; className?: string }) {
  // Les colonnes calculées d'un croisement (correspondance, clé) n'ont pas de rubrique.
  if (!value) return null;
  const side = value.startsWith("B·") ? "b" : value.startsWith("A·") ? "a" : null;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-4 min-w-6 shrink-0 items-center justify-center rounded-[3px] border px-1 font-mono text-[10px] leading-none font-medium tabular-nums",
        side === "b" ? "border-source-b/70 text-source-b" : "border-primary/60 text-primary",
        className,
      )}
    >
      {value}
    </span>
  );
}
