"use client";

// Les deux contenus possibles de la vue principale : une base, ou un croisement de deux bases.

import { Settings2 } from "lucide-react";

import { DataView } from "@/components/data-view";
import { Rubric } from "@/components/rubric";
import { Button } from "@/components/ui/button";
import { useJoin } from "@/hooks/use-join";
import { useSheetData } from "@/hooks/use-sheet-data";
import { JOIN_LABELS } from "@/lib/join";
import type { JoinConfig, SheetSource } from "@/lib/types";

const nf = new Intl.NumberFormat("fr-FR");
const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function SourceView({ source, onJoin }: { source: SheetSource; onJoin: () => void }) {
  const data = useSheetData(source);
  const columns = data.dataset?.columns.length;
  return (
    <DataView
      title={source.name}
      meta={
        <>
          Onglet « {source.sheetTitle} »
          {columns !== undefined && ` · ${columns} rubrique${columns > 1 ? "s" : ""} découverte${columns > 1 ? "s" : ""}`}
          {data.loadedAt && ` · lu à ${time.format(data.loadedAt)}`}
        </>
      }
      status={data.status === "idle" ? "loading" : data.status}
      dataset={data.dataset}
      error={data.error?.message}
      onReload={data.reload}
      onJoin={onJoin}
    />
  );
}

export function JoinView({ join, sources, onEdit }: { join: JoinConfig; sources: SheetSource[]; onEdit: () => void }) {
  const state = useJoin(join, sources);
  const stats = state.result?.stats;
  const nameA = state.sourceA?.name ?? "A";
  const nameB = state.sourceB?.name ?? "B";

  return (
    <DataView
      title={join.name}
      meta={
        <>
          {JOIN_LABELS[join.type].title} · {JOIN_LABELS[join.type].description}
        </>
      }
      status={state.status}
      dataset={state.result?.dataset ?? null}
      error={state.error}
      onReload={state.reload}
      actions={
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Settings2 data-icon="inline-start" />
          Modifier
        </Button>
      }
      join={
        state.keyA && state.keyB
          ? { nameA, nameB, keyIds: [`a${state.keyA.index}`, `b${state.keyB.index}`] }
          : undefined
      }
      summary={
        state.keyA && state.keyB && stats ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 border-b px-4 py-2.5 text-[13px] md:px-6">
            <p className="flex flex-wrap items-center gap-1.5">
              <Rubric value={`A·${state.keyA.rubric}`} />
              <span>
                <span className="text-muted-foreground">{nameA}.</span>
                <strong className="font-semibold">{state.keyA.label}</strong>
              </span>
              <span aria-label="comparé à" className="px-1 text-muted-foreground">
                ⇄
              </span>
              <Rubric value={`B·${state.keyB.rubric}`} />
              <span>
                <span className="text-muted-foreground">{nameB}.</span>
                <strong className="font-semibold">{state.keyB.label}</strong>
              </span>
              <span className="text-muted-foreground">
                · {stats.mode === "phone" ? "téléphones sur les 9 derniers chiffres" : "texte sans casse, espaces, points ni tirets"}
              </span>
            </p>
            <p className="text-muted-foreground tabular-nums">
              <span className="font-semibold text-success">{nf.format(stats.matchedA)} trouvées</span> ·{" "}
              <span className="font-semibold text-destructive">{nf.format(stats.unmatchedA)} absentes</span> sur{" "}
              {nf.format(stats.rowsA)} lignes de A
              {stats.duplicateKeysB > 0 && ` · ${nf.format(stats.duplicateKeysB)} clés en double dans B`}
              {stats.emptyKeysA > 0 && ` · ${nf.format(stats.emptyKeysA)} clés vides dans A`}
            </p>
          </div>
        ) : null
      }
    />
  );
}
