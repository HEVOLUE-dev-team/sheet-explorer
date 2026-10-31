"use client";

// Modèle TanStack Table (v9) : colonnes découvertes, tri typé, pagination, colonnes visibles.
// Chaque ligne du tableau est une référence { i } vers dataset.rows : aucune copie des données.

import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type PaginationState,
  type ReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { getParsedColumn } from "@/lib/dataset";
import { identityColumns } from "@/lib/record";
import type { Column, Dataset } from "@/lib/types";

export const PAGE_SIZES = [25, 50, 100] as const;

/** Référence vers une ligne du jeu de données. */
export interface RowRef {
  i: number;
}

// Fonctionnalités enregistrées une fois pour toutes (stables, comme l'exige TanStack v9).
const features = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<{ column: Column; pinned: boolean }>(),
});

export type DataTableInstance = ReactTable<typeof features, RowRef>;

const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });

/** Références réutilisées tant que le jeu de données ne change pas. */
const refsCache = new WeakMap<Dataset, RowRef[]>();
function rowRefs(dataset: Dataset): RowRef[] {
  let refs = refsCache.get(dataset);
  if (!refs) {
    refs = dataset.rows.map((_, i) => ({ i }));
    refsCache.set(dataset, refs);
  }
  return refs;
}

export function useDataTable(dataset: Dataset | null, indices: number[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});

  const columns = useMemo<ColumnDef<typeof features, RowRef>[]>(() => {
    if (!dataset) return [];
    // Ordre d'affichage : correspondance (croisement), puis l'identité de la personne, épinglées
    // à gauche ; ensuite les autres colonnes dans l'ordre du Sheet. Les rubriques gardent leur numéro.
    const match = dataset.columns.filter((c) => c.id === "match");
    const identity = identityColumns(dataset.columns.filter((c) => !c.id.startsWith("b")));
    const pinnedIds = new Set([...match, ...identity].map((c) => c.id));
    const ordered = [...match, ...identity, ...dataset.columns.filter((c) => !pinnedIds.has(c.id))];
    return ordered.map((column) => {
      const parsed = column.type === "text" ? null : getParsedColumn(dataset, column);
      return {
        id: column.id,
        header: column.label,
        meta: { column, pinned: pinnedIds.has(column.id) },
        // Une cellule vide vaut « undefined » pour être toujours classée en dernier.
        accessorFn: (ref: RowRef) => dataset.rows[ref.i][column.index] || undefined,
        sortUndefined: "last",
        sortFn: parsed
          ? (a, b) => {
              const x = parsed[a.original.i];
              const y = parsed[b.original.i];
              if (Number.isNaN(x)) return Number.isNaN(y) ? 0 : 1;
              if (Number.isNaN(y)) return -1;
              return x - y;
            }
          : (a, b) =>
              collator.compare(dataset.rows[a.original.i][column.index], dataset.rows[b.original.i][column.index]),
      };
    });
  }, [dataset]);

  const data = useMemo(() => {
    if (!dataset) return [];
    const refs = rowRefs(dataset);
    return indices.map((i) => refs[i]);
  }, [dataset, indices]);

  // Revenir à la première page quand le résultat change (nouvelle recherche, nouveau filtre).
  const [lastData, setLastData] = useState(data);
  if (lastData !== data) {
    setLastData(data);
    if (pagination.pageIndex !== 0) setPagination((p) => ({ ...p, pageIndex: 0 }));
  }

  const table = useTable({
    features,
    data,
    columns,
    state: { sorting, pagination, columnVisibility },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (ref) => String(ref.i),
    autoResetPageIndex: false,
  });

  return { table, sorting, pagination };
}
