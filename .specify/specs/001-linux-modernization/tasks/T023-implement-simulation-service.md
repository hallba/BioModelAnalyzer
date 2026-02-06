# Task T023: Implement SimulationService

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 1h
**Dependencies:** T022
**Phase:** Phase 6 - US4 (Run Simulations)

---

## Context Setup Prompt

```
Read: .specify/specs/001-linux-modernization/tasks/T023-implement-simulation-service.md
      BmaLinux/BioCheckAnaylzerCommonMulti/IAnalyzer.cs

## Goal

Wrap F# IAnalyzer.simulate_tick method.
```

---

## Implementation

Create `src/BmaLinuxApi/Services/SimulationService.cs`:

```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public class SimulationService : ISimulationService
{
    private readonly IAnalyzer _analyzer;
    
    public SimulationService(IAnalyzer analyzer)
    {
        _analyzer = analyzer;
    }

    public async Task<SimulationResult> SimulateTickAsync(
        Model model, 
        VariableValue[] variables, 
        CancellationToken ct = default)
    {
        // Convert and call F# simulate_tick
        // Return converted result
        throw new NotImplementedException();
    }
}
```

- [x] Implement service
- [x] Register in DI

---

**Created:** 2026-01-29
