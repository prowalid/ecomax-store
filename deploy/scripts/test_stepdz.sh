#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  test_stepdz.sh [options]

Options:
  --skip-web-build     Do not rebuild web image.
  --skip-api-build     Do not rebuild api image.
  --allow-mixed        Allow mixed channels between API and WEB (default: disabled).
  --client-dir PATH    Client stack directory (default: /opt/client-stores/stepdz)
  --project NAME       Docker compose project name (default: stepdz)
  -h, --help           Show help.

Notes:
  - This script is TEST-ONLY. It does NOT push anything to GitHub or GHCR.
  - It rewires stepdz to local test tags:
      ghcr.io/walid733/express-trade-kit-web:stepdz-test
      ghcr.io/walid733/express-trade-kit-api:stepdz-test
EOF
}

BUILD_WEB="true"
BUILD_API="true"
ALLOW_MIXED="false"
CLIENT_DIR="/opt/client-stores/stepdz"
PROJECT_NAME="stepdz"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-web-build) BUILD_WEB="false"; shift ;;
    --skip-api-build) BUILD_API="false"; shift ;;
    --allow-mixed) ALLOW_MIXED="true"; shift ;;
    --client-dir) CLIENT_DIR="$2"; shift 2 ;;
    --project) PROJECT_NAME="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${CLIENT_DIR}/.env.registry"
COMPOSE_FILE="${CLIENT_DIR}/docker-compose.yml"
WEB_TEST_IMAGE="ghcr.io/walid733/express-trade-kit-web:stepdz-test"
API_TEST_IMAGE="ghcr.io/walid733/express-trade-kit-api:stepdz-test"

if [[ ! -f "${ENV_FILE}" || ! -f "${COMPOSE_FILE}" ]]; then
  echo "Missing stepdz stack files under ${CLIENT_DIR}" >&2
  exit 1
fi

CURRENT_API_IMAGE="$(grep -E '^ETK_API_IMAGE=' "${ENV_FILE}" | cut -d'=' -f2- || true)"
CURRENT_WEB_IMAGE="$(grep -E '^ETK_WEB_IMAGE=' "${ENV_FILE}" | cut -d'=' -f2- || true)"
BACKUP_FILE="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"

rollback_on_error() {
  local exit_code=$?
  if [[ $exit_code -ne 0 && -f "${BACKUP_FILE}" ]]; then
    cp "${BACKUP_FILE}" "${ENV_FILE}"
    docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d >/dev/null 2>&1 || true
    echo "test_stepdz.sh failed. Restored ${ENV_FILE} from backup." >&2
  fi
  return $exit_code
}

trap rollback_on_error EXIT

if [[ "${BUILD_API}" == "true" ]]; then
  docker build -f "${REPO_ROOT}/server/Dockerfile" -t "${API_TEST_IMAGE}" "${REPO_ROOT}/server"
fi

if [[ "${BUILD_WEB}" == "true" ]]; then
  docker build -f "${REPO_ROOT}/Dockerfile.web" -t "${WEB_TEST_IMAGE}" "${REPO_ROOT}"
fi

cp "${ENV_FILE}" "${BACKUP_FILE}"

TARGET_API_IMAGE="${CURRENT_API_IMAGE}"
TARGET_WEB_IMAGE="${CURRENT_WEB_IMAGE}"

if [[ "${BUILD_API}" == "true" ]]; then
  TARGET_API_IMAGE="${API_TEST_IMAGE}"
fi

if [[ "${BUILD_WEB}" == "true" ]]; then
  TARGET_WEB_IMAGE="${WEB_TEST_IMAGE}"
fi

is_test_channel() {
  [[ "$1" == *":stepdz-test" ]]
}

is_release_channel() {
  [[ "$1" =~ :v[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

if [[ "${ALLOW_MIXED}" != "true" ]]; then
  API_IS_TEST="false"
  WEB_IS_TEST="false"
  API_IS_RELEASE="false"
  WEB_IS_RELEASE="false"

  is_test_channel "${TARGET_API_IMAGE}" && API_IS_TEST="true"
  is_test_channel "${TARGET_WEB_IMAGE}" && WEB_IS_TEST="true"
  is_release_channel "${TARGET_API_IMAGE}" && API_IS_RELEASE="true"
  is_release_channel "${TARGET_WEB_IMAGE}" && WEB_IS_RELEASE="true"

  if [[ "${API_IS_TEST}" != "${WEB_IS_TEST}" ]] || [[ "${API_IS_RELEASE}" != "${WEB_IS_RELEASE}" ]]; then
    echo "Refusing mixed channels:" >&2
    echo "  ETK_API_IMAGE=${TARGET_API_IMAGE}" >&2
    echo "  ETK_WEB_IMAGE=${TARGET_WEB_IMAGE}" >&2
    echo "Use unified tags or pass --allow-mixed explicitly." >&2
    exit 1
  fi
fi

sed -i \
  -e "s|^ETK_API_IMAGE=.*|ETK_API_IMAGE=${TARGET_API_IMAGE}|" \
  -e "s|^ETK_WEB_IMAGE=.*|ETK_WEB_IMAGE=${TARGET_WEB_IMAGE}|" \
  "${ENV_FILE}"

if [[ "${BUILD_API}" == "true" && "${BUILD_WEB}" == "true" ]]; then
  docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate api web
elif [[ "${BUILD_API}" == "true" ]]; then
  docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate api
elif [[ "${BUILD_WEB}" == "true" ]]; then
  docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate web
else
  docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d
fi

echo
echo "stepdz test deployment complete."
echo "Current image refs in ${ENV_FILE}:"
grep -E '^ETK_(API|WEB)_IMAGE=' "${ENV_FILE}"
echo
docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps
trap - EXIT
