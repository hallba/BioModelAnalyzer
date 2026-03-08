# Task T042: Create LRA Result Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T040
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Context Setup Prompt

```
I'm working on Task T042: Create LRA Result Endpoint.

Read: .specify/specs/001-linux-modernization/tasks/T042-create-lra-result-endpoint.md
      .specify/specs/001-linux-modernization/contracts/api-spec.yaml
      src/BmaLinuxApi/Endpoints/LraEndpoints.cs
      src/BmaLinuxApi/Models/LtlModels.cs

## Goal

Add GET /api/lra/{appId}/result endpoint to LraEndpoints.cs for
retrieving completed job results (LtlPolarityResult).
GET status and DELETE endpoints were added in T040-T041.
```

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
