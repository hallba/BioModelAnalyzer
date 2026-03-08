# Task T044: Create systemd Service

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T014
**Phase:** Phase 11 - Polish & Deployment

---

## Implementation

Create `deployment/bma.service`:

```ini
[Unit]
Description=BioModelAnalyzer API
After=network.target

[Service]
Type=exec
ExecStart=/opt/bma/BmaLinuxApi
WorkingDirectory=/opt/bma
Restart=always
RestartSec=10
KillSignal=SIGINT
User=bma
Environment=ASPNETCORE_URLS=http://0.0.0.0:8020
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

```bash
mkdir -p deployment
```

- [ ] Create deployment/bma.service
- [ ] Document installation steps

---

**Created:** 2026-01-29
