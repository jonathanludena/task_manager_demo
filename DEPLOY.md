# 🚀 Deploy — VPS + SSL + CI/CD

> **Guía de despliegue en un VPS Hostinger con Docker, Let's Encrypt SSL, y GitHub Actions CI/CD.**

Esta guía cubre el deploy completo de la aplicación Task Manager: desde la preparación del VPS hasta la renovación automática de certificados SSL.

---

## 📋 Prerrequisitos del VPS

Antes del primer deploy, el VPS debe tener instalado:

| Requisito          | Versión mínima      | Verificación                  |
| :----------------- | :------------------ | :---------------------------- |
| **Docker**         | 24+                 | `docker --version`            |
| **Docker Compose** | v2 (plugin)         | `docker compose version`      |
| **Git**            | cualquiera reciente | `git --version`               |
| **OpenSSL**        | cualquiera reciente | `openssl version`             |
| **curl**           | cualquiera reciente | `curl --version`              |

### Instalación en Ubuntu/Debian

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # logout/login para aplicar

# Docker Compose (ya viene incluido con Docker 24+)
docker compose version
```

### Firewall (Hostinger)

Asegurate de que los puertos **80** (HTTP) y **443** (HTTPS) estén abiertos en el panel de Hostinger. Sin estos puertos, Let's Encrypt no puede validar el dominio mediante el desafío HTTP-01 y los usuarios no pueden acceder a la aplicación.

### DNS

Configurá estos registros DNS **tipo A** en tu proveedor de dominios, apuntando a la IP pública del VPS:

| Subdominio                                  | Tipo | Valor     |
| :------------------------------------------ | :--- | :-------- |
| `app-challenge-0526.lproconsulting.com`     | A    | `<VPS_IP>` |
| `api-challenge-0526.lproconsulting.com`     | A    | `<VPS_IP>` |

> **Nota**: Ambos subdominios comparten el mismo certificado SSL multi-SAN. No necesitás registros CNAME separados — con registros A es suficiente.

### GitHub Deploy Key (solo si el repo es privado)

Si el repositorio es privado, generá una deploy key en el VPS y agregala como **Deploy Key** en Settings del repo:

```bash
# En el VPS
ssh-keygen -t ed25519 -C "deploy@vps" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub   # Copiá esta key pública
```

Luego en GitHub: **Settings → Deploy Keys → Add Deploy Key** (sin write access).

---

## 🔐 Secrets en GitHub Actions

Estos 4 secrets deben estar configurados en el repositorio de GitHub (**Settings → Secrets and variables → Actions → Repository secrets**):

| Secret         | Descripción                                    |
| :------------- | :--------------------------------------------- |
| `VPS_HOST`     | IP pública o hostname del VPS                  |
| `VPS_USER`     | Usuario SSH con acceso al VPS                  |
| `VPS_APP_PATH` | Ruta absoluta donde se clonó el repo en el VPS (ej. `/home/ubuntu/app`) |
| `VPS_SSH_KEY`  | Clave privada SSH (ED25519 o RSA) para conectarse al VPS |

> **Importante**: La clave privada (`VPS_SSH_KEY`) debe ser la **misma** cuya pública está en `~/.ssh/authorized_keys` del VPS. Pegala completa, incluyendo `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`.

---

## 🐣 Primer Deploy — Paso a Paso

### 1. Clonar el repositorio en el VPS

```bash
# Si el repo es público
git clone git@github.com:tu-usuario/challenge_smartjob_may2026.git ~/app
cd ~/app

# Si usaste deploy key (repo privado)
GIT_SSH_COMMAND='ssh -i ~/.ssh/github_deploy -o IdentitiesOnly=yes' \
  git clone git@github.com:tu-usuario/challenge_smartjob_may2026.git ~/app
