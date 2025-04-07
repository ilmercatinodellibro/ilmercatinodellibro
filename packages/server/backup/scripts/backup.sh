#!/bin/sh

export PGPASSWORD="$DB_PASS"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
LOG_DIR="/logs"
EMAIL="$MAIL_SUPPORT"

BACKUP_FILE="$BACKUP_DIR/dump_$TIMESTAMP.sql.gz"
LOG_FILE="$LOG_DIR/backup_$TIMESTAMP.log"

mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# All output goes to the log file
exec > "$LOG_FILE" 2>&1

echo "=== Inizio Backup $(date) ==="

BACKUP_SUCCESS=true

# DB dump
if ! pg_dump -h postgres -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    echo "ERRORE: Creazione dump fallita!"
    BACKUP_SUCCESS=false
fi

if $BACKUP_SUCCESS && ! gzip -t "$BACKUP_FILE"; then
    echo "ERRORE: Verifica backup fallita!"
    BACKUP_SUCCESS=false
fi

# Delete old backups (older than 7 days)
find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +7 -delete

if $BACKUP_SUCCESS; then
    echo "Backup completato con successo: $BACKUP_FILE"
    echo "Dimensione: $(du -h "$BACKUP_FILE" | cut -f1)"
fi

echo "=== Fine Backup $(date) ==="

# Send email if there are errors (using the log file already created)
if grep -q "ERRORE" "$LOG_FILE"; then
    (
        echo "Subject: [Mercatino] Errore Backup $(date)"
        echo "From: $MAIL_FROM_DEFAULT"
        echo "To: $EMAIL"
        echo ""
        cat "$LOG_FILE"
    ) | msmtp --read-recipients "$EMAIL"
fi

if ! $BACKUP_SUCCESS; then
    exit 1
fi