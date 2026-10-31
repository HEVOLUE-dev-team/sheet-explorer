"use client";

// Rail des bases : basculer d'une base ou d'un croisement à l'autre, renommer, supprimer.

import { ExternalLink, GitMerge, MoreHorizontal, Pencil, Plus, Settings2, Sheet as SheetIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { WhatsAppIcon } from "@/components/whatsapp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSources } from "@/hooks/use-sources";
import { isDemoId } from "@/lib/sheet-url";
import type { JoinConfig, SheetSource } from "@/lib/types";

const ACTIVE =
  "data-active:bg-sidebar-primary data-active:font-semibold data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground";

interface AppSidebarProps {
  onAddSource: () => void;
  onNewJoin: () => void;
  onEditJoin: (join: JoinConfig) => void;
  onRename: (target: { kind: "source"; item: SheetSource } | { kind: "join"; item: JoinConfig }) => void;
  /** Lien d'aide WhatsApp (null si WHATSAPP_NUMBER n'est pas configuré). */
  whatsappUrl: string | null;
}

export function AppSidebar({ onAddSource, onNewJoin, onEditJoin, onRename, whatsappUrl }: AppSidebarProps) {
  const { sources, joins, selection, select, removeSource, removeJoin, snapshot, restore } = useSources();
  const { setOpenMobile } = useSidebar();

  const choose = (next: NonNullable<typeof selection>) => {
    select(next);
    setOpenMobile(false);
  };

  const remove = (kind: "source" | "join", item: SheetSource | JoinConfig) => {
    const saved = snapshot();
    const linked = kind === "source" ? joins.filter((j) => j.sourceA === item.id || j.sourceB === item.id).length : 0;
    if (kind === "source") removeSource(item.id);
    else removeJoin(item.id);
    toast(`« ${item.name} » supprimé${kind === "join" ? "" : "e"}`, {
      description:
        linked > 0
          ? `Ainsi que ${linked} croisement${linked > 1 ? "s" : ""} qui l'utilisai${linked > 1 ? "ent" : "t"}. Le Google Sheet n'est pas touché.`
          : "Seule la connexion est retirée : le Google Sheet n'est pas touché.",
      action: { label: "Annuler", onClick: () => restore(saved) },
    });
  };

  const sourceName = (id: string) => sources.find((s) => s.id === id)?.name ?? "base supprimée";

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-5 pb-2">
        <Link
          href="/"
          aria-label="Sheet Explorer, retour à l'accueil"
          className="w-fit rounded-sm text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Wordmark />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-sidebar-muted uppercase">Bases</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sources.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-sidebar-muted">Aucune base pour l&apos;instant.</p>
              )}
              {sources.map((source) => (
                <SidebarMenuItem key={source.id}>
                  <SidebarMenuButton
                    size="lg"
                    isActive={selection?.kind === "source" && selection.id === source.id}
                    onClick={() => choose({ kind: "source", id: source.id })}
                    className={`h-11 ${ACTIVE}`}
                  >
                    <span className="grid min-w-0 leading-tight">
                      <span className="truncate">{source.name}</span>
                      <span className="truncate text-[11px] font-normal opacity-75">
                        {isDemoId(source.spreadsheetId) ? "Démonstration · " : ""}
                        {source.sheetTitle}
                      </span>
                    </span>
                  </SidebarMenuButton>
                  <ItemMenu label={source.name}>
                    <DropdownMenuItem onClick={() => onRename({ kind: "source", item: source })}>
                      <Pencil /> Renommer
                    </DropdownMenuItem>
                    {!isDemoId(source.spreadsheetId) && (
                      <DropdownMenuItem
                        render={
                          <a
                            href={`https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/edit`}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        <ExternalLink /> Ouvrir dans Google Sheets
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => remove("source", source)}>
                      <Trash2 /> Supprimer la connexion
                    </DropdownMenuItem>
                  </ItemMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {joins.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-sidebar-muted uppercase">Croisements</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {joins.map((join) => (
                  <SidebarMenuItem key={join.id}>
                    <SidebarMenuButton
                      size="lg"
                      isActive={selection?.kind === "join" && selection.id === join.id}
                      onClick={() => choose({ kind: "join", id: join.id })}
                      className={`h-11 ${ACTIVE}`}
                    >
                      <GitMerge className="opacity-80" />
                      <span className="grid min-w-0 leading-tight">
                        <span className="truncate">{join.name}</span>
                        <span className="truncate text-[11px] font-normal opacity-75">
                          {join.keyA} ⇄ {join.keyB}
                        </span>
                      </span>
                    </SidebarMenuButton>
                    <ItemMenu label={join.name}>
                      <DropdownMenuItem onClick={() => onEditJoin(join)}>
                        <Settings2 /> Modifier le croisement
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRename({ kind: "join", item: join })}>
                        <Pencil /> Renommer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => remove("join", join)}>
                        <Trash2 /> Supprimer
                      </DropdownMenuItem>
                    </ItemMenu>
                    <span className="sr-only">
                      Croisement de {sourceName(join.sourceA)} et {sourceName(join.sourceB)}
                    </span>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-2 px-3 pb-3">
        <Button
          onClick={onAddSource}
          className="w-full justify-start border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus data-icon="inline-start" />
          Ajouter une base
        </Button>
        <Button
          variant="outline"
          onClick={onNewJoin}
          disabled={sources.length < 2}
          className="w-full justify-start border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:bg-transparent"
        >
          <GitMerge data-icon="inline-start" />
          Croiser deux bases
        </Button>
        <SidebarMenu className="mt-1 border-t border-sidebar-border pt-2">
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          {whatsappUrl && (
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}>
                <WhatsAppIcon className="text-[#25D366]" />
                <span>Aide sur WhatsApp</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<a href="https://docs.google.com/spreadsheets/" target="_blank" rel="noreferrer" />}
              className="text-sidebar-muted"
            >
              <SheetIcon />
              <span>Ouvrir Google Sheets</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ItemMenu({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<SidebarMenuAction showOnHover className="top-3 text-current" aria-label={`Actions pour ${label}`} />}
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
