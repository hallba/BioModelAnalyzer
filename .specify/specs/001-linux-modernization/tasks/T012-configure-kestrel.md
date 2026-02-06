# Task T012: Configure Kestrel

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 15m
**Dependencies:** T005
**Phase:** Phase 3 - US1 (Run BMA on Linux)

---

## Context Setup Prompt

```
I'm working on Task T012: Configure Kestrel for port 8020.

Please read: .specify/specs/001-linux-modernization/tasks/T012-configure-kestrel.md

## Goal

Configure Kestrel to listen on 0.0.0.0:8020 for Linux deployment.
```

---

## Implementation Checklist

Update `src/BmaLinuxApi/appsettings.json`:

```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:8020"
      }
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Analysis": {
    "TimeoutSeconds": 120,
    "MaxConcurrentJobs": 4
  }
}
```

- [x]Update appsettings.json
- [x]Test: `dotnet run` listens on 8020
- [x]Test: `curl http://localhost:8020/api/health`

---

## Acceptance Criteria

- [x]Application listens on port 8020
- [x]Accessible from 0.0.0.0 (not just localhost)

---

## Troubleshooting

### Missing SDK
- **Option A:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- **Option B:** Use Docker: `./scripts/dotnet-docker.sh run --project src/BmaLinuxApi`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

---

**Created:** 2026-01-29
