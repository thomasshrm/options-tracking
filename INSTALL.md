# Guide d'installation

## Prérequis
- Docker & Docker Compose
- Node.js 20+ (optionnel pour un lancement local sans Docker)

## Variables d'environnement
Les valeurs suivantes peuvent être ajustées dans votre `.env` à la racine du repo si besoin :

```
JWT_SECRET=change_me
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

Le backend expose également un fichier d'exemple: `backend/.env.example`.
Le frontend expose également un fichier d'exemple: `frontend/.env.example`.

## Création du compte admin (seed)
Un compte administrateur est créé automatiquement au démarrage du backend avec les variables :
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Lancement Docker Compose
```bash
docker compose up --build
```

## Accès aux services
- Frontend : http://localhost:5173
- Backend : http://localhost:4000

## Commandes utiles
Rebuild complet :
```bash
docker compose up --build
```

Arrêt des services :
```bash
docker compose down
```

## Reset de la base
```bash
docker compose down -v
```
