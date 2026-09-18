# Evals — scénarios de non-régression

Chaque scénario est exécutable manuellement ou via `npm test` quand automatisable.
Statut attendu documenté de façon déterministe (HTTP + état base).

## 1. Validation patient — âge négatif

- **Étapes** : login admin → `POST /api/patients` avec `{ "name": "Test", "age": -3, "gender": "Homme" }`
- **Attendu** : HTTP **400**, aucune ligne créée en base
- **Automatisé** : `tests/schema.test.ts` (« rejette un âge négatif »)

## 2. Authentification

- **Étapes** : `POST /api/auth/login` avec identifiants seed (`admin`/`admin123`)
- **Attendu** : HTTP **200** avec `{ token, user }` ; mauvais mot de passe → HTTP **401**
- **Automatisé** : partiellement (`tests/auth.test.ts` couvre hash/JWT, pas la route)

## 3. Cycle produit inventaire

- **Étapes** : créer produit (stock 2, min 5) → vérifier apparition dans `/api/inventory/products` et dans low-stock
- **Attendu** : produit créé puis listé comme alerte stock faible
- **Automatisé** : non — à couvrir via test d'intégration

## 4. Ajustement de stock

- **Étapes** : `POST` ajustement entrée quantité N sur produit existant
- **Attendu** : `currentStock` incrémenté de N ; mouvement journalisé
- **Automatisé** : non — à couvrir

## Règles

- Un eval sans statut déterministe ne compte pas.
- Tout bug corrigé doit ajouter son cas ici ET son test automatisé si possible.
