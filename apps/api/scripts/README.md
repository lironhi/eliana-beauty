# Database Backup & Restore Scripts

## Overview

Scripts pour sauvegarder et restaurer la base de données de l'application Eliana Beauty.

## Scripts disponibles

### 1. Backup (Sauvegarde)

Crée une sauvegarde complète de toutes les données de la base de données au format JSON.

```bash
cd apps/api
pnpm db:backup
```

**Fonctionnalités:**
- Sauvegarde toutes les tables (users, categories, services, appointments, etc.)
- Crée un fichier JSON avec timestamp
- Affiche un résumé des données sauvegardées
- Conserve automatiquement les 10 dernières sauvegardes
- Supprime automatiquement les anciennes sauvegardes

**Format du fichier:**
- `backup_YYYY-MM-DDTHH-MM-SS.json`
- Exemple: `backup_2025-11-05T08-00-49.json`

**Emplacement:**
- `apps/api/backups/`

### 2. Restore (Restauration)

Restaure la base de données à partir d'une sauvegarde.

```bash
cd apps/api
pnpm db:restore
```

**Options:**
- Sans argument: utilise la sauvegarde la plus récente
- Avec numéro: `pnpm db:restore 2` (utilise la 2ème sauvegarde de la liste)

**⚠️ ATTENTION:**
- Cette opération **SUPPRIME TOUTES LES DONNÉES ACTUELLES**
- Une confirmation est demandée avant de procéder
- Tapez `yes` pour confirmer

**Processus:**
1. Affiche la liste des sauvegardes disponibles
2. Demande confirmation
3. Supprime toutes les données actuelles
4. Restaure les données depuis le backup
5. Affiche un résumé de la restauration

## Données sauvegardées

Le backup inclut toutes les tables:
- ✅ Users (utilisateurs)
- ✅ Refresh Tokens
- ✅ Categories (catégories de services)
- ✅ Services
- ✅ Service Images
- ✅ Staff (personnel)
- ✅ Staff Services (relations personnel-services)
- ✅ Working Hours (heures de travail)
- ✅ Time Offs (congés)
- ✅ Appointments (rendez-vous)

## Exemples d'utilisation

### Créer une sauvegarde avant une mise à jour

```bash
cd apps/api
pnpm db:backup
# ✅ Backup completed successfully!
# 📊 Backup size: 18.47 KB
# 📁 Location: apps/api/backups/backup_2025-11-05T08-00-49.json
```

### Restaurer après un problème

```bash
cd apps/api
pnpm db:restore

# 📋 Available backups:
#   1. backup_2025-11-05T08-00-49.json (18.47 KB) - 5/11/2025, 09:00:49
#   2. backup_2025-11-04T14-30-22.json (17.82 KB) - 4/11/2025, 15:30:22
#
# ⚠️  No backup specified, using most recent: backup_2025-11-05T08-00-49.json
#
# ⚠️  WARNING: This will DELETE all current data and restore from backup.
# Are you sure? (yes/no): yes
#
# 🔄 Starting database restore...
# ✅ Database restored successfully!
```

### Restaurer une sauvegarde spécifique

```bash
cd apps/api
pnpm db:restore 2  # Restaure la 2ème sauvegarde de la liste
```

## Bonnes pratiques

1. **Sauvegarde régulière:**
   - Créez un backup avant toute migration de base de données
   - Créez un backup avant toute modification importante
   - Sauvegardez quotidiennement si possible

2. **Avant des tests:**
   - Créez toujours un backup avant de tester des fonctionnalités qui modifient beaucoup de données

3. **Gestion des backups:**
   - Les 10 dernières sauvegardes sont conservées automatiquement
   - Les anciennes sauvegardes sont supprimées automatiquement
   - Pour conserver un backup important, copiez-le dans un autre dossier

4. **Sauvegarde externe:**
   - Copiez régulièrement le dossier `backups/` vers un stockage externe
   - Utilisez un système de version control (Git) pour les backups critiques (attention aux données sensibles!)

## Scripts alternatifs (PostgreSQL natif)

Si vous avez `pg_dump` et `psql` installés:

### Backup SQL natif
```bash
cd apps/api
node scripts/backup-db.js
```

### Restore SQL natif
```bash
cd apps/api
node scripts/restore-db.js
```

Ces scripts créent des backups au format SQL (.sql) au lieu de JSON.

## Dépannage

### Erreur: "No backups directory found"
- Le dossier backups sera créé automatiquement lors du premier backup

### Erreur: "Cannot find module"
- Assurez-vous d'être dans le bon dossier: `cd apps/api`
- Installez les dépendances: `pnpm install`

### La restauration échoue
- Vérifiez que le fichier de backup n'est pas corrompu
- Assurez-vous que la base de données est accessible
- Vérifiez les logs pour plus de détails

## Notes techniques

- Les backups sont au format JSON pour faciliter l'inspection
- Les données sont stockées avec leurs IDs originaux
- L'ordre de restauration respecte les dépendances entre tables
- Les timestamps sont en format ISO 8601
