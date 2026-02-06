# Linux Deployment Guide

## Prerequisites

- Ubuntu 22.04 or later (any glibc-based Linux distro)
- No .NET SDK required (self-contained executable)

## Option 1: Single Executable

1. Download the `BmaLinuxApi` binary from releases
2. Make executable: `chmod +x BmaLinuxApi`
3. Run: `./BmaLinuxApi`
4. Access: http://localhost:8020

## Option 2: Docker

```bash
# Build the image
docker build -f src/BmaLinuxApi/Dockerfile -t bma-linux-api .

# Run the container
docker run -p 8020:8020 bma-linux-api
```

Access: http://localhost:8020

## Option 3: systemd Service

1. Copy the executable and frontend assets to `/opt/bma/`:
   ```bash
   sudo mkdir -p /opt/bma
   sudo cp BmaLinuxApi /opt/bma/
   sudo cp -r wwwroot /opt/bma/
   sudo cp appsettings.json /opt/bma/
   ```

2. Create a service user:
   ```bash
   sudo useradd --system --no-create-home --shell /usr/sbin/nologin bma
   sudo chown -R bma:bma /opt/bma
   ```

3. Install the systemd unit:
   ```bash
   sudo cp deployment/bma.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable bma
   sudo systemctl start bma
   ```

4. Check status:
   ```bash
   sudo systemctl status bma
   journalctl -u bma -f
   ```

## Configuration

Configuration can be set via `appsettings.json` or environment variables:

| Setting | Environment Variable | Default | Description |
|---------|---------------------|---------|-------------|
| Listen URL | `ASPNETCORE_URLS` | `http://0.0.0.0:8020` | Bind address and port |
| Analysis timeout | `Analysis__TimeoutSeconds` | `120` | Max seconds for analysis endpoints |
| Max concurrent jobs | `Analysis__MaxConcurrentJobs` | `4` | Max parallel long-running analysis jobs |
| Log level | `Logging__LogLevel__Default` | `Information` | Logging verbosity |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/Analyze` | Stability analysis |
| POST | `/api/FurtherTesting` | Counter-example finding |
| POST | `/api/Simulate` | Simulation step |
| POST | `/api/AnalyzeLTLSimulation` | LTL simulation |
| POST | `/api/AnalyzeLTLPolarity` | LTL polarity analysis |
| POST | `/api/lra/{appId}` | Schedule long-running job |
| GET | `/api/lra/{appId}?jobId={id}` | Get job status |
| DELETE | `/api/lra/{appId}?jobId={id}` | Cancel/delete job |
| GET | `/api/lra/{appId}/result?jobId={id}` | Get job result |
| POST | `/api/export` | Export to Excel |

## Troubleshooting

### Port already in use
```bash
# Check what's using port 8020
ss -tlnp | grep 8020

# Change port via environment variable
ASPNETCORE_URLS=http://0.0.0.0:9090 ./BmaLinuxApi
```

### Z3 native library not found
The self-contained binary bundles `libz3.so`. If you see `DllNotFoundException`, ensure the binary was published with `linux-x64` runtime identifier and that `libstdc++` is installed:
```bash
sudo apt-get install libstdc++6
```
