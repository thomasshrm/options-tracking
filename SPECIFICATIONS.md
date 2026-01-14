# SPECIFICATIONS FONCTIONNELLES ET TECHNIQUES - MVP

## 1. Ojectifs de l'application
L'application permet à des utilisateurs de :
- suivre leurs positions de trading d'options, à l'achat ou à la vente
- analyser leurs performances
- gérer leur portefeuille de stratégies options

Elle s'adresse à des investisseurs particuliers pratiquant :
- Cash Secured Put
- Covered Call
- Naked Call
- Naked Put
- Long Call
- Long Put

## 2. Périmètre MVP
### Inclus
- Authentification (inscription / connexion)
- Gestion des utilisateurs
- Gestion des rôles (user / admin)
- CRUD de positions options
- Dashboard de performance basique
- Conteneurisation complète Docker

### Exclus (volontairement)
- Connexion à un broker réel
- Import automatique de trades
- Pricing temps réels
- Greeks en temps réel
- Fiscalité avancée

## 3. Types d'utilisateurs
### 3.1 Utilisateur standard
Peut :
- créer un compte
- se connecter
- gérer ses positions
- consulter son dashboard
- modifier ses informations personnelles (hors rôle)

### 3.2 Administrateur
- créé automatiquement au démarrage de l'application
- credentials stockés dans .env
- accès à un panneau d'administration
- peut :
    - activer / désactiver des comptes
    - modifier les rôles
    - supprimer des utilisateurs

## 4. Gestion des utilisateurs
### Données stockées 
```
- id
- username
- password (hashé)
- role (user | admin)
- is_active (bool)
- created_at
- updated_at
```

### Règles
- email unique
- mot de passe hashé (bcrypt ou équivalent)
- un utilisateur inactif ne peut pas se connecter
- seul un admin peut modifier le rôle d'un utilisateur

## 5. Authentification
- inscription classique
- connexion avec email + mot de passe
- authentification par JWT
- token stocké côté frontend (localStorage ou cookie - à ta guise)

## 6. Gestion des positions options
### 6.1 Types de positions supportées (enum)
```
- CASH_SECURED_PUT
- COVERED_CALL
- NAKED_CALL
- NAKED_PUT
- NAKED_PUT_SELLING
- NAKED_CALL_SELLING
```

### 6.2 Données d'une position
```
- id
- user_id
- symbol (ex: AAPL)
- position_type
- direction (LONG | SHORT)
- strike_price
- premium
- quantity
- expiration_date
- open_date
- close_date (nullable)
- status (OPEN | CLOSED)
- pnl_realized
- pnl_unrealized
```

### 6.3 Actions possibles
- ouvrir une position
- modifier une position (tant qu'elle est ouverte)
- fermer une position
- supprimer une position (soft delete)

##  7. Dashboard utilisateur (MVP)
### Indicateurs minimum
- PnL total
- PnL par mois
- nombre de positions ouvertes
- win rate (positions gagnantes / total)
- répartition par type de stratégie

## 8. Panneau d'administration
Fonctionnalités :
- liste des utilisateurs
- activation / désactivation
- changement de rôle
- suppression

## 9. Spécifications techniques
### Backend
- Node.js
- Framework: Express.js
- ORM: Drizzle
- DB: PostgreSQL
- Auth: JWT
- Validation: Zod

### Frontend
- Vite
- Framework: React
- UI: Bootstrap
- State: Context API (MVP)

## 10. Architecture Docker
### Services
```
- backend
- frontend
- database (postgres)
```
Chaque service a :
- son Dockerfile
- un réseau commun
- des variables d'environnement centralisées

## 11. Structure du repo
### README.md - Contenu attendu
- Présentation du projet
- Fonctionnalités principales
- Stack technique
- Architecture globale
- Schéma simplifié
- Lancement rapide (TL;DR)
- Liens vers INSTALL.md et SPECIFICATIONS.md

### INSTALL.md - Contenu attendu
- Prérequis
- Variables d'environnement
- Création du compte admin (seed)
- Lancement Docker Compose
- Accès frontend / backend
- Commandes utiles
- Reset de la base