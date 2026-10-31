"use client";

// Ajouter une base : coller un lien, choisir l'onglet, nommer. L'onglet est lu avant
// l'enregistrement pour signaler tout de suite un fichier non partagé ou un onglet vide.

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadDataset } from "@/hooks/use-sheet-data";
import { useSources } from "@/hooks/use-sources";
import { fetchSpreadsheet, SheetsClientError } from "@/lib/sheets-client";
import { parseSheetUrl } from "@/lib/sheet-url";
import type { SheetSource, SpreadsheetInfo } from "@/lib/types";

const nf = new Intl.NumberFormat("fr-FR");

export function AddSourceDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Appelé quand la base est lue et enregistrée (la landing ouvre alors le back office). */
  onAdded?: (source: SheetSource) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-lg">
        {/* Le formulaire est remonté à chaque ouverture : il repart vide. */}
        {open && (
          <AddSourceForm
            onDone={(source) => {
              onOpenChange(false);
              if (source) onAdded?.(source);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddSourceForm({ onDone }: { onDone: (added?: SheetSource) => void }) {
  const { addSource, sources } = useSources();
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [info, setInfo] = useState<{ id: string; data: SpreadsheetInfo } | null>(null);
  const [tab, setTab] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);

  const parsed = parseSheetUrl(url);
  const spreadsheetId = parsed?.spreadsheetId ?? null;

  // Lecture des onglets dès qu'un lien valide est collé.
  useEffect(() => {
    if (!spreadsheetId || info?.id === spreadsheetId) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setReading(true);
      setLinkError(null);
      fetchSpreadsheet(spreadsheetId, controller.signal)
        .then((data) => {
          setInfo({ id: spreadsheetId, data });
          const fromGid = data.tabs.find((t) => t.sheetId === parsed?.gid);
          const chosen = fromGid ?? data.tabs[0];
          setTab(chosen?.title ?? null);
          if (!nameEdited) setName(data.title || chosen?.title || "");
        })
        .catch((error: unknown) => {
          if ((error as Error).name === "AbortError") return;
          setInfo(null);
          setLinkError(error instanceof SheetsClientError ? error.message : "Lecture du fichier impossible.");
        })
        .finally(() => setReading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on relit seulement quand l'ID change
  }, [spreadsheetId]);

  const invalidLink = touched && url.trim() !== "" && !spreadsheetId;
  const tabs = info?.id === spreadsheetId ? info.data.tabs : [];
  const duplicate = sources.some((s) => s.spreadsheetId === spreadsheetId && s.sheetTitle === tab);
  const canSubmit = Boolean(spreadsheetId && tab && name.trim() && !reading && !saving);

  const submit = async () => {
    if (!spreadsheetId || !tab) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const dataset = await loadDataset({ spreadsheetId, sheetTitle: tab }).promise;
      const source = addSource({ name: name.trim(), spreadsheetId, sheetTitle: tab });
      toast.success(`Base « ${name.trim()} » ajoutée`, {
        description: `${nf.format(dataset.rows.length)} lignes, ${dataset.columns.length} colonnes découvertes.`,
      });
      onDone(source);
    } catch (error) {
      setSubmitError(error instanceof SheetsClientError ? error.message : "Lecture de l'onglet impossible.");
    } finally {
      setSaving(false);
    }
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
        <DialogTitle className="font-serif text-2xl font-normal">Ajouter une base</DialogTitle>
        <DialogDescription>
          Le Sheet doit être partagé avec « Tous les utilisateurs disposant du lien », en lecture.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1.5">
        <Label htmlFor="sheet-url">Lien du Google Sheet</Label>
        <div className="relative">
          <Input
            id="sheet-url"
            autoFocus
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setSubmitError(null);
            }}
            onBlur={() => setTouched(true)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            aria-invalid={invalidLink || Boolean(linkError)}
            aria-describedby="sheet-url-help"
            className="pr-8"
          />
          {reading && <Loader2 className="absolute top-2 right-2.5 size-4 animate-spin text-muted-foreground" aria-label="Lecture du fichier" />}
        </div>
        <p id="sheet-url-help" className={invalidLink || linkError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {invalidLink
            ? "Ce lien ne ressemble pas à un lien Google Sheets : il doit contenir /spreadsheets/d/…"
            : linkError ?? "Copiez l'adresse depuis la barre du navigateur, ou le lien de partage."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="sheet-tab">Onglet</Label>
          <Select
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              setSubmitError(null);
              if (!nameEdited && info && info.data.tabs.length > 1 && v) setName(`${info.data.title} · ${v}`);
            }}
            items={tabs.map((t) => ({ value: t.title, label: t.title }))}
            disabled={tabs.length === 0}
          >
            <SelectTrigger id="sheet-tab" className="w-full">
              <SelectValue placeholder={reading ? "Lecture…" : "Collez d'abord le lien"} />
            </SelectTrigger>
            <SelectContent>
              {tabs.map((t) => (
                <SelectItem key={t.sheetId} value={t.title}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tabs.length > 1 && (
            <p className="text-xs text-muted-foreground">{tabs.length} onglets dans ce fichier.</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sheet-name">Nom de la base</Label>
          <Input
            id="sheet-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameEdited(true);
            }}
            placeholder="Ex. Recouvrement"
            maxLength={60}
          />
        </div>
      </div>

      {duplicate && !submitError && (
        <p className="text-xs text-muted-foreground">Cet onglet est déjà connecté ; il sera ajouté une seconde fois.</p>
      )}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <DialogFooter className="-mx-6 -mb-6 px-6">
        <Button type="button" variant="outline" onClick={() => onDone()}>
          Annuler
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {saving && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {saving ? "Lecture de l'onglet…" : "Ajouter la base"}
        </Button>
      </DialogFooter>
    </form>
  );
}
