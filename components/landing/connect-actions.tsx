"use client";

// Les actions de la landing : connecter un Sheet (formulaire d'ajout, puis back office)
// et essayer la démonstration (4 bases fictives, quand le serveur les sert).

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AddSourceDialog } from "@/components/add-source-dialog";
import { useSources } from "@/hooks/use-sources";
import { DEMO_SOURCES } from "@/lib/demo";
import { fetchDemoAvailable } from "@/lib/sheets-client";
import { cn } from "@/lib/utils";

const DARK =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--l-dark)] font-medium text-[var(--l-on-dark)] outline-none transition-colors hover:bg-[var(--l-dark-hover)] focus-visible:ring-2 focus-visible:ring-[var(--l-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--l-bg)]";
const LIGHT =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--l-line)] bg-[var(--l-card)] font-medium text-[var(--l-ink)] outline-none transition-colors hover:bg-[var(--l-hover)] focus-visible:ring-2 focus-visible:ring-[var(--l-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--l-bg)]";

export function ConnectActions({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { sources, addSource, select } = useSources();
  const [open, setOpen] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (!compact) fetchDemoAvailable().then(setDemo);
  }, [compact]);

  const openDemo = () => {
    // Les bases de démonstration déjà connectées ne sont pas ajoutées une seconde fois.
    const existing = sources.filter((s) => DEMO_SOURCES.some((d) => d.spreadsheetId === s.spreadsheetId));
    const first =
      existing[0] ??
      DEMO_SOURCES.filter((d) => !sources.some((s) => s.spreadsheetId === d.spreadsheetId)).map((d) => addSource(d))[0];
    if (first) select({ kind: "source", id: first.id });
    router.push("/app");
  };

  const dialog = <AddSourceDialog open={open} onOpenChange={setOpen} onAdded={() => router.push("/app")} />;

  if (compact) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className={cn(DARK, "h-8 rounded-full px-3.5 text-[13px]")}>
          Connecter un Sheet
        </button>
        {dialog}
      </>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => setOpen(true)} className={cn(DARK, "h-11 px-4 text-[15px]")}>
        Connecter un Google Sheet
        <ArrowRight className="size-4" aria-hidden />
      </button>
      {demo && (
        <button type="button" onClick={openDemo} className={cn(LIGHT, "h-11 px-4 text-[15px]")}>
          Essayer avec la démo
        </button>
      )}
      {dialog}
    </div>
  );
}
