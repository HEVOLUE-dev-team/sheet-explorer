---
name: Sheet Explorer
description: Consulter, filtrer et croiser n'importe quel Google Sheet à partir de son lien, sur papier crème chaud et encre brun-noir.
colors:
  # Clair (:root, app/globals.css)
  papier-creme: "oklch(0.968 0.006 85)"
  encre: "oklch(0.25 0.008 70)"
  encre-noire: "oklch(0.22 0.004 70)"
  sur-encre: "oklch(0.97 0.006 85)"
  carte: "oklch(0.99 0.003 85)"
  fond-muet: "oklch(0.935 0.008 80)"
  survol: "oklch(0.94 0.008 80)"
  bandeau: "oklch(0.935 0.01 80)"
  bandeau-encre: "oklch(0.32 0.01 70)"
  encre-attenuee: "oklch(0.47 0.01 70)"
  peche-selection: "oklch(0.91 0.045 60)"
  filet-separation: "oklch(0.88 0.01 80)"
  filet-case: "oklch(0.8 0.015 75)"
  vert-trouve: "oklch(0.48 0.1 150)"
  rouge-absent: "oklch(0.53 0.17 30)"
  ocre-base-b: "oklch(0.5 0.11 50)"
  rail: "oklch(0.22 0.004 70)"
  rail-texte: "oklch(0.93 0.008 85)"
  rail-attenue: "oklch(0.72 0.01 80)"
  rail-survol: "oklch(0.3 0.004 70)"
  rail-filet: "oklch(0.33 0.004 70)"
  # Landing (.landing, variables --l-*), quand elles diffèrent du socle
  landing-encre-attenuee: "oklch(0.48 0.01 70)"
  landing-filet-haut: "oklch(0.8 0.025 70)"
  landing-pastille: "oklch(0.92 0.008 80)"
  landing-carte: "oklch(0.995 0.002 85)"
  landing-survol: "oklch(0.95 0.006 85)"
  # Sombre (.dark, .dark .landing)
  nuit-fond: "oklch(0.19 0.005 70)"
  nuit-encre: "oklch(0.94 0.008 85)"
  nuit-carte: "oklch(0.23 0.005 70)"
  nuit-popover: "oklch(0.24 0.005 70)"
  nuit-encre-inverse: "oklch(0.2 0.005 70)"
  nuit-fond-muet: "oklch(0.26 0.006 70)"
  nuit-survol: "oklch(0.27 0.006 70)"
  nuit-bandeau: "oklch(0.25 0.006 70)"
  nuit-bandeau-encre: "oklch(0.86 0.01 80)"
  nuit-encre-attenuee: "oklch(0.72 0.01 80)"
  nuit-peche-selection: "oklch(0.33 0.05 55)"
  nuit-filet-separation: "oklch(0.32 0.006 70)"
  nuit-filet-case: "oklch(0.43 0.01 70)"
  nuit-vert-trouve: "oklch(0.74 0.11 150)"
  nuit-rouge-absent: "oklch(0.7 0.15 30)"
  nuit-ocre-base-b: "oklch(0.78 0.1 60)"
  nuit-rail: "oklch(0.14 0.004 70)"
  nuit-rail-texte: "oklch(0.92 0.008 85)"
  nuit-rail-attenue: "oklch(0.7 0.01 80)"
  nuit-rail-survol: "oklch(0.24 0.005 70)"
  nuit-rail-filet: "oklch(0.28 0.005 70)"
  nuit-landing-filet-haut: "oklch(0.45 0.03 70)"
  nuit-landing-bouton-survol: "oklch(0.86 0.008 85)"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "4.25rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display-sm:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display-mobile:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "2.75rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title-dialog:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.33
  title-record:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.25
  wordmark:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  body-dense:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label-section:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.05em"
  label-mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.05em"
  rubric:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
  stamp:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.025em"
    fontVariation: "\"wdth\" 88"
