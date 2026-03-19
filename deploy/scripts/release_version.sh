#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  release_version.sh --version vX.Y.Z [options]

Required:
  --version vX.Y.Z        Release tag, example: v1.0.7

Options:
  --skip-git              Skip git cleanliness and push checks.
  --skip-stepdz-update    Do not switch stepdz to the released version.
  --client-dir PATH       stepdz client directory (default: /opt/client-stores/stepdz)
  --project NAME          Docker compose project name (default: stepdz)
  -h, --help              Show help.

What this script does:
  1) (Optional strict check) verifies local git status is clean.
  2) Builds api/web images for the provided version.
  3) Tags both images as :latest.
  4) Pushes version + latest to GHCR.
  5) Updates stepdz image refs to the released version (unless skipped).
EOF
}

VERSION=""
SKIP_GIT="false"
SKIP_STEPDZ_UPDATE="false"
CLIENT_DIR="/opt/client-stores/stepdz"
PROJECT_NAME="stepdz"

wait_for_stack_health() {
  local env_file="$1"
  local compose_file="$2"
  local project_name="$3"
  local domain="$4"
  local attempts=30

  for ((i=1; i<=attempts; i++)); do
    local api_status
    api_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${project_name}-api-1" 2>/dev/null || true)"
    if [[ "${api_status}" == "healthy" ]]; then
      if [[ -n "${domain}" ]]; then
        if curl -fsS "https://${domain}/api/health" >/dev/null 2>&1; then
          return 0
        fi
      else
        return 0
      fi
    fi

    sleep 2
  done

  echo "Timed out waiting for ${project_name} stack health." >&2
  docker compose -p "${project_name}" --env-file "${env_file}" -f "${compose_file}" ps >&2 || true
  return 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version) VERSION="$2"; shift 2 ;;
    --skip-git) SKIP_GIT="true"; shift ;;
    --skip-stepdz-update) SKIP_STEPDZ_UPDATE="true"; shift ;;
    --client-dir) CLIENT_DIR="$2"; shift 2 ;;
    --project) PROJECT_NAME="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${VERSION}" ]]; then
  usage
  exit 1
fi

