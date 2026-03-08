#!/bin/bash
# BioModelAnalyzer Production Deployment Script
# Manages production deployment with HTTPS and OneDrive integration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.production.yml"
ENV_FILE="${CONFIG_DIR}/production.env"
ENV_TEMPLATE="${CONFIG_DIR}/production.env.template"

# Load production.env into the shell environment early so that every Docker
# Compose invocation inherits the variables (Docker Compose re-parses the
# compose file on every call and warns if variables aren't set). We strip \r
# to handle CRLF line endings from Windows-edited files.
if [ -f "${ENV_FILE}" ]; then
    set -a
    source <(tr -d '\r' < "${ENV_FILE}")
    set +a
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

detect_docker_compose() {
    # Detect Docker Compose (both plugin and standalone versions)
    # This must be called early to set DOCKER_COMPOSE variable
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        # Only error if we're not showing help
        if [[ "${1:-}" != "help" && "${1:-}" != "--help" && "${1:-}" != "-h" && "${1:-}" != "" ]]; then
            print_error "Docker Compose is not installed"
            echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
            exit 1
        fi
        DOCKER_COMPOSE="docker compose"  # Default for help message
    fi
    export DOCKER_COMPOSE
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
    
    # Check Docker Compose (both plugin and standalone versions)
    if docker compose version &> /dev/null; then
        print_success "Docker Compose found: $(docker compose version)"
    elif command -v docker-compose &> /dev/null; then
        print_success "Docker Compose found: $(docker-compose --version)"
    else
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo ""
}

setup_production() {
    print_header "Production Deployment Setup"
    
    # Check prerequisites
    check_prerequisites
    
    # Create directory structure
    print_info "Creating directory structure..."
    mkdir -p "${CONFIG_DIR}/nginx"
    mkdir -p "${CONFIG_DIR}/ssl"
    mkdir -p "${SCRIPT_DIR}/data/letsencrypt"
    mkdir -p "${SCRIPT_DIR}/logs/app"
    mkdir -p "${SCRIPT_DIR}/logs/nginx"
    print_success "Directories created"
    
    # Copy environment template if not exists
    if [ ! -f "${ENV_FILE}" ]; then
        print_info "Creating production.env from template..."
        cp "${ENV_TEMPLATE}" "${ENV_FILE}"
        
        # Convert Windows line endings to Unix (CRLF -> LF)
        # This prevents "$'\r': command not found" errors on Linux
        if command -v dos2unix &> /dev/null; then
            dos2unix "${ENV_FILE}" 2>/dev/null || true
        else
            # Fallback: use sed to remove carriage returns
            sed -i 's/\r$//' "${ENV_FILE}" 2>/dev/null || sed -i '' 's/\r$//' "${ENV_FILE}" 2>/dev/null || true
        fi
        
        print_warning "Please edit ${ENV_FILE} with your configuration"
        echo ""
        echo "Required settings:"
        echo "  - DOMAIN: Your domain name (e.g., biomodelanalyzer.org)"
        echo "  - EMAIL: Your email for SSL certificates"
        echo "  - ONEDRIVE_CLIENT_ID: From Azure Portal app registration"
        echo "  - ONEDRIVE_REDIRECT_URI: OAuth redirect URL"
        echo ""
        echo "See docs/deployment/PRODUCTION.md for detailed instructions"
        echo ""
        read -p "Press Enter to edit production.env now, or Ctrl+C to exit..."
        ${EDITOR:-nano} "${ENV_FILE}"
    else
        print_success "production.env already exists"
    fi
    
    # Load environment (strip carriage returns to handle Windows line endings)
    set -a
    source <(tr -d '\r' < "${ENV_FILE}")
    set +a
    
    # Generate configuration files
    print_info "Generating configuration files..."
    bash "${SCRIPT_DIR}/scripts/generate-config.sh"
    print_success "Configuration generated"
    
    # Setup SSL certificates based on mode
    case "${SSL_MODE:-letsencrypt}" in
        letsencrypt)
            print_info "Setting up Let's Encrypt certificates..."
            echo "This will acquire SSL certificates for ${DOMAIN}"
            echo "Make sure:"
            echo "  - DNS for ${DOMAIN} points to this server"
            echo "  - Ports 80 and 443 are open"
            echo ""
            read -p "Continue with Let's Encrypt setup? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                bash "${SCRIPT_DIR}/scripts/setup-letsencrypt.sh" acquire
            else
                print_warning "Skipped Let's Encrypt setup. Run manually: scripts/setup-letsencrypt.sh acquire"
            fi
            ;;
        selfsigned)
            print_info "Generating self-signed certificates..."
            mkdir -p "${CONFIG_DIR}/ssl"
            
            # Generate self-signed certificate
            if openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "${CONFIG_DIR}/ssl/selfsigned.key" \
                -out "${CONFIG_DIR}/ssl/selfsigned.crt" \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}" 2>/dev/null; then
                print_success "Self-signed certificates generated"
                echo "  Certificate: ${CONFIG_DIR}/ssl/selfsigned.crt"
                echo "  Key: ${CONFIG_DIR}/ssl/selfsigned.key"
            else
                print_error "Failed to generate self-signed certificates"
                echo "Make sure openssl is installed"
                exit 1
            fi
            print_warning "Self-signed certificates are for testing only!"
            print_warning "Browsers will show security warnings for self-signed certificates"
            ;;
        custom)
            print_warning "Using custom certificates"
            echo "Place your certificate files at:"
            echo "  - ${CONFIG_DIR}/ssl/custom.crt"
            echo "  - ${CONFIG_DIR}/ssl/custom.key"
            ;;
    esac
    
    echo ""
    print_success "Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Review configuration: ${ENV_FILE}"
    echo "  2. Start production: ./deploy-production.sh start"
    echo "  3. View logs: ./deploy-production.sh logs"
    echo ""
}

