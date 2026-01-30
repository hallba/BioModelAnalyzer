# Task T041: Create LRA DELETE Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T040
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Implementation

Add to `src/BmaLinuxApi/Endpoints/LraEndpoints.cs`:

```csharp
app.MapDelete("/api/lra/{appId:guid}", (
    Guid appId,
    Guid jobId,
    IScheduler scheduler) =>
{
    return scheduler.DeleteJob(appId, jobId)
        ? Results.Ok()
        : Results.NotFound();
});
```

- [ ] Add DELETE endpoint

---

**Created:** 2026-01-29
