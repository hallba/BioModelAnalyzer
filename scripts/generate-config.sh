#!/bin/bash
# Helper script to generate runtime configuration from environment variables
# This script substitutes environment variables into configuration templates

set -euo pipefail

CONFIG_DIR="$(cd "$(dirname "$0")/.." && pwd)/config"
NGINX_CONF_TEMPLATE="${CONFIG_DIR}/nginx/bma.conf.template"
NGINX_CONF="${CONFIG_DIR}/nginx/bma.conf"
CONFIG_JS="${CONFIG_DIR}/config.js"

# Load environment variables from production.env if it exists
if [ -f "${CONFIG_DIR}/production.env" ]; then
    set -a
    # Strip carriage returns to handle Windows line endings (CRLF)
    # This prevents "$'\r': command not found" errors
    source <(tr -d '\r' < "${CONFIG_DIR}/production.env")
    set +a
fi

# Validate required variables
if [ -z "${DOMAIN:-}" ]; then
    echo "Error: DOMAIN not set in production.env"
    exit 1
fi

if [ -z "${SSL_MODE:-}" ]; then
    echo "Error: SSL_MODE not set in production.env"
    exit 1
fi

# Determine SSL certificate paths based on SSL_MODE
case "${SSL_MODE}" in
    letsencrypt)
        SSL_CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
        SSL_KEY_PATH="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
        ;;
    selfsigned)
        SSL_CERT_PATH="/etc/nginx/ssl/selfsigned.crt"
        SSL_KEY_PATH="/etc/nginx/ssl/selfsigned.key"
        ;;
    custom)
        SSL_CERT_PATH="/etc/nginx/ssl/custom.crt"
        SSL_KEY_PATH="/etc/nginx/ssl/custom.key"
        ;;
    *)
        echo "Error: Invalid SSL_MODE '${SSL_MODE}'. Must be: letsencrypt, selfsigned, or custom"
        exit 1
        ;;
esac

export SSL_CERT_PATH
export SSL_KEY_PATH

# Generate nginx configuration from template
echo "Generating nginx configuration..."
envsubst '${DOMAIN} ${SSL_CERT_PATH} ${SSL_KEY_PATH}' < "${NGINX_CONF_TEMPLATE}" > "${NGINX_CONF}"
echo "  Created: ${NGINX_CONF}"

# Generate config.js for OneDrive integration
echo "Generating frontend configuration..."
cat > "${CONFIG_JS}" << EOF
// Auto-generated configuration - DO NOT EDIT MANUALLY
// Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
window.BMA_CONFIG = {
    onedriveappid: "${ONEDRIVE_CLIENT_ID:-}",
    onedriveredirecturl: "${ONEDRIVE_REDIRECT_URI:-}"
};
EOF
echo "  Created: ${CONFIG_JS}"

echo "Configuration generation complete!"
