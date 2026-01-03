#!/bin/bash
# Script to initialize the database schema
# Run this on the server after setting up the database

echo "Initializing database schema..."

# Set DATABASE_URL from docker-compose environment
export DATABASE_URL="postgresql://accountingmaster:accountingmaster_secret_pw@db:5432/accountingmaster"

# Run drizzle push to create all tables
npm run db:push

echo "Database schema initialized successfully!"
