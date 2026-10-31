"use client";

// Premier lancement : aucune base connectée. On explique les trois étapes et on propose
// les bases de démonstration quand le serveur les sert.

import { Database, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Rubric } from "@/components/rubric";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSources } from "@/hooks/use-sources";
import { DEMO_SOURCES } from "@/lib/demo";
import { fetchDemoAvailable } from "@/lib/sheets-client";

export function Welcome({ onAddSource }: { onAddSource: () => void }) {
  const { addSource, select } = useSources();
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    fetchDemoAvailable().then(setDemo);
  }, []);

  const loadDemo = () => {
    const created = DEMO_SOURCES.map((d) => addSource(d));
    select({ kind: "source", id: created[0].id });
  };

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <div className="p-3 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-12">
        <h1 className="font-serif text-4xl leading-tight tracking-[-0.01em] md:text-5xl">Connectez un premier Google Sheet</h1>
        <p className="mt-3 max-w-prose text-[15px] text-muted-foreground">
          Sheet Explorer lit la première ligne de l&apos;onglet comme en-têtes et numérote chaque colonne
          découverte <Rubric value="01" className="mx-0.5 align-middle" /> <Rubric value="02" className="align-middle" /> … pour la
          retrouver partout : tableau, filtres, fiche et croisements.
        </p>

        <ol className="mt-8 grid border-t border-l border-rule sm:grid-cols-3">
          {[
            ["Partagez le Sheet", "Partager → Accès général → « Tous les utilisateurs disposant du lien », en lecture."],
            ["Collez le lien", "L'adresse du fichier, telle qu'elle apparaît dans le navigateur."],
            ["Choisissez l'onglet", "Les colonnes, leurs types (texte, nombre, date) sont détectés seuls."],
          ].map(([title, text], i) => (
            <li key={title} className="border-r border-b border-rule p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Rubric value={String(i + 1).padStart(2, "0")} />
                {title}
              </p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={onAddSource}>
            <Plus data-icon="inline-start" />
            Ajouter une base
          </Button>
          {demo && (
            <Button size="lg" variant="outline" onClick={loadDemo}>
              <Database data-icon="inline-start" />
              Charger les 4 bases de démonstration
            </Button>
          )}
        </div>
        {demo && (
          <p className="mt-3 text-xs text-muted-foreground">
            Données 100 % fictives (dossier sample-data), servies par le serveur de développement.
          </p>
        )}
      </div>
    </div>
  );
}
