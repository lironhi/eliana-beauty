# 🚀 Guide de Migration vers Supabase

## ✅ Pré-requis

- [ ] Compte Supabase créé sur [app.supabase.com](https://app.supabase.com)
- [ ] Projet Supabase créé
- [ ] Backup de la base de données actuelle effectué

---

## 📋 Étapes de Migration

### **1️⃣ Récupérer vos credentials Supabase**

1. Connectez-vous sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet **Eliana Beauty**
3. Allez dans **Settings** ⚙️ → **Database**
4. Trouvez la section **Connection string**
5. Cliquez sur **URI** (pas Transaction ou Session)
6. Copiez la chaîne de connexion

Elle ressemble à:
```
postgresql://postgres.XXXXX:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANT:** Si vous ne connaissez pas votre mot de passe:
- Cliquez sur **Reset Database Password**
- Notez le nouveau mot de passe
- Mettez-le dans votre DATABASE_URL

---

### **2️⃣ Backup de la base de données actuelle**

Avant de changer quoi que ce soit, exportez vos données:

```bash
cd apps/api
npx tsx scripts/export-data.ts
```

✅ Vérifiez que le fichier est créé dans `apps/api/backups/`

---

### **3️⃣ Mettre à jour `.env`**

1. **Créer un backup de votre `.env` actuel:**
```bash
cp apps/api/.env apps/api/.env.local.backup
```

2. **Modifier `apps/api/.env`:**

Remplacez la ligne `DATABASE_URL` par votre URL Supabase:

```env
# AVANT (Docker local)
DATABASE_URL="postgresql://eliana:eliana_dev_pass@localhost:5433/eliana_beauty"

# APRÈS (Supabase)
DATABASE_URL="postgresql://postgres.XXXXX:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

**Remplacez:**
- `XXXXX` → Votre ID de projet Supabase
- `[YOUR-PASSWORD]` → Votre mot de passe Supabase
- `aws-0-eu-central-1` → Votre région (visible dans l'URL)

---

### **4️⃣ Migrer le schéma vers Supabase**

```bash
cd apps/api

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations sur Supabase
npx prisma migrate deploy

# OU si migrate deploy ne fonctionne pas:
npx prisma db push
```

✅ Cela va créer toutes vos tables sur Supabase!

---

### **5️⃣ Importer les données (optionnel)**

Si vous voulez importer vos données actuelles sur Supabase:

```bash
cd apps/api

# Créer le script d'import (si vous avez exporté les données)
npx tsx scripts/import-data.ts
```

---

### **6️⃣ Tester la connexion**

```bash
cd apps/api

# Démarrer l'API
npm run dev
```

✅ Si l'API démarre sans erreur, la connexion fonctionne!

Testez en visitant: http://localhost:3001/health

---

### **7️⃣ Vérifier dans Supabase Dashboard**

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Ouvrez **Table Editor** 📊
3. Vous devriez voir toutes vos 16 tables:
   - users
   - refresh_tokens
   - categories
   - services
   - service_images
   - staff
   - staff_services
   - working_hours
   - time_offs
   - hour_blocks
   - appointments
   - messages
   - message_recipients
   - fcm_tokens
   - uploaded_images
   - payment_method_configs

---

## 🎉 Migration terminée!

Votre application utilise maintenant Supabase!

### **Avantages obtenus:**

✅ Base de données hébergée (pas besoin de Docker)
✅ Backups automatiques
✅ Interface web pour gérer les données
✅ Gratuit jusqu'à 500 MB
✅ Prêt pour le déploiement

---

## 🔧 Configuration pour Production

Quand vous déployez sur Render/Vercel/Railway, ajoutez simplement:

```env
DATABASE_URL=postgresql://postgres.XXXXX:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Dans les variables d'environnement de votre service.

---

## ⚠️ Troubleshooting

### **Erreur: "Can't reach database server"**

✅ Vérifiez que:
1. Votre URL est correcte (copié-collé depuis Supabase)
2. Le mot de passe est correct
3. Vous utilisez le **pooler** (port 6543) pas direct (5432)

### **Erreur: "SSL connection required"**

Ajoutez `?sslmode=require` à la fin de votre DATABASE_URL:

```
postgresql://...postgres?sslmode=require
```

### **Tables non créées**

Exécutez:
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

---

## 🔄 Revenir en arrière

Si vous voulez revenir à Docker local:

```bash
# Restaurer le backup
cp apps/api/.env.local.backup apps/api/.env

# Redémarrer Docker
docker-compose up -d

# Réappliquer les migrations
cd apps/api
npx prisma migrate deploy
```

---

## 📞 Support

En cas de problème, vérifiez:
1. [Documentation Supabase](https://supabase.com/docs/guides/database)
2. [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
