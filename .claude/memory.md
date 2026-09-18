# Mémoire projet — DentalSoft

> Point d'entrée rapide pour tout agent. Les règles complètes vivent dans `AGENTS.md` et `docs/` — ne pas dupliquer ici, seulement les leçons durables.

## Quirks d'environnement (Windows)

- Le shell hôte **tue les processus enfants non détachés** : toujours lancer le serveur via `dev-start.bat` (`cmd /c "start /min dev-start.bat"`) ou `node dist/index.cjs` en prod. Ne jamais utiliser `Start-Process -NoNewWindow`.
- L'erreur `Unknown: ChildProcess.kill` du shell est bénigne mais peut tuer des enfants : toujours vérifier l'effet dans une commande séparée.
- Tuer les processus node **par PID ciblé**, jamais globalement : d'autres projets (ex. `ecommerce-ai-builders`) tournent sur cette machine.
- Pas de `&&` ni `head` ni `rg` — PowerShell 5.1.

## État & décisions

- Design system actuel : **Liquid Glass Azur** (sky #0EA5E9, CTA ambre #FBBF24, police Lato) — voir `client/src/index.css`.
- `.env` détracké + rotaté (Postgres 18 local). Ne jamais re-commiter.
- Boucle de vérification : `npx tsc --noEmit` → `npm test` → `npm run build` → redémarrage → HTTP 200 sur `http://localhost:5000`.

## Régressions connues couvertes par tests

- `shared/schema.ts` : âge patient négatif rejeté (`.min(0)`) — voir `tests/schema.test.ts`, cas reproduit dans `evals/core-flows.eval.md`.
