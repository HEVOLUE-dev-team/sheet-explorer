// Le logo de Sheet Explorer : un « S » dessiné avec des cellules de tableur.
// Même dessin que l'icône d'onglet (app/icon.svg).

import { cn } from "@/lib/utils";

const CELLS = [
  [1, 0], [2, 0], [3, 0],
  [0, 1],
  [1, 2], [2, 2], [3, 2],
  [4, 3],
  [1, 4], [2, 4], [3, 4],
];

export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {CELLS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x * 24 + 2} y={y * 24 + 2} width="20" height="20" rx="3" fill="currentColor" />
      ))}
    </svg>
  );
}

/** Monogramme + nom en serif. */
export function Wordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif text-xl tracking-tight", className)}>
      <Monogram className={cn("size-5", markClassName)} />
      Sheet Explorer
    </span>
  );
}
