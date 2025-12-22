# Data Safety Guide

## Your Data is Safe! ✅

**Database data is stored in a Docker volume** (`accountingmaster_pgdata`), which means:
- ✅ Data persists across container rebuilds
- ✅ Data persists across container restarts
- ✅ Data persists even if you delete and recreate containers
- ✅ Data is stored on your VM's disk, not in the container

## What Gets Updated vs What Stays Safe

### ✅ Safe (Persists):
- **All database data** (companies, customers, transactions, invoices, etc.)
- **User accounts and credentials**
- **All business records**

### 🔄 Gets Updated:
- **Application code** (new features, bug fixes)
- **Dependencies** (npm packages)
- **Built files** (compiled JavaScript/CSS)

## Safe Update Process

### Option 1: Use the Update Script (Recommended)

```bash
cd /opt/AccountingMaster
chmod +x update-app.sh
./update-app.sh
```

This script:
1. ✅ Creates automatic backup before updating
2. ✅ Verifies backup is valid
3. ✅ Updates only the app (database keeps running)
4. ✅ No downtime for database
5. ✅ Cleans up old backups (keeps last 7 days)

### Option 2: Manual Update with Backup

```bash
cd /opt/AccountingMaster

# 1. Create backup first
mkdir -p backups
docker exec accountingmaster-db pg_dump -U accountingmaster accountingmaster | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 2. Update app (database stays running)
docker-compose stop app
docker-compose up -d --build --no-deps app
```

### Option 3: Full Rebuild (if needed)

```bash
# This is safe - database volume persists
docker-compose down
docker-compose up -d --build
```

## Verify Your Data is Safe

### Check Volume Exists:
```bash
docker volume ls | grep accountingmaster
```

### Check Volume Location:
```bash
docker volume inspect accountingmaster_accountingmaster_pgdata
```

### Verify Data After Update:
```bash
# Check record counts
docker exec accountingmaster-db psql -U accountingmaster -d accountingmaster -c "SELECT COUNT(*) FROM companies;"
docker exec accountingmaster-db psql -U accountingmaster -d accountingmaster -c "SELECT COUNT(*) FROM customers;"
```

## Backup Strategy

### Automatic Backups (Recommended)

Add to crontab for daily backups:
```bash
# Edit crontab
crontab -e

# Add this line (runs at 2 AM daily)
0 2 * * * cd /opt/AccountingMaster && docker exec accountingmaster-db pg_dump -U accountingmaster accountingmaster | gzip > backups/backup_$(date +\%Y\%m\%d).sql.gz && find backups -name "backup_*.sql.gz" -mtime +30 -delete
```

### Manual Backup:
```bash
cd /opt/AccountingMaster
mkdir -p backups
docker exec accountingmaster-db pg_dump -U accountingmaster accountingmaster | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore from Backup:
```bash
cd /opt/AccountingMaster
chmod +x restore-backup.sh
./restore-backup.sh backups/backup_20250115_120000.sql.gz
```

## Important Notes

1. **Database container never gets rebuilt** - Only the app container is updated
2. **Volume persists independently** - Even if you `docker-compose down`, the volume remains
3. **Only delete volume if you want to start fresh** - `docker volume rm accountingmaster_accountingmaster_pgdata`

## Disaster Recovery

If something goes wrong:

1. **Stop containers:**
   ```bash
   docker-compose down
   ```

2. **Restore from backup:**
   ```bash
   ./restore-backup.sh backups/backup_YYYYMMDD_HHMMSS.sql.gz
   ```

3. **Restart:**
   ```bash
   docker-compose up -d
   ```

## Best Practices

1. ✅ **Always backup before major updates**
2. ✅ **Test updates in a staging environment if possible**
3. ✅ **Keep multiple backup copies** (local + remote if possible)
4. ✅ **Verify backups regularly** (restore test)
5. ✅ **Document your backup schedule**

## Quick Commands Reference

```bash
# Create backup
docker exec accountingmaster-db pg_dump -U accountingmaster accountingmaster | gzip > backup.sql.gz

# Update app safely
./update-app.sh

# Check data
docker exec accountingmaster-db psql -U accountingmaster -d accountingmaster -c "SELECT COUNT(*) FROM companies;"

# View volume info
docker volume inspect accountingmaster_accountingmaster_pgdata

# List all backups
ls -lh backups/
```