rounded:
  stamp: "2px"
  rubric: "3px"
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.encre-noire}"
    textColor: "{colors.sur-encre}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-outline-hover:
    backgroundColor: "{colors.fond-muet}"
  button-ghost:
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  landing-button-dark:
    backgroundColor: "{colors.encre-noire}"
    textColor: "{colors.sur-encre}"
    rounded: "{rounded.lg}"
    height: "44px"
    padding: "0 16px"
  landing-button-dark-hover:
    backgroundColor: "{colors.rail-survol}"
  landing-button-light:
    backgroundColor: "{colors.landing-carte}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    height: "44px"
    padding: "0 16px"
  landing-button-light-hover:
    backgroundColor: "{colors.landing-survol}"
  landing-pill:
    backgroundColor: "{colors.encre-noire}"
    textColor: "{colors.sur-encre}"
    rounded: "{rounded.full}"
    height: "32px"
    padding: "0 14px"
  sidebar:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-texte}"
    width: "16rem"
  sidebar-item-active:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.encre-noire}"
    rounded: "{rounded.md}"
    height: "44px"
  toolbar-band:
    backgroundColor: "{colors.bandeau}"
    padding: "10px 24px"
  table-header:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.encre}"
    typography: "{typography.body-dense}"
    height: "40px"
  table-row-selected:
    backgroundColor: "{colors.peche-selection}"
    textColor: "{colors.encre}"
  rubric:
    textColor: "{colors.encre-noire}"
    typography: "{typography.rubric}"
    rounded: "{rounded.rubric}"
    height: "16px"
    padding: "0 4px"
  rubric-b:
    textColor: "{colors.ocre-base-b}"
    rounded: "{rounded.rubric}"
  stamp-found:
    textColor: "{colors.vert-trouve}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "0 6px"
  stamp-missing:
    textColor: "{colors.rouge-absent}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "0 6px"
  record-field:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.encre}"
    padding: "6px 10px 8px"
    height: "52px"
  record-band:
    backgroundColor: "{colors.bandeau}"
    textColor: "{colors.bandeau-encre}"
    typography: "{typography.label-section}"
    padding: "4px 8px"
  filter-chip:
    backgroundColor: "{colors.papier-creme}"
    textColor: "{colors.encre}"
    rounded: "{rounded.sm}"
    height: "28px"
  landing-video-frame:
    backgroundColor: "{colors.landing-carte}"
    rounded: "{rounded.lg}"
    width: "72rem"
---

# Design System: Sheet Explorer

## Overview

**Creative North Star: "Le registre sur papier crème"**

Un seul monde pour la landing (« / ») et le back office (« /app »), tiré de la référence épinglée par l'utilisateur : papier crème chaud, encre brun-noir à peine teintée, titres en serif Newsreader, petites étiquettes et numéros en Geist Mono, texte courant en Archivo. Le monde est calme et éditorial à l'extérieur, précis comme un registre à l'intérieur : chaque colonne découverte devient une rubrique numérotée (« 01 », « A·06 », « B·01 ») qui la désigne partout, dans l'en-tête du tableau, les filtres, la fiche et la correspondance d'un croisement.

La landing tient en trois blocs (barre, hero, pied) et montre le vrai produit dans une vidéo encadrée. Le back office pose un rail en panneau sombre à gauche, un bandeau d'outils teinté, un tableau à filets fins et une fiche en cases à droite. La couleur ne décore rien : le neutre chaud porte tout, la teinte pêche marque la ligne sélectionnée, l'ocre signe la base B, et le vert et le rouge ne disent que « trouvé » et « absent » (ou une erreur).

Clair par défaut (suit le système), sombre disponible avec les mêmes rôles. L'ancien monde « Cerfa » bleu administratif est abandonné.

**Key Characteristics:**
- Papier crème et encre brun-noir, teinte 70-85, chroma quasi nulle.
- Newsreader pour toute voix de titre, avec un seul mot en italique dans le titre de la landing.
- Rubriques encadrées en Geist Mono, adressables d'un bout à l'autre de l'app.
- Filets fins à la place des ombres ; une seule ombre portée, sous la vidéo.
- Couleur de sens réservée : vert trouvé, rouge absent ou erreur, ocre base B, pêche sélection.

## Colors

Une palette de neutres chauds (teinte 70-85) quasi sans chroma, avec quatre teintes de sens et rien d'autre.

### Primary
- **Encre noire** (encre-noire) : boutons pleins, pastille « Connecter un Sheet », rubriques de la base A, filet de la ligne sélectionnée, flèche de tri active. En sombre, le rôle s'inverse en encre crème (nuit-encre) sur fond nuit.
- **Encre** (encre) : tout le texte courant et les titres ; c'est aussi la couleur de l'anneau de focus.

### Secondary
- **Ocre base B** (ocre-base-b / nuit-ocre-base-b) : rubriques « B·nn », titre du groupe « Base B » dans la fiche, exemple B dans l'aperçu de croisement. A reste à l'encre.
- **Pêche sélection** (peche-selection / nuit-peche-selection) : fond de la ligne sélectionnée du tableau, encadrée d'un filet d'encre en haut et en bas.

