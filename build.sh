#!/bin/bash
# Build and optionally run BioModelAnalyzer Linux API
# Usage:
#   ./build.sh          # Build only
#   ./build.sh run      # Build and run
#   ./build.sh test     # Build, run, and execute regression tests

set -euo pipefail

IMAGE="bma-linux-api"
CONTAINER="bma-linux-api"
PORT=8020

echo "Building ${IMAGE}..."
docker build -f src/BmaLinuxApi/Dockerfile -t "${IMAGE}" .

echo "Build complete."

case "${1:-}" in
    run)
        docker rm -f "${CONTAINER}" 2>/dev/null || true
        echo "Starting ${CONTAINER} on port ${PORT}..."
        docker run -d --name "${CONTAINER}" -p "${PORT}:${PORT}" "${IMAGE}"
        echo "Running at http://0.0.0.0:${PORT}/"
        ;;
    test)
        docker rm -f "${CONTAINER}" 2>/dev/null || true
        echo "Starting ${CONTAINER} on port ${PORT}..."
        docker run -d --name "${CONTAINER}" -p "${PORT}:${PORT}" "${IMAGE}"
        echo "Running regression tests..."
        bash scripts/regression-test.sh "http://localhost:${PORT}"
        docker rm -f "${CONTAINER}" 2>/dev/null || true
        ;;
    *)
        echo "Usage: ./build.sh [run|test]"
        ;;
esac
