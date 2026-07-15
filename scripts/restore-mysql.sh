#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_FILE:?BACKUP_FILE wajib diisi}"
: "${DB_HOST:?DB_HOST wajib diisi}"
: "${DB_USERNAME:?DB_USERNAME wajib diisi}"
: "${DB_DATABASE:?DB_DATABASE wajib diisi}"
: "${DB_PASSWORD:?DB_PASSWORD wajib diisi}"

if [[ "${RESTORE_CONFIRM:-}" != "$DB_DATABASE" ]]; then
  echo "Set RESTORE_CONFIRM=$DB_DATABASE untuk mengonfirmasi target restore." >&2
  exit 1
fi
if [[ ! -r "$BACKUP_FILE" ]]; then
  echo "Backup tidak dapat dibaca: $BACKUP_FILE" >&2
  exit 1
fi

gzip -t "$BACKUP_FILE"
MYSQL_PWD="$DB_PASSWORD" gunzip -c "$BACKUP_FILE" | \
  mysql --host="$DB_HOST" --user="$DB_USERNAME" "$DB_DATABASE"

echo "Restore selesai ke database $DB_DATABASE"
