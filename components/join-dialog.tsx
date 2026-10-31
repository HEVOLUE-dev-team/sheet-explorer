"use client";

// Croiser deux bases : choisir A, B, la colonne clé de chacune, le type de jointure et la façon
// de comparer. Un aperçu montre tout de suite combien de lignes correspondent, et sur quelle valeur.

import { ArrowLeftRight, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Rubric } from "@/components/rubric";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSheetData } from "@/hooks/use-sheet-data";
import { useSources } from "@/hooks/use-sources";
import { findColumnByLabel } from "@/lib/dataset";
import { JOIN_LABELS, joinDatasets, keyNormalizer, suggestKeyColumn } from "@/lib/join";
import type { Column, Dataset, JoinConfig, JoinType, KeyMode } from "@/lib/types";

const nf = new Intl.NumberFormat("fr-FR");

const MODE_LABELS: Record<KeyMode, string> = {
  auto: "Automatique",
  phone: "Téléphones : 9 derniers chiffres",
  text: "Texte : sans casse, espaces, points ni tirets",
};

const JOIN_SYMBOL: Record<JoinType, string> = { inner: "⋂", left: "+", anti: "−" };

export interface JoinDialogState {
  open: boolean;
  /** Base A proposée à l'ouverture (bouton « Croiser » d'une base). */
  sourceA?: string;
  /** Croisement existant à modifier. */
  editing?: JoinConfig;
}

