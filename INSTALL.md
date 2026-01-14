# Installation détaillée

## Prérequis

- Node.js 20+
- npm 9+
- Docker + Docker Compose (optionnel)

## Configuration

Copier le fichier d'environnement et ajuster les variables :

```bash
cp .env.example .env
```

Variables clés :

- `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` : identifiants de l'administrateur initial.
- `JWT_SECRET` : secret de signature des tokens.
- `DB_PATH` : chemin de la base SQLite (par défaut `./data/data.sqlite`).

## Lancement avec Docker (recommandé)

```bash
docker compose up --build
```

- Frontend : http://localhost:5173
- Backend : http://localhost:4000/api

## Lancement en local (sans Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

Le backend écoute sur `http://localhost:4000`.

### Frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend écoute sur `http://localhost:5173` et consomme l'API à l'adresse `http://localhost:4000/api`.

## Notes

- L'utilisateur administrateur est automatiquement créé au démarrage du backend.
- Les données sont stockées dans SQLite et persistées via le volume Docker `backend-data`.
