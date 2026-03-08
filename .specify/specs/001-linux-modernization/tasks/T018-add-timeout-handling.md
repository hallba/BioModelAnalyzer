# Task T018: Add Timeout Handling

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 30m
**Dependencies:** T017
**Phase:** Phase 4 - US2 (Analyze Biological Models)

---

## Context Setup Prompt

```
I'm working on Task T018: Add Timeout Handling.

Read: .specify/specs/001-linux-modernization/tasks/T018-add-timeout-handling.md

## Goal

Add 2-minute timeout that returns 204 No Content when exceeded.
```

---

## Implementation

Update `src/BmaLinuxApi/Endpoints/AnalyzeEndpoint.cs`:

```csharp
app.MapPost("/api/Analyze", async (
    AnalysisInput input,
    IAnalysisService analysisService,
    IConfiguration config) =>
{
    var timeoutSeconds = config.GetValue<int>("Analysis:TimeoutSeconds", 120);
    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));

    try
    {
        var result = await analysisService.AnalyzeAsync(input.Model, cts.Token);
        return Results.Ok(result);
    }
    catch (OperationCanceledException)
    {
        return Results.NoContent(); // 204 for timeout per API spec
    }
});
```

- [ ] Add timeout using CancellationTokenSource
- [ ] Return 204 on timeout
- [ ] Read timeout from configuration

---

**Created:** 2026-01-29
