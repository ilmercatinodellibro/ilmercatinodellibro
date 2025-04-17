#!/bin/sh

ARUBA_BUCKET="$ARUBA_BUCKET"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
LOG_DIR="/logs"

LOG_FILE="$LOG_DIR/sync_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

# All output goes to the log file
exec > "$LOG_FILE" 2>&1

echo "=== Inizio Sync $(date) ==="
echo "Sincronizzazione backup con storage remoto..."

SYNC_SUCCESS=true

# Sync to Aruba
if ! rclone sync "$BACKUP_DIR" "aruba:$ARUBA_BUCKET" --log-level INFO; then
    echo "ERRORE: Sincronizzazione fallita!"
    SYNC_SUCCESS=false
fi

if $SYNC_SUCCESS && ! rclone check "$BACKUP_DIR" "aruba:$ARUBA_BUCKET" --size-only; then
    echo "ATTENZIONE: Verifica sincronizzazione fallita!"
    SYNC_SUCCESS=false
fi

if $SYNC_SUCCESS; then
    echo "Sync completed successfully!"
    echo "Backup Directory: $BACKUP_DIR ($(du -sh "$BACKUP_DIR" | cut -f1))"
else
    echo "Sync completed with errors!"
    # Send error notification
    /scripts/send_email.sh "$LOG_FILE" "[Mercatino] Sync Error $(date)"
fi
echo "=== Sync Finished $(date) ==="

if ! $SYNC_SUCCESS; then
    exit 1
fi