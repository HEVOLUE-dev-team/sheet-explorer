// Polices communes à la landing et au back office : un serif de titre avec son italique,
// et une chasse fixe pour les petites étiquettes et les numéros.

import { Geist_Mono, Newsreader } from "next/font/google";

export const landingSerif = Newsreader({
  variable: "--font-landing-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const landingMono = Geist_Mono({
  variable: "--font-landing-mono",
  subsets: ["latin"],
});
