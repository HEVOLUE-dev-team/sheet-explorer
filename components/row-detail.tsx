"use client";

// Fiche d'une ligne : tous les champs en cases numérotées, comme un formulaire rempli.
// Pour un croisement, les champs sont regroupés par base et la clé comparée est mise en évidence.

import { ChevronDown, ChevronUp, Copy, X } from "lucide-react";
import { toast } from "sonner";

import { Rubric } from "@/components/rubric";
import { Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { MATCH_MISSING } from "@/lib/join";
import { recordTitle, valueHref } from "@/lib/record";
import type { Column, Dataset } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface JoinContext {
  nameA: string;
  nameB: string;
  /** Identifiants des colonnes clés dans le résultat (« a5 », « b0 »). */
  keyIds: string[];
}

interface RowDetailProps {
  dataset: Dataset;
  rowIndex: number;
  /** Numéro de ligne dans le Sheet d'origine (null pour un croisement). */
  sheetRow: number | null;
  position: { current: number; total: number };
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  join?: JoinContext;
}

export function RowDetail({ dataset, rowIndex, sheetRow, position, onPrev, onNext, onClose, join }: RowDetailProps) {
  const row = dataset.rows[rowIndex];
  const title = recordTitle(dataset.columns, row);
  const status = dataset.columns.find((c) => c.id === "match");

  const groups: { title: string | null; side: "a" | "b" | null; columns: Column[] }[] = join
    ? [
        { title: `Base A · ${join.nameA}`, side: "a" as const, columns: dataset.columns.filter((c) => c.id.startsWith("a")) },
        { title: `Base B · ${join.nameB}`, side: "b" as const, columns: dataset.columns.filter((c) => c.id.startsWith("b")) },
      ].filter((g) => g.columns.length > 0)
    : [{ title: null, side: null, columns: dataset.columns }];

  const keyValue = join ? row[dataset.columns.find((c) => c.id === "key")?.index ?? 0] : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start gap-2 border-b px-5 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-[22px] leading-tight">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {sheetRow !== null ? `Ligne ${sheetRow} du Sheet · ` : ""}
            {position.current} sur {position.total} résultats
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" onClick={onPrev} disabled={position.current <= 1} aria-label="Fiche précédente (↑)">
            <ChevronUp />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onNext} disabled={position.current >= position.total} aria-label="Fiche suivante (↓)">
            <ChevronDown />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fermer la fiche (Échap)">
            <X />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {join && (
          <div className="flex flex-wrap items-center gap-2">
            {status && <Stamp value={row[status.index]} large />}
            {keyValue && (
              <span className="text-xs text-muted-foreground">
                Clé comparée <span className="font-mono text-foreground">{keyValue}</span>
              </span>
            )}
          </div>
        )}

        {groups.map((group) => (
          <section key={group.title ?? "fields"} aria-label={group.title ?? "Champs"}>
            {group.title && (
              <h3
                className={cn(
                  "mb-0 bg-band px-2 py-1 text-[11px] font-semibold tracking-wider uppercase",
                  group.side === "b" ? "text-source-b" : "text-band-foreground",
                )}
              >
                {group.title}
              </h3>
            )}
            {group.side === "b" && status && row[status.index] === MATCH_MISSING ? (
              <p className="border border-rule px-3 py-3 text-sm text-muted-foreground">
                Aucune ligne de {join?.nameB} ne correspond à cette clé.
              </p>
            ) : (
            <dl className="grid grid-cols-2 border-t border-l border-rule">
              {layoutFields(group.columns, row).map(({ column, wide }) => {
                const value = row[column.index] ?? "";
                const isKey = join?.keyIds.includes(column.id);
                const label = join ? column.label.replace(/^[AB]\./, "") : column.label;
                const href = valueHref(value);
                return (
                  <div
                    key={column.id}
                    className={cn(
                      "group/field relative min-h-13 border-r border-b border-rule px-2.5 pt-1.5 pb-2",
                      wide && "col-span-2",
                      isKey && "bg-success/8 outline-2 -outline-offset-2 outline-success",
                    )}
                  >
                    <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Rubric value={column.rubric} />
                      <span className="truncate">{label}</span>
                      {isKey && <span className="font-semibold text-success">clé</span>}
                    </dt>
                    <dd className="mt-1 text-sm break-words">
                      {value.trim() === "" ? (
                        <span className="text-muted-foreground">vide</span>
                      ) : href ? (
                        <a href={href} className="text-primary underline decoration-primary/30 hover:decoration-primary">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                    {value.trim() !== "" && (
                      <button
                        type="button"
                        aria-label={`Copier ${label}`}
                        onClick={() => {
                          navigator.clipboard?.writeText(value).then(
                            () => toast.success(`${label} copié`),
                            () => toast.error("Copie impossible dans ce navigateur."),
                          );
                        }}
                        className="absolute top-1 right-1 grid size-6 place-items-center rounded-sm text-muted-foreground opacity-0 outline-none group-hover/field:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </dl>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * Range les cases deux par deux, sans trou : une valeur longue prend toute la largeur,
 * deux cases courtes se partagent une ligne, et une case courte restée seule s'élargit.
 * L'ordre des rubriques est toujours conservé.
 */
function layoutFields(columns: Column[], row: string[]): { column: Column; wide: boolean }[] {
  const out: { column: Column; wide: boolean }[] = [];
  let pending: Column | null = null;
  for (const column of columns) {
    if ((row[column.index] ?? "").length > 22) {
      // Une case courte en attente s'élargit plutôt que de passer après : l'ordre 06, 07, 08 tient.
      if (pending) out.push({ column: pending, wide: true });
      pending = null;
      out.push({ column, wide: true });
    } else if (pending) {
      out.push({ column: pending, wide: false }, { column, wide: false });
      pending = null;
    } else {
      pending = column;
    }
  }
  if (pending) out.push({ column: pending, wide: true });
  return out;
}
