---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/landing"]
---

# Surface brief — landing (app/page.tsx)

Scope : la page d'accueil publique « / » : une barre, une hero, un pied de page ; rien d'autre (demande explicite). Mode : Persuade. Le back office vit sur /app et garde son propre brief.
Audience : l'équipe opérationnelle qui croise des fichiers de contacts. Action : « Connecter un Google Sheet » ouvre le formulaire d'ajout existant ; un lien valide (fichier partagé, onglet non vide) enregistre la base et ouvre /app. Secondaire : « Essayer avec la démo » (4 bases fictives, si le serveur les sert).
Contraintes confirmées : aucune notion de compte ni de connexion utilisateur ; pied de page « Un produit Hevolue » ; aucun client, chiffre ou témoignage inventé.

## Direction contract

THESIS: une hero éditoriale calme qui montre le vrai produit en vidéo (coller un lien, chercher, fiche, croisement) ; direction imposée par l'utilisateur (référence fournie) ; refuse les sections empilées et la preuve inventée.
OWN-WORLD: crème chaud, encre brun-noir, serif de titre (Newsreader) avec un mot en italique, petites étiquettes en chasse fixe (Geist Mono), bouton noir arrondi et bouton contour blanc, monogramme en cellules ; une vidéo de démonstration dans une figure arrondie de 8px, légende et mention « Données fictives ».
STORY: le visiteur comprend qu'un lien suffit, regarde la démo de 30 secondes enregistrée sur l'application réelle, puis connecte son Sheet ou essaie la démo.
FIRST VIEWPORT: barre (monogramme + nom en serif, lien « Voir la démo », pastille noire « Connecter un Sheet ») ; titre centré « Collez un lien de Sheet, / trouvez les bonnes données » sans surtitre, description humaine, deux boutons, rangée A B C D ; le haut de la vidéo entre dans le premier écran.
FORM: direction imposée par l'utilisateur (référence fournie), seed:7122889516c1445d. Mouvement : la vidéo de démonstration en boucle, sans son, en pause si mouvement réduit. Pied : © année courante, « Un produit Hevolue » vers https://hevolue.com/.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
