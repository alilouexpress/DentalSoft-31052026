# Politique de sécurité — DentalSoft

## Signalement

Signaler toute vulnérabilité directement au mainteneur : **@alilouexpress** (issue privée ou contact direct). Ne pas ouvrir d'issue publique pour un problème de sécurité.

## Périmètre

Application EMR local-first (cabinet dentaire) : serveur Express + PostgreSQL, client React. Aucun service cloud au runtime.

## Règles de gestion des secrets

- `.env` est **gitignoré** et ne doit jamais être commité ni poussé.
- Le mot de passe Postgres a été rotaté après une exposition historique ; l'ancienne valeur dans l'historique GitHub est invalide.
- Toute nouvelle exposition impose : rotation immédiate + purge d'historique si nécessaire.
- Les logs (`*.log`, `dev-server.log`) sont gitignorés — ne jamais y écrire de secrets.

## Garde-fous agents IA

- Hook preflight `.claude/hooks/guard.js` bloque les commandes destructrices (format, suppression récursive racine).
- Interdits par convention : force-push non approuvé, commit de secrets, dépendances cloud/SaaS.
