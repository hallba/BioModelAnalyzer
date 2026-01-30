# Task T028: Create LTL Polarity Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T027
**Phase:** Phase 7 - US5 (LTL Formula Checking)

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
