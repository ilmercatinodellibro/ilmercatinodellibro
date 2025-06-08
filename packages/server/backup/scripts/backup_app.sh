#!/bin/sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
APP_DIR="app"
LOG_DIR="/logs"
BACKUP_DIR="/backups"

BACKUP_FILE="$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz"
LOG_FILE="$LOG_DIR/app_backup_$TIMESTAMP.log"

mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# All output goes to the log file
BACKUP_SUCCESS=true
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Starting Full Application Backup $(date) ==="

# Source the backup_application functions script
. /scripts/functions.sh

backup_application "$BACKUP_FILE" "$APP_DIR"
if [ $? -ne 0 ]; then
    BACKUP_SUCCESS=false
fi

# Cleanup old backups (keeping last 7 days)
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +7 -delete
find "$LOG_DIR" -name "*.log" -type f -mtime +7 -delete

if $BACKUP_SUCCESS; then
    echo "Backup completed successfully!"
    echo "Application Backup: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
    echo "Backup completed with errors!"
    # Send error notification
    send_mail "$LOG_FILE" "[Mercatino] APP Backup Error $(date)"
fi

echo "=== Backup Finished $(date) ==="

if ! $BACKUP_SUCCESS; then
    exit 1
fi