```

### 2. Configurar el archivo `.env`

```bash
cp .env.example .env
vim .env   # o nano .env
```

Editá **solo** `DB_PASSWORD` con una contraseña segura. Las otras variables (`STAGING=true`, `CERT_EMAIL`, `CERT_DOMAINS`) ya vienen con valores por defecto correctos.

### 3. Primer deploy con staging

El flag `STAGING=true` usa el **entorno de staging de Let's Encrypt**, que tiene rate limits mucho más generosos. Ideal para probar que todo funciona antes de solicitar certificados reales.

```bash
STAGING=true ./deploy.sh
```

> **Qué esperar**: El script genera un certificado autofirmado temporal, construye las imágenes Docker, levanta todos los servicios, y luego ejecuta certbot contra el entorno de staging. Si certbot falla (DNS no propagado, por ejemplo), la aplicación sigue funcionando con el certificado autofirmado — no es un bloqueante.

### 4. Verificar que el certificado staging funciona

```bash
# Verificar que ambos subdominios responden con SSL (ignorando advertencias de staging)
curl -k https://app-challenge-0526.lproconsulting.com/health
curl -k https://api-challenge-0526.lproconsulting.com/health

# También podés abrir los subdominios en el navegador.
# Con staging vas a ver una advertencia "Fake LE Intermediate X1" — es esperado.
```

### 5. Cambiar a producción

Una vez verificado que todo funciona con staging, ejecutá el deploy con staging desactivado para obtener certificados reales:

```bash
STAGING=false ./deploy.sh
```

> ⚠️ **Rate limits de producción**: Let's Encrypt permite 5 certificados por dominio por semana. Si algo falla y necesitás re-ejecutar, volvé a `STAGING=true` para pruebas y solo usá `STAGING=false` cuando estés seguro.

---

## 🔄 Cómo funciona deploy.sh

El script `deploy.sh` sigue este flujo en cada ejecución:

```
git pull origin main
     │
     ▼
┌─────────────────────────────────────┐
│ 1. SSL Bootstrap                    │
│    └─ Genera certificado autofirmado│
│       temporal (1 día) si no existe │
│       un cert real de Let's Encrypt │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 2. Build + Start                    │
│    ├─ docker compose build          │
│    └─ docker compose up -d          │
│    Nginx arranca con el cert        │
│    autofirmado en puertos 80/443    │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 3. Wait for Nginx                   │
│    └─ Curl /health cada 2s (max 30s)│
│       Asegura que nginx esté listo  │
│       antes de ejecutar certbot     │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 4. Certbot (solo si hay self-signed)│
│    ├─ STAGING=true → --staging      │
│    ├─ STAGING=false → producción    │
│    ├─ certonly --webroot            │
│    └─ Fallo NO bloquea el deploy    │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 5. Copy real certs → ./ssl-certs/   │
│    └─ Reemplaza el autofirmado con  │
│       los certs reales de LE        │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 6. Reload Nginx                     │
│    └─ nginx -s reload (sin downtime)│
│       Recarga la config con los     │
│       nuevos certificados           │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 7. Cleanup                          │
│    └─ docker image prune -f         │
│       Elimina imágenes viejas       │
└─────────────────────────────────────┘
```

**Idempotencia**: El script es seguro de ejecutar múltiples veces. Si ya existen certificados reales en `./certbot/conf/live/`, saltea los pasos 1 y 4 y solo hace build + start + reload.

**Servicios que levanta**: `nginx` (edge proxy SSL), `frontend` (SPA estática), `backend` (API Fastify), `postgres` (base de datos). El servicio `certbot` solo se ejecuta bajo demanda con `--profile certbot`.

---

## 🔄 SSL Renewal

Los certificados de Let's Encrypt son válidos por **90 días**. La renovación debe ocurrir antes del vencimiento para evitar interrupciones.

### Renovación automática (recomendada)

Agregá esta línea al crontab del VPS para renovar automáticamente dos veces al día:

```bash
crontab -e
```

```cron
0 2,14 * * * cd /home/ubuntu/app && docker compose --profile certbot run --rm certbot renew && docker compose exec nginx nginx -s reload
```

> Se ejecuta a las 2:00 AM y 2:00 PM. `certbot renew` solo renueva certificados que estén a menos de 30 días de expirar — las ejecuciones sin nada que renovar son inofensivas.

### Renovación manual

Si necesitás renovar manualmente (por ejemplo, después de agregar un dominio):

```bash
cd /home/ubuntu/app
docker compose --profile certbot run --rm certbot renew
docker compose exec nginx nginx -s reload
```

### Verificar fecha de expiración

```bash
openssl x509 -enddate -noout -in ./ssl-certs/fullchain.pem
```

Salida esperada: `notAfter=Aug  1 12:00:00 2026 GMT` (la fecha exacta depende de cuándo se emitió).

### Staging vs producción en renovación

Certbot recuerda qué entorno usó cada certificado (staging o producción) — no necesitás pasar flags adicionales. Para forzar staging en pruebas:

```bash
STAGING=true docker compose --profile certbot run --rm certbot renew --staging
```

---

## 🔧 Troubleshooting

### ❌ Port 80 in use

```bash
# Ver qué está usando el puerto
sudo lsof -i :80

