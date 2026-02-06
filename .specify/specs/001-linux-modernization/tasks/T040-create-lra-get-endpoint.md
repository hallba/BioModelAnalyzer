# Task T040: Create LRA GET Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T039
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Context Setup Prompt

```
I'm working on Task T040: Create LRA GET Endpoint.

Read: .specify/specs/001-linux-modernization/tasks/T040-create-lra-get-endpoint.md
      .specify/specs/001-linux-modernization/contracts/api-spec.yaml
      src/BmaLinuxApi/Endpoints/LraEndpoints.cs
      src/BmaLinuxApi/Services/IScheduler.cs

## Goal

Add GET /api/lra/{appId} endpoint to LraEndpoints.cs for checking
long-running job status. Returns status codes per API spec
(201=Queued, 202=Executing, 200=Completed, 203=Failed).
The POST endpoint was created in T039.
```

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
