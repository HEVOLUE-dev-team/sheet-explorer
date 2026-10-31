"use client";

// L'année du pied de page, lue dans le navigateur : elle change seule chaque 1er janvier, même
// si la page a été générée l'année précédente. Côté serveur (pré-rendu), rien n'est calculé :
// Next.js interdit une valeur instable comme new Date() dans une page statique.

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <span className="inline-block min-w-[4ch] tabular-nums">{year}</span>;
}
