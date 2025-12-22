# Cleanup Guide

## Overview
This guide helps you clean up unwanted files from your AccountingMaster project, both locally and on your VM.

## What Gets Removed

### ✅ Safe to Remove:
- **Old backup SQL files** (`backup.sql`, `backup2.sql`) - You have the database running
- **Replit files** (`replit.md`, `.replit`) - Not needed if not using Replit
- **Build artifacts** (`dist/`, `.next/`, `.turbo/`)
- **Cache files** (`node_modules/.cache`)
- **Temporary files** (`*.log`, `*.tmp`, `.DS_Store`)
- **Editor files** (`.vscode/`, `.idea/`, `*.swp`)

### ✅ Kept (Essential):
- All source code (`client/`, `server/`, `shared/`)
- Configuration files (`docker-compose.yml`, `Dockerfile`, `package.json`)
- Setup scripts (`setup-domain.sh`, `update-app.sh`, `restore-backup.sh`)
- Documentation (`DATA_SAFETY.md`, `DOMAIN_SETUP.md`)
- Useful SQL scripts (`clear_data.sql`)
- Attached assets directory (structure kept)

## Usage

### Local Cleanup

```bash
# Dry run first (see what would be removed)
./cleanup.sh --dry-run

# Actually clean up
chmod +x cleanup.sh
./cleanup.sh
```

### VM Cleanup

```bash
# Copy script to VM
scp cleanup.sh root@148.72.168.58:/opt/AccountingMaster/

# On VM - dry run first
cd /opt/AccountingMaster
chmod +x cleanup.sh
./cleanup.sh --dry-run --vm

# Actually clean up
./cleanup.sh --vm
```

## Manual Cleanup (If Needed)

### Remove Old Backups Only:
```bash
rm backup.sql backup2.sql
```

### Remove Replit Files:
```bash
rm replit.md .replit
```

### Clean Build Artifacts:
```bash
rm -rf dist node_modules/.cache
```

### Clean Docker (VM only - optional):
```bash
# Remove unused Docker images (saves space)
docker image prune -a -f

# Remove build cache (saves space)
docker builder prune -f
```

## After Cleanup

### Verify Important Files Still Exist:
```bash
ls -la docker-compose.yml Dockerfile package.json
ls -la setup-domain.sh update-app.sh
ls -la clear_data.sql
```

### Check Git Status (if using git):
```bash
git status
```

## Safety Notes

1. **Always run with `--dry-run` first** to see what will be removed
2. **Backup important data** before cleanup (though cleanup.sh is safe)
3. **Don't remove** `.env` files (they contain secrets)
4. **Keep** all `.sh` scripts and `.md` documentation

## What to Keep

Essential files that should NEVER be removed:
- ✅ `docker-compose.yml` - Container configuration
- ✅ `Dockerfile` - Build configuration
- ✅ `package.json` - Dependencies
- ✅ `*.sh` scripts - Setup and maintenance scripts
- ✅ `*.md` documentation - Important guides
- ✅ `clear_data.sql` - Useful database script
- ✅ `.env` - Environment variables (secrets)
- ✅ All source code directories

