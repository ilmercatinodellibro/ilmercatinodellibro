#!/bin/sh

export PGPASSWORD="$DB_PASS"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
APP_DIR="app"
LOG_DIR="/logs"
BACKUP_DIR="/backups"

DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
BACKUP_FILE="$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz"
LOG_FILE="$LOG_DIR/app_backup_$TIMESTAMP.log"

mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# All output goes to the log file
BACKUP_SUCCESS=true
exec > "$LOG_FILE" 2>&1

echo "=== Starting Full Application Backup $(date) ==="

# Change to the root directory to avoid tar'ing the entire filesystem
cd / 

# Create application backup (excluding unnecessary files)
if ! tar --exclude='node_modules' \
         --exclude='.git' \
         --exclude='*.log' \
         -czf "$BACKUP_FILE" "$APP_DIR"; then
    echo "ERROR: Application backup failed!"
    BACKUP_SUCCESS=false
fi

if $BACKUP_SUCCESS && ! gzip -t "$BACKUP_FILE"; then
    echo "ERROR: Backup verification failed!"
    BACKUP_SUCCESS=false
fi

# DB dump
if ! pg_dump -h postgres -U "$DB_USER" -d "$DB_NAME" | gzip > "$DB_BACKUP_FILE"; then
    echo "ERROR: Database dump failed!"
    BACKUP_SUCCESS=false
fi

if $BACKUP_SUCCESS && ! gzip -t "$DB_BACKUP_FILE"; then
    echo "ERROR: Database backup verification failed!"
    BACKUP_SUCCESS=false
fi

# Cleanup old backups (keeping last 7 days)
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +7 -delete
find "$LOG_DIR" -name "*.log" -type f -mtime +7 -delete

if $BACKUP_SUCCESS; then
    echo "Backup completed successfully!"
    echo "Application Backup: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
    echo "Database Backup: $DB_BACKUP_FILE ($(du -h "$DB_BACKUP_FILE" | cut -f1))"
else
    echo "Backup completed with errors!"
    # Send error notification
    /scripts/send_email.sh "$LOG_FILE" "[Mercatino] Backup Error $(date)"
fi

echo "=== Backup Finished $(date) ==="

if ! $BACKUP_SUCCESS; then
    exit 1
fi