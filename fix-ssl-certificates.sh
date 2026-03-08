#!/bin/bash
# Comprehensive SSL certificate fix and deployment restart
# This ensures certificates exist and services can access them

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "SSL Certificate Fix & Restart"
echo "========================================="
echo ""

# Detect Docker Compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose not found${NC}"
    exit 1
fi

# Check if production.env exists
if [ ! -f "${CONFIG_DIR}/production.env" ]; then
    echo -e "${RED}Error: config/production.env not found${NC}"
    echo "Run './deploy-production.sh setup' first"
    exit 1
fi

# Load environment
echo "Loading configuration..."
source <(tr -d '\r' < "${CONFIG_DIR}/production.env")
echo -e "${GREEN}✓ Configuration loaded${NC}"
echo "  DOMAIN: ${DOMAIN}"
echo "  SSL_MODE: ${SSL_MODE:-letsencrypt}"
echo ""

# Ensure SSL directory exists
mkdir -p "${CONFIG_DIR}/ssl"

# Generate or verify self-signed certificates
echo "Checking self-signed certificates..."
if [ -f "${CONFIG_DIR}/ssl/selfsigned.crt" ] && [ -f "${CONFIG_DIR}/ssl/selfsigned.key" ]; then
    echo -e "${GREEN}✓ Self-signed certificates already exist${NC}"
else
    echo "Generating self-signed certificates..."
    if openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${CONFIG_DIR}/ssl/selfsigned.key" \
        -out "${CONFIG_DIR}/ssl/selfsigned.crt" \
        -subj "/C=US/ST=State/L=City/O=BioModelAnalyzer/CN=${DOMAIN}" 2>/dev/null; then
        echo -e "${GREEN}✓ Self-signed certificates generated${NC}"
    else
        echo -e "${RED}✗ Failed to generate certificates${NC}"
        echo "Make sure openssl is installed"
        exit 1
    fi
fi

# Verify certificate files
echo ""
echo "Verifying certificate files..."
if [ -f "${CONFIG_DIR}/ssl/selfsigned.crt" ]; then
    SIZE=$(stat -f%z "${CONFIG_DIR}/ssl/selfsigned.crt" 2>/dev/null || stat -c%s "${CONFIG_DIR}/ssl/selfsigned.crt" 2>/dev/null)
    echo -e "${GREEN}✓ Certificate exists (${SIZE} bytes)${NC}"
    echo "  Path: ${CONFIG_DIR}/ssl/selfsigned.crt"
else
    echo -e "${RED}✗ Certificate file not found${NC}"
    exit 1
fi

if [ -f "${CONFIG_DIR}/ssl/selfsigned.key" ]; then
    SIZE=$(stat -f%z "${CONFIG_DIR}/ssl/selfsigned.key" 2>/dev/null || stat -c%s "${CONFIG_DIR}/ssl/selfsigned.key" 2>/dev/null)
    echo -e "${GREEN}✓ Private key exists (${SIZE} bytes)${NC}"
    echo "  Path: ${CONFIG_DIR}/ssl/selfsigned.key"
else
    echo -e "${RED}✗ Private key file not found${NC}"
    exit 1
fi

# Update SSL_MODE if needed
echo ""
if [ "${SSL_MODE:-letsencrypt}" != "selfsigned" ]; then
    echo "Updating SSL_MODE to selfsigned..."
    if grep -q "^SSL_MODE=" "${CONFIG_DIR}/production.env"; then
        sed -i 's/^SSL_MODE=.*/SSL_MODE=selfsigned/' "${CONFIG_DIR}/production.env" 2>/dev/null || \
        sed -i '' 's/^SSL_MODE=.*/SSL_MODE=selfsigned/' "${CONFIG_DIR}/production.env" 2>/dev/null
    else
        echo "SSL_MODE=selfsigned" >> "${CONFIG_DIR}/production.env"
    fi
    echo -e "${GREEN}✓ Updated SSL_MODE to selfsigned${NC}"
else
    echo -e "${GREEN}✓ SSL_MODE already set to selfsigned${NC}"
fi

# Regenerate nginx configuration
echo ""
echo "Regenerating nginx configuration..."
if bash "${SCRIPT_DIR}/scripts/generate-config.sh"; then
    echo -e "${GREEN}✓ Nginx configuration regenerated${NC}"
else
    echo -e "${RED}✗ Failed to regenerate configuration${NC}"
    exit 1
fi

# Verify nginx config was generated
if [ -f "${CONFIG_DIR}/nginx/bma.conf" ]; then
    echo -e "${GREEN}✓ Nginx config exists${NC}"
    # Check if it references the correct SSL paths
    if grep -q "/etc/nginx/ssl/selfsigned" "${CONFIG_DIR}/nginx/bma.conf"; then
        echo -e "${GREEN}✓ Nginx config references self-signed certificates${NC}"
    else
        echo -e "${YELLOW}⚠ Nginx config may not reference self-signed certificates${NC}"
    fi
else
    echo -e "${RED}✗ Nginx config not found${NC}"
    exit 1
fi

# Stop services
echo ""
echo "Stopping services..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" down
echo -e "${GREEN}✓ Services stopped${NC}"

# Start services
echo ""
echo "Starting services..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" up -d
echo -e "${GREEN}✓ Services started${NC}"

# Wait for services to initialize
echo ""
echo "Waiting for services to initialize (10 seconds)..."
sleep 10

# Check status
echo ""
echo "Checking service status..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" ps

echo ""
echo "Checking nginx logs for errors..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" logs --tail=20 nginx | grep -i "emerg\|error" || echo -e "${GREEN}✓ No critical errors in nginx logs${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}Fix complete!${NC}"
echo "========================================="
echo ""
echo "Access your deployment at:"
echo "  http://${DOMAIN}  (will redirect to HTTPS)"
echo "  https://${DOMAIN}"
echo ""
echo -e "${YELLOW}Note: Browsers will show a security warning for self-signed certificates.${NC}"
echo "This is normal and safe for testing. Click 'Advanced' and 'Proceed' to access the site."
echo ""
echo "To check detailed status: ./deploy-production.sh status"
echo "To view logs: ./deploy-production.sh logs"
echo ""
