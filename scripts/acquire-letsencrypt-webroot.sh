#!/bin/bash
# Acquire Let's Encrypt certificates using webroot method
# This works with nginx running and behind firewalls that allow port 80

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"
DATA_DIR="${SCRIPT_DIR}/data/letsencrypt"
WEBROOT_DIR="${SCRIPT_DIR}/data/certbot-webroot"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [ ! -f "${CONFIG_DIR}/production.env" ]; then
    echo -e "${RED}Error: production.env not found. Run 'deploy-production.sh setup' first.${NC}"
    exit 1
fi

source <(tr -d '\r' < "${CONFIG_DIR}/production.env")

# Validate required variables
if [ -z "${DOMAIN:-}" ] || [ -z "${EMAIL:-}" ]; then
    echo -e "${RED}Error: DOMAIN and EMAIL must be set in production.env${NC}"
    exit 1
fi

echo "========================================="
echo "Let's Encrypt Certificate Acquisition"
echo "========================================="
echo "Domain: ${DOMAIN}"
echo "Email: ${EMAIL}"
echo "Method: Webroot (nginx running)"
echo ""

# Check if certificates already exist
if [ -d "${DATA_DIR}/live/${DOMAIN}" ]; then
    echo -e "${YELLOW}Certificates already exist for ${DOMAIN}${NC}"
    echo "To renew, use: ./scripts/setup-letsencrypt.sh renew"
    exit 0
fi

# Ensure directories exist
mkdir -p "${DATA_DIR}"
mkdir -p "${WEBROOT_DIR}"

echo "Pre-flight checks:"
echo ""

# Check if nginx is running
if docker ps | grep -q bma-production-nginx; then
    echo -e "${GREEN}✓ Nginx container is running${NC}"
else
    echo -e "${RED}✗ Nginx container is not running${NC}"
    echo "Start the deployment first: ./deploy-production.sh start"
    exit 1
fi

# Test if webroot is accessible
echo "Testing webroot accessibility..."
TEST_FILE="${WEBROOT_DIR}/test-$(date +%s).txt"
echo "test" > "${TEST_FILE}"

# Wait a moment for file to be available
sleep 2

if curl -sf "http://${DOMAIN}/.well-known/acme-challenge/$(basename ${TEST_FILE})" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Webroot is accessible from the internet${NC}"
    rm -f "${TEST_FILE}"
else
    echo -e "${YELLOW}⚠ Could not verify webroot accessibility${NC}"
    echo "This might be okay if you're behind a firewall that allows Let's Encrypt IPs"
    rm -f "${TEST_FILE}"
fi

echo ""
echo "Acquiring certificates using certbot webroot mode..."
echo "This requires:"
echo "  - DNS for ${DOMAIN} points to this server"
echo "  - Port 80 is accessible from the internet (or at least from Let's Encrypt servers)"
echo "  - Nginx is running and serving /.well-known/acme-challenge/"
echo ""

# Run certbot in webroot mode
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
    echo -e "${GREEN}✓ Certificates acquired successfully!${NC}"
    echo "  Location: ${DATA_DIR}/live/${DOMAIN}/"
    echo ""
    echo "Next steps:"
    echo "  1. Update production.env: SSL_MODE=letsencrypt"
    echo "  2. Regenerate config: bash scripts/generate-config.sh"
    echo "  3. Restart nginx: ./deploy-production.sh restart"
    echo ""
    echo "Certificates will expire in 90 days."
    echo "Set up automatic renewal with: ./deploy-production.sh setup-renewal"
else
    echo ""
    echo -e "${RED}✗ Certificate acquisition failed!${NC}"
    echo ""
    echo "Common issues:"
    echo "  1. DNS not pointing to this server"
    echo "     - Check: dig ${DOMAIN} +short"
    echo "     - Should return: $(curl -s ifconfig.me 2>/dev/null || echo 'your server IP')"
    echo ""
    echo "  2. Port 80 blocked by firewall"
    echo "     - Check firewall rules: sudo ufw status (Ubuntu) or sudo firewall-cmd --list-all (RedHat)"
    echo "     - Allow port 80: sudo ufw allow 80/tcp"
    echo ""
    echo "  3. Nginx not serving webroot correctly"
    echo "     - Test: curl http://${DOMAIN}/.well-known/acme-challenge/test"
    echo ""
    echo "  4. Rate limiting (if you've tried many times)"
    echo "     - Wait an hour and try again"
    echo "     - Use staging for testing: add --staging flag"
    echo ""
    exit 1
fi
