# Task T040: Create LRA GET Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T039
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Implementation

Add to `src/BmaLinuxApi/Endpoints/LraEndpoints.cs`:

```csharp
app.MapGet("/api/lra/{appId:guid}", (
    Guid appId,
    Guid jobId,
    IScheduler scheduler) =>
{
    var job = scheduler.GetJobStatus(appId, jobId);
    if (job == null)
        return Results.NotFound();

    return job.State switch
    {
        JobState.Queued => Results.StatusCode(201), // Queued
        JobState.Executing => Results.StatusCode(202), // Executing
        JobState.Completed => Results.Ok(), // Succeeded
        JobState.Failed => Results.StatusCode(203), // Failed
        _ => Results.StatusCode(501) // Unknown
    };
});
```

- [ ] Add GET endpoint
- [ ] Returns correct status codes per API spec

---

**Created:** 2026-01-29
