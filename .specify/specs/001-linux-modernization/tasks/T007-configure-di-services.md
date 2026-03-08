# Task T007: Configure Dependency Injection

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 45m
**Dependencies:** T005 (API project created), T006 (DTO models created)
**Phase:** Phase 2 - Foundational

---

## Context Setup Prompt

Use this prompt to start a fresh Claude Code session for this task:

```
I'm working on Task T007: Configure Dependency Injection for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T007-configure-di-services.md (this task file)
- .specify/specs/001-linux-modernization/plan.md (service layer design)
- src/BmaLinuxApi/Program.cs
- BmaLinux/BioCheckAnaylzerCommonMulti/IAnalyzer.cs (the interface to wrap)

## Problem Statement

We need to configure ASP.NET Core's built-in dependency injection to register the F# analyzer and our service wrappers.

## Goal

Configure DI in Program.cs so services can be injected into endpoint handlers.

## What's Already Done

- [x] T005: BmaLinuxApi project created with F# project references
- [x] T006: DTO models created

## Your Tasks

1. Understand IAnalyzer interface from F# project
2. Create service interface stubs (actual implementations come later)
3. Configure DI registration in Program.cs
4. Verify build succeeds

## Important Notes

- The F# IAnalyzer is the core interface to wrap
- Register IAnalyzer as Singleton (thread-safe)
- Register service wrappers as Scoped (per-request)
- Just create interface stubs - implementations come in Phase 4-7
```

---

## Background

### Why This Task?

Dependency injection allows loose coupling between components. ASP.NET Core uses built-in DI which:
- Manages service lifetimes
- Enables testability
- Follows modern .NET patterns

### Technical Context

The IAnalyzer interface from F# provides:
- `checkStability` - Stability analysis
- `simulate_tick` - Simulation step
- `findCExBifurcates/Cycles/Fixpoint` - Counter-examples
- `checkLTLSimulation/Polarity` - LTL analysis

We'll create C# wrapper services that adapt this interface.

---

## Implementation Checklist

### Part A: Create Service Interfaces

Create stub interfaces in `src/BmaLinuxApi/Services/`:

`IAnalysisService.cs`:
```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IAnalysisService
{
    Task<AnalysisResult> AnalyzeAsync(Model model, CancellationToken ct = default);
}
```

`ISimulationService.cs`:
```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface ISimulationService
{
    Task<SimulationResult> SimulateTickAsync(Model model, VariableValue[] variables, CancellationToken ct = default);
}
```

`IFurtherTestingService.cs`:
```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IFurtherTestingService
{
    Task<FurtherTestingResult> FindCounterExamplesAsync(Model model, AnalysisResult analysis, CancellationToken ct = default);
}
```

`ILtlService.cs`:
```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface ILtlService
{
    Task<LtlSimulationResult> CheckSimulationAsync(LtlSimulationInput input, CancellationToken ct = default);
    Task<LtlPolarityResult> CheckPolarityAsync(LtlPolarityInput input, CancellationToken ct = default);
}
```

`IScheduler.cs`:
```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IScheduler
{
    Guid ScheduleJob(Guid appId, Func<CancellationToken, Task<object?>> work);
    JobInfo? GetJobStatus(Guid appId, Guid jobId);
    object? GetJobResult(Guid appId, Guid jobId);
    bool DeleteJob(Guid appId, Guid jobId);
}
```

- [x] Create IAnalysisService.cs
- [x] Create ISimulationService.cs
- [x] Create IFurtherTestingService.cs
- [x] Create ILtlService.cs
- [x] Create IScheduler.cs

### Part B: Create Placeholder Implementations

Create placeholder implementations that throw NotImplementedException:

`PlaceholderServices.cs`:
```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

// Placeholder implementations - to be replaced in Phase 4-7

public class PlaceholderAnalysisService : IAnalysisService
{
    public Task<AnalysisResult> AnalyzeAsync(Model model, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T016");
}

public class PlaceholderSimulationService : ISimulationService
{
    public Task<SimulationResult> SimulateTickAsync(Model model, VariableValue[] variables, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T023");
}

public class PlaceholderFurtherTestingService : IFurtherTestingService
{
    public Task<FurtherTestingResult> FindCounterExamplesAsync(Model model, AnalysisResult analysis, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T020");
}

public class PlaceholderLtlService : ILtlService
{
    public Task<LtlSimulationResult> CheckSimulationAsync(LtlSimulationInput input, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T026");

    public Task<LtlPolarityResult> CheckPolarityAsync(LtlPolarityInput input, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T026");
}

public class PlaceholderScheduler : IScheduler
{
    public Guid ScheduleJob(Guid appId, Func<CancellationToken, Task<object?>> work)
        => throw new NotImplementedException("Implement in T038");

    public JobInfo? GetJobStatus(Guid appId, Guid jobId)
        => throw new NotImplementedException("Implement in T038");

    public object? GetJobResult(Guid appId, Guid jobId)
        => throw new NotImplementedException("Implement in T038");

    public bool DeleteJob(Guid appId, Guid jobId)
        => throw new NotImplementedException("Implement in T038");
}
```

- [x] Create PlaceholderServices.cs

### Part C: Configure DI in Program.cs

Update `src/BmaLinuxApi/Program.cs`:

```csharp
using BmaLinuxApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Register services
// Note: F# IAnalyzer registration will be added when implementing actual services
builder.Services.AddScoped<IAnalysisService, PlaceholderAnalysisService>();
builder.Services.AddScoped<ISimulationService, PlaceholderSimulationService>();
builder.Services.AddScoped<IFurtherTestingService, PlaceholderFurtherTestingService>();
builder.Services.AddScoped<ILtlService, PlaceholderLtlService>();
builder.Services.AddSingleton<IScheduler, PlaceholderScheduler>();

var app = builder.Build();

app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

app.Run();
```

- [x] Update Program.cs with service registration

### Part D: Verify Build

```bash
cd src/BmaLinuxApi
dotnet build
```

> **No local SDK?** Use Docker: `./scripts/dotnet-docker.sh build src/BmaLinuxApi`
> See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details.

- [x] Build succeeds
- [x] No namespace conflicts

---

## Acceptance Criteria

- [x] All service interfaces created in src/BmaLinuxApi/Services/
- [x] Placeholder implementations throw NotImplementedException with task references
- [x] Services registered in Program.cs DI container
- [x] `dotnet build` succeeds
- [x] Application still runs and health endpoint works

---

## Troubleshooting

### Namespace Conflicts
- Use explicit namespaces if Model type conflicts
- `using BmaModel = BmaLinuxApi.Models.Model;`

### Missing References
- Ensure Models namespace is imported in Services

### Build Errors
- Check all using statements
- Verify file locations match namespace declarations

---

## Completion Notes

**Completed:** 2026-02-02
**Actual Effort:** ~15 minutes
**Notes:**
- Created all 5 service interfaces (IAnalysisService, ISimulationService, IFurtherTestingService, ILtlService, IScheduler)
- Added JobInfo record and JobState enum to IScheduler.cs for job status tracking
- Created PlaceholderServices.cs with all placeholder implementations that throw NotImplementedException with task references
- Configured DI in Program.cs with Scoped lifetime for service wrappers and Singleton for scheduler
- Build verified via Docker (scripts/dotnet-docker.sh) - 0 warnings, 0 errors

---

**Created:** 2026-01-29
**Updated:** 2026-01-29
