#!/bin/bash
# Diagnostic script for production deployment issues
# Run this on the server to gather diagnostic information

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.production.yml"

# Detect Docker Compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "Error: Docker Compose not found"
    exit 1
fi

echo "========================================="
echo "BMA Production Deployment Diagnostics"
echo "========================================="
echo ""

echo "--- Container Status ---"
${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" ps
echo ""

echo "--- Nginx Logs (last 50 lines) ---"
${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" logs --tail=50 nginx
echo ""

echo "--- BMA App Logs (last 50 lines) ---"
${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" logs --tail=50 bma-app
echo ""

echo "--- Checking SSL Certificate Files ---"
if [ -f "config/production.env" ]; then
    source <(tr -d '\r' < config/production.env)
    echo "SSL_MODE: ${SSL_MODE:-not set}"
    
    case "${SSL_MODE:-letsencrypt}" in
        letsencrypt)
            if [ -d "data/letsencrypt/live/${DOMAIN}" ]; then
                echo "✓ Let's Encrypt certificates found for ${DOMAIN}"
                ls -la "data/letsencrypt/live/${DOMAIN}/"
            else
                echo "✗ Let's Encrypt certificates NOT found for ${DOMAIN}"
                echo "  Expected location: data/letsencrypt/live/${DOMAIN}/"
            fi
            ;;
        selfsigned)
            if [ -f "config/ssl/selfsigned.crt" ] && [ -f "config/ssl/selfsigned.key" ]; then
                echo "✓ Self-signed certificates found"
            else
                echo "✗ Self-signed certificates NOT found"
                echo "  Expected: config/ssl/selfsigned.crt and config/ssl/selfsigned.key"
            fi
            ;;
        custom)
            if [ -f "config/ssl/custom.crt" ] && [ -f "config/ssl/custom.key" ]; then
                echo "✓ Custom certificates found"
            else
                echo "✗ Custom certificates NOT found"
                echo "  Expected: config/ssl/custom.crt and config/ssl/custom.key"
            fi
            ;;
    esac
else
    echo "✗ config/production.env not found"
fi
echo ""

echo "--- Nginx Configuration ---"
if [ -f "config/nginx/bma.conf" ]; then
    echo "✓ Nginx config exists"
    echo "First 20 lines:"
    head -20 config/nginx/bma.conf
else
    echo "✗ config/nginx/bma.conf not found"
fi
echo ""

echo "--- Network Connectivity Test ---"
echo "Testing if nginx can reach bma-app..."
${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" exec -T nginx wget --timeout=5 --tries=1 -O- http://bma-app:8020/api/health 2>&1 || echo "✗ Cannot reach bma-app from nginx"
echo ""

echo "========================================="
echo "Diagnostic complete"
echo "========================================="
