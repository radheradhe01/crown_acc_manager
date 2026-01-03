#!/bin/bash

# Complete end-to-end setup script for AccountingMaster
# This script handles both database initialization and domain configuration

set -e  # Exit on error

echo "=========================================="
echo "AccountingMaster Complete Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_section() {
    echo -e "${BLUE}▶${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the AccountingMaster directory."
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
print_section "Phase 1: Database Setup"
echo ""

# Run database setup script
if [ -f "$SCRIPT_DIR/setup-database.sh" ]; then
    bash "$SCRIPT_DIR/setup-database.sh"
    DB_SETUP_EXIT_CODE=$?
    
    if [ $DB_SETUP_EXIT_CODE -ne 0 ]; then
        print_error "Database setup failed. Please fix the errors and try again."
        exit 1
    fi
else
    print_error "setup-database.sh not found"
    exit 1
fi

echo ""
print_section "Phase 2: Domain Configuration (Optional)"
echo ""

# Ask if user wants to configure domain
read -p "Do you want to configure the domain (billing.crownitsolution.com)? [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$SCRIPT_DIR/setup-domain.sh" ]; then
        print_info "Running domain setup..."
        bash "$SCRIPT_DIR/setup-domain.sh"
        DOMAIN_SETUP_EXIT_CODE=$?
        
        if [ $DOMAIN_SETUP_EXIT_CODE -ne 0 ]; then
            print_error "Domain setup had issues. Check the output above."
            print_info "You can run setup-domain.sh separately later."
        else
            print_success "Domain configuration completed"
        fi
    else
        print_error "setup-domain.sh not found"
        print_info "Skipping domain configuration"
    fi
else
    print_info "Skipping domain configuration"
    print_info "You can run setup-domain.sh later if needed"
fi

echo ""
echo "=========================================="
print_success "Complete setup finished!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Database schema initialized"
echo "  ✓ Default roles and permissions created"
echo "  ✓ Admin user configured"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  ✓ Domain configured"
fi
echo ""
echo "Application is ready to use!"
echo ""
echo "Access information:"
echo "  Local: http://localhost:3001"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  Domain: https://billing.crownitsolution.com"
fi
echo ""
echo "Login credentials:"
echo "  Email: crownsolution.noc@gmail.com"
echo "  Password: Crown4689@^^+5"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f app"
echo "  Restart app: docker-compose restart app"
echo "  Stop all: docker-compose down"
echo "  Start all: docker-compose up -d"
echo ""
