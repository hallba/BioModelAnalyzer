#!/bin/bash
# Apply OneDrive configuration fix
# This regenerates config.js and restarts the deployment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "Applying OneDrive Configuration Fix"
echo "========================================="
echo ""

# Detect Docker Compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "Error: Docker Compose not found"
    exit 1
fi

# Regenerate config.js with OneDrive settings
echo "Step 1: Regenerating config.js with OneDrive settings..."
bash "${SCRIPT_DIR}/scripts/generate-config.sh"
echo -e "${GREEN}✓ Config generated${NC}"
echo ""

# Show the generated config
if [ -f "${CONFIG_DIR}/config.js" ]; then
    echo "Generated config.js:"
    cat "${CONFIG_DIR}/config.js"
    echo ""
else
    echo "Error: config.js was not generated"
    exit 1
fi

# Restart deployment to pick up the new volume mount
echo "Step 2: Restarting deployment..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" --env-file "${CONFIG_DIR}/production.env" restart

echo ""
echo "Waiting for services to restart (10 seconds)..."
sleep 10

echo ""
echo "========================================="
echo -e "${GREEN}OneDrive Configuration Applied!${NC}"
echo "========================================="
echo ""
echo "The OneDrive button should now work in the application."
echo ""
echo "If OneDrive still doesn't work, check:"
echo "  1. Browser console for errors (F12)"
echo "  2. Verify config.js is loaded: view source and check for config.js"
echo "  3. Check OneDrive app registration in Azure Portal"
echo ""
