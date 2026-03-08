# Task T039: Create LRA POST Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T038
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Implementation

Create `src/BmaLinuxApi/Endpoints/LraEndpoints.cs`:

```csharp
namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class LraEndpoints
{
    public static void MapLraEndpoints(this WebApplication app)
    {
        app.MapPost("/api/lra/{appId:guid}", (
            Guid appId,
            LtlPolarityInput input,
            IScheduler scheduler,
            ILtlService ltlService) =>
        {
            var jobId = scheduler.ScheduleJob(appId, async ct =>
            {
                return await ltlService.CheckPolarityAsync(input, ct);
            });
            
            return Results.Ok(jobId.ToString());
        });
    }
}
```

- [ ] Create POST endpoint
- [ ] Returns job ID

---

**Created:** 2026-01-29
