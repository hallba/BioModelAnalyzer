# Task T017: Create Analyze Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T016
**Phase:** Phase 4 - US2 (Analyze Biological Models)

---

## Context Setup Prompt

```
I'm working on Task T017: Create Analyze Endpoint.

Read: .specify/specs/001-linux-modernization/tasks/T017-create-analyze-endpoint.md
      .specify/specs/001-linux-modernization/contracts/api-spec.yaml

## Goal

Create POST /api/Analyze endpoint matching the OpenAPI spec.
```

---

## Implementation

Create `src/BmaLinuxApi/Endpoints/AnalyzeEndpoint.cs`:

```csharp
namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class AnalyzeEndpoint
{
    public static void MapAnalyzeEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Analyze", async (
            AnalysisInput input,
            IAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var result = await analysisService.AnalyzeAsync(input.Model, ct);
            return Results.Ok(result);
        });
    }
}
```

Update Program.cs:
```csharp
app.MapAnalyzeEndpoints();
```

- [ ] Create AnalyzeEndpoint.cs
- [ ] Register in Program.cs
- [ ] Test with curl

---

**Created:** 2026-01-29
