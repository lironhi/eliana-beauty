# ✅ Configuration Terminée - Démarrage du Projet

## 🎉 Ce qui a été corrigé

- ✅ Docker Desktop est maintenant actif
- ✅ Port changé de 5432 → 5433 (évite conflit avec PostgreSQL local)
- ✅ Fichiers `.env` créés avec le bon port
- ✅ Projet prêt à démarrer

---

## 🚀 Commandes à Exécuter (dans l'ordre)

### 1️⃣ Démarrer PostgreSQL dans Docker
```powershell
pnpm db:up
```

**Résultat attendu :**
```
✔ Network eliana-beauty_default       Created
✔ Volume eliana-beauty_postgres_data  Created
✔ Container eliana-beauty-db          Started
```

---

### 2️⃣ Initialiser la Base de Données
```powershell
cd apps\api
pnpm prisma:generate
pnpm db:push
pnpm db:seed
cd ..\..
```

**Ce que fait chaque commande :**
- `prisma:generate` → Génère le client Prisma TypeScript
- `db:push` → Crée les tables dans PostgreSQL
- `db:seed` → Insère les données de test (catégories, services, staff, admin)

**Résultat attendu du seed :**
```
✅ Admin user created: admin@eliana.beauty
✅ Staff member created: Eliana
✅ Categories created
✅ Nails services created
✅ Brows service created
✅ Working hours created (Sun-Thu, 9:00-18:00)
🎉 Seed completed successfully!
```

---

### 3️⃣ Lancer l'Application en Développement
```powershell
pnpm dev
```

**Résultat attendu :**
```
• web:dev: VITE ready in XXXms
• web:dev: ➜ Local: http://localhost:5173/
• api:dev: 🚀 API running on http://localhost:3001
```

---

## 🌐 Accéder à l'Application

Une fois `pnpm dev` lancé :

- **Application Web** : http://localhost:5173
- **API** : http://localhost:3001
- **Health Check** : http://localhost:3001/health

---

## 🔑 Compte de Test

**Admin :**
- Email : `admin@eliana.beauty`
- Mot de passe : `admin123`

**Ou créez votre propre compte :**
- Cliquez sur "Register" dans le header
- Remplissez le formulaire
- Vous serez automatiquement connecté

---

## ✨ Fonctionnalités à Tester

### 1. Parcourir les Services
- Page d'accueil : voir les catégories
- Cliquez sur "Book Now" ou "Services"
- Explorez les services disponibles

### 2. Créer une Réservation
- Cliquez sur un service
- Sélectionnez un membre du staff (Eliana)
- Choisissez une date (aujourd'hui ou future)
- Sélectionnez un créneau horaire
- Connectez-vous ou créez un compte
- Confirmez la réservation

### 3. Gérer vos Réservations
- Allez dans "My Bookings"
- Voyez vos rendez-vous
- Annulez un rendez-vous

### 4. Changer de Langue
- Cliquez sur "עב" / "EN" dans le header
- L'interface passe en hébreu avec support RTL

---

## 📊 Structure du Projet

```
eliana-beauty/
├── apps/
│   ├── api/              ← Backend NestJS
│   │   ├── src/          ← Code source API
│   │   └── prisma/       ← Schéma DB + seed
│   └── web/              ← Frontend React
│       └── src/          ← Code source Web
├── SPECS/                ← Documents de spécifications
└── *.md                  ← Documentation
```

---

## 🛠️ Commandes Utiles

```powershell
# Développement
pnpm dev                  # Démarre API + Web
pnpm api:dev              # API seule
pnpm web:dev              # Web seule

# Base de données
pnpm db:up                # Démarre PostgreSQL
pnpm db:down              # Arrête PostgreSQL
pnpm db:seed              # Re-seed les données

# Qualité
pnpm lint                 # Vérifie le code
pnpm typecheck            # Vérifie TypeScript
pnpm test                 # Lance les tests

# Build production
pnpm build                # Build tout
```

---

## 🐛 Dépannage

### PostgreSQL ne démarre pas
```powershell
# Vérifier si le container existe
docker ps -a

# Voir les logs
docker logs eliana-beauty-db

# Redémarrer
pnpm db:down
pnpm db:up
```

### Port déjà utilisé
```powershell
# Tuer le processus sur le port
npx kill-port 3001        # API
npx kill-port 5173        # Web
npx kill-port 5433        # PostgreSQL
```

### Erreurs Prisma
```powershell
cd apps\api
pnpm prisma:generate
cd ..\..
```

### Réinitialiser la base de données
```powershell
pnpm db:down
docker volume rm eliana-beauty_postgres_data
pnpm db:up
cd apps\api && pnpm db:push && pnpm db:seed && cd ..\..
```

---

## 📚 Documentation Complète

- **[README.md](README.md)** - Documentation principale
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Guide de démarrage détaillé
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guide développeur
- **[DOCKER_SETUP_WINDOWS.md](DOCKER_SETUP_WINDOWS.md)** - Aide Docker Windows
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Vue d'ensemble du projet
- **[QUICK_START.txt](QUICK_START.txt)** - Résumé rapide

---

## 🎯 Prochaines Étapes

1. ✅ **Exécutez les commandes ci-dessus**
2. ✅ **Testez l'application**
3. ✅ **Explorez le code**
4. ✅ **Personnalisez selon vos besoins**

---

## 💡 Modifications Apportées

### Changement de Port
- **Ancien** : `localhost:5432` (conflit avec PostgreSQL local)
- **Nouveau** : `localhost:5433` (Docker isolé)

### Fichiers Créés
- `.env` (racine)
- `apps/api/.env`
- `apps/web/.env`

### Docker Compose Mis à Jour
- Ligne `version:` supprimée (obsolète)
- Port changé à `5433:5432`

---

## ✅ Checklist de Démarrage

- [ ] Exécuter `pnpm db:up`
- [ ] Exécuter `cd apps\api`
- [ ] Exécuter `pnpm prisma:generate`
- [ ] Exécuter `pnpm db:push`
- [ ] Exécuter `pnpm db:seed`
- [ ] Exécuter `cd ..\..`
- [ ] Exécuter `pnpm dev`
- [ ] Ouvrir http://localhost:5173
- [ ] Tester la création de compte
- [ ] Tester la réservation d'un service

---

**Tout est prêt ! Lancez les commandes et amusez-vous ! 🚀**
