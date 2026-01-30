# Task T016: Implement AnalysisService

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 1.5h
**Dependencies:** T015
**Phase:** Phase 4 - US2 (Analyze Biological Models)

---

## Context Setup Prompt

```
I'm working on Task T016: Implement AnalysisService.

Read these files first:
- .specify/specs/001-linux-modernization/tasks/T016-implement-analysis-service.md
- BmaLinux/BioCheckAnaylzerCommonMulti/IAnalyzer.cs
- src/BmaLinuxApi/Services/IAnalysisService.cs
- src/BmaLinuxApi/Models/AnalysisModels.cs

## Goal

Implement AnalysisService that wraps the F# IAnalyzer.checkStability() method.

## Your Tasks

1. Understand IAnalyzer interface from F# project
2. Create AnalysisService that adapts F# types to C# DTOs
3. Register in DI container
4. Handle exceptions and timeouts
```

---

## Implementation Checklist

### Part A: Create Service

Create `src/BmaLinuxApi/Services/AnalysisService.cs`:

```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;
using BioCheckAnalyzerCommon;  // F# types namespace

public class AnalysisService : IAnalysisService
{
    private readonly IAnalyzer _analyzer;
    private readonly ILogger<AnalysisService> _logger;

    public AnalysisService(IAnalyzer analyzer, ILogger<AnalysisService> logger)
    {
        _analyzer = analyzer;
        _logger = logger;
    }

    public async Task<AnalysisResult> AnalyzeAsync(Model model, CancellationToken ct = default)
    {
        try
        {
            // Convert C# Model to F# Model type
            var fsharpModel = ConvertToFSharpModel(model);
            
            // Call F# analyzer (may need Task.Run for sync API)
            var result = await Task.Run(() => _analyzer.checkStability(fsharpModel), ct);
            
            // Convert F# result to C# DTO
            return ConvertToResult(result);
        }
        catch (OperationCanceledException)
        {
            throw; // Let timeout handling deal with this
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Analysis failed for model {ModelName}", model.Name);
            return new AnalysisResult(
                Status: null,
                Time: 0,
                Ticks: null,
                Error: ex.Message,
                ErrorMessages: new[] { ex.Message },
                DebugMessages: null
            );
        }
    }

    // TODO: Implement type conversion methods
    private object ConvertToFSharpModel(Model model) => throw new NotImplementedException();
    private AnalysisResult ConvertToResult(object result) => throw new NotImplementedException();
}
```

- [ ] Create AnalysisService.cs
- [ ] Implement type conversion (study F# types first)
- [ ] Handle exceptions

### Part B: Register in DI

Update Program.cs:
```csharp
// Register F# analyzer
builder.Services.AddSingleton<IAnalyzer>(sp =>
{
    // Create F# analyzer instance
    return new Analyzer(); // Or however F# instantiates this
});

// Replace placeholder with real service
builder.Services.AddScoped<IAnalysisService, AnalysisService>();
```

- [ ] Register IAnalyzer
- [ ] Register AnalysisService

---

## Acceptance Criteria

- [ ] AnalysisService wraps IAnalyzer correctly
- [ ] C# to F# type conversion works
- [ ] Errors are caught and returned in AnalysisResult

---

**Created:** 2026-01-29
