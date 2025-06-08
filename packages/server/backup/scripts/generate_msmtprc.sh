#!/bin/sh

if [ "$MAIL_SECURE" = "true" ]; then
    export TLS_ENABLED="on"
    export TLS_STARTTLS="off"
    export TLS_TRUST_FILE="/etc/ssl/certs/ca-certificates.crt"
else
    export TLS_ENABLED="off"
    export TLS_STARTTLS=""
    export TLS_TRUST_FILE=""
fi

# Generate the msmtprc file
envsubst < /etc/msmtprc_template > /etc/msmtprc
chmod 600 /etc/msmtprc