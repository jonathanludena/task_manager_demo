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
#
# SSL Flow:
#   1. Generate self-signed cert (if no real cert exists)
#   2. Build + start all services (nginx serves self-signed)
#   3. Run certbot to obtain Let's Encrypt certs
#   4. Copy real certs → reload nginx
#
# Para renovación automática, agregar al crontab del VPS:
# 0 2,14 * * * cd /path/to/app && docker compose --profile certbot run --rm certbot renew && docker compose exec nginx nginx -s reload

set -e

# Cargar variables de .env (no sobreescribe vars ya definidas como STAGING desde CI)
if [ -f .env ]; then
  # shellcheck disable=SC1091
  . ./.env
fi

echo "→ Pulling latest changes..."
git pull origin main

# ── SSL Bootstrap (DPL-01) ─────────────────────────────────
# Create certbot directories and generate a self-signed cert
# valid for 1 day — enough for nginx to start and certbot to
# obtain real Let's Encrypt certificates.
mkdir -p ./certbot/www ./certbot/conf

SELF_SIGNED=false

if [ ! -f "./certbot/conf/live/app-challenge-0526.lproconsulting.com/fullchain.pem" ]; then
    echo "→ Generating self-signed temporary certificate..."
    # Generate self-signed cert for both subdomains
    openssl req -x509 -nodes -newkey rsa:2048 \
      -keyout ./certbot/conf/privkey.pem \
      -out ./certbot/conf/fullchain.pem \
      -days 1 \
      -subj "/CN=app-challenge-0526.lproconsulting.com" \
      -addext "subjectAltName=DNS:app-challenge-0526.lproconsulting.com,DNS:api-challenge-0526.lproconsulting.com"
    # Copy to the path nginx expects
    mkdir -p ./ssl-certs
    cp ./certbot/conf/fullchain.pem ./ssl-certs/fullchain.pem
    cp ./certbot/conf/privkey.pem ./ssl-certs/privkey.pem
    SELF_SIGNED=true
fi

# ── Stop existing containers & cleanup ──────────────────
# Evita conflictos de puertos con contenedores de deploys
# fallidos anteriores (port 80/443 ocupados por versión vieja).
echo "→ Stopping existing containers..."
docker compose down 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# ── Pull or Build Images ─────────────────────────────────
# If CI provided image tags (FRONTEND_IMAGE, BACKEND_IMAGE),
# pull them from GHCR. Otherwise build from source locally.
if [ -n "$FRONTEND_IMAGE" ] && [ -n "$BACKEND_IMAGE" ]; then
    echo "→ Pulling CI-built images from registry..."
    docker pull "$FRONTEND_IMAGE" && docker tag "$FRONTEND_IMAGE" challenge-frontend:latest
    docker pull "$BACKEND_IMAGE" && docker tag "$BACKEND_IMAGE" challenge-backend:latest
else
    echo "→ Building images locally..."
    docker compose build
fi

# ── Start Services ──────────────────────────────────────
# If CI images were pulled (tagged as challenge-*:latest),
# compose skips the build. Otherwise compose builds from source.
echo "→ Starting services..."
docker compose up -d

# ── Database Migrations (DBM-01) ────────────────────────────
echo "→ Running database migrations..."
docker compose exec backend pnpm migration:run && echo "  ✅ Migrations completed" || echo "  ⚠️  Migrations failed — keeping current schema"

# ── Wait for Nginx (DPL-03) ────────────────────────────────
# Nginx must be healthy before certbot can run the ACME
# HTTP-01 webroot challenge. Retry up to 30 seconds.
wait_for_nginx() {
    echo "→ Waiting for nginx to be ready..."
    for i in $(seq 1 15); do
        if curl -s -o /dev/null -w "%{http_code}" -H "Host: app-challenge-0526.lproconsulting.com" http://localhost:80/ -m 2 | grep -q "200\|301\|302"; then
            echo "  ✅ nginx is ready"
            return 0
        fi
        sleep 2
    done
    echo "  ❌ nginx did not respond after 30 seconds"
    return 1
}

wait_for_nginx

# ── Certbot Staging → Production (DPL-02) ──────────────────
# Only run certbot if we started with a self-signed cert.
# STAGING=true uses Let's Encrypt staging (rate-limit safe).
# Certbot failure is non-fatal — we keep the self-signed cert.
STAGING=${STAGING:-true}
CERT_EMAIL=${CERT_EMAIL:-jonathan.ludena@lproconsulting.com}
CERT_DOMAINS=${CERT_DOMAINS:-"app-challenge-0526.lproconsulting.com api-challenge-0526.lproconsulting.com"}

if [ "$SELF_SIGNED" = true ]; then
    echo "→ Obtaining Let's Encrypt certificate..."
    STAGING_FLAG=""
    if [ "$STAGING" = "true" ]; then
        STAGING_FLAG="--staging"
        echo "  STAGING mode active (--staging)"
    fi
    
    # Certbot failure should NOT break the deploy
    set +e
    docker compose --profile certbot run --rm certbot certonly --webroot \
      -w /var/www/certbot \
      $STAGING_FLAG \
      --email "$CERT_EMAIL" \
      --agree-tos \
      --non-interactive \
      -d app-challenge-0526.lproconsulting.com \
      -d api-challenge-0526.lproconsulting.com
    CERTBOT_EXIT=$?
    set -e
    
    if [ $CERTBOT_EXIT -eq 0 ]; then
        echo "  ✅ certbot completed successfully"
    else
        echo "  ⚠️  certbot exited with code $CERTBOT_EXIT — keeping self-signed cert"
    fi
fi

# ── Update SSL Certs with Real Certificates (DPL-02) ────────
# After certbot succeeds, copy the real Let's Encrypt certs
# to the path nginx is configured to read from.
if [ -f "./certbot/conf/live/app-challenge-0526.lproconsulting.com/fullchain.pem" ]; then
    echo "→ Copying real Let's Encrypt certificates..."
    cp "./certbot/conf/live/app-challenge-0526.lproconsulting.com/fullchain.pem" ./ssl-certs/fullchain.pem
    cp "./certbot/conf/live/app-challenge-0526.lproconsulting.com/privkey.pem" ./ssl-certs/privkey.pem
fi

# ── Reload Nginx with New Certificates (DPL-03) ─────────────
# Graceful reload — picks up new certs without dropping
# connections. Zero-downtime cert rotation.
if [ -d "./certbot/conf/live/app-challenge-0526.lproconsulting.com" ]; then
    echo "→ Reloading nginx with new certificates..."
    docker compose exec nginx nginx -s reload
    echo "  ✅ nginx reloaded successfully"
else
    echo "  ⚠️  No certificates found to reload nginx"
fi

# ── Cleanup ────────────────────────────────────────────────
echo "→ Pruning old images..."
docker image prune -f

echo "✅ Deploy completed"

# Show status
docker compose ps
