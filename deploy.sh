#!/bin/sh
# ── Deploy Script ─────────────────────────────────────────
# Se ejecuta en el VPS via GitHub Actions después de que CI pasa.
#
# Uso manual en el VPS:
#   ./deploy.sh
#
# Requisitos:
#   - Docker + Docker Compose instalados
#   - .env en la raíz del proyecto con DB_PASSWORD
#   - Puerto 80 libre para el frontend

set -e

echo "→ Pulling latest changes..."
git pull origin main

echo "→ Rebuilding and restarting services..."
docker compose up -d --build

echo "→ Pruning old images..."
docker image prune -f

echo "✅ Deploy completed"

# Mostrar estado
docker compose ps
