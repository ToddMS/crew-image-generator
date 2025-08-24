#!/bin/bash

# Script to add London rowing clubs to PostgreSQL database
# Usage: ./add-london-clubs.sh [user_id]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default user ID (change this as needed)
USER_ID=${1:-1}

echo -e "${YELLOW}Adding London rowing clubs to database...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set your PostgreSQL connection string:"
    echo "export DATABASE_URL='postgresql://username:password@localhost:5432/database_name'"
    exit 1
fi

echo "Using USER_ID: $USER_ID"
echo "Database: $DATABASE_URL"

# Update the migration file with the correct user ID
MIGRATION_FILE="../database/migrations/002_add_london_club_presets.sql"
TEMP_FILE="/tmp/london_clubs_migration.sql"

# Replace user_id = 1 with the specified user ID
sed "s/user_id = 1/user_id = $USER_ID/g" "$MIGRATION_FILE" > "$TEMP_FILE"

echo -e "${YELLOW}Running migration...${NC}"

# Run the migration
psql "$DATABASE_URL" -f "$TEMP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully added London rowing clubs to database!${NC}"
    echo -e "${GREEN}Added 30 authentic London rowing clubs with traditional colors${NC}"
    
    # Show count of club presets for this user
    echo -e "${YELLOW}Checking results...${NC}"
    psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_presets FROM ClubPresets WHERE user_id = $USER_ID;"
    
    echo -e "${GREEN}Migration completed successfully!${NC}"
else
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
fi

# Clean up temp file
rm -f "$TEMP_FILE"