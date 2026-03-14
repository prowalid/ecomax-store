#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  create_client_store.sh --slug client-a --domain client-a.com [options]

Options:
  --slug            Unique client slug, e.g. client-a
  --domain          Client domain, e.g. client-a.com
  --base-dir        Base directory for client stacks (default: /opt/client-stores)
  --edge-dir        Edge proxy directory (default: /opt/edge-proxy)
  --api-image       API image tag (default: ghcr.io/walid733/express-trade-kit-api:v1.0.19)
  --web-image       Web image tag (default: ghcr.io/walid733/express-trade-kit-web:v1.0.19)
  --db-password     Database password (auto-generated if omitted)
  --jwt-secret      JWT secret (auto-generated if omitted)
  --up              Start the client stack after generating files
EOF
}

rand_secret() {
  openssl rand -hex 24
}

CLIENT_SLUG=""
APP_DOMAIN=""
BASE_DIR="/opt/client-stores"
EDGE_DIR="/opt/edge-proxy"
API_IMAGE="ghcr.io/walid733/express-trade-kit-api:v1.0.19"
WEB_IMAGE="ghcr.io/walid733/express-trade-kit-web:v1.0.19"
POSTGRES_PASSWORD=""
JWT_SECRET=""
START_STACK="false"
EDGE_NETWORK="${EDGE_NETWORK:-etk-edge}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug) CLIENT_SLUG="$2"; shift 2 ;;
    --domain) APP_DOMAIN="$2"; shift 2 ;;
    --base-dir) BASE_DIR="$2"; shift 2 ;;
    --edge-dir) EDGE_DIR="$2"; shift 2 ;;
    --api-image) API_IMAGE="$2"; shift 2 ;;
    --web-image) WEB_IMAGE="$2"; shift 2 ;;
    --db-password) POSTGRES_PASSWORD="$2"; shift 2 ;;
    --jwt-secret) JWT_SECRET="$2"; shift 2 ;;
    --up) START_STACK="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${CLIENT_SLUG}" || -z "${APP_DOMAIN}" ]]; then
  usage
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLIENT_DIR="${BASE_DIR}/${CLIENT_SLUG}"
SITE_CONFIG="${EDGE_DIR}/sites/${CLIENT_SLUG}.caddy"

POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(rand_secret)}"
JWT_SECRET="${JWT_SECRET:-$(rand_secret)$(rand_secret)}"

mkdir -p "${CLIENT_DIR}"
mkdir -p "${EDGE_DIR}/sites"

cp "${REPO_ROOT}/deploy/docker-compose.client-stack.yml" "${CLIENT_DIR}/docker-compose.yml"
cp "${REPO_ROOT}/deploy/client-multi.env.template" "${CLIENT_DIR}/.env.registry"
cp "${REPO_ROOT}/server/src/db/init.sql" "${CLIENT_DIR}/init.sql"
cp "${REPO_ROOT}/deploy/Caddyfile.client-internal" "${CLIENT_DIR}/Caddyfile.client"

sed -i \
  -e "s/^CLIENT_SLUG=.*/CLIENT_SLUG=${CLIENT_SLUG}/" \
  -e "s/^APP_DOMAIN=.*/APP_DOMAIN=${APP_DOMAIN}/" \
  -e "s|^CORS_ORIGINS=.*|CORS_ORIGINS=https://${APP_DOMAIN}|" \
  -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASSWORD}/" \
  -e "s/^POSTGRES_VOLUME_NAME=.*/POSTGRES_VOLUME_NAME=${CLIENT_SLUG}_postgres_data/" \
  -e "s/^API_LOGS_VOLUME_NAME=.*/API_LOGS_VOLUME_NAME=${CLIENT_SLUG}_api_logs/" \
  -e "s/^API_UPLOADS_VOLUME_NAME=.*/API_UPLOADS_VOLUME_NAME=${CLIENT_SLUG}_api_uploads/" \
  -e "s/^API_BACKUPS_VOLUME_NAME=.*/API_BACKUPS_VOLUME_NAME=${CLIENT_SLUG}_api_backups/" \
  -e "s/^JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" \
  -e "s|^ETK_API_IMAGE=.*|ETK_API_IMAGE=${API_IMAGE}|" \
  -e "s|^ETK_WEB_IMAGE=.*|ETK_WEB_IMAGE=${WEB_IMAGE}|" \
  -e "s/^EDGE_NETWORK=.*/EDGE_NETWORK=${EDGE_NETWORK}/" \
  "${CLIENT_DIR}/.env.registry"

cat > "${SITE_CONFIG}" <<EOF
${APP_DOMAIN} {
  encode gzip zstd
  reverse_proxy ${CLIENT_SLUG}-web:80
}
EOF

docker network inspect "${EDGE_NETWORK}" >/dev/null 2>&1 || docker network create "${EDGE_NETWORK}"
docker volume inspect "${CLIENT_SLUG}_postgres_data" >/dev/null 2>&1 || docker volume create "${CLIENT_SLUG}_postgres_data" >/dev/null
docker volume inspect "${CLIENT_SLUG}_api_logs" >/dev/null 2>&1 || docker volume create "${CLIENT_SLUG}_api_logs" >/dev/null
docker volume inspect "${CLIENT_SLUG}_api_uploads" >/dev/null 2>&1 || docker volume create "${CLIENT_SLUG}_api_uploads" >/dev/null
docker volume inspect "${CLIENT_SLUG}_api_backups" >/dev/null 2>&1 || docker volume create "${CLIENT_SLUG}_api_backups" >/dev/null

if [[ -f "${EDGE_DIR}/docker-compose.yml" ]]; then
  (
    cd "${EDGE_DIR}"
    EDGE_NETWORK="${EDGE_NETWORK}" docker compose up -d
    docker compose exec -T edge-proxy caddy reload --config /etc/caddy/Caddyfile >/dev/null 2>&1 || docker compose restart edge-proxy >/dev/null 2>&1 || true
  )
fi

if [[ "${START_STACK}" == "true" ]]; then
  (
    cd "${CLIENT_DIR}"
    docker compose -p "${CLIENT_SLUG}" --env-file .env.registry up -d
  )
fi

cat <<EOF
Client stack prepared successfully.

Client directory:
  ${CLIENT_DIR}

Client env file:
  ${CLIENT_DIR}/.env.registry

Edge site config:
  ${SITE_CONFIG}

Start command:
  cd ${CLIENT_DIR} && docker compose -p ${CLIENT_SLUG} --env-file .env.registry up -d
EOF
