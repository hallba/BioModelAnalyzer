# Task T021: Create FurtherTesting Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T020
**Phase:** Phase 5 - US3 (Find Counter-Examples)

---

## Implementation

Create `src/BmaLinuxApi/Endpoints/FurtherTestingEndpoint.cs`:

```csharp
namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class FurtherTestingEndpoint
{
    public static void MapFurtherTestingEndpoints(this WebApplication app)
    {
        app.MapPost("/api/FurtherTesting", async (
            FurtherTestingInput input,
            IFurtherTestingService service,
            CancellationToken ct) =>
        {
            var result = await service.FindCounterExamplesAsync(input.Model, input.Analysis, ct);
            return Results.Ok(result);
        });
    }
}
```

- [ ] Create endpoint
- [ ] Register in Program.cs

---

**Created:** 2026-01-29
