"use client";

// Vue principale d'une base ou d'un croisement : en-tête, barre d'outils, tableau, pied de page,
// fiche détail. Même vue pour les deux : un croisement se filtre comme une base.

import { ChevronLeft, ChevronRight, Download, GitMerge, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AddFilterButton, FilterChip } from "@/components/column-filters";
import { ColumnVisibility } from "@/components/column-visibility";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
import { RowDetail, type JoinContext } from "@/components/row-detail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PAGE_SIZES, useDataTable } from "@/hooks/use-data-table";
import { useFilters } from "@/hooks/use-filters";
import { useMediaQuery } from "@/hooks/use-media-query";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { recordTitle } from "@/lib/record";
import type { Dataset } from "@/lib/types";

const nf = new Intl.NumberFormat("fr-FR");

interface DataViewProps {
  title: string;
  /** Ligne d'information sous le titre. */
  meta: ReactNode;
  status: "loading" | "ready" | "error";
  dataset: Dataset | null;
  error?: string | null;
  onReload: () => void;
  /** Ouvre le croisement en partant de cette base. */
  onJoin?: () => void;
  /** Bloc supplémentaire sous l'en-tête (correspondance d'un croisement). */
  summary?: ReactNode;
  /** Actions supplémentaires à droite du titre. */
  actions?: ReactNode;
  join?: JoinContext;
}

