# Options Tracking MVP

## Présentation du projet
Options Tracking est une application MVP destinée aux investisseurs particuliers qui souhaitent suivre leurs positions d'options, analyser leurs performances et gérer leurs stratégies (Cash Secured Put, Covered Call, Naked Call/Put, etc.).

## Fonctionnalités principales
- Authentification JWT (inscription / connexion)
- Gestion des utilisateurs et rôles (user / admin)
- CRUD des positions d'options
- Dashboard de performance (PnL total, win rate, positions ouvertes, répartition par stratégie)
- Panneau d'administration (activation, rôles, suppression)
- Conteneurisation complète Docker

## Stack technique
- **Backend** : Node.js, Express.js, Drizzle ORM, PostgreSQL, JWT, Zod
- **Frontend** : React (Vite), Bootstrap, Context API
- **Infra** : Docker & Docker Compose

## Architecture globale
```
frontend (React/Vite)  --->  backend (Express/Drizzle)  --->  database (PostgreSQL)
```

## Schéma simplifié
```
[Browser] -> [Frontend] -> [Backend API] -> [PostgreSQL]
```

## Lancement rapide (TL;DR)
```bash
cp .env.example .env

docker compose up --build
```

Accès :
- Frontend : http://localhost:5173
- Backend : http://localhost:4000

## Documentation
- [INSTALL.md](INSTALL.md)
- [SPECIFICATIONS.md](SPECIFICATIONS.md)
