#!/bin/sh

export PGPASSWORD="$DB_PASS"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
LOG_DIR="/logs"

BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
LOG_FILE="$LOG_DIR/db_backup_$TIMESTAMP.log"

mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# All output goes to the log file
BACKUP_SUCCESS=true
exec > "$LOG_FILE" 2>&1

echo "=== Starting DB Backup $(date) ==="

# Source the backup_database functions script
. /scripts/functions.sh

backup_database "$BACKUP_FILE"
if [ $? -ne 0 ]; then
    BACKUP_SUCCESS=false
fi

if $BACKUP_SUCCESS; then
    echo "Backup completed successfully!"
    echo "Database Backup: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
    echo "DB backup completed with errors!"
    # Send error notification
    send_mail "$LOG_FILE" "[Mercatino] DB backup Error $(date)"
fi
echo "=== Backup Finished $(date) ==="

if ! $BACKUP_SUCCESS; then
    exit 1
fi