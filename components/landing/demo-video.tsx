"use client";

// Vidéo de démonstration : lue en boucle et sans le son, sauf si le visiteur demande moins de
// mouvement (elle reste alors en pause sur la première image, avec les commandes).

import { useEffect, useRef } from "react";

export function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {
      // Lecture automatique refusée par le navigateur : les commandes restent disponibles.
    });
  }, []);

  return (
    <video
      ref={ref}
      className="block aspect-[1280/712] w-full bg-[var(--l-tile)]"
      muted
      loop
      playsInline
      controls
      preload="metadata"
      poster="/landing/demo-poster.jpg"
      aria-label="Démonstration : coller le lien d'un Google Sheet, chercher une personne, ouvrir sa fiche, puis croiser deux bases."
    >
      <source src="/landing/demo.webm" type="video/webm" />
      <source src="/landing/demo.mp4" type="video/mp4" />
    </video>
  );
}
