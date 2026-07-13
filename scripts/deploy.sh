#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/spadm}"
cd "$APP_DIR"

git pull --ff-only
npm --prefix backend ci
npm --prefix backend run build
npm --prefix frontend/starter ci
npm --prefix frontend/starter run build
npm --prefix backend run migration:run
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save
curl --fail --silent http://127.0.0.1:3000/api/health >/dev/null
