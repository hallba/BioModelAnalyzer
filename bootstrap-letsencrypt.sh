#!/bin/bash
# Bootstrap deployment with self-signed certs, then acquire Let's Encrypt certificates
# This solves the chicken-and-egg problem: need certs to start nginx, need nginx to get certs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"
DATA_DIR="${SCRIPT_DIR}/data/letsencrypt"
WEBROOT_DIR="${SCRIPT_DIR}/data/certbot-webroot"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect Docker Compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose not found${NC}"
    exit 1
fi

echo "========================================="
echo "Bootstrap Let's Encrypt Deployment"
echo "========================================="
echo ""

# Load environment
if [ ! -f "${CONFIG_DIR}/production.env" ]; then
    echo -e "${RED}Error: config/production.env not found${NC}"
    echo "Run './deploy-production.sh setup' first"
    exit 1
fi

source <(tr -d '\r' < "${CONFIG_DIR}/production.env")

if [ -z "${DOMAIN:-}" ] || [ -z "${EMAIL:-}" ]; then
    echo -e "${RED}Error: DOMAIN and EMAIL must be set in production.env${NC}"
    exit 1
fi

echo "Configuration:"
echo "  Domain: ${DOMAIN}"
echo "  Email: ${EMAIL}"
echo ""

# Step 1: Generate self-signed certificates
echo "========================================="
echo "Step 1: Generate Self-Signed Certificates"
echo "========================================="
echo ""

mkdir -p "${CONFIG_DIR}/ssl"

if [ -f "${CONFIG_DIR}/ssl/selfsigned.crt" ]; then
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
        exit 1
    fi
fi

# Step 2: Configure for self-signed and start
echo ""
echo "========================================="
echo "Step 2: Start with Self-Signed Certificates"
echo "========================================="
echo ""

# Temporarily set SSL_MODE to selfsigned
if grep -q "^SSL_MODE=" "${CONFIG_DIR}/production.env"; then
    sed -i.bak 's/^SSL_MODE=.*/SSL_MODE=selfsigned/' "${CONFIG_DIR}/production.env" 2>/dev/null || \
    sed -i.bak '' 's/^SSL_MODE=.*/SSL_MODE=selfsigned/' "${CONFIG_DIR}/production.env" 2>/dev/null
else
    echo "SSL_MODE=selfsigned" >> "${CONFIG_DIR}/production.env"
fi

echo "Regenerating nginx configuration for self-signed certificates..."
bash "${SCRIPT_DIR}/scripts/generate-config.sh"

echo "Starting deployment..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" --env-file "${CONFIG_DIR}/production.env" down 2>/dev/null || true
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" --env-file "${CONFIG_DIR}/production.env" up -d

echo "Waiting for services to start (15 seconds)..."
sleep 15

# Check if nginx is running
if docker ps | grep -q bma-production-nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx failed to start${NC}"
    echo "Check logs: ./deploy-production.sh logs nginx"
    exit 1
fi

# Step 3: Acquire Let's Encrypt certificates
echo ""
echo "========================================="
echo "Step 3: Acquire Let's Encrypt Certificates"
echo "========================================="
echo ""

# Check if certificates already exist
if [ -d "${DATA_DIR}/live/${DOMAIN}" ]; then
    echo -e "${YELLOW}Let's Encrypt certificates already exist for ${DOMAIN}${NC}"
    SKIP_ACQUIRE=true
else
    SKIP_ACQUIRE=false
fi

if [ "$SKIP_ACQUIRE" = false ]; then
    mkdir -p "${DATA_DIR}"
    mkdir -p "${WEBROOT_DIR}"

    echo "Acquiring Let's Encrypt certificates using webroot method..."
    echo "This may take a minute..."
    echo ""

    if docker run --rm \
        -v "${DATA_DIR}:/etc/letsencrypt" \
        -v "${WEBROOT_DIR}:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --non-interactive \
        --agree-tos \
        --email "${EMAIL}" \
        -d "${DOMAIN}" \
        --preferred-challenges http; then
        
        echo ""
        echo -e "${GREEN}✓ Let's Encrypt certificates acquired!${NC}"
    else
        echo ""
        echo -e "${RED}✗ Certificate acquisition failed${NC}"
        echo ""
        echo "Your deployment is running with self-signed certificates."
        echo "You can access it at: https://${DOMAIN}"
        echo ""
        echo "To troubleshoot Let's Encrypt, see: docs/deployment/LETSENCRYPT_TROUBLESHOOTING.md"
        echo ""
        echo "Common fixes:"
        echo "  - Check firewall: sudo ufw allow 80/tcp"
        echo "  - Verify DNS: dig ${DOMAIN} +short"
        echo "  - Test port 80: curl -I http://${DOMAIN}"
        exit 1
    fi
fi

# Step 4: Switch to Let's Encrypt certificates
echo ""
echo "========================================="
echo "Step 4: Switch to Let's Encrypt Certificates"
echo "========================================="
echo ""

# Restore SSL_MODE to letsencrypt
if grep -q "^SSL_MODE=" "${CONFIG_DIR}/production.env"; then
    sed -i 's/^SSL_MODE=.*/SSL_MODE=letsencrypt/' "${CONFIG_DIR}/production.env" 2>/dev/null || \
    sed -i '' 's/^SSL_MODE=.*/SSL_MODE=letsencrypt/' "${CONFIG_DIR}/production.env" 2>/dev/null
else
    echo "SSL_MODE=letsencrypt" >> "${CONFIG_DIR}/production.env"
fi

echo "Regenerating nginx configuration for Let's Encrypt..."
bash "${SCRIPT_DIR}/scripts/generate-config.sh"

echo "Restarting nginx with Let's Encrypt certificates..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" --env-file "${CONFIG_DIR}/production.env" restart nginx

echo "Waiting for nginx to restart (5 seconds)..."
sleep 5

# Verify nginx is running
if docker ps | grep -q bma-production-nginx; then
    echo -e "${GREEN}✓ Nginx restarted successfully${NC}"
else
    echo -e "${RED}✗ Nginx failed to restart${NC}"
    echo "Reverting to self-signed certificates..."
    sed -i 's/^SSL_MODE=.*/SSL_MODE=selfsigned/' "${CONFIG_DIR}/production.env" 2>/dev/null || \
    sed -i '' 's/^SSL_MODE=.*/SSL_MODE=selfsigned/' "${CONFIG_DIR}/production.env" 2>/dev/null
    bash "${SCRIPT_DIR}/scripts/generate-config.sh"
    ${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" --env-file "${CONFIG_DIR}/production.env" restart nginx
    exit 1
fi

# Final status
echo ""
echo "========================================="
echo -e "${GREEN}Bootstrap Complete!${NC}"
echo "========================================="
echo ""
echo "Your deployment is now running with Let's Encrypt certificates!"
echo ""
echo "Access your deployment at: https://${DOMAIN}"
echo ""
echo "Next steps:"
echo "  - Set up automatic renewal: ./deploy-production.sh setup-renewal"
echo "  - Check status: ./deploy-production.sh status"
echo "  - View logs: ./deploy-production.sh logs"
echo ""
echo "Certificates will expire in 90 days and will auto-renew if you set up renewal."
echo ""
