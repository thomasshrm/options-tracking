# Options Tracking MVP

## Présentation du projet
Options Tracking est une application MVP permettant de suivre ses positions d'options, d'analyser ses performances et de gérer un portefeuille de stratégies options.

## Fonctionnalités principales
- Authentification JWT (inscription / connexion)
- Gestion des rôles (user / admin)
- CRUD de positions options
- Dashboard de performance basique
- Panneau d'administration pour gérer les comptes
- Conteneurisation complète via Docker

## Stack technique
- Backend: Node.js, Express.js, Drizzle ORM, PostgreSQL, Zod
- Frontend: React (Vite), Bootstrap, Context API
- Conteneurisation: Docker & Docker Compose

## Architecture globale
```
frontend (React)  --> backend (Express) --> database (PostgreSQL)
```

## Schéma simplifié
```
[Utilisateur] -> [Frontend React] -> [API Express] -> [PostgreSQL]
```

## Lancement rapide (TL;DR)
```bash
docker compose up --build
```
Frontend: http://localhost:5173
Backend: http://localhost:4000

Consultez [INSTALL.md](INSTALL.md) pour les prérequis et la configuration détaillée.

## Documentation
- [INSTALL.md](INSTALL.md)
- [SPECIFICATIONS.md](SPECIFICATIONS.md)
