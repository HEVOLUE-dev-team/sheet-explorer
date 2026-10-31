"use client";

// Assemblage de l'application : rail des bases, vue principale et dialogues.

import { useState } from "react";

import { AddSourceDialog } from "@/components/add-source-dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTableSkeleton } from "@/components/data-table";
import { JoinDialog, type JoinDialogState } from "@/components/join-dialog";
import { RenameDialog } from "@/components/rename-dialog";
import { JoinView, SourceView } from "@/components/views";
import { Welcome } from "@/components/welcome";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSources } from "@/hooks/use-sources";
import type { JoinConfig, SheetSource } from "@/lib/types";

type RenameTarget = { kind: "source"; item: SheetSource } | { kind: "join"; item: JoinConfig } | null;

export function Explorer({ whatsappUrl }: { whatsappUrl: string | null }) {
  const { hydrated, sources, joins, selection, renameSource, updateJoin } = useSources();
  const [addOpen, setAddOpen] = useState(false);
  const [joinState, setJoinState] = useState<JoinDialogState>({ open: false });
  const [rename, setRename] = useState<RenameTarget>(null);

  const source = selection?.kind === "source" ? sources.find((s) => s.id === selection.id) : undefined;
  const join = selection?.kind === "join" ? joins.find((j) => j.id === selection.id) : undefined;
  // Sans sélection valide, on affiche la première base.
  const fallback = !source && !join ? sources[0] : undefined;
  const shown = source ?? fallback;

  return (
    <SidebarProvider style={{ "--sidebar-width": "15.5rem" } as React.CSSProperties}>
      <AppSidebar
        onAddSource={() => setAddOpen(true)}
        onNewJoin={() => setJoinState({ open: true, sourceA: shown?.id })}
        onEditJoin={(j) => setJoinState({ open: true, editing: j })}
        onRename={setRename}
        whatsappUrl={whatsappUrl}
      />
      <SidebarInset className="min-w-0">
        {!hydrated ? (
          <div className="h-svh pt-28">
            <DataTableSkeleton />
          </div>
        ) : join ? (
          <JoinView key={join.id} join={join} sources={sources} onEdit={() => setJoinState({ open: true, editing: join })} />
        ) : shown ? (
          <SourceView key={shown.id} source={shown} onJoin={() => setJoinState({ open: true, sourceA: shown.id })} />
        ) : (
          <Welcome onAddSource={() => setAddOpen(true)} />
        )}
      </SidebarInset>

      <AddSourceDialog open={addOpen} onOpenChange={setAddOpen} />
      <JoinDialog state={joinState} onOpenChange={(open) => setJoinState((s) => ({ ...s, open }))} />
      <RenameDialog
        open={rename !== null}
        title={rename?.kind === "join" ? "Renommer le croisement" : "Renommer la base"}
        initial={rename?.item.name ?? ""}
        onOpenChange={(open) => !open && setRename(null)}
        onSubmit={(name) => {
          if (rename?.kind === "source") renameSource(rename.item.id, name);
          if (rename?.kind === "join") updateJoin(rename.item.id, { name });
          setRename(null);
        }}
      />
    </SidebarProvider>
  );
}
