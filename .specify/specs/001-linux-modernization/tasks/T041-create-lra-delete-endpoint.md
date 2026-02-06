# Task T041: Create LRA DELETE Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T040
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Context Setup Prompt

```
I'm working on Task T041: Create LRA DELETE Endpoint.

Read: .specify/specs/001-linux-modernization/tasks/T041-create-lra-delete-endpoint.md
      .specify/specs/001-linux-modernization/contracts/api-spec.yaml
      src/BmaLinuxApi/Endpoints/LraEndpoints.cs

## Goal

Add DELETE /api/lra/{appId} endpoint to LraEndpoints.cs for cancelling
long-running jobs. GET endpoint was added in T040.
```

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
