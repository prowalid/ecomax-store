#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_DIR="${1:-/opt/edge-proxy}"
EDGE_NETWORK="${EDGE_NETWORK:-etk-edge}"

mkdir -p "${TARGET_DIR}/sites"

cp "${REPO_ROOT}/deploy/Caddyfile.edge" "${TARGET_DIR}/Caddyfile"
cp "${REPO_ROOT}/deploy/docker-compose.edge-proxy.yml" "${TARGET_DIR}/docker-compose.yml"

docker network inspect "${EDGE_NETWORK}" >/dev/null 2>&1 || docker network create "${EDGE_NETWORK}"

(
  cd "${TARGET_DIR}"
  EDGE_NETWORK="${EDGE_NETWORK}" docker compose up -d
)

echo "Edge proxy installed in ${TARGET_DIR}"
echo "Shared network: ${EDGE_NETWORK}"
echo "Client site configs directory: ${TARGET_DIR}/sites"
