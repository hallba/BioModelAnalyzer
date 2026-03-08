# Production Deployment - Implementation Summary

This document summarizes the production deployment implementation for BioModelAnalyzer.

## What Was Implemented

### Core Infrastructure

1. **Docker Compose Configuration** (`docker-compose.production.yml`)
   - Multi-container orchestration with nginx and BMA app
   - Health checks for both services
   - Volume mounts for configuration, SSL certificates, and logs
   - Network isolation

2. **nginx Reverse Proxy** (`config/nginx/bma.conf.template`)
   - HTTPS termination with modern TLS configuration
   - HTTP to HTTPS redirect
   - Security headers (HSTS, CSP, X-Frame-Options, etc.)
   - Optimized proxy settings for long-running analysis
   - Static file caching

3. **Environment Configuration** (`config/production.env.template`)
   - Domain configuration (biomodelanalyzer.org default)
   - OneDrive OAuth credentials
   - SSL mode selection (Let's Encrypt, self-signed, custom)
   - Application settings

### Scripts

4. **Main Deployment Script** (`deploy-production.sh`)
   - `setup`: First-time setup with interactive configuration
   - `start`: Build and start production stack
   - `stop`: Stop production deployment
   - `restart`: Restart services
   - `logs [service]`: View logs
   - `status`: Check service health
   - `renew-certs`: Manual certificate renewal
   - `setup-renewal`: Configure automatic renewal cron job

5. **Configuration Generator** (`scripts/generate-config.sh`)
   - Substitutes environment variables into nginx config
   - Generates frontend config.js with OneDrive credentials
   - Validates configuration

6. **SSL Certificate Setup** (`scripts/setup-letsencrypt.sh`)
   - Acquire new Let's Encrypt certificates
   - Renew existing certificates
   - Test renewal (dry run)
   - Automatic port management

### Application Changes

7. **Dockerfile Health Check** (`src/BmaLinuxApi/Dockerfile`)
   - Added HEALTHCHECK instruction for Docker Compose monitoring
   - Checks `/api/health` endpoint

8. **OneDrive Configuration** (`src/bma.package/app.ts`)
   - Reads from `window.BMA_CONFIG` if available
   - Falls back to version object for backward compatibility
   - Enables runtime configuration via environment variables

### Documentation

9. **Production Deployment Guide** (`docs/deployment/PRODUCTION.md`)
   - 500+ line comprehensive guide
   - Step-by-step OneDrive app registration with screenshots guidance
   - Two deployment scenarios (production and local/testing)
   - SSL certificate setup and renewal
   - Monitoring and maintenance
   - Troubleshooting common issues
   - Backup and recovery procedures
   - Quick reference commands

10. **README Updates** (`README.md`)
    - Added production deployment section
    - Quick start commands
    - Link to full documentation

## Key Features

### Security
- HTTPS with modern TLS 1.2+ and secure cipher suites
- HSTS with 1-year max-age
- Security headers to prevent XSS, clickjacking
- Let's Encrypt automatic certificate renewal

### Ease of Use
- Single command setup: `./deploy-production.sh setup`
- Interactive configuration prompts
- Automatic SSL certificate acquisition
- Health monitoring and status checks

### Production Ready
- Automatic container restart on failure
- Log rotation and management
- Zero-downtime updates
- Backup and recovery procedures

### OneDrive Integration
- Environment-based configuration
- No hardcoded credentials
- Supports multiple redirect URIs for testing/production

## Configuration Examples

### biomodelanalyzer.org Production
```bash
DOMAIN=biomodelanalyzer.org
EMAIL=b.hall@ucl.ac.uk
SSL_MODE=letsencrypt
ONEDRIVE_CLIENT_ID=<from Azure Portal>
ONEDRIVE_REDIRECT_URI=https://biomodelanalyzer.org/html/callback.html
```

### Local Testing
```bash
DOMAIN=192.168.1.100
EMAIL=admin@localhost
SSL_MODE=selfsigned
ONEDRIVE_CLIENT_ID=<from Azure Portal>
ONEDRIVE_REDIRECT_URI=https://192.168.1.100/html/callback.html
```

## Files Created

```
BioModelAnalyzerFrk/
├── deploy-production.sh                  # Main deployment script
├── docker-compose.production.yml         # Docker Compose configuration
├── config/
│   ├── production.env.template           # Environment variable template
│   └── nginx/
│       └── bma.conf.template             # nginx configuration template
├── scripts/
│   ├── generate-config.sh                # Configuration generator
│   └── setup-letsencrypt.sh              # SSL certificate setup
└── docs/
    └── deployment/
        └── PRODUCTION.md                 # Comprehensive deployment guide
```

## Modified Files

```
src/BmaLinuxApi/Dockerfile                # Added health check
src/bma.package/app.ts                    # OneDrive config from BMA_CONFIG
README.md                                 # Added production deployment section
```

## Next Steps for Deployment

1. **Setup**: Run `./deploy-production.sh setup` on production server
2. **Configure**: Edit `config/production.env` with actual values
3. **OneDrive**: Register app in Azure Portal, obtain Client ID
4. **DNS**: Point biomodelanalyzer.org to server IP
5. **Deploy**: Run `./deploy-production.sh start`
6. **Verify**: Test HTTPS access, OneDrive authentication, API endpoints
7. **Monitor**: Set up log monitoring and certificate renewal

## Testing Checklist

- [ ] Test HTTPS access with self-signed certificates (local)
- [ ] Test Let's Encrypt certificate acquisition (production)
- [ ] Test OneDrive authentication flow
- [ ] Verify all API endpoints work over HTTPS
- [ ] Test certificate renewal process
- [ ] Verify automatic container restart
- [ ] Test log viewing and monitoring
- [ ] Verify backup and restore procedures

## Support

For issues or questions:
- Review `docs/deployment/PRODUCTION.md`
- Check logs: `./deploy-production.sh logs`
- Contact: b.hall@ucl.ac.uk
