#!/bin/sh

BACKUP_DIR="/backups"
LOG_DIR="/logs"
ARUBA_BUCKET="$ARUBA_BUCKET"
EMAIL="$MAIL_SUPPORT"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/sync_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

# All output goes to the log file
exec > "$LOG_FILE" 2>&1

# Replace env variables in the rclone.conf file
if ! envsubst < /root/.config/rclone/rclone.conf_tmp > /root/.config/rclone/rclone.conf; then
    echo "ERRORE: Sostituzione variabili nel file di configurazione di rclone fallita!"
    exit 1
fi

if ! envsubst < /etc/msmtprc_tmp > /etc/msmtprc; then
    echo "ERRORE: Sostituzione variabili nel file msmtprc fallita!"
    exit 1
fi

chmod 600 /etc/msmtprc
chmod 600 /root/.config/rclone/rclone.conf

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
    echo "Sync completato con successo"
fi

echo "=== Fine Sync $(date) ==="

# Send email if there are errors (using the log file already created)
if ! $SYNC_SUCCESS || grep -q "ERRORE" "$LOG_FILE"; then
    (
        echo "Subject: [Mercatino] Errore Sync Backup $(date)"
        echo "From: $MAIL_FROM_DEFAULT"
        echo "To: $EMAIL"
        echo ""
        cat "$LOG_FILE"
    ) | msmtp --read-recipients "$EMAIL"
fi

if ! $SYNC_SUCCESS; then
    exit 1
fi