export function JoinDialog({ state, onOpenChange }: { state: JoinDialogState; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto p-6 sm:max-w-2xl">
        {state.open && <JoinForm initial={state} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function JoinForm({ initial, onDone }: { initial: JoinDialogState; onDone: () => void }) {
  const { sources, addJoin, updateJoin } = useSources();
  const editing = initial.editing;

  const [sourceA, setSourceA] = useState<string | null>(editing?.sourceA ?? initial.sourceA ?? sources[0]?.id ?? null);
  const [sourceB, setSourceB] = useState<string | null>(
    editing?.sourceB ?? sources.find((s) => s.id !== (editing?.sourceA ?? initial.sourceA ?? sources[0]?.id))?.id ?? null,
  );
  const [keyALabel, setKeyALabel] = useState<string | null>(editing?.keyA ?? null);
  const [keyBLabel, setKeyBLabel] = useState<string | null>(editing?.keyB ?? null);
  const [type, setType] = useState<JoinType>(editing?.type ?? "inner");
  const [mode, setMode] = useState<KeyMode>(editing?.mode ?? "auto");
  const [name, setName] = useState(editing?.name ?? "");

  const srcA = sources.find((s) => s.id === sourceA);
  const srcB = sources.find((s) => s.id === sourceB);
  const dataA = useSheetData(srcA);
  const dataB = useSheetData(srcB);

  // Colonnes clés : choix de l'utilisateur, sinon une proposition (« Téléphone » ⇄ « phone »).
  const keyA = pickKey(dataA.dataset, keyALabel, () => guessKeyA(dataA.dataset));
  const keyB = pickKey(dataB.dataset, keyBLabel, () =>
    keyA && dataB.dataset ? suggestKeyColumn(keyA, dataB.dataset, dataA.dataset ?? undefined) : undefined,
  );

  const preview = useMemo(() => {
    if (!dataA.dataset || !dataB.dataset || !keyA || !keyB) return null;
    const result = joinDatasets({ a: dataA.dataset, b: dataB.dataset, keyA, keyB, type, mode });
    // Un exemple de correspondance pour montrer ce que la normalisation a rapproché.
    const normalize = keyNormalizer(result.stats.mode);
    const indexB = new Map<string, string>();
    for (const row of dataB.dataset.rows) {
      const k = normalize(row[keyB.index]);
      if (k && !indexB.has(k)) indexB.set(k, row[keyB.index]);
    }
    let example: { a: string; b: string; key: string } | null = null;
    for (const row of dataA.dataset.rows) {
      const k = normalize(row[keyA.index]);
      const b = k ? indexB.get(k) : undefined;
      if (b !== undefined) {
        example = { a: row[keyA.index], b, key: k };
        if (row[keyA.index] !== b) break; // on préfère un exemple où les écritures diffèrent
      }
    }
    return { ...result.stats, example };
  }, [dataA.dataset, dataB.dataset, keyA, keyB, type, mode]);

  const defaultName = srcA && srcB ? `${srcA.name} ${JOIN_SYMBOL[type]} ${srcB.name}` : "";
  const sameSource = Boolean(sourceA && sourceA === sourceB);
  const canSubmit = Boolean(srcA && srcB && keyA && keyB && !sameSource);

  const submit = () => {
    if (!srcA || !srcB || !keyA || !keyB) return;
    const config = {
      name: name.trim() || defaultName,
      sourceA: srcA.id,
      sourceB: srcB.id,
      keyA: keyA.label,
      keyB: keyB.label,
      type,
      mode,
    };
    if (editing) updateJoin(editing.id, config);
    else addJoin(config);
    onDone();
  };

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submit();
      }}
    >
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl font-normal">{editing ? "Modifier le croisement" : "Croiser deux bases"}</DialogTitle>
        <DialogDescription>
          Les lignes sont rapprochées sur une colonne clé de chaque base. Les noms de colonnes peuvent différer.
        </DialogDescription>
      </DialogHeader>

      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <SidePicker
          side="A"
          sources={sources}
          sourceId={sourceA}
          onSource={(id) => {
            setSourceA(id);
            setKeyALabel(null);
            setKeyBLabel(null);
          }}
          dataset={dataA.dataset}
          loading={dataA.status === "loading"}
          error={dataA.error?.message}
          keyColumn={keyA}
          onKey={(label) => {
            setKeyALabel(label);
            setKeyBLabel(null);
          }}
        />
        <ArrowLeftRight aria-hidden className="mx-auto mb-2.5 hidden size-4 text-muted-foreground sm:block" />
        <SidePicker
          side="B"
          sources={sources}
          sourceId={sourceB}
          onSource={(id) => {
            setSourceB(id);
            setKeyBLabel(null);
          }}
          dataset={dataB.dataset}
          loading={dataB.status === "loading"}
          error={dataB.error?.message}
          keyColumn={keyB}
          onKey={setKeyBLabel}
        />
      </div>
      {sameSource && <p className="-mt-2 text-xs text-destructive">Choisissez deux bases différentes.</p>}

      <div className="grid gap-1.5">
        <Label>Type de croisement</Label>
        <Tabs value={type} onValueChange={(v) => setType(v as JoinType)}>
          <TabsList className="w-full">
            {(Object.keys(JOIN_LABELS) as JoinType[]).map((t) => (
              <TabsTrigger key={t} value={t} className="flex-1">
                {JOIN_LABELS[t].title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">{JOIN_LABELS[type].description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="join-mode">Comparaison des clés</Label>
          <Select
            value={mode}
            onValueChange={(v) => v && setMode(v as KeyMode)}
            items={(Object.keys(MODE_LABELS) as KeyMode[]).map((m) => ({ value: m, label: MODE_LABELS[m] }))}
          >
            <SelectTrigger id="join-mode" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MODE_LABELS) as KeyMode[]).map((m) => (
                <SelectItem key={m} value={m}>
                  {MODE_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="join-name">Nom du croisement</Label>
          <Input id="join-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultName || "Ex. Recouvrement ⋂ Clients"} maxLength={80} />
        </div>
      </div>

      {/* Aperçu */}
      <div className="border border-rule bg-band px-4 py-3 text-sm" aria-live="polite">
        {preview ? (
          <div className="grid gap-1.5">
            <p>
              <strong className="tabular-nums">{nf.format(preview.matchedA)}</strong> ligne{preview.matchedA > 1 ? "s" : ""} de A
              sur {nf.format(preview.rowsA)} trouvée{preview.matchedA > 1 ? "s" : ""} dans B ·{" "}
              <strong className="tabular-nums">{nf.format(preview.unmatchedA)}</strong> absente{preview.unmatchedA > 1 ? "s" : ""} ·
              résultat : <strong className="tabular-nums">{nf.format(preview.resultRows)}</strong> ligne{preview.resultRows > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Comparaison {preview.mode === "phone" ? "des téléphones sur les 9 derniers chiffres" : "en texte normalisé"}
              {mode === "auto" && " (détectée automatiquement)"}
              {preview.emptyKeysA > 0 && ` · ${nf.format(preview.emptyKeysA)} clé${preview.emptyKeysA > 1 ? "s" : ""} vide${preview.emptyKeysA > 1 ? "s" : ""} dans A`}
              {preview.duplicateKeysB > 0 && ` · ${nf.format(preview.duplicateKeysB)} clé${preview.duplicateKeysB > 1 ? "s" : ""} en double dans B`}
            </p>
            {preview.example ? (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="text-muted-foreground">Exemple :</span>
                <span className="border border-primary/40 bg-background px-1.5 py-0.5">{preview.example.a}</span>
                <span aria-label="correspond à">⇄</span>
                <span className="border border-source-b/50 bg-background px-1.5 py-0.5">{preview.example.b}</span>
                <span className="text-muted-foreground">
                  → clé <span className="font-mono text-foreground">{preview.example.key}</span>
                </span>
              </p>
            ) : (
              <p className="text-xs text-destructive">
                Aucune valeur commune : vérifiez les colonnes clés ou essayez un autre mode de comparaison.
              </p>
            )}
          </div>
        ) : dataA.status === "loading" || dataB.status === "loading" ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Lecture des deux bases…
          </p>
        ) : (
          <p className="text-muted-foreground">Choisissez les deux bases et leur colonne clé pour voir l&apos;aperçu.</p>
        )}
      </div>

      <DialogFooter className="-mx-6 -mb-6 px-6">
        <Button type="button" variant="outline" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {editing ? "Enregistrer" : "Afficher le croisement"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function pickKey(dataset: Dataset | null, label: string | null, fallback: () => Column | undefined) {
  if (!dataset) return undefined;
  return (label ? findColumnByLabel(dataset, label) : undefined) ?? fallback();
}

/** Première colonne qui ressemble à un téléphone ou un e-mail, sinon la première colonne. */
function guessKeyA(dataset: Dataset | null): Column | undefined {
  if (!dataset) return undefined;
  const byName = dataset.columns.find((c) => /t[ée]l[ée]phone|phone|mobile|portable|e-?mail|courriel/i.test(c.label));
  return byName ?? dataset.columns[0];
}

function SidePicker({
  side,
  sources,
  sourceId,
  onSource,
  dataset,
  loading,
  error,
  keyColumn,
  onKey,
}: {
  side: "A" | "B";
  sources: { id: string; name: string }[];
  sourceId: string | null;
  onSource: (id: string) => void;
  dataset: Dataset | null;
  loading: boolean;
  error?: string;
  keyColumn?: Column;
  onKey: (label: string) => void;
}) {
  const id = side.toLowerCase();
  const columns = dataset?.columns ?? [];
  const rubricPrefix = `${side}·`;
  return (
    <fieldset className="grid min-w-0 gap-3">
      <legend className={side === "B" ? "mb-2 text-sm font-semibold text-source-b" : "mb-2 text-sm font-semibold text-primary"}>
        Base {side}
      </legend>
      <div className="grid gap-1.5">
        <Select
          value={sourceId}
          onValueChange={(v) => v && onSource(v)}
          items={sources.map((s) => ({ value: s.id, label: s.name }))}
        >
          <SelectTrigger id={`join-source-${id}`} aria-label={`Base ${side}`} className="w-full">
            <SelectValue placeholder="Choisir une base" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`join-key-${id}`}>Colonne clé</Label>
        <Select
          value={keyColumn?.label ?? null}
          onValueChange={(v) => v && onKey(v)}
          items={columns.map((c) => ({ value: c.label, label: c.label }))}
          disabled={!dataset}
        >
          <SelectTrigger id={`join-key-${id}`} className="w-full">
            {keyColumn && <Rubric value={`${rubricPrefix}${keyColumn.rubric}`} />}
            <SelectValue placeholder={loading ? "Lecture…" : "Choisir la colonne"} />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.label}>
                <Rubric value={`${rubricPrefix}${c.rubric}`} />
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </fieldset>
  );
}
