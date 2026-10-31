"use client";

// Retour direct au back office : si des bases sont déjà enregistrées dans ce navigateur,
// la landing le dit et ouvre /app sans redemander de lien.

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { useSources } from "@/hooks/use-sources";
import { isDemoId } from "@/lib/sheet-url";
import { cn } from "@/lib/utils";

function useBaseCount() {
  const { hydrated, sources } = useSources();
  const own = sources.filter((s) => !isDemoId(s.spreadsheetId)).length;
  return { hydrated, total: sources.length, own };
}

/** Bandeau sous les boutons de la hero. */
export function ResumeBases() {
  const { hydrated, total, own } = useBaseCount();
  if (!hydrated || total === 0) return null;
  const label =
    own > 0
      ? `Vous avez ${own} base${own > 1 ? "s" : ""} enregistrée${own > 1 ? "s" : ""} dans ce navigateur.`
      : "Les bases de démonstration sont déjà chargées dans ce navigateur.";
  return (
    <p className="mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-[var(--l-tag)] px-4 py-2 text-[14px] text-[var(--l-ink)]">
      <span>{label}</span>
      <Link href="/app" className="inline-flex items-center gap-1 font-semibold underline decoration-[var(--l-line)] underline-offset-4 hover:decoration-[var(--l-ink)]">
        Ouvrir mes bases
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </p>
  );
}

/** Lien « Mes bases » dans la barre, visible seulement s'il y en a. */
export function NavBasesLink({ className }: { className?: string }) {
  const { hydrated, total } = useBaseCount();
  if (!hydrated || total === 0) return null;
  return (
    <Link
      href="/app"
      className={cn(
        "inline-flex h-8 items-center rounded-full border border-[var(--l-line)] bg-[var(--l-card)] px-3.5 text-[13px] font-medium text-[var(--l-ink)] hover:bg-[var(--l-hover)]",
        className,
      )}
    >
      Mes bases ({total})
    </Link>
  );
}
