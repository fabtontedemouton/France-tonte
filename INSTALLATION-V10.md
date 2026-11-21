# Shearing France WORLD V10 — kit d'intégration

## Choix retenus
- Interface WORLD en français et anglais.
- Classement mondial et vues par pays.
- Fenêtre glissante de 52 semaines (364 jours).
- Discipline : tonte machine.
- Import de résultats CSV et dépôt de sources publiques.
- Validation humaine obligatoire avant intégration des résultats.

## Important : ce que fait cette première V10
Le module ajoute un espace WORLD et une file partagée de validation. Il accepte des liens publics et des fichiers CSV structurés. Il ne lance PAS encore un robot qui aspire automatiquement les sites, Facebook ou d'autres réseaux : chaque source nécessitera un connecteur dédié et les autorisations d'accès correspondantes. Cette étape évite de promettre une collecte automatique qui ne serait pas techniquement fiable.

Le classement provisoire reprend les indicateurs déjà utilisés par l'application : victoires, podiums, nombre de concours. Il n'invente pas de barème de points officiel. La formule définitive devra être validée avant publication d'un classement mondial officiel.

## Installation

1. Télécharge et sauvegarde une copie de ton dépôt actuel.
2. Dans Supabase > SQL Editor, exécute `supabase-world-v10.sql`.
3. Dans `index.html`, repère la ligne :
   `window.sfQueueSync=()=>{if(session&&client)sync();};`
4. Insère le contenu de `supabase-world-v10-hook.js` juste AVANT cette ligne, à l'intérieur du même bloc `<script>` Supabase.
5. Juste avant `</body>` dans `index.html`, ajoute :
   `<script src="world-v10.js"></script>`
6. Ajoute `world-v10.js` à la racine du dépôt GitHub.
7. Déploie et teste d'abord avec un compte administrateur.

## Format CSV attendu

Colonnes obligatoires : `name` et `rank` (ou `nom` et `place`).

Colonnes facultatives : `country`, `event`, `date`, `city`, `category`, `points`, `url`.

Exemple :

```csv
name,country,event,date,city,category,rank,points,url
Jean Dupont,France,Open de démonstration,2026-06-15,Poitiers,Open,1,45,https://example.org/resultats
Jane Smith,New Zealand,Open de démonstration,2026-06-15,Poitiers,Open,2,38,https://example.org/resultats
```

## Contrôles à faire après installation
- Vérifier que les anciennes pages, profils et résultats fonctionnent toujours.
- Se connecter avec un compte administrateur.
- Envoyer un CSV test et vérifier qu'il apparaît dans la file.
- Valider le CSV et vérifier que les résultats sont ajoutés puis synchronisés.
- Vérifier qu'un compte membre ne peut pas valider ou refuser une source.
- Vérifier le classement sur 52 semaines et les pays.

## Limites connues de cette première livraison
- La traduction anglais/français couvre l'espace WORLD ajouté, pas encore toutes les anciennes rubriques.
- Les résultats importés sont rattachés à une compétition à partir du nom et du pays ; vérifier les doublons avant validation.
- Le classement actuel est un classement provisoire par victoires, podiums et participations, pas un barème mondial officiel pondéré.
- Les sources web sont proposées par les membres et contrôlées par l'administrateur ; les connecteurs automatiques par organisme seront développés ensuite.
