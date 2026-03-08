# Task T027: Create LTL Simulation Endpoint

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 30m
**Dependencies:** T026
**Phase:** Phase 7 - US5 (LTL Formula Checking)

---

## Implementation

Create `src/BmaLinuxApi/Endpoints/LtlEndpoints.cs`:

```csharp
namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class LtlEndpoints
{
    public static void MapLtlEndpoints(this WebApplication app)
    {
        app.MapPost("/api/AnalyzeLTLSimulation", async (
            LtlSimulationInput input,
            ILtlService service,
            CancellationToken ct) =>
        {
            var result = await service.CheckSimulationAsync(input, ct);
            return Results.Ok(result);
        });

        // Polarity endpoint added in T028
    }
}
```

- [x] Create LtlEndpoints.cs with simulation endpoint
- [x] Register in Program.cs
- [x] Add timeout handling (204 on timeout per API spec) — added alongside T028

---

**Created:** 2026-01-29
