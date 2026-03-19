#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  backup_client_store.sh --slug client-slug [options]

Options:
  --slug NAME         Client slug / compose project name.
  --client-dir PATH   Client directory (default: /opt/client-stores/<slug>)
  --output-dir PATH   Backup output directory (default: /opt/backups/<slug>)
  -h, --help          Show help.

Creates:
  - PostgreSQL dump (.sql.gz)
  - uploads archive (.tar.gz)
  - env snapshot (.env.registry)
EOF
}

CLIENT_SLUG=""
CLIENT_DIR=""
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug) CLIENT_SLUG="$2"; shift 2 ;;
    --client-dir) CLIENT_DIR="$2"; shift 2 ;;
    --output-dir) OUTPUT_DIR="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${CLIENT_SLUG}" ]]; then
  usage
  exit 1
fi

CLIENT_DIR="${CLIENT_DIR:-/opt/client-stores/${CLIENT_SLUG}}"
OUTPUT_DIR="${OUTPUT_DIR:-/opt/backups/${CLIENT_SLUG}}"
ENV_FILE="${CLIENT_DIR}/.env.registry"
COMPOSE_FILE="${CLIENT_DIR}/docker-compose.yml"

if [[ ! -f "${ENV_FILE}" || ! -f "${COMPOSE_FILE}" ]]; then
  echo "Missing client stack files under ${CLIENT_DIR}" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DB_BACKUP="${OUTPUT_DIR}/${CLIENT_SLUG}-db-${TIMESTAMP}.sql.gz"
UPLOADS_BACKUP="${OUTPUT_DIR}/${CLIENT_SLUG}-uploads-${TIMESTAMP}.tar.gz"
ENV_SNAPSHOT="${OUTPUT_DIR}/${CLIENT_SLUG}-env-${TIMESTAMP}.registry"

set -a
source "${ENV_FILE}"
set +a

DB_CONTAINER="${CLIENT_SLUG}-db-1"
UPLOADS_VOLUME="${API_UPLOADS_VOLUME_NAME}"

cp "${ENV_FILE}" "${ENV_SNAPSHOT}"

docker exec -t "${DB_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "${DB_BACKUP}"

docker run --rm \
  -v "${UPLOADS_VOLUME}:/source:ro" \
  -v "${OUTPUT_DIR}:/backup" \
  alpine sh -c "tar -czf /backup/$(basename "${UPLOADS_BACKUP}") -C /source ."

echo "Backup completed."
echo "DB:      ${DB_BACKUP}"
echo "Uploads: ${UPLOADS_BACKUP}"
echo "Env:     ${ENV_SNAPSHOT}"
