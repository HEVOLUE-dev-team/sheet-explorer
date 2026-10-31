// Tampon d'état d'un croisement : « Trouvé dans B » (vert) ou « Absent de B » (rouge).
// L'état s'inscrit sur la ligne au lieu de la faire disparaître.

import { MATCH_FOUND } from "@/lib/join";
import { cn } from "@/lib/utils";

export function Stamp({ value, large = false }: { value: string; large?: boolean }) {
  if (!value) return null;
  const found = value === MATCH_FOUND;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border font-semibold tracking-wide whitespace-nowrap uppercase [font-stretch:88%]",
        large ? "-rotate-1 border-2 px-2 py-0.5 text-xs" : "px-1.5 text-[10px] leading-4",
        found ? "border-success text-success" : "border-destructive text-destructive",
      )}
    >
      {value}
    </span>
  );
}
