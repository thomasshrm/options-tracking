# Installation & Lancement

## Prérequis
- Docker + Docker Compose

## Variables d'environnement
Les variables sont gérées dans le `docker-compose.yml` pour le MVP.

### Backend
- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_USERNAME`

### Frontend
- `VITE_API_URL`

## Création du compte admin (seed)
Au démarrage du backend, un utilisateur admin est créé automatiquement si aucun admin n'existe.
Les identifiants sont définis via `ADMIN_EMAIL` et `ADMIN_PASSWORD`.

## Lancement Docker Compose
```bash
docker compose up --build
```

## Accès aux services
- Frontend : http://localhost:5173
- Backend : http://localhost:4000
- PostgreSQL : localhost:5432

## Commandes utiles
- Arrêter les services :
  ```bash
  docker compose down
  ```
- Relancer en reconstruisant :
  ```bash
  docker compose up --build
  ```

## Reset de la base
```bash
docker compose down -v
```
