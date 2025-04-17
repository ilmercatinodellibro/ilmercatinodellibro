#!/bin/sh

# Usage: send_email.sh <log_file> <subject>

LOG_FILE="$1"
SUBJECT="$2"
EMAIL="$MAIL_SUPPORT"
FROM="$MAIL_FROM_DEFAULT"

if [ ! -f "$LOG_FILE" ]; then
    echo "ERROR: Log file '$LOG_FILE' not found!"
    exit 1
fi

if [ -z "$EMAIL" ]; then
    echo "ERROR: Email address is not set!"
    exit 1
fi

(
    echo "Subject: $SUBJECT"
    echo "From: $FROM"
    echo "To: $EMAIL"
    echo ""
    cat "$LOG_FILE"
) | msmtp --read-recipients "$EMAIL"

echo "Email sent to $EMAIL with subject: $SUBJECT"