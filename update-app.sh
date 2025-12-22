#!/bin/bash

# Safe update script - backs up database before updating the app
# Usage: ./update-app.sh

set -e  # Exit on error

BACKUP_DIR="/opt/AccountingMaster/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/accountingmaster_backup_$TIMESTAMP.sql.gz"

echo "=========================================="
echo "AccountingMaster - Safe Update Script"
echo "=========================================="
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Step 1: Backup database
echo "Step 1: Creating database backup..."
if docker exec accountingmaster-db pg_dump -U accountingmaster accountingmaster 2>/dev/null | gzip > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✓ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo "✗ Backup failed! Aborting update for safety."
    exit 1
fi

# Step 2: Verify backup
echo ""
echo "Step 2: Verifying backup..."
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo "✓ Backup file is valid"
else
    echo "✗ Backup file is invalid! Aborting update."
    exit 1
fi

# Step 3: Update app (database container stays running)
echo ""
echo "Step 3: Updating application..."
echo "   (Database will continue running - no downtime)"

# Stop only the app container
docker-compose stop app

# Rebuild and start app
if docker-compose up -d --build --no-deps app; then
    echo "✓ Application updated successfully"
else
    echo "✗ Update failed! Restoring from backup..."
    echo "   (Your data is safe - database was not touched)"
    exit 1
fi

# Step 4: Cleanup old backups (keep last 7 days)
echo ""
echo "Step 4: Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "accountingmaster_backup_*.sql.gz" -mtime +7 -delete
echo "✓ Cleanup complete"

# Step 5: Show status
echo ""
echo "=========================================="
echo "Update Complete!"
echo "=========================================="
echo ""
echo "Backup location: $BACKUP_FILE"
echo ""
echo "Container status:"
docker-compose ps
echo ""
echo "To view app logs: docker-compose logs -f app"
echo "To restore from backup: ./restore-backup.sh $BACKUP_FILE"

