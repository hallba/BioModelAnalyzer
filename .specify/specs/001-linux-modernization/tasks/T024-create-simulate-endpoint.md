# Task T024: Create Simulate Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T023
**Phase:** Phase 6 - US4 (Run Simulations)

---

## Implementation

Create `src/BmaLinuxApi/Endpoints/SimulateEndpoint.cs`:

```csharp
namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class SimulateEndpoint
{
    public static void MapSimulateEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Simulate", async (
            SimulationInput input,
            ISimulationService service,
            CancellationToken ct) =>
        {
            var result = await service.SimulateTickAsync(input.Model, input.Variables, ct);
            return Results.Ok(result);
        });
    }
}
```

- [ ] Create endpoint
- [ ] Register in Program.cs

---

**Created:** 2026-01-29
