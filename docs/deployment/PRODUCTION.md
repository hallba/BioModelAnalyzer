# BioModelAnalyzer Production Deployment Guide

This guide provides comprehensive instructions for deploying BioModelAnalyzer in production with HTTPS and OneDrive integration.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [OneDrive App Registration](#onedrive-app-registration)
4. [Deployment Scenarios](#deployment-scenarios)
5. [Initial Setup](#initial-setup)
6. [Configuration](#configuration)
7. [SSL Certificates](#ssl-certificates)
8. [Deployment](#deployment)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)
11. [Updating](#updating)
12. [Backup and Recovery](#backup-and-recovery)

---

## Introduction

### Overview

The production deployment uses Docker Compose to orchestrate two services:
- **nginx**: Reverse proxy handling HTTPS termination and security headers
- **bma-app**: The BioModelAnalyzer application

```
Internet → nginx:443 (HTTPS) → bma-app:8020 (HTTP)
```

### Development vs Production

| Feature | Development (`build.sh`) | Production (`deploy-production.sh`) |
|---------|-------------------------|-------------------------------------|
| Protocol | HTTP only | HTTPS with HTTP redirect |
| Port | 8020 | 80, 443 (standard) |
| SSL | None | Let's Encrypt or custom |
| OneDrive | Hardcoded config | Environment variables |
| Security Headers | No | Yes (HSTS, CSP, etc.) |
| Auto-restart | No | Yes |

### When to Use Each

- **Development**: Local testing, development work, regression tests
- **Production**: Public-facing deployment, biomodelanalyzer.org, secure access required

---

## Prerequisites

### Server Requirements

- **OS**: Linux (Ubuntu 22.04+ recommended)
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 20GB minimum
- **Network**: Public IP address with ports 80 and 443 accessible

### Software Requirements

1. **Docker** (version 20.10+)
   ```bash
   # Install Docker on Ubuntu
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   # Log out and back in for group changes to take effect
   ```

2. **Docker Compose** (version 2.0+)
   ```bash
   # Verify installation
   docker compose version
   # Should output: Docker Compose version v2.x.x
   ```

### Network Configuration

1. **Domain Name**: You need a domain name pointing to your server
   - For biomodelanalyzer.org: DNS A record → server IP
   - For testing: Can use IP address with self-signed certificates

2. **Firewall Rules**: Open ports 80 and 443
   ```bash
   # Ubuntu/Debian with ufw
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **DNS Verification**: Ensure DNS is propagated
   ```bash
   # Check DNS resolution
   nslookup biomodelanalyzer.org
   # Should return your server's IP address
   ```

---

## OneDrive App Registration

OneDrive integration allows users to save and load models from their OneDrive accounts. This requires registering an application in the Microsoft Azure Portal.

### Step 1: Create Microsoft Azure Account

If you don't have an Azure account:
1. Go to [portal.azure.com](https://portal.azure.com)
2. Click "Create a free account" or sign in with existing Microsoft account
3. Complete the registration process

### Step 2: Navigate to App Registrations

1. Sign in to [Azure Portal](https://portal.azure.com)
2. In the search bar at the top, type "App registrations"
3. Click on "App registrations" in the results
4. Click "+ New registration" button

### Step 3: Register the Application

Fill in the registration form:

**Name**: `BioModelAnalyzer Production` (or your preferred name)

**Supported account types**: Select one of:
- "Accounts in any organizational directory and personal Microsoft accounts" (recommended)
- This allows both work/school and personal Microsoft accounts

**Redirect URI**:
- Platform: **Web**
- URL: `https://biomodelanalyzer.org/html/callback.html`
  - Replace `biomodelanalyzer.org` with your actual domain
  - For local testing: `https://your-server-ip/html/callback.html`

Click **Register**

### Step 4: Obtain Client ID

After registration, you'll see the app overview page:

1. **Application (client) ID**: This is your `ONEDRIVE_CLIENT_ID`
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - **Copy this value** - you'll need it for configuration

### Step 5: Configure API Permissions

1. In the left sidebar, click "API permissions"
2. Click "+ Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Search for and add these permissions:
   - `Files.ReadWrite` - Read and write user files
   - `Files.ReadWrite.All` - Read and write all files user can access
   - `offline_access` - Maintain access to data
   - `User.Read` - Sign in and read user profile
6. Click "Add permissions"
7. Click "Grant admin consent" (if you have admin rights)

### Step 6: Add Additional Redirect URIs (Optional)

For testing environments, you may want multiple redirect URIs:

1. In the left sidebar, click "Authentication"
2. Under "Platform configurations" → "Web", click "Add URI"
3. Add additional URIs:
   - Local testing: `http://localhost:8020/html/callback.html`
   - Staging: `https://staging.biomodelanalyzer.org/html/callback.html`
4. Click "Save"

### Common Pitfalls

❌ **Wrong redirect URI**: Must exactly match your deployment URL
- Correct: `https://biomodelanalyzer.org/html/callback.html`
- Wrong: `https://biomodelanalyzer.org` (missing path)
- Wrong: `http://biomodelanalyzer.org/html/callback.html` (http instead of https)

❌ **Missing permissions**: OneDrive won't work without Files.ReadWrite permissions

❌ **Not granting consent**: Users may see permission errors if admin consent not granted

### Configuration Values Summary

After completing registration, you should have:

```bash
ONEDRIVE_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
ONEDRIVE_REDIRECT_URI=https://biomodelanalyzer.org/html/callback.html
```

Keep these values for the configuration step.

---

## Deployment Scenarios

### Scenario A: biomodelanalyzer.org Production

**Use case**: Public-facing production deployment

**Requirements**:
- Domain `biomodelanalyzer.org` with DNS pointing to server
- Let's Encrypt SSL certificates (automatic, free)
- OneDrive configured with production redirect URI

**Configuration**:
```bash
DOMAIN=biomodelanalyzer.org
EMAIL=b.hall@ucl.ac.uk
SSL_MODE=letsencrypt
ONEDRIVE_REDIRECT_URI=https://biomodelanalyzer.org/html/callback.html
```

**Steps**:
1. Ensure DNS is configured and propagated
2. Run setup with Let's Encrypt
3. Deploy and verify HTTPS access
4. Test OneDrive authentication

### Scenario B: Local Server / Testing

**Use case**: Internal deployment, testing, or development

**Requirements**:
- Server accessible on local network
- Self-signed SSL certificates (or no HTTPS for testing)
- OneDrive configured with IP-based redirect URI

**Configuration**:
```bash
DOMAIN=192.168.1.100  # Your server IP
EMAIL=admin@localhost
SSL_MODE=selfsigned
ONEDRIVE_REDIRECT_URI=https://192.168.1.100/html/callback.html
```

**Steps**:
1. Run setup with self-signed certificates
2. Deploy and accept browser security warnings
3. Test locally before moving to production

---

## Initial Setup

### Step 1: Clone Repository

```bash
cd /opt  # or your preferred location
git clone https://github.com/hallbh/BioModelAnalyzerFrk.git
cd BioModelAnalyzerFrk
```

### Step 2: Run Setup Command

```bash
./deploy-production.sh setup
```

This command will:
1. Check Docker and Docker Compose installation
2. Create directory structure (`config/`, `data/`, `logs/`)
3. Copy `production.env.template` to `production.env`
4. Prompt you to edit configuration
5. Generate nginx and frontend configuration files
6. Set up SSL certificates based on `SSL_MODE`

### Step 3: Edit Configuration

The setup will open `config/production.env` in your editor. Fill in your values:

```bash
# Domain configuration
DOMAIN=biomodelanalyzer.org
EMAIL=b.hall@ucl.ac.uk

# OneDrive OAuth (from Azure Portal)
ONEDRIVE_CLIENT_ID=your-client-id-here
ONEDRIVE_REDIRECT_URI=https://biomodelanalyzer.org/html/callback.html

# SSL mode
SSL_MODE=letsencrypt

# Application settings (usually no need to change)
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8020
```

### Step 4: SSL Certificate Setup

#### Let's Encrypt (Production)

When prompted during setup:
```
Continue with Let's Encrypt setup? (y/N) y
```

The setup will:
- Stop any services using ports 80/443
- Run certbot to obtain certificates
- Certificates are saved to `data/letsencrypt/`
- Valid for 90 days (auto-renewal configured later)

**Troubleshooting**:
- If it fails, check DNS is pointing to your server: `nslookup biomodelanalyzer.org`
- Ensure ports 80 and 443 are open: `sudo ufw status`
- Check no other services are using these ports: `sudo netstat -tlnp | grep ':80\|:443'`

#### Self-Signed (Testing)

For local testing, setup automatically generates:
```bash
config/ssl/selfsigned.crt
config/ssl/selfsigned.key
```

Browsers will show security warnings - this is expected for self-signed certificates.

### Step 5: Verify Setup

Check that configuration files were generated:
```bash
ls -la config/nginx/bma.conf
ls -la src/BmaLinuxApi/wwwroot/config.js
```

---

## Configuration

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your domain name or IP | `biomodelanalyzer.org` |
| `EMAIL` | Contact email for SSL certificates | `b.hall@ucl.ac.uk` |
| `ONEDRIVE_CLIENT_ID` | Azure app client ID | `a1b2c3d4-...` |
| `ONEDRIVE_REDIRECT_URI` | OAuth callback URL | `https://biomodelanalyzer.org/html/callback.html` |
| `SSL_MODE` | Certificate type | `letsencrypt`, `selfsigned`, or `custom` |
| `ASPNETCORE_ENVIRONMENT` | .NET environment | `Production` |
| `ASPNETCORE_URLS` | Internal app URL | `http://+:8020` |

### SSL Modes

**letsencrypt** (Recommended for production):
- Automatic free certificates from Let's Encrypt
- Requires public domain and ports 80/443 accessible
- Auto-renewal supported

**selfsigned** (For testing):
- Generates self-signed certificates
- Browser security warnings
- No external dependencies

**custom** (Bring your own):
- Place your certificates at:
  - `config/ssl/custom.crt`
  - `config/ssl/custom.key`

### Regenerating Configuration

If you change environment variables, regenerate configs:
```bash
bash scripts/generate-config.sh
```

---

## SSL Certificates

### Let's Encrypt Setup

Certificates are automatically obtained during `deploy-production.sh setup` if `SSL_MODE=letsencrypt`.

**Manual acquisition**:
```bash
bash scripts/setup-letsencrypt.sh acquire
```

**Certificate location**:
```
data/letsencrypt/live/biomodelanalyzer.org/
├── fullchain.pem  (certificate)
├── privkey.pem    (private key)
├── cert.pem
└── chain.pem
```

### Certificate Renewal

Let's Encrypt certificates expire after 90 days.

**Manual renewal**:
```bash
./deploy-production.sh renew-certs
```

**Test renewal** (dry run):
```bash
bash scripts/setup-letsencrypt.sh test
```

**Automatic renewal** (recommended):
```bash
./deploy-production.sh setup-renewal
```

This creates a cron job that runs twice daily to check and renew certificates.

**Verify cron job**:
```bash
crontab -l
# Should show: 0 0,12 * * * /path/to/deploy-production.sh renew-certs
```

### Rate Limits

Let's Encrypt has rate limits:
- 50 certificates per domain per week
- 5 duplicate certificates per week

For testing, use `selfsigned` mode or the staging environment.

---

## Deployment

### Start Production

```bash
./deploy-production.sh start
```

This will:
1. Regenerate configuration from `production.env`
2. Build Docker images
3. Start nginx and bma-app containers
4. Wait for services to be healthy
5. Display access URL

**Expected output**:
```
=========================================
Starting Production Deployment
=========================================
✓ Generating configuration...
✓ Building and starting services...
✓ Production deployment started!

Access your deployment at: https://biomodelanalyzer.org

Useful commands:
  View logs:    ./deploy-production.sh logs
  Check status: ./deploy-production.sh status
  Stop:         ./deploy-production.sh stop
```

### Verify Deployment

1. **Check service status**:
   ```bash
   ./deploy-production.sh status
   ```

2. **Access in browser**:
   - Navigate to `https://biomodelanalyzer.org`
   - Should see BMA interface
   - Check for valid SSL certificate (green padlock)

3. **Test API health**:
   ```bash
   curl https://biomodelanalyzer.org/api/health
   ```

4. **Test OneDrive**:
   - Click OneDrive button in BMA interface
   - Should redirect to Microsoft login
   - After login, should return to BMA

### Stop Production

```bash
./deploy-production.sh stop
```

### Restart Production

```bash
./deploy-production.sh restart
```

---

## Monitoring and Maintenance

### View Logs

**All services**:
```bash
./deploy-production.sh logs
```

**Specific service**:
```bash
./deploy-production.sh logs nginx
./deploy-production.sh logs bma-app
```

**Log files**:
```
logs/
├── app/           (BMA application logs)
├── nginx/         (nginx access and error logs)
└── renewal.log    (certificate renewal logs)
```

### Check Service Health

```bash
./deploy-production.sh status
```

**Expected output**:
```
NAME                    STATUS    PORTS
bma-production-nginx    Up        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
bma-production-app      Up        8020/tcp

Service Health:
✓ BMA Application: Healthy
✓ Nginx Proxy: Healthy
```

### Resource Monitoring

**Container stats**:
```bash
docker stats bma-production-app bma-production-nginx
```

**Disk usage**:
```bash
du -sh data/ logs/
```

### Log Rotation

Configure logrotate for nginx logs:

```bash
sudo nano /etc/logrotate.d/bma-nginx
```

```
/opt/BioModelAnalyzerFrk/logs/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        docker exec bma-production-nginx nginx -s reload
    endscript
}
```

---

## Troubleshooting

### SSL Certificate Issues

**Problem**: Certificate acquisition fails

**Solutions**:
1. Verify DNS: `nslookup biomodelanalyzer.org`
2. Check ports: `sudo netstat -tlnp | grep ':80\|:443'`
3. Check firewall: `sudo ufw status`
4. Review logs: `./deploy-production.sh logs nginx`

**Problem**: Browser shows "Certificate not valid"

**Solutions**:
- Wait for DNS propagation (up to 48 hours)
- Verify certificate: `openssl s_client -connect biomodelanalyzer.org:443`
- Check certificate expiry: `./deploy-production.sh status`

### OneDrive Authentication Failures

**Problem**: OneDrive login redirects to error page

**Solutions**:
1. Verify `ONEDRIVE_REDIRECT_URI` exactly matches Azure Portal configuration
2. Check `config.js` was generated: `cat src/BmaLinuxApi/wwwroot/config.js`
3. Verify client ID is correct in `production.env`
4. Check browser console for JavaScript errors

**Problem**: "Invalid redirect URI" error

**Solution**: Redirect URI in Azure Portal must exactly match deployment URL including `/html/callback.html` path

### Container Startup Failures

**Problem**: Containers won't start

**Solutions**:
1. Check logs: `./deploy-production.sh logs`
2. Verify configuration: `docker compose -f docker-compose.production.yml config`
3. Check disk space: `df -h`
4. Rebuild images: `docker compose -f docker-compose.production.yml build --no-cache`

### Network Connectivity Issues

**Problem**: Can't access deployment from external network

**Solutions**:
1. Verify firewall rules: `sudo ufw status`
2. Check nginx is listening: `docker exec bma-production-nginx netstat -tlnp`
3. Test from server: `curl -k https://localhost`
4. Check DNS resolution from external network

### Getting Help

1. Check logs: `./deploy-production.sh logs`
2. Review this documentation
3. Check GitHub issues: https://github.com/hallbh/BioModelAnalyzerFrk/issues
4. Contact: b.hall@ucl.ac.uk

---

## Updating

### Update to Latest Version

```bash
cd /opt/BioModelAnalyzerFrk
git pull origin main
./deploy-production.sh restart
```

This will:
1. Pull latest code
2. Rebuild Docker images with new code
3. Restart services with zero downtime

### Rollback to Previous Version

```bash
git log --oneline  # Find commit hash
git checkout <commit-hash>
./deploy-production.sh restart
```

### Zero-Downtime Updates

For critical production environments:

```bash
# Start new version alongside old
docker compose -f docker-compose.production.yml up -d --no-deps --build bma-app

# Verify new version is healthy
docker exec bma-production-app curl -f http://localhost:8020/api/health

# nginx will automatically route to new container
# Old container can be removed after verification
```

---

## Backup and Recovery

### What to Backup

1. **Configuration**:
   ```bash
   tar -czf backup-config-$(date +%Y%m%d).tar.gz config/
   ```

2. **SSL Certificates**:
   ```bash
   tar -czf backup-certs-$(date +%Y%m%d).tar.gz data/letsencrypt/
   ```

3. **Logs** (optional):
   ```bash
   tar -czf backup-logs-$(date +%Y%m%d).tar.gz logs/
   ```

### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backup/bma"
DATE=$(date +%Y%m%d)
cd /opt/BioModelAnalyzerFrk

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/config-$DATE.tar.gz config/
tar -czf $BACKUP_DIR/certs-$DATE.tar.gz data/letsencrypt/

# Keep last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Schedule with cron:
```bash
crontab -e
# Add: 0 2 * * * /opt/BioModelAnalyzerFrk/backup.sh
```

### Restore from Backup

```bash
cd /opt/BioModelAnalyzerFrk
./deploy-production.sh stop

# Restore configuration
tar -xzf backup-config-20260211.tar.gz

# Restore certificates
tar -xzf backup-certs-20260211.tar.gz

./deploy-production.sh start
```

### Disaster Recovery

**Complete server failure**:

1. Provision new server
2. Install Docker and Docker Compose
3. Clone repository
4. Restore backups
5. Update DNS to point to new server IP
6. Run `./deploy-production.sh start`

**Certificate renewal failure**:

Certificates can be manually renewed even after expiry:
```bash
bash scripts/setup-letsencrypt.sh acquire
```

---

## Quick Reference

### Common Commands

```bash
# Setup
./deploy-production.sh setup

# Start/Stop/Restart
./deploy-production.sh start
./deploy-production.sh stop
./deploy-production.sh restart

# Monitoring
./deploy-production.sh status
./deploy-production.sh logs
./deploy-production.sh logs nginx

# Certificates
./deploy-production.sh renew-certs
./deploy-production.sh setup-renewal

# Help
./deploy-production.sh help
```

### File Locations

```
BioModelAnalyzerFrk/
├── deploy-production.sh              # Main deployment script
├── docker-compose.production.yml     # Docker Compose config
├── config/
│   ├── production.env                # Your configuration
│   ├── nginx/bma.conf                # Generated nginx config
│   └── ssl/                          # SSL certificates
├── data/
│   └── letsencrypt/                  # Let's Encrypt data
├── logs/
│   ├── app/                          # Application logs
│   └── nginx/                        # Nginx logs
└── scripts/
    ├── generate-config.sh            # Config generator
    └── setup-letsencrypt.sh          # SSL setup
```

### Support

- **Documentation**: This file
- **Issues**: https://github.com/hallbh/BioModelAnalyzerFrk/issues
- **Contact**: b.hall@ucl.ac.uk
