# Let's Encrypt Certificate Acquisition Troubleshooting

## Problem
Getting timeout errors when trying to acquire Let's Encrypt certificates:
```
Timeout during connect (likely firewall problem)
```

## Root Cause
The original `setup-letsencrypt.sh` script uses certbot's **standalone mode**, which:
- Requires stopping nginx to free port 80
- Runs its own temporary web server
- May be blocked by firewalls that only allow specific services

## Solution: Use Webroot Method

The webroot method works with nginx running, making it more firewall-friendly.

### Steps to Acquire Certificates

1. **Ensure deployment is running with self-signed certificates:**
   ```bash
   ./deploy-production.sh status
   ```
   Both nginx and bma-app should be running.

2. **Verify DNS is pointing to your server:**
   ```bash
   dig pin1.cs.ucl.ac.uk +short
   ```
   Should return your server's IP address (128.16.10.134).

3. **Check port 80 is accessible:**
   ```bash
   curl -I http://pin1.cs.ucl.ac.uk
   ```
   Should get a response (even if it's a redirect).

4. **Run the webroot acquisition script:**
   ```bash
   bash scripts/acquire-letsencrypt-webroot.sh
   ```

5. **If successful, switch to Let's Encrypt certificates:**
   ```bash
   # Edit config/production.env
   # Change: SSL_MODE=selfsigned
   # To:     SSL_MODE=letsencrypt
   
   # Regenerate config
   bash scripts/generate-config.sh
   
   # Restart
   ./deploy-production.sh restart
   ```

### Firewall Configuration

If you're still getting timeouts, check your firewall:

**Ubuntu (ufw):**
```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**Red Hat/CentOS (firewalld):**
```bash
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**Check if port 80 is listening:**
```bash
sudo netstat -tlnp | grep :80
```

### Testing from External Server

From another machine, test if port 80 is reachable:
```bash
curl -v http://pin1.cs.ucl.ac.uk/.well-known/acme-challenge/test
```

You should get a 404 (not found) response, which is fine - it means nginx is reachable.

### Common Issues

1. **Institutional Firewall**
   - Some institutions block inbound port 80
   - Contact your IT department to allow Let's Encrypt IPs
   - Let's Encrypt IP ranges: https://letsencrypt.org/docs/integration-guide/

2. **DNS Not Propagated**
   - Wait for DNS to propagate (can take up to 48 hours)
   - Check with: `dig pin1.cs.ucl.ac.uk @8.8.8.8`

3. **Rate Limiting**
   - Let's Encrypt has rate limits (5 failures per hour)
   - Wait an hour before retrying
   - Use staging mode for testing: add `--staging` flag to certbot command

4. **Nginx Not Serving Webroot**
   - Check nginx logs: `./deploy-production.sh logs nginx`
   - Verify webroot directory exists: `ls -la data/certbot-webroot/`

### Alternative: Manual Certificate Installation

If Let's Encrypt continues to fail, you can use certificates from another source:

1. Obtain certificates from your institution's IT department
2. Place them in `config/ssl/`:
   - `custom.crt` (certificate)
   - `custom.key` (private key)
3. Update `config/production.env`: `SSL_MODE=custom`
4. Regenerate config and restart: 
   ```bash
   bash scripts/generate-config.sh
   ./deploy-production.sh restart
   ```
