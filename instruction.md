# Banana Factory — Mon projet de stage

**Guide complet pour présenter TON jeu :** lis **`mon-jeu.md`** — tout y est expliqué (écran par écran, règles, code, questions au stage).

## Règles du projet

- Pas de framework — uniquement **HTML, CSS et JavaScript**.
- Les choix de design (prix, améliorations, bonus…) sont dans **`commentaire.md`** (le pourquoi).
- **Tout ce qui est dans le jeu** est expliqué dans **`mon-jeu.md`** (pour toi, au stage).
## Concept du jeu

**Jeu incrémental** sur le thème de la banane, pour l'entreprise **Banana Factory** — l'entreprise où tu fais ton **stage d'observation de seconde**.

- Tu commences petit (cliquer sur la **banane** du logo **Las Bananas**, équipe de hockey roller).
- Tu progresses en achetant des améliorations (usine, ouvriers, machines…).
- Plus tu avances, plus tu produis — même sans cliquer tout le temps.

## État actuel

**Jeu codé et jouable.** Ouvre `index.html` dans ton navigateur.

## Fichiers du projet

```
banana_project/
├── index.html          ← Page du jeu
├── style.css           ← Apparence
├── script.js           ← Logique (commenté)
├── mon-jeu.md          ← TOUT expliqué (pour présenter au stage)
├── commentaire.md      ← Pourquoi on a choisi telle option
├── instruction.md      ← Ce fichier (résumé)
└── images/
    ├── logo-las-bananas-complet.png
    └── banane.png
```

## Comment jouer

1. Double-clique sur **`index.html`**
2. Sur l'**écran d'accueil**, clique **▶ Jouer**
3. Clique sur la **banane** pour produire
4. Achète des **améliorations** à droite
5. Attrape les **bananes dorées** quand elles apparaissent
6. Ouvre **🏆 Trophées** pour voir tes secrets débloqués

La partie est **sauvegardée** automatiquement dans le navigateur.

## Améliorations (proposition retenue)

**6 améliorations** — détails et explications dans `commentaire.md`.

| # | Nom | Prix | Effet |
|---|-----|------|-------|
| 1 | Stagiaire | 15 | +0,1 / sec |
| 2 | Ouvrier | 75 | +0,5 / sec |
| 3 | Convoyeur | 250 | +2 / sec |
| 4 | Machine à peler | 1 000 | +8 / sec |
| 5 | Camion livraison | 5 000 | +30 / sec |
| 6 | Agrandir l'usine | 25 000 | ×2 sur tout |

**Disposition** : banane à gauche, liste d'achats à droite, score en haut.

## Extras (proposition)

| Fonctionnalité | Détail |
|----------------|--------|
| **Écran d'accueil** | Menu avec bouton ▶ Jouer avant le jeu |
| Banane dorée | Apparaît aléatoirement, bonus si clic à temps |
| Bonus de clic | Frénésie ×5, Pluie +50, Prod ×2, Main magique |
| Trophées secrets | 6 trophées cachés, panneau 🏆 |

Explications : écran d'accueil → `commentaire.md` + `mon-jeu.md` · reste → `commentaire.md`

## Prochaine étape

Amuse-toi, modifie le code, et demande si tu veux ajouter des features !
