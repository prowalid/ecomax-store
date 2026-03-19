#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  rotate_client_secrets.sh --slug client-slug [options]

Options:
  --slug NAME          Client slug / compose project name.
  --client-dir PATH    Client directory (default: /opt/client-stores/<slug>)
  --rotate-jwt         Rotate JWT_SECRET.
  --rotate-metrics     Rotate METRICS_TOKEN.
  --apply              Recreate api service after updating env.
  -h, --help           Show help.
EOF
}

rand_secret() {
  openssl rand -hex 24
}

CLIENT_SLUG=""
CLIENT_DIR=""
ROTATE_JWT="false"
ROTATE_METRICS="false"
APPLY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug) CLIENT_SLUG="$2"; shift 2 ;;
    --client-dir) CLIENT_DIR="$2"; shift 2 ;;
    --rotate-jwt) ROTATE_JWT="true"; shift ;;
    --rotate-metrics) ROTATE_METRICS="true"; shift ;;
    --apply) APPLY="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${CLIENT_SLUG}" ]]; then
  usage
  exit 1
fi

if [[ "${ROTATE_JWT}" != "true" && "${ROTATE_METRICS}" != "true" ]]; then
  echo "Nothing to rotate. Pass --rotate-jwt and/or --rotate-metrics." >&2
  exit 1
fi

CLIENT_DIR="${CLIENT_DIR:-/opt/client-stores/${CLIENT_SLUG}}"
ENV_FILE="${CLIENT_DIR}/.env.registry"
COMPOSE_FILE="${CLIENT_DIR}/docker-compose.yml"

if [[ ! -f "${ENV_FILE}" || ! -f "${COMPOSE_FILE}" ]]; then
  echo "Missing client stack files under ${CLIENT_DIR}" >&2
  exit 1
fi

BACKUP_FILE="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
cp "${ENV_FILE}" "${BACKUP_FILE}"

upsert_env_value() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "${ENV_FILE}"; then
    sed -i -e "s/^${key}=.*/${key}=${value}/" "${ENV_FILE}"
  else
    printf '\n%s=%s\n' "${key}" "${value}" >> "${ENV_FILE}"
  fi
}

if [[ "${ROTATE_JWT}" == "true" ]]; then
  upsert_env_value "JWT_SECRET" "$(rand_secret)$(rand_secret)"
fi

if [[ "${ROTATE_METRICS}" == "true" ]]; then
  upsert_env_value "METRICS_TOKEN" "$(rand_secret)"
fi

if [[ "${APPLY}" == "true" ]]; then
  docker compose -p "${CLIENT_SLUG}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate api
fi

echo "Secrets rotated for ${CLIENT_SLUG}."
echo "Backup: ${BACKUP_FILE}"
