"use client";

// Recherche globale + filtres par colonne. Le calcul est mémoïsé et la recherche différée,
// pour que la frappe reste fluide sur ~20 000 lignes.

import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { filterRows, isFilterActive, type ColumnFilter } from "@/lib/filters";
import type { Dataset } from "@/lib/types";

let filterSeq = 0;

export function useFilters(dataset: Dataset | null) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ColumnFilter[]>([]);

  // React met à jour le champ tout de suite et recalcule le tableau juste après.
  const deferredQuery = useDeferredValue(query);

  const activeFilters = useMemo(() => filters.filter(isFilterActive), [filters]);

  const indices = useMemo(
    () => (dataset ? filterRows(dataset, deferredQuery, activeFilters) : []),
    [dataset, deferredQuery, activeFilters],
  );

  const addFilter = useCallback((filter: Omit<ColumnFilter, "id">) => {
    const created = { ...filter, id: `f${++filterSeq}` };
    setFilters((list) => [...list, created]);
    return created;
  }, []);

  const updateFilter = useCallback((id: string, patch: Partial<ColumnFilter>) => {
    setFilters((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters((list) => list.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFilters([]);
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    filters,
    activeFilters,
    addFilter,
    updateFilter,
    removeFilter,
    clearAll,
    /** Index (dans dataset.rows) des lignes retenues, dans l'ordre du Sheet. */
    indices,
    /** Vrai pendant qu'une frappe récente n'est pas encore appliquée. */
    isPending: query !== deferredQuery,
    isFiltering: Boolean(query.trim()) || activeFilters.length > 0,
  };
}
