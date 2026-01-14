# Options Tracking (MVP)

MVP pour suivre des positions de trading d'options. L'application permet l'inscription, la connexion et la gestion de positions (Cash Secured Put, Covered Call, Naked Call, Naked Put, etc.), avec un tableau de bord de performance et un panneau d'administration.

## Fonctionnalités clés

- Authentification (inscription, connexion, sessions via JWT).
- Panneau d'administration pour activer/désactiver les comptes et changer les rôles.
- Gestion des positions (ouvrir, clôturer, supprimer).
- Dashboard de performance (total positions, ouvertes, clôturées, PnL total).
- Thème Bootstrap.

## Stack technique

- **Backend** : Node.js + Express + SQLite (better-sqlite3).
- **Frontend** : Vite + React + Bootstrap.
- **Conteneurisation** : Docker Compose (frontend + backend).

## Démarrage rapide (Docker)

1. Copier le fichier d'environnement et ajuster les secrets :

```bash
cp .env.example .env
```

2. Lancer les services :

```bash
docker compose up --build
```

3. Accéder à l'application :

- Frontend : http://localhost:5173
- API : http://localhost:4000/api/health

> L'utilisateur administrateur est automatiquement créé à partir des variables `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.

## Documentation

- Voir [INSTALL.md](./INSTALL.md) pour les instructions d'installation détaillées.
