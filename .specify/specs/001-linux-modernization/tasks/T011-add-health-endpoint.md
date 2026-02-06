# Task T011: Add Health Endpoint

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 15m
**Dependencies:** T010 (Foundational complete)
**Phase:** Phase 3 - US1 (Run BMA on Linux)

---

## Context Setup Prompt

```
I'm working on Task T011: Add Health Endpoint for BioModelAnalyzer Linux Modernization.

Please read: .specify/specs/001-linux-modernization/tasks/T011-add-health-endpoint.md

## Goal

Create a proper health check endpoint for monitoring.

## Your Tasks

1. Create HealthEndpoint.cs with GET /api/health
2. Include version, uptime, and dependency status
```

---

## Implementation Checklist

Create `src/BmaLinuxApi/Endpoints/HealthEndpoint.cs`:

```csharp
namespace BmaLinuxApi.Endpoints;

public static class HealthEndpoint
{
    private static readonly DateTime StartTime = DateTime.UtcNow;

    public static void MapHealthEndpoints(this WebApplication app)
    {
        app.MapGet("/api/health", () => Results.Ok(new
        {
            Status = "Healthy",
            Version = "1.14.0",
            Timestamp = DateTime.UtcNow,
            UptimeSeconds = (DateTime.UtcNow - StartTime).TotalSeconds
        }));
    }
}
```

Update Program.cs:
```csharp
using BmaLinuxApi.Endpoints;
// ...
app.MapHealthEndpoints();
```

- [x]Create HealthEndpoint.cs
- [x]Register in Program.cs
- [x]Test endpoint responds

---

## Acceptance Criteria

- [x]GET /api/health returns 200 with JSON status
- [x]Response includes version and uptime

---

**Created:** 2026-01-29
