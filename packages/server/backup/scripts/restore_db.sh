#!/bin/sh

# Usage: ./restore_db.sh <backup_file.sql.gz>

if [ -z "$1" ]; then
  echo "ERROR: Please specify backup file (e.g., db_backup_20240501_143000.sql.gz)"
  exit 1
fi

export PGPASSWORD="$DB_PASS"
BACKUP_FILE="/backups/$1"
DB_CONTAINER="ilmercatinodellibro-postgres"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file $BACKUP_FILE not found!"
  exit 1
fi

echo "=== Restoring database from $1 ==="
echo "This will OVERWRITE existing data. Continue? (y/N)"
read -r confirm

if [ "$confirm" != "y" ]; then
  echo "Cancelled."
  exit 0
fi

gzip -dc "$BACKUP_FILE" | psql -h "$DB_CONTAINER" -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
  echo "=== Restoration complete ==="
else
  echo "ERROR: Database restoration failed!"
  exit 1
fi