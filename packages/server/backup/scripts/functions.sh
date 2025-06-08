function backup_database() {
    BACKUP_FILE=$1

    if [ -z "$BACKUP_FILE" ]; then
        echo "ERROR: Usage: backup_database <backup_file>"
        return 1
    fi

    # Check environment variables
    if [ -z "$DB_PASS" ]; then
        echo "DB_PASS is not set. Please set it in the environment."
        return 2
    fi

    if [ -z "$DB_USER" ]; then
        echo "DB_USER is not set. Please set it in the environment."
        return 3
    fi

    if [ -z "$DB_NAME" ]; then
        echo "DB_NAME is not set. Please set it in the environment."
        return 4
    fi

    echo "Creating database backup..."
    if ! pg_dump -h postgres -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"; then
        echo "ERROR: Database dump failed!"
        return 5
    fi

    if ! gzip -t "$BACKUP_FILE"; then
        echo "ERROR: Database backup verification failed!"
        return 6
    fi

    return 0
}

function backup_application() {
    BACKUP_FILE=$1
    APP_DIR=$2

    if [ -z "$BACKUP_FILE" ] || [ -z "$APP_DIR" ]; then
        echo "ERROR: Usage: backup_application <backup_file> <app_dir>"
        return 1
    fi

    # Change to the root directory to avoid tar'ing the entire filesystem
    cd / 

    echo "Creating application backup..."
    if ! tar --exclude='node_modules' \
             --exclude='.git' \
             --exclude='*.log' \
             --exclude='*.gz' \
             -czf "$BACKUP_FILE" "$APP_DIR"; then
        echo "ERROR: Application backup failed!"
        return 2
    fi

    if ! gzip -t "$BACKUP_FILE"; then
        echo "ERROR: Backup verification failed!"
        return 3
    fi

    return 0
}

function send_mail() {
    LOG_FILE="$1"
    SUBJECT="$2"
    EMAIL="$MAIL_SUPPORT"
    FROM="$MAIL_FROM_DEFAULT"

    if [ -z "$LOG_FILE" ] || [ -z "$SUBJECT" ]; then
        echo "Usage: send_mail <log_file> <subject>"
        return 1
    fi

    if [ ! -f "$LOG_FILE" ]; then
        echo "Log file $LOG_FILE does not exist."
        return 2
    fi

    # Check environment variables
    if [ -z "$MAIL_SUPPORT" ]; then
        echo "MAIL_SUPPORT is not set. Please set it in the environment."
        return 3
    fi

    if [ -z "$MAIL_FROM_DEFAULT" ]; then
        echo "MAIL_FROM_DEFAULT is not set. Please set it in the environment."
        return 4
    fi

    (
        echo "Subject: $SUBJECT"
        echo "From: $FROM"
        echo "To: $EMAIL"
        echo ""
        cat "$LOG_FILE"
    ) | msmtp --read-recipients

    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to send email."
        return 5
    fi

    echo "Email sent to $EMAIL with subject: $SUBJECT"
    return 0
}