# Task T028: Create LTL Polarity Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T027
**Phase:** Phase 7 - US5 (LTL Formula Checking)

---

## Context Setup Prompt

```
I'm working on Task T028: Create LTL Polarity Endpoint.

Read: .specify/specs/001-linux-modernization/tasks/T028-create-ltl-polarity-endpoint.md
      .specify/specs/001-linux-modernization/contracts/api-spec.yaml
      src/BmaLinuxApi/Endpoints/LtlEndpoints.cs

## Goal

Add POST /api/AnalyzeLTLPolarity endpoint to the existing LtlEndpoints.cs file,
matching the OpenAPI spec. This is the second LTL endpoint alongside the
simulation one added in T027.
```

---

## Implementation

Add to `src/BmaLinuxApi/Endpoints/LtlEndpoints.cs`:

```csharp
app.MapPost("/api/AnalyzeLTLPolarity", async (
    LtlPolarityInput input,
    ILtlService service,
    CancellationToken ct) =>
{
    var result = await service.CheckPolarityAsync(input, ct);
    return Results.Ok(result);
});
```

- [ ] Add polarity endpoint to LtlEndpoints.cs
- [ ] Test both LTL endpoints

---

**Created:** 2026-01-29