export function DataView({ title, meta, status, dataset, error, onReload, onJoin, summary, actions, join }: DataViewProps) {
  const filters = useFilters(dataset);
  const { table, sorting, pagination } = useDataTable(dataset, filters.indices);
  const [selected, setSelected] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const docked = useMediaQuery("(min-width: 1280px)");
  const wide = useMediaQuery("(min-width: 640px)");

  const columns = useMemo(() => dataset?.columns ?? [], [dataset]);
  const total = dataset?.rows.length ?? 0;
  const count = filters.indices.length;

  // Ordre affiché (après tri) : sert à « précédente / suivante » dans la fiche.
  const ordered = table.getSortedRowModel().rows;
  const position = selected === null ? -1 : ordered.findIndex((r) => r.original.i === selected);
  const pageRows = table.getRowModel().rows;

  const move = (delta: number) => {
    const next = ordered[position + delta];
    if (!next) return;
    setSelected(next.original.i);
    // La page suit la fiche.
    const page = Math.floor((position + delta) / pagination.pageSize);
    if (page !== pagination.pageIndex) table.setPageIndex(page);
  };

  // Raccourcis : « / » pour chercher, ↑ ↓ pour parcourir les fiches, Échap pour fermer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable=true], [role=dialog]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (selected !== null && !typing && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        if (target.closest("tr")) return; // le tableau gère son propre focus
        e.preventDefault();
        move(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Escape" && selected !== null && !typing) {
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const exportCsv = () => {
    if (!dataset) return;
    const visible = table.getVisibleLeafColumns().map((c) => c.columnDef.meta!.column);
    const rows = ordered.map((r) => visible.map((c) => dataset.rows[r.original.i][c.index]));
    downloadCsv(csvFilename(title), toCsv(visible.map((c) => c.label), rows));
    toast.success(`${nf.format(rows.length)} ligne${rows.length > 1 ? "s" : ""} exportée${rows.length > 1 ? "s" : ""}`, {
      description: `${visible.length} colonne${visible.length > 1 ? "s" : ""} visibles, dans l'ordre du tableau.`,
    });
  };

  // Mots-repères : première et dernière entrée de la page, dans la colonne triée ou, sans tri,
  // par le nom de la personne (« Dubois → Roux »).
  const sortColumn = sorting[0] ? columns.find((c) => c.id === sorting[0].id) : undefined;
  const guide =
    pageRows.length > 1 && dataset
      ? [pageRows[0], pageRows[pageRows.length - 1]].map((r) => {
          const row = dataset.rows[r.original.i];
          return sortColumn ? row[sortColumn.index] || "vide" : recordTitle(columns, row);
        })
      : null;
  const from = count === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const to = Math.min(count, (pagination.pageIndex + 1) * pagination.pageSize);
  const pageCount = Math.max(1, table.getPageCount());

  const detail =
    dataset && selected !== null && position >= 0 ? (
      <RowDetail
        dataset={dataset}
        rowIndex={selected}
        sheetRow={join ? null : selected + 2}
        position={{ current: position + 1, total: ordered.length }}
        onPrev={() => move(-1)}
        onNext={() => move(1)}
        onClose={() => setSelected(null)}
        join={join}
      />
    ) : null;

  return (
    <div className="flex h-svh min-w-0 flex-none overflow-hidden">
      <section className="flex min-w-0 flex-1 flex-col">
        {/* En-tête */}
        <header className="flex items-start gap-3 border-b px-4 pt-4 pb-3 md:px-6">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-[28px] leading-tight tracking-[-0.01em]">{title}</h1>
            <div className="mt-0.5 text-[13px] text-muted-foreground">{meta}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {actions}
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="ghost" size="icon" onClick={onReload} aria-label="Actualiser depuis Google Sheets" />}
              >
                <RefreshCw className={status === "loading" ? "animate-spin" : undefined} />
              </TooltipTrigger>
              <TooltipContent>Actualiser depuis Google Sheets</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {summary}

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-2 border-b bg-band px-4 py-2.5 md:px-6">
          {/* Sous 640 px : recherche sur toute la largeur, puis une seule rangée de boutons. */}
          <InputGroup className="h-8 w-full bg-background sm:w-auto sm:min-w-48 sm:flex-1 sm:basis-64 dark:bg-background">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              ref={searchRef}
              value={filters.query}
              onChange={(e) => filters.setQuery(e.target.value)}
              placeholder={wide ? "Rechercher un nom, un e-mail, un téléphone…" : "Nom, e-mail, téléphone…"}
              aria-label="Rechercher dans toutes les colonnes"
              disabled={!dataset}
            />
            <InputGroupAddon align="inline-end">
              {filters.query ? (
                <InputGroupButton size="icon-xs" aria-label="Effacer la recherche" onClick={() => filters.setQuery("")}>
                  <X />
                </InputGroupButton>
              ) : (
                <kbd className="hidden border border-rule px-1.5 font-sans text-[11px] text-muted-foreground sm:inline">/</kbd>
              )}
            </InputGroupAddon>
          </InputGroup>
          <div className="flex flex-wrap items-center gap-2">
            <AddFilterButton columns={columns} onAdd={filters.addFilter} />
            {dataset && <ColumnVisibility table={table} />}
            {onJoin && (
              <Button variant="outline" onClick={onJoin} disabled={!dataset}>
                <GitMerge data-icon="inline-start" />
                <span className="sr-only sm:not-sr-only">Croiser</span>
              </Button>
            )}
            <Button variant="outline" onClick={exportCsv} disabled={!dataset || count === 0}>
              <Download data-icon="inline-start" />
              <span className="sr-only sm:not-sr-only">Exporter CSV</span>
            </Button>
          </div>
        </div>

        {filters.filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-2 md:px-6">
            {filters.filters.map((f) => (
              <FilterChip
                key={f.id}
                filter={f}
                columns={columns}
                onChange={(patch) => filters.updateFilter(f.id, patch)}
                onRemove={() => filters.removeFilter(f.id)}
              />
            ))}
            <Button variant="ghost" size="sm" onClick={filters.clearAll} className="text-muted-foreground">
              Tout effacer
            </Button>
          </div>
        )}

        {/* Tableau */}
        <div className="min-h-0 flex-1">
          {status === "error" ? (
            <div className="p-6">
              <Alert variant="destructive" className="max-w-2xl">
                <AlertTitle>Lecture impossible</AlertTitle>
                <AlertDescription>
                  <p>{error}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={onReload}>
                    Réessayer
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : !dataset ? (
            <DataTableSkeleton />
          ) : total === 0 ? (
            <EmptyMessage title="Cet onglet ne contient que la ligne d'en-têtes.">
              Ajoutez des lignes dans le Sheet, puis actualisez.
            </EmptyMessage>
          ) : count === 0 ? (
            <EmptyMessage title="Aucune ligne ne correspond.">
              {filters.query && <>La recherche « {filters.query} » ne donne rien avec ces filtres. </>}
              <Button variant="link" className="h-auto p-0" onClick={filters.clearAll}>
                Effacer la recherche et les filtres
              </Button>
            </EmptyMessage>
          ) : (
            <DataTable table={table} selected={selected} onSelect={setSelected} />
          )}
        </div>

        {/* Pied : compteur, mots-repères, pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t px-4 py-2 text-[13px] md:flex-nowrap md:px-6">
          {dataset ? (
            <p className="min-w-0 truncate text-muted-foreground tabular-nums" aria-live="polite">
              <strong className="font-semibold text-foreground">
                {nf.format(count)} résultat{count > 1 ? "s" : ""}
              </strong>{" "}
              sur {nf.format(total)}
              {count > 0 && (
                <span className="hidden sm:inline">
                  {" · "}lignes {nf.format(from)}–{nf.format(to)}
                </span>
              )}
              {guide && (
                <span className="hidden md:inline">
                  {" · "}
                  <span className="text-foreground">{guide[0]}</span> → <span className="text-foreground">{guide[1]}</span>
                </span>
              )}
            </p>
          ) : (
            <Skeleton className="h-4 w-40" />
          )}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="hidden text-muted-foreground 2xl:inline">Lignes par page</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(v) => v && table.setPageSize(Number(v))}
                items={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
              >
                <SelectTrigger size="sm" aria-label="Lignes par page" className="w-18">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-muted-foreground tabular-nums">
              Page {pagination.pageIndex + 1} sur {pageCount}
            </span>
            <div className="flex">
              <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Page précédente" className="rounded-r-none">
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Page suivante" className="-ml-px rounded-l-none">
                <ChevronRight />
              </Button>
            </div>
          </div>
        </footer>
      </section>

      {/* Fiche détail : panneau fixe sur grand écran, tiroir ailleurs. */}
      {docked ? (
        detail && <aside className="h-svh w-[380px] shrink-0 border-l bg-background">{detail}</aside>
      ) : (
        <Sheet open={detail !== null} onOpenChange={(open) => !open && setSelected(null)}>
          <SheetContent side="right" showCloseButton={false} className="w-full gap-0 p-0 sm:max-w-md">
            <SheetTitle className="sr-only">Fiche détail</SheetTitle>
            <SheetDescription className="sr-only">Tous les champs de la ligne sélectionnée.</SheetDescription>
            {detail}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

function EmptyMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