# Si es otro contenedor o proceso, detenelo
docker compose down
sudo systemctl stop apache2   # si tenés Apache
sudo systemctl stop nginx     # si tenés nginx nativo
```

### ❌ DNS not propagated

```bash
# Verificá que los registros DNS se hayan propagado
nslookup app-challenge-0526.lproconsulting.com
nslookup api-challenge-0526.lproconsulting.com

# Si apuntan a la IP correcta pero certbot falla, esperá unos minutos
# La propagación DNS puede tardar hasta 24 horas (aunque usualmente son 5-15 min)
```

### ❌ certbot rate limits

Let's Encrypt tiene rate limits estrictos para producción:

| Límite                         | Valor                      |
| :----------------------------- | :------------------------- |
| Certificados por dominio       | 5 por semana               |
| Fallos de validación por cuenta | 5 por hora                |

Si llegás al límite, usá `STAGING=true` mientras debuggeás — el entorno de staging tiene límites mucho más altos (60 por hora).

### ❌ nginx -t fails

```bash
# Para debuggear la configuración de nginx
docker compose exec nginx nginx -t

# Errores comunes:
# - ssl_certificate no such file → los certificados no están en ./ssl-certs/
# - host not found in upstream → los servicios frontend/backend no están corriendo
```

### ❌ Docker not installed

Si `docker: command not found`:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Cerrá sesión y volvé a entrar
```

### ❌ "Permission denied" en el deploy SSH

Verificá que:
1. `VPS_SSH_KEY` en GitHub Secrets sea la **clave privada completa** (no la pública)
2. La clave pública correspondiente esté en `~/.ssh/authorized_keys` del VPS
3. El usuario (`VPS_USER`) tenga permisos de escritura en `VPS_APP_PATH`

```bash
# En el VPS, verificá los permisos
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### ❌ Servicios no se levantan después del deploy

```bash
# Ver estado de los servicios
docker compose ps

# Ver logs de un servicio específico
docker compose logs nginx
docker compose logs backend
docker compose logs frontend

# Ver logs de todos
docker compose logs --tail=50
```

---

## 📊 Verificación Post-Deploy

Después de un deploy exitoso, verificá que todo funcione:

```bash
# 1. Nginx respondiendo en HTTP (debe redirigir 301 a HTTPS)
curl -I http://app-challenge-0526.lproconsulting.com/health

# 2. HTTPS frontend
curl -s https://app-challenge-0526.lproconsulting.com/health

# 3. HTTPS backend API
curl -s https://api-challenge-0526.lproconsulting.com/health

# 4. Certificado SSL válido
echo | openssl s_client -connect app-challenge-0526.lproconsulting.com:443 -servername app-challenge-0526.lproconsulting.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```
