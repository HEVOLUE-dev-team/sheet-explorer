# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Une équipe opérationnelle (recouvrement, suivi client, relances) qui travaille sur des fichiers de
contacts tenus dans Google Sheets. Plusieurs fois par jour, ses membres doivent retrouver une
personne précise et comparer des fichiers entre eux. Le projet sert aussi de TD de programmation
web : étudiant et enseignant l'évaluent en démonstration.

## Product Purpose

Se connecter à n'importe quel Google Sheet à partir de son lien, sans rien connaître à l'avance
de ses colonnes, puis consulter, filtrer, croiser et exporter les données. Réussite : retrouver
une personne en quelques secondes, et comprendre sans ambiguïté le résultat d'un croisement.

## Positioning

Universel : les colonnes sont découvertes à partir de la première ligne du Sheet. Le croisement
normalise les clés (casse, espaces, ponctuation, téléphones comparés sur les 9 derniers
chiffres), ce qu'un filtre de tableur ne fait pas.

## Operating Context

- Les données vivent dans Google Sheets, partagés « Toute personne disposant du lien » (v1).
- Volumes visés : jusqu'à ~20 000 lignes par base.
- Les connexions (ID, onglet, nom) sont gardées dans le navigateur (localStorage).
- Usage répété dans la journée, sur ordinateur surtout, parfois sur mobile.

## Capabilities and Constraints

- Ajouter une base (lien + nom + choix d'onglet), basculer, renommer, supprimer.
- Vue tableau : recherche globale sans accents ni casse, filtres par colonne (contient, égal,
  vide / non vide, plages pour nombres et dates détectés), tri, pagination 25/50/100, colonnes
  visibles, compteur « X résultats sur Y ».
- Fiche détail d'une ligne.
- Croisement de deux bases : intersection, tout A, différence (dans A pas dans B) ; colonnes
  préfixées A. / B.
- Export CSV du résultat filtré.
- Stack imposée : Next.js App Router, TypeScript, Tailwind, shadcn/ui ; lecture via l'API Google
  Sheets v4 depuis une route serveur (clé API côté serveur). Pas de connecteur tiers.
- Interface en français, clair / sombre, responsive.

## Evidence on Hand

Seulement des données de test 100 % fictives (`sample-data/*.csv`, domaines @example.com). Aucun
client, chiffre ou témoignage réel : rien de tel ne doit être inventé dans l'interface.

## Product Principles

1. Retrouver une personne est le chemin le plus court de l'app.
2. Un croisement s'explique de lui-même : on voit sur quelle clé et pourquoi deux lignes
   correspondent.
3. Lisible avant d'être dense : on travaille longtemps sur ces tableaux.
4. Sobre : rien de décoratif ne doit gêner le travail sur les données.
5. Aucune hypothèse sur les colonnes : tout se découvre dans le Sheet.

## Accessibility & Inclusion

Aucune exigence propre au produit n'a été fixée au-delà du socle (contraste, clavier, focus).
