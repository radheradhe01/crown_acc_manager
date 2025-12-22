#!/bin/bash

# Cleanup script for AccountingMaster
# Removes unwanted files while keeping essential ones
# Usage: ./cleanup.sh [--dry-run] [--vm]

DRY_RUN=false
VM_MODE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --vm)
            VM_MODE=true
            shift
            ;;
        *)
            ;;
    esac
done

echo "=========================================="
echo "AccountingMaster Cleanup Script"
echo "=========================================="
if [ "$DRY_RUN" = true ]; then
    echo "Mode: DRY RUN (no files will be deleted)"
fi
if [ "$VM_MODE" = true ]; then
    echo "Mode: VM Cleanup"
fi
echo ""

# Function to remove file/directory
remove() {
    if [ -e "$1" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "  [DRY RUN] Would remove: $1"
        else
            rm -rf "$1"
            echo "  ✓ Removed: $1"
        fi
    fi
}

# Files to remove
echo "Removing old backup files..."
remove "backup.sql"
remove "backup2.sql"

echo ""
echo "Removing Replit-specific files..."
remove "replit.md"
remove ".replit" 2>/dev/null

echo ""
echo "Removing build artifacts and caches..."
remove "dist"
remove "node_modules/.cache"
remove ".next" 2>/dev/null
remove ".turbo" 2>/dev/null

echo ""
echo "Removing old attached assets (keeping directory)..."
# Remove old text files in attached_assets
find attached_assets -name "*.txt" -type f 2>/dev/null | while read file; do
    remove "$file"
done

# Remove old image files if they're not being used (optional - commented out for safety)
# find attached_assets -name "image_*.png" -type f -mtime +30 2>/dev/null | while read file; do
#     remove "$file"
# done

echo ""
echo "Removing temporary files..."
remove "*.log"
remove "*.tmp"
remove ".DS_Store"
find . -name ".DS_Store" -type f 2>/dev/null | while read file; do
    remove "$file"
done

echo ""
echo "Removing editor/IDE files..."
remove ".vscode" 2>/dev/null
remove ".idea" 2>/dev/null
remove "*.swp"
remove "*.swo"
remove "*~"

if [ "$VM_MODE" = true ]; then
    echo ""
    echo "VM-specific cleanup..."
    # Remove old Docker build cache (optional - saves space)
    # docker builder prune -f
    echo "  (Skipping Docker cleanup - run manually if needed)"
fi

echo ""
echo "=========================================="
if [ "$DRY_RUN" = true ]; then
    echo "Dry run complete. Run without --dry-run to actually remove files."
else
    echo "Cleanup complete!"
fi
echo "=========================================="
echo ""
echo "Files kept (essential):"
echo "  ✓ clear_data.sql (useful script)"
echo "  ✓ All source code"
echo "  ✓ Configuration files (docker-compose.yml, Dockerfile, etc.)"
echo "  ✓ Setup scripts (setup-domain.sh, update-app.sh, etc.)"
echo "  ✓ Documentation (DATA_SAFETY.md, DOMAIN_SETUP.md)"
echo ""

