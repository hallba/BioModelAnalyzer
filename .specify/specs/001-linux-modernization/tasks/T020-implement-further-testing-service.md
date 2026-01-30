# Task T020: Implement FurtherTestingService

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 1.5h
**Dependencies:** T019
**Phase:** Phase 5 - US3 (Find Counter-Examples)

---

## Context Setup Prompt

```
I'm working on Task T020: Implement FurtherTestingService.

Read: .specify/specs/001-linux-modernization/tasks/T020-implement-further-testing-service.md
      BmaLinux/BioCheckAnaylzerCommonMulti/IAnalyzer.cs

## Goal

Wrap F# findCExBifurcates, findCExCycles, findCExFixpoint methods.
```

---

## Implementation

Create `src/BmaLinuxApi/Services/FurtherTestingService.cs`:

```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public class FurtherTestingService : IFurtherTestingService
{
    private readonly IAnalyzer _analyzer;
    
    public FurtherTestingService(IAnalyzer analyzer)
    {
        _analyzer = analyzer;
    }

    public async Task<FurtherTestingResult> FindCounterExamplesAsync(
        Model model, 
        AnalysisResult analysis, 
        CancellationToken ct = default)
    {
        var counterExamples = new List<CounterExample>();
        
        // Call F# methods for each counter-example type
        // Bifurcation, Cycle, Fixpoint
        
        return new FurtherTestingResult(
            CounterExamples: counterExamples.ToArray(),
            Error: null,
            ErrorMessages: null,
            DebugMessages: null
        );
    }
}
```

- [ ] Implement service
- [ ] Register in DI

---

**Created:** 2026-01-29
