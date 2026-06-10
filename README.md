# Snake Game — Frontend

Interface React + GSAP du jeu Snake Évolution. Communique avec le backend FastAPI pour les scores, niveaux et leaderboard.

---

## Stack

- **React 18** + Vite
- **GSAP 3** — animations du serpent, slow-motion, effets power-up
- **Zustand** — state management global
- **Axios** — appels REST vers le backend

---
---

## Installation

```bash
cd snakegame/front

npm install
```

---

## Lancement

```bash
# Mode développement
npm run dev
# → http://localhost:5173

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

> Le backend FastAPI doit tourner sur `http://localhost:8000` pour les scores et niveaux.
> Si le backend est absent, le jeu démarre quand même en **mode hors-ligne** avec une config de fallback.

---

## Contrôles

| Touche | Action |
|---|---|
| `↑ ↓ ← →` | Diriger le serpent |
| `W A S D` | Diriger le serpent |
| `ESC` ou `P` | Pause / Reprendre |
| `Entrée` | Valider le pseudo (menu) |

> Les touches `W A S D` sont automatiquement **désactivées quand le focus est sur un champ de saisie**

---

## Écrans

### Menu
- Saisie du pseudo — créé automatiquement côté backend si nouveau
- Légende des 5 power-ups avec images
- Leaderboard top 5 (chargé depuis l'API)

### Jeu
- Grille 20×20 en damier pixel art
- HUD : score animé, niveau, stade d'évolution, vies, timer power-up actif
- Pause avec overlay

### Game Over
- Cause de mort (mur / collision corps / crânes)
- Stats complètes : score, niveau, durée, longueur, détail par food
- Boutons Rejouer et Menu

---

## Power-ups

| Image | Nom | Effet jeu | Effet GSAP |
|---|---|---|---|
| `apple.svg` | Pomme | +1 segment, +10 pts | — |
| `gold.svg` | Or | +1 segment, +30 pts, ×1.6 vitesse 5s | — |
| `blue.svg` | Bleu | +1 segment, +20 pts, slow-mo 5s | `gsap.globalTimeline.timeScale(0.4)` |
| `red.svg` | Rouge | +1 segment, +25 pts, traverser 1 mur | — |
| `skull.svg` | Crâne | −3 segments, −15 pts | `animateScreenShake` |

---

## Stades d'évolution

| Stade | Longueur | Couleur serpent |
|---|---|---|
| Larve | 1 – 7 segments | Vert `#3ddc84` |
| Serpent | 8 – 14 segments | Vert vif `#5efa8a` |
| Dragon | 15+ segments | Or `#ffd700` + dégradé |

---

## Communication avec le backend

| Action | Appel API |
|---|---|
| Connexion / création joueur | `GET /players/username/:name` ou `POST /players/` |
| Charger la config d'un niveau | `GET /levels/:number` |
| Soumettre le score en fin de partie | `POST /scores/` |
| Charger le leaderboard | `GET /scores/leaderboard?limit=5` |

Le proxy Vite redirige `/api/*` → `http://localhost:8000/*` — aucun CORS à gérer en développement.

---