# Task T015: Create IAnalysisService Interface

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 15m
**Dependencies:** T007
**Phase:** Phase 4 - US2 (Analyze Biological Models)

---

## Context Setup Prompt

```
I'm working on Task T015: Create IAnalysisService Interface.

Read: .specify/specs/001-linux-modernization/tasks/T015-create-analysis-service.md

## Goal

Finalize the IAnalysisService interface (already stubbed in T007).
```

---

## Implementation

Verify/update `src/BmaLinuxApi/Services/IAnalysisService.cs`:

```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IAnalysisService
{
    Task<AnalysisResult> AnalyzeAsync(Model model, CancellationToken ct = default);
}
```

- [x] Interface defined
- [x] Uses correct Model type from Models namespace

---

**Created:** 2026-01-29