### Tertiary
- **Vert trouvé** (vert-trouve / nuit-vert-trouve) : tampon « Trouvé dans B », compteur « trouvées », case de la clé comparée dans la fiche (contour 2px et fond à 8%).
- **Rouge absent** (rouge-absent / nuit-rouge-absent) : tampon « Absent de B », compteur « absentes », messages d'erreur, actions de suppression.

### Neutral
- **Papier crème** (papier-creme / nuit-fond) : fond de page des deux surfaces, fond des cases et des en-têtes collants.
- **Carte** (carte, landing-carte / nuit-carte) : dialogues, popovers, bouton contour et cadre vidéo de la landing.
- **Fond muet** (fond-muet / nuit-fond-muet) : fonds muets, survol des lignes, fond de la vidéo avant lecture.
- **Bandeau** (bandeau, bandeau-encre) : bande d'outils sous le titre et titres de groupe de la fiche.
- **Encre atténuée** (encre-attenuee, landing-encre-attenuee) : lignes d'info, légendes, compteurs secondaires.
- **Filet de séparation** (filet-separation) : séparations de zones, lignes du tableau, filets de la landing.
- **Filet de case** (filet-case) : bords des cases de la fiche, des champs, de la touche « / » et des colonnes épinglées.
- **Rail** (rail, rail-texte, rail-attenue, rail-survol, rail-filet) : panneau sombre du back office ; en sombre il descend encore (nuit-rail) pour rester le plan le plus profond.
- **Pastille landing** (landing-pastille) : pastilles rondes A B C D ; **filet haut** (landing-filet-haut) : la barre de 4px qui coiffe la page.

### Named Rules
**The Colour Means Something Rule.** Le vert et le rouge ne servent qu'à « trouvé », « absent » et aux erreurs ; aucun bouton, lien ou décor ne les emprunte.

**The B Is Ochre Rule.** Tout ce qui vient de la base B porte l'ocre ; la base A reste à l'encre. Jamais l'inverse, jamais une troisième teinte de source.

**The Peach Is Selection Rule.** La pêche marque la ligne sélectionnée et rien d'autre ; le survol reste neutre (fond muet) pour que survol et sélection ne se confondent jamais.

## Typography

**Display Font:** Newsreader (avec Georgia, serif), axe optique, romain et italique
**Body Font:** Archivo (avec ui-sans-serif, system-ui), axe de chasse
**Label/Mono Font:** Geist Mono (avec ui-monospace, monospace)

**Character:** Un serif de lecture calme pour toute voix de titre, une grotesque de travail pour l'interface, une chasse fixe pour ce qui se compte ou s'adresse (rubriques, clés, numéros).

### Hierarchy
- **Display** (400, 2.75rem mobile, 3.75rem dès 640px, 4.25rem dès 768px, interligne 1.05, -0.02em) : le titre de la landing seulement, centré, sur deux lignes, avec un mot en italique (« bonnes »).
- **Headline** (400, 2.25rem puis 3rem dès 768px, interligne 1.25, -0.01em) : titre de l'écran d'accueil vide du back office.
- **Title** (400, 28px, 1.25, -0.01em) : nom de la base ou du croisement en tête du back office. Variantes : titre de dialogue (1.5rem), titre de fiche (22px), wordmark (1.25rem, -0.025em).
- **Lead** (Archivo 400, 17px) : description sous le titre de la landing, 36rem de large au plus.
- **Body** (Archivo 400, 14px) : texte d'interface et valeurs de la fiche. **Body dense** (13px) : cellules et en-têtes du tableau, pied de page, barre de la landing.
- **Label section** (Archivo 600, 11px, 0.05em, majuscules) : « Bases », « Croisements » dans le rail, « Base A · … » dans la fiche.
- **Label mono** (Geist Mono 400, 11px, 0.05em, majuscules) : légende « Données fictives » sous la vidéo, pastilles A B C D.
- **Rubric** (Geist Mono 500, 10px, interligne 1, chiffres tabulaires) : numéros de rubrique encadrés.
- **Stamp** (Archivo 600, 10px sur 16px, majuscules, chasse 88%) : tampons d'état ; 12px avec bord 2px dans la fiche.

### Named Rules
**The Serif Speaks Rule.** Toute voix de titre (landing, base, fiche, dialogue, wordmark) est en Newsreader 400 ; on hiérarchise par l'échelle, jamais par la graisse.

