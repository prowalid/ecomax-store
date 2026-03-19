#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  verify_client_stack.sh --slug client-slug [options]

Options:
  --slug NAME         Client slug / compose project name.
  --client-dir PATH   Client directory (default: /opt/client-stores/<slug>)
  --domain DOMAIN     Override application domain; otherwise reads APP_DOMAIN from env.
  -h, --help          Show help.
EOF
}

CLIENT_SLUG=""
CLIENT_DIR=""
APP_DOMAIN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug) CLIENT_SLUG="$2"; shift 2 ;;
    --client-dir) CLIENT_DIR="$2"; shift 2 ;;
    --domain) APP_DOMAIN="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${CLIENT_SLUG}" ]]; then
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

set -a
source "${ENV_FILE}"
set +a

APP_DOMAIN="${APP_DOMAIN:-${APP_DOMAIN:-}}"
if [[ -z "${APP_DOMAIN}" ]]; then
  echo "APP_DOMAIN is required" >&2
  exit 1
fi

docker compose -p "${CLIENT_SLUG}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps
echo
curl -fsS "https://${APP_DOMAIN}/api/health" | sed -n '1p'
echo
curl -fsS "https://${APP_DOMAIN}/api/health/ready" | sed -n '1p'
echo
curl -fsS "https://${APP_DOMAIN}/api/openapi.json" | sed -n '1p'
echo

if [[ -n "${METRICS_TOKEN:-}" ]]; then
  curl -fsS -H "Authorization: Bearer ${METRICS_TOKEN}" "https://${APP_DOMAIN}/api/metrics" | sed -n '1,5p'
  echo
fi
