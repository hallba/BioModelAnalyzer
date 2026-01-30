# Task T026: Implement LtlService

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 1.5h
**Dependencies:** T025
**Phase:** Phase 7 - US5 (LTL Formula Checking)

---

## Context Setup Prompt

```
Read: .specify/specs/001-linux-modernization/tasks/T026-implement-ltl-service.md
      BmaLinux/BioCheckAnaylzerCommonMulti/IAnalyzer.cs

## Goal

Wrap F# checkLTLSimulation and checkLTLPolarity methods.
```

---

## Implementation

Create `src/BmaLinuxApi/Services/LtlService.cs`:

```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public class LtlService : ILtlService
{
    private readonly IAnalyzer _analyzer;
    
    public LtlService(IAnalyzer analyzer)
    {
        _analyzer = analyzer;
    }

    public async Task<LtlSimulationResult> CheckSimulationAsync(
        LtlSimulationInput input, 
        CancellationToken ct = default)
    {
        // Call F# checkLTLSimulation
        throw new NotImplementedException();
    }

    public async Task<LtlPolarityResult> CheckPolarityAsync(
        LtlPolarityInput input, 
        CancellationToken ct = default)
    {
        // Call F# checkLTLPolarity
        throw new NotImplementedException();
    }
}
```

- [ ] Implement service
- [ ] Register in DI

---

**Created:** 2026-01-29
