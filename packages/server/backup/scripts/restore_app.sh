#!/bin/sh

# Usage: ./restore_app.sh <backup_file.tar.gz>

if [ -z "$1" ]; then
  echo "ERROR: Please specify backup file (e.g., app_backup_20240501_020000.tar.gz)"
  exit 1
fi

BACKUP_FILE="/backups/$1"
APP_DIR="/app"  # Mount point in container

mkdir -p "$APP_DIR"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file $BACKUP_FILE not found!"
  exit 1
fi

echo "=== Restoring application from $1 ==="
echo "This will OVERWRITE existing files. Continue? (y/N)"
read -r confirm

if [ "$confirm" != "y" ]; then
  echo "Cancelled."
  exit 0
fi

# Extract with permissions preserved
tar -xzvf "$BACKUP_FILE" -C "$APP_DIR" --strip-components=1

if [ $? -eq 0 ]; then
  echo "=== Restoration complete ==="
else
  echo "ERROR: Application restoration failed!"
  exit 1
fi