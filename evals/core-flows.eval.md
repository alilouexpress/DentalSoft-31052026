# Evals — scénarios de non-régression

Chaque scénario est exécutable manuellement ou automatiquement :
- `npm test` → tests unitaires (16) — tourne en CI (sans base de données).
- `npm run test:int` → tests d'intégration (15) sur la vraie API + base Postgres locale — **hors CI** (nécessite `.env` avec `DATABASE_URL`).
Statut attendu documenté de façon déterministe (HTTP + état base).

## 1. Validation patient — âge négatif

- **Étapes** : login admin → `POST /api/patients` avec `{ "name": "Test", "age": -3, "gender": "Homme" }`
- **Attendu** : HTTP **400**, aucune ligne créée en base
- **Automatisé** : `tests/schema.test.ts` (« rejette un âge négatif ») + `tests/integration/patient.int.ts` (400 + absence de ligne via API réelle)

## 2. Authentification

- **Étapes** : `POST /api/auth/login` avec identifiants seed (`admin`/`admin123`)
- **Attendu** : HTTP **200** avec `{ token, user }` ; mauvais mot de passe → HTTP **401**
- **Automatisé** : `tests/auth.test.ts` (hash/JWT) + `tests/integration/auth.int.ts` (route réelle : 200/401/400, `/api/auth/me` avec et sans token)

## 3. Cycle produit inventaire

- **Étapes** : créer produit (stock 2, min 5) → vérifier apparition dans `/api/inventory/products` et dans low-stock
- **Attendu** : produit créé puis listé comme alerte stock faible
- **Automatisé** : `tests/integration/inventory.int.ts` (création → présent dans `/products` et `/products/low-stock`)

## 4. Ajustement de stock

- **Étapes** : `POST` ajustement entrée quantité N sur produit existant
- **Attendu** : `currentStock` incrémenté de N ; mouvement journalisé
- **Automatisé** : `tests/integration/inventory.int.ts` (entrée incrémente + mouvement journalisé ; sortie décrémente ; quantité non positive → 400)

## Règles

- Un eval sans statut déterministe ne compte pas.
- Tout bug corrigé doit ajouter son cas ici ET son test automatisé si possible.
