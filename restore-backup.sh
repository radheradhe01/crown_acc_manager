#!/bin/bash

# Restore database from backup
# Usage: ./restore-backup.sh <backup-file>

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh /opt/AccountingMaster/backups/accountingmaster_backup_*.sql.gz 2>/dev/null | tail -5
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=========================================="
echo "Restoring Database from Backup"
echo "=========================================="
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "This will REPLACE all current data. Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Restoring backup..."

# Restore from compressed backup
if gunzip < "$BACKUP_FILE" | docker exec -i accountingmaster-db psql -U accountingmaster -d accountingmaster; then
    echo "✓ Database restored successfully"
else
    echo "✗ Restore failed!"
    exit 1
fi

echo ""
echo "Restore complete!"


