#!/bin/sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
LOG_DIR="/logs"

LOG_FILE="$LOG_DIR/sync_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

# All output goes to the log file
exec > "$LOG_FILE" 2>&1

echo "=== Starting Sync $(date) ==="
echo "Starting backup synchronization with remote storage..."

SYNC_SUCCESS=true

if [ -z "$NODE_ENV" ]; then
    echo "ERROR: NODE_ENV is not set!"
    exit 1
fi

# Define the bucket path based on NODE_ENV
REMOTE_PATH="aruba:$ARUBA_BUCKET/$NODE_ENV"

echo "Remote path: $REMOTE_PATH"

# Copy /backups in development
if [ "$NODE_ENV" = "development" ]; then
    if ! rclone copy "$BACKUP_DIR" "$REMOTE_PATH" --log-level INFO; then
        echo "ERROR: Copy to Aruba failed!"
        SYNC_SUCCESS=false
    fi
else
    # Sync /backups in production
    if ! rclone sync "$BACKUP_DIR" "$REMOTE_PATH" --log-level INFO; then
        echo "ERROR: Sync to Aruba failed!"
        SYNC_SUCCESS=false
    fi

    if $SYNC_SUCCESS && ! rclone check "$BACKUP_DIR" "$REMOTE_PATH" --size-only; then
        echo "ATTENTION: Sync verification failed!"
        SYNC_SUCCESS=false
    fi
fi

if $SYNC_SUCCESS; then
    echo "Sync completed successfully!"
    echo "Backup Directory: $BACKUP_DIR ($(du -sh "$BACKUP_DIR" | cut -f1))"
else
    echo "Sync completed with errors!"
    
    # Source the functions script
    . /scripts/functions.sh

    # Send error notification
    send_mail "$LOG_FILE" "[Mercatino] Sync Error $(date)"
fi
echo "=== Sync Finished $(date) ==="

if ! $SYNC_SUCCESS; then
    exit 1
fi