# Task T045: Write Deployment Documentation

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 1h
**Dependencies:** T043, T044
**Phase:** Phase 11 - Polish & Deployment

---

## Implementation

Create `docs/LinuxDeployment.md`:

```markdown
# Linux Deployment Guide

## Prerequisites
- Ubuntu 22.04 or later
- No .NET SDK required (self-contained)

## Option 1: Single Executable

1. Download BmaLinuxApi from releases
2. Make executable: `chmod +x BmaLinuxApi`
3. Run: `./BmaLinuxApi`
4. Access: http://localhost:8080

## Option 2: Docker

1. `docker pull bma-linux:latest`
2. `docker run -p 8080:8080 bma-linux`

## Option 3: systemd Service

1. Copy executable to /opt/bma/
2. Copy bma.service to /etc/systemd/system/
3. `systemctl enable bma`
4. `systemctl start bma`

## Configuration

Edit appsettings.json or use environment variables:
- `ASPNETCORE_URLS=http://0.0.0.0:8080`
- `Analysis__TimeoutSeconds=120`
```

- [ ] Create docs/LinuxDeployment.md
- [ ] Include all deployment options

---

**Created:** 2026-01-29
