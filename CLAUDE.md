# Eliana Beauty — guide de contribution

Application de réservation pour un salon de beauté israélien. Monorepo Turbo + pnpm.

## Structure

- `apps/api` — NestJS 11, port 3001
- `apps/web` — React 19 + Vite 8, port 5173
- `docs/` — documentation historique (guides, roadmap, audits)
- `SPECS/` — spécifications fonctionnelles de référence

## Commandes

```bash
pnpm dev          # API + web via Turbo
pnpm typecheck    # tsc --noEmit sur les deux apps
pnpm test         # Jest (API uniquement pour l'instant)
pnpm build
npx eslint apps/api/src apps/web/src   # lint (flat config à la racine)

pnpm db:up        # PostgreSQL local via Docker (port 5433)
pnpm db:migrate   # prisma migrate dev
pnpm db:seed
```

Docker Desktop doit tourner avant `pnpm db:up` : sans base, l'API démarre puis
échoue à la première requête avec `ECONNREFUSED`.

## Prisma 7 — à savoir avant de toucher à la base

Prisma 7 a changé trois choses par rapport aux versions précédentes :

1. **L'URL de connexion n'est plus dans `schema.prisma`.** Elle vit dans
   `apps/api/prisma.config.ts` pour les migrations, et arrive au client
   d'exécution via un *driver adapter*.
2. **`PrismaClient` exige un adapter.** Ne jamais faire `new PrismaClient()`
   directement — passer par `createPrismaClient()` (scripts, seeds) ou
   `createPrismaAdapter()` (le service Nest), dans
   `apps/api/src/prisma/create-prisma-client.ts`.
3. **`.env` n'est plus chargé automatiquement.** Ce helper fait le
   `import 'dotenv/config'` ; `main.ts` aussi.

## Conventions

- **Bilingue EN/HE avec RTL.** Toute chaîne visible passe par
  `apps/web/src/i18n/locales/{en,he}.ts` (i18n maison, pas i18next). Les champs
  bilingues en base suivent le motif `name` / `nameHe`.
- **Prix en shekels** (`priceIls`), champ `priceFrom` pour les tarifs
  « à partir de ».
- Le mode de paiement par défaut d'un rendez-vous est `NOT_PAID`.
- Une réservation client est limitée à **1 mois à l'avance** (règle métier
  d'Eliana, couverte par un test).
- Prettier est en `endOfLine: "auto"` : le dépôt est en CRLF sous Windows, ne
  pas le normaliser sans ajouter un `.gitattributes`.
- `turbo.json` force `"ui": "stream"` — le TUI de Turbo 2 plante sous Windows.

## Build de l'API

`tsconfig.json` couvre `src/` **et** `prisma/` pour que les seeds et les specs
soient typecheckés. `nest build` utilise en revanche `tsconfig.build.json`, qui
se limite à `src/` hors specs : sans lui, tsc élargit le `rootDir` à la racine du
package, émet `dist/src/main.js` au lieu de `dist/main.js` — et `pnpm start`
casse — tout en embarquant les tests et les seeds dans le bundle de production.

## Déploiement

L'API a besoin d'un serveur Node qui tourne en continu (WebSocket Socket.io,
cron des rappels via `@nestjs/schedule`, pool Prisma persistant) : Render ou
équivalent, **pas** Vercel, qui ne fait que du serverless. Le front `apps/web`,
lui, est un build statique et va très bien sur Vercel comme sur Render.

Trois pièges rencontrés en production, tous déjà corrigés :

1. **`NODE_ENV=production` fait sauter les devDependencies à l'installation.**
   Or `prisma` et `@nestjs/cli` en font partie et sont nécessaires au build. La
   commande de build doit donc forcer leur installation :
   `pnpm install --prod=false && pnpm --filter api build`.
2. **Borner `engines.node`.** Un `>=20.19.0` non borné fait choisir la dernière
   version disponible à l'hébergeur (Node 26), que Prisma ne supporte pas. Le
   `.node-version` à la racine fixe Node 22.
3. **Le cookie de refresh est cross-site en production.** Front et API sont sur
   deux domaines différents, donc `SameSite=Strict` empêcherait le navigateur
   d'envoyer le cookie à `/auth/refresh`. `auth.controller.ts` bascule sur
   `SameSite=None` + `Secure` dès que `NODE_ENV=production`.

Le disque des hébergeurs gratuits est éphémère : `apps/api/uploads/` est perdu à
chaque redéploiement. À migrer vers Supabase Storage avant la mise en service.

## Pièges connus

- **Ne jamais créer de fichier nommé `nul`** (ni `con`, `aux`, `prn`) : ce sont
  des noms de périphériques réservés sous Windows. Git et Turbo échouent alors
  avec `I/O error: os error 1`. Utiliser `> /dev/null`, pas `> nul`.
- `apps/api/prisma/migrations` est dans le `.gitignore`. Les migrations ne sont
  donc pas versionnées, ce qui empêche un `prisma migrate deploy` en production.
  À corriger avant tout déploiement.
