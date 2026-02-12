#!/bin/bash
# Quick restart script that properly loads environment variables
# Use this to restart the deployment and pick up changes to production.env

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Detect Docker Compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "Error: Docker Compose not found"
    exit 1
fi

echo "Restarting deployment with environment variables from production.env..."
${DOCKER_COMPOSE} -f "${SCRIPT_DIR}/docker-compose.production.yml" --env-file "${CONFIG_DIR}/production.env" restart

echo ""
echo "Deployment restarted!"
echo "Environment variables from config/production.env have been loaded."
echo ""
echo "Check status: ./deploy-production.sh status"
echo "View logs: ./deploy-production.sh logs"
