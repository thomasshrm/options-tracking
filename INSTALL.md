# INSTALLATION

## Prérequis
- Docker + Docker Compose
- (Optionnel) Node.js 20+ si vous souhaitez lancer les services en local sans Docker

## Variables d'environnement
Copiez le fichier `.env.example` puis adaptez les valeurs :
```bash
cp .env.example .env
```

Variables clés :
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL` (utilisée par le backend)
- `JWT_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`
- `VITE_API_URL` (utilisée par le frontend)

## Création du compte admin (seed)
Au démarrage du backend, un compte admin est créé automatiquement si aucune entrée ne correspond à `ADMIN_EMAIL`.

## Lancement Docker Compose
```bash
docker compose up --build
```

## Accès frontend / backend
- Frontend : http://localhost:5173
- Backend : http://localhost:4000

## Commandes utiles
```bash
# Arrêter les services
docker compose down

# Relancer les services
docker compose up --build
```

## Reset de la base
```bash
docker compose down -v
```
