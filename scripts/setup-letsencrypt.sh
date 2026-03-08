#!/bin/bash
# Setup Let's Encrypt SSL certificates using certbot
# This script handles both initial certificate acquisition and renewal

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"
DATA_DIR="${SCRIPT_DIR}/data/letsencrypt"

# Load environment variables
if [ ! -f "${CONFIG_DIR}/production.env" ]; then
    echo "Error: production.env not found. Run 'deploy-production.sh setup' first."
    exit 1
fi

set -a
# Strip carriage returns to handle Windows line endings (CRLF)
source <(tr -d '\r' < "${CONFIG_DIR}/production.env")
set +a

# Detect Docker Compose command (plugin vs standalone)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "Error: Docker Compose not found"
    exit 1
fi

# Validate required variables
if [ -z "${DOMAIN:-}" ] || [ -z "${EMAIL:-}" ]; then
    echo "Error: DOMAIN and EMAIL must be set in production.env"
    exit 1
fi

MODE="${1:-acquire}"

case "${MODE}" in
    acquire)
        echo "========================================="
        echo "Let's Encrypt Certificate Acquisition"
        echo "========================================="
        echo "Domain: ${DOMAIN}"
        echo "Email: ${EMAIL}"
        echo ""
        
        # Check if certificates already exist
        if [ -d "${DATA_DIR}/live/${DOMAIN}" ]; then
            echo "Certificates already exist for ${DOMAIN}"
            echo "Use 'renew' mode to renew existing certificates"
            exit 0
        fi
        
        # Ensure data directory exists
        mkdir -p "${DATA_DIR}"
        
        echo "Acquiring certificates using certbot standalone mode..."
        echo "Note: This requires ports 80 and 443 to be available"
        echo ""
        
        # Run certbot in standalone mode
        docker run --rm \
            -p 80:80 -p 443:443 \
            -v "${DATA_DIR}:/etc/letsencrypt" \
            certbot/certbot certonly \
            --standalone \
            --non-interactive \
            --agree-tos \
            --email "${EMAIL}" \
            -d "${DOMAIN}" \
            --preferred-challenges http
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✓ Certificates acquired successfully!"
            echo "  Location: ${DATA_DIR}/live/${DOMAIN}/"
            echo ""
            echo "Certificates will expire in 90 days."
            echo "Set up automatic renewal with: deploy-production.sh setup-renewal"
        else
            echo ""
            echo "✗ Certificate acquisition failed!"
            echo "  Check that:"
            echo "  - DNS for ${DOMAIN} points to this server"
            echo "  - Ports 80 and 443 are open in firewall"
            echo "  - No other services are using ports 80/443"
            exit 1
        fi
        ;;
        
    renew)
        echo "========================================="
        echo "Let's Encrypt Certificate Renewal"
        echo "========================================="
        echo "Domain: ${DOMAIN}"
        echo ""
        
        if [ ! -d "${DATA_DIR}/live/${DOMAIN}" ]; then
            echo "Error: No existing certificates found for ${DOMAIN}"
            echo "Use 'acquire' mode to obtain certificates first"
            exit 1
        fi
        
        echo "Renewing certificates..."
        
        # Stop nginx temporarily to free port 80
        ${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" stop nginx 2>/dev/null || true
        
        # Run certbot renewal
        docker run --rm \
            -p 80:80 -p 443:443 \
            -v "${DATA_DIR}:/etc/letsencrypt" \
            certbot/certbot renew \
            --standalone \
            --non-interactive
        
        # Restart nginx
        ${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" start nginx 2>/dev/null || true
        
        echo ""
        echo "✓ Certificate renewal complete!"
        echo "  Reloading nginx to use new certificates..."
        ${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" exec nginx nginx -s reload 2>/dev/null || true
        ;;
        
    test)
        echo "Testing certificate renewal (dry run)..."
        docker run --rm \
            -v "${DATA_DIR}:/etc/letsencrypt" \
            certbot/certbot renew \
            --dry-run
        ;;
        
    *)
        echo "Usage: $0 {acquire|renew|test}"
        echo "  acquire - Obtain new certificates"
        echo "  renew   - Renew existing certificates"
        echo "  test    - Test renewal process (dry run)"
        exit 1
        ;;
esac
