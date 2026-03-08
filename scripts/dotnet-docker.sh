#!/bin/bash
# Helper script to run dotnet commands via Docker when SDK is not installed locally
# Usage: ./scripts/dotnet-docker.sh <dotnet-command>
# Example: ./scripts/dotnet-docker.sh build src/BmaLinuxApi
#          ./scripts/dotnet-docker.sh test
#          ./scripts/dotnet-docker.sh publish src/BmaLinuxApi -c Release

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_IMAGE="mcr.microsoft.com/dotnet/sdk:8.0"

if [ $# -eq 0 ]; then
    echo "Usage: $0 <dotnet-command> [args...]"
    echo ""
    echo "Examples:"
    echo "  $0 build src/BmaLinuxApi"
    echo "  $0 test"
    echo "  $0 run --project src/BmaLinuxApi"
    echo "  $0 publish src/BmaLinuxApi -c Release -r linux-x64 --self-contained"
    exit 1
fi

echo "Running: dotnet $@"
echo "Using Docker image: $DOCKER_IMAGE"
echo ""

docker run --rm \
    -v "$REPO_ROOT":/src \
    -w /src \
    "$DOCKER_IMAGE" \
    dotnet "$@"