**The Numbers Align Rule.** Tableaux et éléments `.tabular` utilisent des chiffres tabulaires ; clés et rubriques sont en chasse fixe.

## Layout

Grille commune de 4px. Back office : rail de 16rem à gauche, zone de travail fluide, fiche détail de 380px à droite sur grand écran et en feuille latérale (pleine largeur, 28rem dès 640px) sur petit écran. En-tête de zone à 16px de marge, 24px dès 768px ; bandeau d'outils à 10px vertical ; cellules à 8px × 10px ; pied « X résultats sur Y · Dubois → Roux » en 13px. Les colonnes d'identité s'épinglent à gauche dès 768px (9.5rem, 11.5rem pour la correspondance) avec un filet de case à droite ; un fondu de 2rem sur le bord droit signale les colonnes restantes.

Landing : conteneur de 80rem pour la barre (64px de haut, grille 1fr auto 1fr dès 768px), 56rem pour la hero (80px au-dessus, 112px dès 768px), 72rem pour la vidéo. Marges latérales de 20px, 32px dès 768px. Le haut de la vidéo entre dans le premier écran.

Points de rupture : 640px (sm), 768px (md, épinglage et nav de landing), 1536px (2xl, libellé « Lignes par page »).

## Elevation & Depth

Système plat fait de filets et d'aplats tonals : le rail sombre est le plan profond, le papier le plan de travail, la carte le plan levé. Une seule ombre portée dans tout le produit, sous la vidéo de la landing. La sélection et le focus du tableau s'expriment par des filets intérieurs, pas par des ombres.

### Shadow Vocabulary
- **Ombre de vitrine** (`box-shadow: 0 30px 60px -40px rgb(40 30 20 / 0.45)`) : cadre de la vidéo de démonstration seulement.
- **Filet de sélection** (`box-shadow: inset 0 1px 0 var(--primary), inset 0 -1px 0 var(--primary)`) : ligne sélectionnée, avec un filet gauche sur la première cellule.
- **Filet de focus** (`box-shadow: inset 2px 0 0 var(--ring)`) : ligne du tableau focalisée au clavier.

### Named Rules
**The Rules Not Shadows Rule.** La profondeur vient des filets et des aplats ; l'ombre portée reste l'exception unique de la vitrine vidéo.

## Shapes

Coins doucement arrondis à 8px (`--radius: 0.5rem`) pour les boutons, la vidéo et les dialogues ; 4.8px pour les puces de filtre ; 6.4px pour les éléments du rail. Les marques de registre sont presque vives : rubriques à 3px, tampons à 2px, cases de la fiche à 0. Seuls la pastille de la barre et les pastilles A B C D sont entièrement rondes. Le logo dessine un « S » avec onze cellules de 20 unités arrondies à 3, dans une grille au pas de 24 ; l'icône d'onglet pose ce dessin sur un carré à rayon 32/148.

## Components

### Buttons
- **Shape :** coins à 8px (lg) ; 32px de haut dans le back office, 44px dans la hero de la landing.
- **Primary :** encre noire sur crème ; survol à 80% d'opacité ; enfoncement de 1px à l'appui.
- **Outline / Ghost :** contour filet sur papier, survol fond muet ; ghost sans contour pour les icônes (fiche précédente, suivante, fermer).
- **Landing :** bouton noir « Connecter un Google Sheet » avec flèche, bouton contour blanc « Essayer avec la démo », pastille ronde de 32px dans la barre. Survol par changement de fond (150ms), focus par anneau d'encre de 2px décalé de 2px.

