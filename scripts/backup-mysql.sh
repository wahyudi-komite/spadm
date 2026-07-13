#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/spadm}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
: "${DB_HOST:?DB_HOST wajib diisi}"
: "${DB_USERNAME:?DB_USERNAME wajib diisi}"
: "${DB_DATABASE:?DB_DATABASE wajib diisi}"
: "${DB_PASSWORD:?DB_PASSWORD wajib diisi}"

install -d -m 700 "$BACKUP_DIR"
FILE="$BACKUP_DIR/${DB_DATABASE}_$(date +%Y%m%d_%H%M%S).sql.gz"
MYSQL_PWD="$DB_PASSWORD" mysqldump \
  --host="$DB_HOST" --user="$DB_USERNAME" \
  --single-transaction --routines --triggers --events "$DB_DATABASE" | gzip -9 > "$FILE"
chmod 600 "$FILE"
find "$BACKUP_DIR" -type f -name '*.sql.gz' -mtime "+$RETENTION_DAYS" -delete
echo "$FILE"
