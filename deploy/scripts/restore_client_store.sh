#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  restore_client_store.sh --slug client-slug --db-backup FILE [options]

Options:
  --slug NAME            Client slug / compose project name.
  --db-backup FILE       Path to PostgreSQL .sql.gz backup.
  --uploads-backup FILE  Optional uploads .tar.gz backup.
  --client-dir PATH      Client directory (default: /opt/client-stores/<slug>)
  --force                Skip confirmation prompt.
  -h, --help             Show help.
EOF
}

CLIENT_SLUG=""
DB_BACKUP=""
UPLOADS_BACKUP=""
CLIENT_DIR=""
FORCE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug) CLIENT_SLUG="$2"; shift 2 ;;
    --db-backup) DB_BACKUP="$2"; shift 2 ;;
    --uploads-backup) UPLOADS_BACKUP="$2"; shift 2 ;;
    --client-dir) CLIENT_DIR="$2"; shift 2 ;;
    --force) FORCE="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${CLIENT_SLUG}" || -z "${DB_BACKUP}" ]]; then
  usage
  exit 1
fi

CLIENT_DIR="${CLIENT_DIR:-/opt/client-stores/${CLIENT_SLUG}}"
ENV_FILE="${CLIENT_DIR}/.env.registry"
COMPOSE_FILE="${CLIENT_DIR}/docker-compose.yml"

if [[ ! -f "${ENV_FILE}" || ! -f "${COMPOSE_FILE}" ]]; then
  echo "Missing client stack files under ${CLIENT_DIR}" >&2
  exit 1
fi

if [[ ! -f "${DB_BACKUP}" ]]; then
  echo "Missing DB backup: ${DB_BACKUP}" >&2
  exit 1
fi

if [[ -n "${UPLOADS_BACKUP}" && ! -f "${UPLOADS_BACKUP}" ]]; then
  echo "Missing uploads backup: ${UPLOADS_BACKUP}" >&2
  exit 1
fi

if [[ "${FORCE}" != "true" ]]; then
  read -r -p "This will overwrite database data for ${CLIENT_SLUG}. Continue? [y/N] " ANSWER
  if [[ "${ANSWER}" != "y" && "${ANSWER}" != "Y" ]]; then
    echo "Restore cancelled."
    exit 0
  fi
fi

set -a
source "${ENV_FILE}"
set +a

DB_CONTAINER="${CLIENT_SLUG}-db-1"
UPLOADS_VOLUME="${API_UPLOADS_VOLUME_NAME}"

docker exec -i "${DB_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO PUBLIC;
SQL

gunzip -c "${DB_BACKUP}" | docker exec -i "${DB_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"

if [[ -n "${UPLOADS_BACKUP}" ]]; then
  docker run --rm \
    -v "${UPLOADS_VOLUME}:/target" \
    -v "$(dirname "${UPLOADS_BACKUP}"):/backup:ro" \
    alpine sh -c "rm -rf /target/* && tar -xzf /backup/$(basename "${UPLOADS_BACKUP}") -C /target"
fi

echo "Restore completed for ${CLIENT_SLUG}."