### Navigation (rail)
- Panneau sombre de 16rem, wordmark en haut (retour à l'accueil), groupes « Bases » et « Croisements » en label section atténué.
- Entrées de 44px sur deux lignes (nom, puis ligne d'info à 11px et 75% d'opacité) ; survol rail-survol ; l'entrée active s'inverse en papier crème sur encre noire, en gras.
- Pied : « Ajouter une base » en bouton crème plein, « Croiser deux bases » en contour transparent, puis thème et lien Google Sheets.

### Bandeau d'outils et puces de filtre
- Bandeau teinté sous le titre : recherche en premier (raccourci « / » dans une touche à filet de case), puis Filtrer, Colonnes, Croiser, Exporter CSV.
- Puces de filtre actives : 28px, coins à 4.8px, bord d'encre à 40%, texte 12px ; « Tout effacer » en ghost atténué.

### Table
- En-têtes collants de 40px, 13px semi-gras, précédés de leur rubrique, triables (flèche visible au survol, à l'encre quand active), soulignés d'un filet d'encre à 80%.
- Lignes à filet de séparation, survol fond muet, sélection pêche encadrée d'encre ; valeurs tronquées avec la valeur complète en infobulle au-delà de 18 caractères.
- Colonne « Correspondance » : un tampon par ligne au lieu de masquer la ligne. Colonne « Clé comparée » en Geist Mono 12px atténuée.

### Rubric (signature)
Numéro encadré de 16px de haut, 24px de large au moins, bord à 60% d'encre (base A) ou 70% d'ocre (base B). Il relie en-tête, filtres, fiche et la ligne de correspondance « A·06 ⇄ B·01 ».

### Stamps
Tampons d'état en capitales condensées, bord 1px, coins à 2px : vert « Trouvé dans B », rouge « Absent de B ». Version fiche : bord 2px, 12px, légère rotation de -1°.

### Record fields (fiche)
- En-tête : nom de la personne en serif 22px, « Ligne N du Sheet · X sur Y résultats », boutons précédente / suivante / fermer.
- Champs en grille de deux cases à filet de case (aucun coin), 52px de haut au moins : rubrique et libellé en 11px atténué, valeur en 14px ; une valeur de plus de 22 caractères prend toute la largeur. Bouton copier qui apparaît au survol. Liens à l'encre avec soulignement à 30%.
- Croisement : groupes « Base A · … » et « Base B · … » sur bandeau ; la clé comparée en case verte contournée ; « Aucune ligne de … ne correspond » dans une case à filet quand B est absente.

### Landing video frame

Vidéo tutoriel de 45 s en 8 étapes numérotées (légendes incrustées en pastille sombre en bas de
l'image) ; l'enregistrement du partage Google Sheets y est flouté hors de la fenêtre de partage.
Figure à coins de 8px sur carte, anneau d'un filet, ombre de vitrine ; vidéo au format 1280/712 sur fond muet, en boucle et sans son ; légende en pied à filet (13px atténué à gauche, « Données fictives » en label mono à droite).

### Aide WhatsApp

Sur la landing, un bouton rond de 52px au vert WhatsApp (#25D366), logo blanc, fixé en bas à droite
(20px des bords). Le pied de page réserve 96px à droite (et 96px en bas sur mobile) pour qu'il ne
couvre jamais « Hevolue ». Dans le back office, pas de bouton flottant (il masquerait la pagination) :
une entrée « Aide sur WhatsApp » dans le pied du rail. Le vert WhatsApp est la seule couleur de marque
tierce admise, et uniquement sur ce logo.

### Logo
Monogramme « S » en cellules de tableur à la couleur courante, suivi de « Sheet Explorer » en Newsreader 1.25rem ; le même dessin sert d'icône d'onglet, qui s'inverse en sombre.

### Motion
Rare et fonctionnel : changements de fond en 150ms sur les boutons, défilement doux des ancres, icônes de chargement qui tournent, vidéo de la landing en boucle muette. Sous `prefers-reduced-motion`, la vidéo reste en pause sur sa première image avec ses commandes, et animations et transitions tombent à 0.01ms. Le changement de thème se fait sans transition.

## Do's and Don'ts

### Do:
- **Do** poser chaque titre en Newsreader 400 et hiérarchiser par la taille (4.25rem, 3rem, 28px, 22px).
- **Do** précéder chaque libellé de colonne de sa rubrique, partout où la colonne apparaît.
- **Do** inscrire l'état d'un croisement par un tampon sur la ligne plutôt que de masquer la ligne.
- **Do** séparer par des filets (filet-separation pour les zones, filet-case pour les cases et les champs).
- **Do** garder la landing à trois blocs : barre, hero avec vidéo, pied « Un produit Hevolue ».

### Don't:
- **Don't** placer de surtitre (eyebrow) au-dessus d'un titre : le titre de la landing ouvre directement la page.
- **Don't** introduire de notion de compte, de connexion utilisateur ou d'avatar : « Connecter » s'applique à un Google Sheet.
- **Don't** utiliser le vert ou le rouge pour autre chose que trouvé, absent ou erreur.
- **Don't** ajouter d'ombre portée hors de la vitrine vidéo de la landing.
- **Don't** inventer de client, de chiffre ou de témoignage ; les données montrées sont fictives et le disent.
- **Don't** ramener le bleu administratif de l'ancien monde « Cerfa ».
