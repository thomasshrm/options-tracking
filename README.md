# Options Tracking MVP

Application MVP pour suivre des positions de trading d'options, analyser les performances et gérer un portefeuille de stratégies options.

## Fonctionnalités principales
- Authentification (inscription / connexion) avec JWT
- Gestion des utilisateurs (rôles, activation/désactivation)
- CRUD des positions options (ouverture, modification, fermeture, suppression soft)
- Dashboard de performance basique
- Panneau d'administration
- Conteneurisation complète via Docker

## Stack technique
- Backend : Node.js, Express, Drizzle ORM, PostgreSQL, JWT, Zod
- Frontend : React + Vite, Bootstrap, Context API
- Infra : Docker + Docker Compose

## Architecture globale
```
frontend (React) --> backend (Express API) --> database (PostgreSQL)
```

## Schéma simplifié
```
[Utilisateur] -> [Frontend Vite] -> [Backend Express] -> [PostgreSQL]
```

## Lancement rapide (TL;DR)
```bash
docker compose up --build
```

## Liens utiles
- [INSTALL.md](./INSTALL.md)
- [SPECIFICATIONS.md](./SPECIFICATIONS.md)
