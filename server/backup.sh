#!/bin/bash
# -------------------------------------------------------------------
# Automated Database Backup Script for Express Trade Kit
# -------------------------------------------------------------------

# Load environment variables (ensure to run from server directory or provide path)
source .env

# Backup directory
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

DB_USER="${PGUSER:-postgres}"
DB_NAME="${PGDATABASE:-express_trade_kit}"
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${DATE}.sql.gz"

echo "Starting backup of database $DB_NAME..."

# Execute pg_dump
PGPASSWORD="$PGPASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F p | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $BACKUP_FILE"
  
  # Remove backups older than 14 days
  find "$BACKUP_DIR" -type f -name "${DB_NAME}_backup_*.sql.gz" -mtime +14 -delete
  echo "🧹 Cleaned up backups older than 14 days."
else
  echo "❌ Backup failed!"
  exit 1
fi
