"use client";

// Le tableau : en-têtes numérotés et triables, lignes cliquables qui ouvrent la fiche.

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Rubric } from "@/components/rubric";
import { Stamp } from "@/components/stamp";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DataTableInstance } from "@/hooks/use-data-table";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface DataTableProps {
  table: DataTableInstance;
  selected: number | null;
  onSelect: (rowIndex: number) => void;
}

/** Largeur fixe des colonnes épinglées (en rem), pour calculer leur décalage à gauche. */
const PINNED_WIDTH_REM = { match: 11.5, identity: 9.5 };

export function DataTable({ table, selected, onSelect }: DataTableProps) {
  const rows = table.getRowModel().rows;
  // Sur petit écran, les colonnes d'identité passent en tête sans être épinglées (trop larges).
  const canPin = useMediaQuery("(min-width: 768px)");

  // Position des colonnes épinglées : décalage cumulé et dernière colonne (filet à droite).
  const pinned = new Map<string, { left: number; width: number; last: boolean }>();
  if (canPin) {
    let left = 0;
    for (const column of table.getVisibleLeafColumns()) {
      if (!column.columnDef.meta!.pinned) break;
      const width = column.id === "match" ? PINNED_WIDTH_REM.match : PINNED_WIDTH_REM.identity;
      pinned.set(column.id, { left, width, last: false });
      left += width;
    }
    const lastId = [...pinned.keys()].pop();
    if (lastId) pinned.get(lastId)!.last = true;
  }
  const pinStyle = (id: string): CSSProperties | undefined => {
    const p = pinned.get(id);
    return p ? { left: `${p.left}rem`, width: `${p.width}rem`, minWidth: `${p.width}rem`, maxWidth: `${p.width}rem` } : undefined;
  };

  // Fondu sur le bord droit tant qu'il reste des colonnes à faire défiler : une valeur coupée
  // ne doit jamais passer pour une valeur entière.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [moreRight, setMoreRight] = useState(false);
  useEffect(() => {
    const scroller = wrapperRef.current?.querySelector<HTMLElement>("[data-slot=table-container]");
    if (!scroller) return;
    const update = () => setMoreRight(scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 2);
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "h-full",
        moreRight && "[mask-image:linear-gradient(to_left,transparent,#000_2rem)]",
      )}
    >
      <Table containerClassName="h-full overflow-auto overscroll-contain" className="border-separate border-spacing-0">
        <TableHeader className="sticky top-0 z-20 bg-background [&_tr]:border-0">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const column = header.column.columnDef.meta!.column;
                const sorted = header.column.getIsSorted();
                const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;
                const pin = pinned.get(column.id);
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                    style={pinStyle(column.id)}
                    className={cn(
                      "h-10 border-b border-foreground/80 bg-background p-0 first:pl-2 last:pr-4",
                      column.type === "number" && "text-right",
                      pin && "sticky z-30",
                      pin?.last && "border-r border-r-rule",
                    )}
                  >
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      title={`Trier par ${column.label}`}
                      className={cn(
                        "group/sort flex h-10 w-full items-center gap-1.5 rounded-sm px-2.5 text-[13px] font-semibold whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                        column.type === "number" && "flex-row-reverse",
                      )}
                    >
                      <Rubric value={column.rubric} />
                      <span className="truncate">{column.label}</span>
                      <SortIcon
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0",
                          sorted ? "text-primary" : "text-muted-foreground/0 group-hover/sort:text-muted-foreground",
                        )}
                      />
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isSelected = row.original.i === selected;
            const cells = row.getVisibleCells();
            return (
              <TableRow
                key={row.id}
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() => onSelect(row.original.i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(row.original.i);
                  }
                }}
                className="group/row cursor-pointer border-0 outline-none hover:bg-transparent focus-visible:[&>td:first-child]:shadow-[inset_2px_0_0_var(--ring)]"
              >
                {cells.map((cell, index) => {
                  const meta = cell.column.columnDef.meta!;
                  const column = meta.column;
                  const value = (cell.getValue() as string | undefined) ?? "";
                  const pin = pinned.get(column.id);
                  return (
                    <TableCell
                      key={cell.id}
                      style={pinStyle(column.id)}
                      className={cn(
                        "max-w-80 truncate border-b border-border px-2.5 py-2 text-[13px] first:pl-4.5 last:pr-6",
                        column.type === "number" && "text-right",
                        column.id === "key" && "font-mono text-xs text-muted-foreground",
                        pin && "sticky z-10",
                        pin?.last && "border-r border-r-rule",
                        // Survol neutre, sélection pêche encadrée d'un filet : on ne confond jamais les deux.
                        isSelected
                          ? "bg-selected shadow-[inset_0_1px_0_var(--primary),inset_0_-1px_0_var(--primary)]"
                          : "bg-background group-hover/row:bg-muted group-focus-visible/row:bg-muted",
                        isSelected && index === 0 && "shadow-[inset_1px_0_0_var(--primary),inset_0_1px_0_var(--primary),inset_0_-1px_0_var(--primary)]",
                        isSelected && meta.pinned && column.id !== "match" && "font-semibold",
                      )}
                      title={value.length > 18 ? value : undefined}
                    >
                      {column.id === "match" ? <Stamp value={value} /> : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** Tableau fantôme pendant le chargement : mêmes proportions que le vrai. */
export function DataTableSkeleton({ columns = 8, rows = 12 }: { columns?: number; rows?: number }) {
  return (
    <div className="h-full overflow-hidden px-2" aria-busy aria-label="Chargement des données">
      <div className="flex h-10 items-center gap-4 border-b border-foreground/80 px-2.5">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex h-9 items-center gap-4 border-b border-border px-2.5">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="h-3 flex-1" style={{ maxWidth: `${50 + ((r * 7 + i * 13) % 45)}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
