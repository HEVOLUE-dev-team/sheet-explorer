---
version: 1
slug: "app-app-page-tsx"
primary_target: "app/app/page.tsx"
related_targets: ["components"]
---

# Surface brief — back office (app/app/page.tsx)

Scope : l'écran de travail unique (rail des bases, tableau, fiche détail, ajout de base, croisement). Mode : Operate.
Audience : équipe recouvrement / suivi qui retrouve une personne et croise des fichiers de contacts, plusieurs fois par jour. Tâche reine : retrouver une personne. À éviter (confirmé) : look template générique, décoratif, trop dense, jointure obscure.
Scène : bureau, journée, éclairage de bureau → clair par défaut (suit le système), sombre disponible.

## Direction contract

THESIS: chaque colonne découverte devient une rubrique numérotée, adressable partout ; refuse le tableau SaaS gris anonyme où les colonnes n'ont pas d'identité.
OWN-WORLD: (révisé à la demande de l'utilisateur) le monde de la landing : papier crème chaud, encre brun-noir, rail en panneau sombre, titres en serif Newsreader, numéros de rubrique et clés en Geist Mono, sélection pêche, filets fins, tampons vert/rouge, ocre pour la base B. Archivo pour le texte et l'interface.
STORY: on choisit une base, on tape un nom, la fiche s'ouvre en cases ; on croise deux bases et on voit quelle rubrique a correspondu à quelle autre, et sur quelle valeur normalisée.
FIRST VIEWPORT: rail en panneau sombre (bases, croisements, + ajouter) à gauche ; titre de la base et ligne d'info ; bandeau d'outils teinté avec recherche en premier, filtres actifs en pastilles, Filtres/Colonnes/Croiser/Exporter ; tableau aux en-têtes « 01 Pays » triables ; pied « X résultats sur Y · Dubois → Roux » ; fiche détail en cases à droite au clic.
FORM: candidat 6 sur 7 (formulaire Cerfa), seed:39eac0c615147f3f. Mouvement signature : la numérotation des rubriques reliant tableau, filtres, fiche et correspondance « A·06 ⇄ B·01 ». Raises : grille 4 px commune, tampons d'état, mots-repères en pied, précédente/suivante dans la fiche, un seul système de filets, hiérarchie par l'échelle.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
