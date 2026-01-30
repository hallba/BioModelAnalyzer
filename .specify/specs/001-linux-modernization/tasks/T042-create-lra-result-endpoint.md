# Task T042: Create LRA Result Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T040
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Implementation

Add to `src/BmaLinuxApi/Endpoints/LraEndpoints.cs`:

```csharp
app.MapGet("/api/lra/{appId:guid}/result", (
    Guid appId,
    Guid jobId,
    IScheduler scheduler) =>
{
    var result = scheduler.GetJobResult(appId, jobId);
    return result != null
        ? Results.Ok(result)
        : Results.NotFound();
});
```

- [ ] Add result endpoint
- [ ] Returns LtlPolarityResult

---

**Created:** 2026-01-29
