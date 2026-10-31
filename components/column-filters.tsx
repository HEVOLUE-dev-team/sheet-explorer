"use client";

// Filtres par colonne : un bouton « Filtrer » pour en ajouter, des pastilles pour les modifier.

import { ListFilter, X } from "lucide-react";
import { useState } from "react";

import { Rubric } from "@/components/rubric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  describeFilter,
  isFilterActive,
  OPERATOR_LABELS,
  operatorsFor,
  type ColumnFilter,
  type FilterOperator,
} from "@/lib/filters";
import type { Column } from "@/lib/types";

type Draft = Omit<ColumnFilter, "id">;

const TYPE_LABELS = { text: "texte", number: "nombre", date: "date" } as const;

/** Formulaire d'un filtre : colonne, opérateur, valeur(s). */
function FilterForm({
  columns,
  initial,
  submitLabel,
  onSubmit,
  onRemove,
}: {
  columns: Column[];
  initial: Draft;
  submitLabel: string;
  onSubmit: (draft: Draft) => void;
  onRemove?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const column = columns.find((c) => c.id === draft.columnId) ?? columns[0];
  const operators = operatorsFor(column);

  const changeColumn = (columnId: string) => {
    // Chaque type a son opérateur naturel : « entre » pour les nombres et les dates.
    const next = columns.find((c) => c.id === columnId) ?? columns[0];
    setDraft({ columnId, operator: operatorsFor(next)[0], value: "", min: "", max: "" });
  };

  const inputType = column.type === "date" ? "date" : "text";
  const valid = isFilterActive({ ...draft, id: "" });

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(draft);
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="filter-column">Colonne</Label>
        <Select
          value={column.id}
          onValueChange={(v) => v && changeColumn(v)}
          items={columns.map((c) => ({ value: c.id, label: c.label }))}
        >
          <SelectTrigger id="filter-column" className="w-full">
            <Rubric value={column.rubric} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <Rubric value={c.rubric} />
                {c.label}
                <span className="ml-auto pl-3 text-xs text-muted-foreground">{TYPE_LABELS[c.type]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filter-operator">Condition</Label>
        <Select
          value={draft.operator}
          onValueChange={(v) => v && setDraft((d) => ({ ...d, operator: v as FilterOperator }))}
          items={operators.map((op) => ({ value: op, label: OPERATOR_LABELS[op] }))}
        >
          <SelectTrigger id="filter-operator" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(draft.operator === "contains" || draft.operator === "equals") && (
        <div className="grid gap-1.5">
          <Label htmlFor="filter-value">Valeur</Label>
          <Input
            id="filter-value"
            autoFocus
            value={draft.value ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
            placeholder={draft.operator === "contains" ? "Une partie du texte" : "La valeur exacte"}
          />
        </div>
      )}

      {draft.operator === "range" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="filter-min">{column.type === "date" ? "Du" : "Minimum"}</Label>
            <Input
              id="filter-min"
              type={inputType}
              inputMode={column.type === "number" ? "decimal" : undefined}
              value={draft.min ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="filter-max">{column.type === "date" ? "Au" : "Maximum"}</Label>
            <Input
              id="filter-max"
              type={inputType}
              inputMode={column.type === "number" ? "decimal" : undefined}
              value={draft.max ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
            />
          </div>
          <p className="col-span-2 text-xs text-muted-foreground">Laissez une borne vide pour ne pas la limiter.</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
            Retirer le filtre
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="sm" disabled={!valid}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

/** Bouton « Filtrer » de la barre d'outils. */
export function AddFilterButton({
  columns,
  onAdd,
}: {
  columns: Column[];
  onAdd: (draft: Draft) => void;
}) {
  const [open, setOpen] = useState(false);
  const first = columns[0];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" />} disabled={!first}>
        <ListFilter data-icon="inline-start" />
        <span className="sr-only sm:not-sr-only">Filtrer</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        {first && open && (
          <FilterForm
            columns={columns}
            initial={{ columnId: first.id, operator: operatorsFor(first)[0], value: "", min: "", max: "" }}
            submitLabel="Ajouter le filtre"
            onSubmit={(draft) => {
              onAdd(draft);
              setOpen(false);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Pastille d'un filtre actif : clic pour modifier, croix pour retirer. */
export function FilterChip({
  filter,
  columns,
  onChange,
  onRemove,
}: {
  filter: ColumnFilter;
  columns: Column[];
  onChange: (patch: Partial<ColumnFilter>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const column = columns.find((c) => c.id === filter.columnId);
  return (
    <span className="inline-flex h-7 items-stretch overflow-hidden rounded-sm border border-primary/40 bg-background text-xs">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<button type="button" />}
          className="flex items-center gap-1.5 pr-1 pl-1.5 outline-none hover:bg-accent focus-visible:bg-accent"
        >
          {column && <Rubric value={column.rubric} />}
          <span className="max-w-64 truncate">{describeFilter(filter, column)}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-3">
          {open && (
            <FilterForm
              columns={columns}
              initial={filter}
              submitLabel="Appliquer"
              onSubmit={(draft) => {
                onChange(draft);
                setOpen(false);
              }}
              onRemove={onRemove}
            />
          )}
        </PopoverContent>
      </Popover>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer le filtre ${describeFilter(filter, column)}`}
        className="grid w-6 place-items-center border-l border-primary/25 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}
