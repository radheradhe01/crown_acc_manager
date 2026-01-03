#!/bin/bash

# End-to-end database setup script for AccountingMaster
# This script initializes the database schema and sets up default data

set -e  # Exit on error

echo "=========================================="
echo "AccountingMaster Database Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the AccountingMaster directory."
    exit 1
fi

print_success "Found docker-compose.yml"

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Check if containers exist
if ! docker ps -a | grep -q "accountingmaster-db"; then
    print_error "Database container not found. Please run 'docker-compose up -d db' first."
    exit 1
fi

print_success "Database container found"

# Check if database container is running
if ! docker ps | grep -q "accountingmaster-db"; then
    print_info "Starting database container..."
    docker-compose up -d db
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    sleep 5
    
    # Check database health
    for i in {1..30}; do
        if docker exec accountingmaster-db pg_isready -U accountingmaster -d accountingmaster > /dev/null 2>&1; then
            print_success "Database is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Database failed to start after 30 seconds"
            exit 1
        fi
        sleep 1
    done
else
    print_success "Database container is running"
fi

# Check if app container exists
if ! docker ps -a | grep -q "accountingmaster-app"; then
    print_info "App container not found. It will be created during migration."
else
    print_success "App container found"
fi

# Set DATABASE_URL
export DATABASE_URL="postgresql://accountingmaster:accountingmaster_secret_pw@db:5432/accountingmaster"

echo ""
print_info "Step 1: Checking database connection..."
echo ""

# Test database connection
if docker exec accountingmaster-db psql -U accountingmaster -d accountingmaster -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database"
    exit 1
fi

echo ""
print_info "Step 2: Running database migration (drizzle push)..."
echo ""

# Check if we need to run migration from inside container or locally
if docker ps | grep -q "accountingmaster-app"; then
    # App container exists, run migration inside it
    print_info "Running migration inside app container..."
    
    # Check if drizzle-kit is available in container
    if docker exec accountingmaster-app sh -c "cd /app && npm list drizzle-kit > /dev/null 2>&1" 2>/dev/null; then
        print_info "drizzle-kit found in container"
    else
        print_info "Installing drizzle-kit in container..."
        docker exec accountingmaster-app sh -c "cd /app && npm install drizzle-kit --save-dev" || {
            print_error "Failed to install drizzle-kit. Trying alternative method..."
        }
    fi
    
    # Run migration
    if docker exec -e DATABASE_URL="$DATABASE_URL" accountingmaster-app sh -c "cd /app && npm run db:push" 2>&1; then
        print_success "Database migration completed"
    else
        print_error "Migration failed inside container. Trying local migration..."
        
        # Fallback: try local migration if DATABASE_URL can reach the database
        # This requires the database port to be exposed (5433)
        LOCAL_DATABASE_URL="postgresql://accountingmaster:accountingmaster_secret_pw@localhost:5433/accountingmaster"
        
        print_info "Attempting local migration with exposed port..."
        if command -v npm > /dev/null 2>&1; then
            if [ -f "package.json" ]; then
                export DATABASE_URL="$LOCAL_DATABASE_URL"
                if npm run db:push 2>&1; then
                    print_success "Database migration completed (local)"
                else
                    print_error "Local migration also failed"
                    exit 1
                fi
            else
                print_error "package.json not found for local migration"
                exit 1
            fi
        else
            print_error "npm not found. Cannot run local migration."
            exit 1
        fi
    fi
else
    # App container doesn't exist, try local migration
    print_info "App container not running. Attempting local migration..."
    
    # Check if database port is exposed
    if docker ps | grep -q "5433->5432"; then
        LOCAL_DATABASE_URL="postgresql://accountingmaster:accountingmaster_secret_pw@localhost:5433/accountingmaster"
        export DATABASE_URL="$LOCAL_DATABASE_URL"
        
        if command -v npm > /dev/null 2>&1 && [ -f "package.json" ]; then
            if npm run db:push 2>&1; then
                print_success "Database migration completed (local)"
            else
                print_error "Local migration failed"
                exit 1
            fi
        else
            print_error "Cannot run migration: npm not found or package.json missing"
            print_info "Please start the app container first: docker-compose up -d app"
            exit 1
        fi
    else
        print_error "Database port 5433 is not exposed. Cannot run local migration."
        print_info "Please start the app container first: docker-compose up -d app"
        exit 1
    fi
fi

echo ""
print_info "Step 3: Verifying database schema..."
echo ""

# Check if key tables exist
TABLES=("users" "companies" "permissions" "user_roles" "customers" "vendors")
ALL_TABLES_EXIST=true

for table in "${TABLES[@]}"; do
    if docker exec accountingmaster-db psql -U accountingmaster -d accountingmaster -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" | grep -q t; then
        print_success "Table '$table' exists"
    else
        print_error "Table '$table' does not exist"
        ALL_TABLES_EXIST=false
    fi
done

if [ "$ALL_TABLES_EXIST" = false ]; then
    print_error "Some tables are missing. Migration may have failed."
    exit 1
fi

echo ""
print_info "Step 4: Starting/restarting application..."
echo ""

# Start or restart the app container
if docker ps | grep -q "accountingmaster-app"; then
    print_info "Restarting app container..."
    docker-compose restart app
else
    print_info "Starting app container..."
    docker-compose up -d app
fi

# Wait for app to be ready
print_info "Waiting for application to start..."
sleep 5

# Check if app container is running
if docker ps | grep -q "accountingmaster-app"; then
    print_success "Application container is running"
else
    print_error "Application container failed to start"
    print_info "Check logs with: docker-compose logs app"
    exit 1
fi

echo ""
print_info "Step 5: Verifying application health..."
echo ""

# Wait a bit more for the app to fully initialize
sleep 3

# Check app logs for initialization
if docker logs accountingmaster-app 2>&1 | grep -q "serving on port"; then
    print_success "Application is serving on port"
else
    print_error "Application may not be running correctly"
    print_info "Check logs with: docker-compose logs app"
fi

# Check if default user initialization ran
if docker logs accountingmaster-app 2>&1 | grep -q "Default roles, permissions, and user initialized"; then
    print_success "Default user initialization completed"
elif docker logs accountingmaster-app 2>&1 | grep -q "Admin user"; then
    print_success "Admin user setup completed"
else
    print_info "Checking if admin user exists in database..."
    
    # Check if admin user exists
    USER_COUNT=$(docker exec accountingmaster-db psql -U accountingmaster -d accountingmaster -tAc "SELECT COUNT(*) FROM users WHERE email = 'crownsolution.noc@gmail.com';" 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" -gt 0 ]; then
        print_success "Admin user exists in database"
    else
        print_info "Admin user not found. It will be created on next app restart."
    fi
fi

echo ""
echo "=========================================="
print_success "Database setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check application logs: docker-compose logs -f app"
echo "2. Access the application at: http://localhost:3001 (or your configured domain)"
echo "3. Login with credentials:"
echo "   Email: crownsolution.noc@gmail.com"
echo "   Password: Crown4689@^^+5"
echo ""
echo "If login fails, check logs for errors:"
echo "   docker-compose logs app | grep -i error"
echo ""
echo "To view all logs:"
echo "   docker-compose logs -f"
echo ""
