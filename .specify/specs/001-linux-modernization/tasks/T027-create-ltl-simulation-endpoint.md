# Task T027: Create LTL Simulation Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
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

- [ ] Create LtlEndpoints.cs with simulation endpoint
- [ ] Register in Program.cs

---

**Created:** 2026-01-29