if [[ ! "${VERSION}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version format: ${VERSION}. Expected vX.Y.Z" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_IMAGE="ghcr.io/prowalid/ecomax-store-api:${VERSION}"
WEB_IMAGE="ghcr.io/prowalid/ecomax-store-web:${VERSION}"
API_IMAGE_LATEST="ghcr.io/prowalid/ecomax-store-api:latest"
WEB_IMAGE_LATEST="ghcr.io/prowalid/ecomax-store-web:latest"
MANIFEST_FILE="${REPO_ROOT}/deploy/releases.json"
ENV_FILE="${CLIENT_DIR}/.env.registry"
COMPOSE_FILE="${CLIENT_DIR}/docker-compose.yml"

if [[ "${SKIP_GIT}" == "false" ]]; then
  BRANCH_NAME="$(git -C "${REPO_ROOT}" branch --show-current)"
  if [[ "${BRANCH_NAME}" != "main" ]]; then
    echo "Release is only allowed from branch 'main'. Current branch: ${BRANCH_NAME}" >&2
    exit 1
  fi

  git -C "${REPO_ROOT}" fetch origin main

  if [[ -n "$(git -C "${REPO_ROOT}" status --porcelain)" ]]; then
    echo "Git working tree is not clean. Commit/push first, or use --skip-git." >&2
    exit 1
  fi

  LOCAL_HEAD="$(git -C "${REPO_ROOT}" rev-parse HEAD)"
  REMOTE_HEAD="$(git -C "${REPO_ROOT}" rev-parse origin/main)"
  if [[ "${LOCAL_HEAD}" != "${REMOTE_HEAD}" ]]; then
    echo "Local HEAD is not aligned with origin/main. Push/pull before release." >&2
    echo "local=${LOCAL_HEAD}" >&2
    echo "origin/main=${REMOTE_HEAD}" >&2
    exit 1
  fi
fi

if [[ ! -f "${MANIFEST_FILE}" ]]; then
  echo "Missing release manifest: ${MANIFEST_FILE}" >&2
  exit 1
fi

if ! node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
const version = process.argv[2];
const entry = manifest.releases?.find((item) => item.version === version);
const stable = manifest.latest?.stable;
if (!entry) {
  console.error('Release manifest does not contain an entry for ' + version);
  process.exit(1);
}
if (stable !== version) {
  console.error('Release manifest latest.stable must match ' + version + ', found ' + stable);
  process.exit(1);
}
if (entry.api_image !== process.argv[3] || entry.web_image !== process.argv[4]) {
  console.error('Release manifest image refs do not match this release version.');
  process.exit(1);
}
" "${MANIFEST_FILE}" "${VERSION}" "${API_IMAGE}" "${WEB_IMAGE}"; then
  exit 1
fi

GIT_COMMIT="$(git -C "${REPO_ROOT}" rev-parse --short HEAD)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if docker manifest inspect "${API_IMAGE}" >/dev/null 2>&1 || docker manifest inspect "${WEB_IMAGE}" >/dev/null 2>&1; then
  echo "Version ${VERSION} already exists in GHCR. Use a new version." >&2
  exit 1
fi

docker build \
  -f "${REPO_ROOT}/server/Dockerfile" \
  --build-arg ETK_API_VERSION="${VERSION}" \
  --build-arg ETK_WEB_VERSION="${VERSION}" \
  --build-arg ETK_GIT_COMMIT="${GIT_COMMIT}" \
  --build-arg ETK_BUILD_TIME="${BUILD_TIME}" \
  --build-arg ETK_RELEASE_CHANNEL="stable" \
  --build-arg ETK_API_IMAGE_REF="${API_IMAGE}" \
  --build-arg ETK_WEB_IMAGE_REF="${WEB_IMAGE}" \
  -t "${API_IMAGE}" "${REPO_ROOT}"
docker build \
  -f "${REPO_ROOT}/Dockerfile.web" \
  --build-arg ETK_WEB_VERSION="${VERSION}" \
  --build-arg ETK_GIT_COMMIT="${GIT_COMMIT}" \
  --build-arg ETK_BUILD_TIME="${BUILD_TIME}" \
  --build-arg ETK_RELEASE_CHANNEL="stable" \
  -t "${WEB_IMAGE}" "${REPO_ROOT}"

docker tag "${API_IMAGE}" "${API_IMAGE_LATEST}"
docker tag "${WEB_IMAGE}" "${WEB_IMAGE_LATEST}"

docker push "${API_IMAGE}"
docker push "${WEB_IMAGE}"
docker push "${API_IMAGE_LATEST}"
docker push "${WEB_IMAGE_LATEST}"

if [[ "${SKIP_STEPDZ_UPDATE}" == "false" ]]; then
  if [[ ! -f "${ENV_FILE}" || ! -f "${COMPOSE_FILE}" ]]; then
    echo "Missing stepdz stack files under ${CLIENT_DIR}" >&2
    exit 1
  fi

  BACKUP_FILE="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
  cp "${ENV_FILE}" "${BACKUP_FILE}"
  sed -i \
    -e "s|^ETK_API_IMAGE=.*|ETK_API_IMAGE=${API_IMAGE}|" \
    -e "s|^ETK_WEB_IMAGE=.*|ETK_WEB_IMAGE=${WEB_IMAGE}|" \
    "${ENV_FILE}"

  STEP_DOMAIN="$(grep -E '^APP_DOMAIN=' "${ENV_FILE}" | cut -d'=' -f2- || true)"

  if ! docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate api web; then
    cp "${BACKUP_FILE}" "${ENV_FILE}"
    docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d || true
    echo "Stepdz update failed. Restored env backup: ${BACKUP_FILE}" >&2
    exit 1
  fi

  if ! wait_for_stack_health "${ENV_FILE}" "${COMPOSE_FILE}" "${PROJECT_NAME}" "${STEP_DOMAIN}"; then
    cp "${BACKUP_FILE}" "${ENV_FILE}"
    docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d || true
    echo "Stepdz health verification failed. Restored env backup: ${BACKUP_FILE}" >&2
    exit 1
  fi
fi

echo
echo "Release completed: ${VERSION}"
echo "Pushed:"
echo "  ${API_IMAGE}"
echo "  ${WEB_IMAGE}"
echo "  ${API_IMAGE_LATEST}"
echo "  ${WEB_IMAGE_LATEST}"

if [[ "${SKIP_STEPDZ_UPDATE}" == "false" ]]; then
  echo
  echo "stepdz updated to ${VERSION}."
  grep -E '^ETK_(API|WEB)_IMAGE=' "${ENV_FILE}"
  docker compose -p "${PROJECT_NAME}" --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps
fi