start_production() {
    print_header "Starting Production Deployment"
    
    if [ ! -f "${ENV_FILE}" ]; then
        print_error "Configuration not found. Run './deploy-production.sh setup' first"
        exit 1
    fi
    
    # Generate latest configuration
    print_info "Generating configuration..."
    bash "${SCRIPT_DIR}/scripts/generate-config.sh"
    
    # Build and start services
    print_info "Building and starting services..."
    ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --build
    
    echo ""
    print_success "Production deployment started!"
    echo ""
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 5
    
    # Check service status
    ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
    
    echo ""
    echo "Access your deployment at: https://${DOMAIN}"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    ./deploy-production.sh logs"
    echo "  Check status: ./deploy-production.sh status"
    echo "  Stop:         ./deploy-production.sh stop"
    echo ""
}

stop_production() {
    print_header "Stopping Production Deployment"
    
    ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" down
    
    print_success "Production deployment stopped"
}

restart_production() {
    print_header "Restarting Production Deployment"
    
    stop_production
    echo ""
    start_production
}

show_logs() {
    SERVICE="${1:-}"
    
    if [ -z "${SERVICE}" ]; then
        ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" logs -f
    else
        ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" logs -f "${SERVICE}"
    fi
}

show_status() {
    print_header "Production Deployment Status"
    
    ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
    
    echo ""
    print_info "Service Health:"
    
    # Check BMA app health
    if ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T bma-app curl -sf http://localhost:8020/api/health > /dev/null 2>&1; then
        print_success "BMA Application: Healthy"
    else
        print_error "BMA Application: Unhealthy"
    fi
    
    # Check nginx health
    if ${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T nginx wget --quiet --tries=1 --spider http://localhost/api/health > /dev/null 2>&1; then
        print_success "Nginx Proxy: Healthy"
    else
        print_error "Nginx Proxy: Unhealthy"
    fi
}

renew_certificates() {
    print_header "Renewing SSL Certificates"
    
    bash "${SCRIPT_DIR}/scripts/setup-letsencrypt.sh" renew
}

setup_renewal_cron() {
    print_header "Setting Up Automatic Certificate Renewal"
    
    CRON_CMD="${SCRIPT_DIR}/deploy-production.sh renew-certs"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "${CRON_CMD}"; then
        print_warning "Renewal cron job already exists"
        return
    fi
    
    # Add cron job to run renewal twice daily
    (crontab -l 2>/dev/null; echo "0 0,12 * * * ${CRON_CMD} >> ${SCRIPT_DIR}/logs/renewal.log 2>&1") | crontab -
    
    print_success "Automatic renewal configured (runs twice daily)"
    echo "Renewal logs: ${SCRIPT_DIR}/logs/renewal.log"
}

show_help() {
    cat << EOF
BioModelAnalyzer Production Deployment Script

Usage: ./deploy-production.sh COMMAND

Commands:
  setup           First-time setup (creates config, SSL certificates)
  start           Start production deployment
  stop            Stop production deployment
  restart         Restart production deployment
  logs [SERVICE]  View logs (optionally for specific service: bma-app, nginx)
  status          Show deployment status and health
  renew-certs     Manually renew SSL certificates
  setup-renewal   Configure automatic certificate renewal
  help            Show this help message

Examples:
  ./deploy-production.sh setup
  ./deploy-production.sh start
  ./deploy-production.sh logs nginx
  ./deploy-production.sh status

For detailed documentation, see: docs/deployment/PRODUCTION.md
EOF
}

# Detect Docker Compose early (before command dispatcher)
COMMAND="${1:-help}"
detect_docker_compose "${COMMAND}"

case "${COMMAND}" in
    setup)
        setup_production
        ;;
    start)
        start_production
        ;;
    stop)
        stop_production
        ;;
    restart)
        restart_production
        ;;
    logs)
        show_logs "${2:-}"
        ;;
    status)
        show_status
        ;;
    renew-certs)
        renew_certificates
        ;;
    setup-renewal)
        setup_renewal_cron
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: ${COMMAND}"
        echo ""
        show_help
        exit 1
        ;;
esac
