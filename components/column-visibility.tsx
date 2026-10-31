"use client";

// Choix des colonnes visibles : une liste filtrable (Command) de cases à cocher.

import { Check, Columns3 } from "lucide-react";

import { Rubric } from "@/components/rubric";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DataTableInstance } from "@/hooks/use-data-table";
import { cn } from "@/lib/utils";

export function ColumnVisibility({ table }: { table: DataTableInstance }) {
  const columns = table.getAllLeafColumns();
  const visible = columns.filter((c) => c.getIsVisible()).length;
  const hidden = columns.length - visible;

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <Columns3 data-icon="inline-start" />
        <span className="sr-only sm:not-sr-only">Colonnes</span>
        {hidden > 0 && (
          <span className="rounded-sm bg-primary px-1 text-[11px] leading-4 text-primary-foreground tabular-nums">
            {visible}/{columns.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Chercher une colonne…" />
          <CommandList className="max-h-80">
            <CommandEmpty>Aucune colonne de ce nom.</CommandEmpty>
            <CommandGroup>
              {columns.map((column) => {
                const meta = column.columnDef.meta!.column;
                const isVisible = column.getIsVisible();
                return (
                  <CommandItem
                    key={column.id}
                    value={`${meta.rubric} ${meta.label}`}
                    onSelect={() => {
                      // On garde toujours au moins une colonne visible.
                      if (isVisible && visible === 1) return;
                      column.toggleVisibility(!isVisible);
                    }}
                  >
                    <span
                      className={cn(
                        "grid size-4 place-items-center rounded-[3px] border",
                        isVisible ? "border-primary bg-primary text-primary-foreground" : "border-rule",
                      )}
                    >
                      {isVisible && <Check className="size-3" />}
                    </span>
                    <Rubric value={meta.rubric} />
                    <span className="truncate">{meta.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {hidden > 0 && (
            <div className="border-t p-1">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => table.resetColumnVisibility()}>
                Tout afficher
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
