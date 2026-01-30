# Task T006: Create DTO Models

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 1.5h
**Dependencies:** T005 (API project created)
**Phase:** Phase 2 - Foundational

---

## Context Setup Prompt

Use this prompt to start a fresh Claude Code session for this task:

```
I'm working on Task T006: Create DTO Models for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T006-create-dto-models.md (this task file)
- .specify/specs/001-linux-modernization/contracts/api-spec.yaml (OpenAPI spec)
- src/BmaLinuxApi/BmaLinuxApi.csproj (project file)

## Problem Statement

We need C# record types that match the API contract in api-spec.yaml for request/response serialization.

## Goal

Create all DTO models in src/BmaLinuxApi/Models/ matching the OpenAPI schema exactly.

## What's Already Done

- [x] T005: BmaLinuxApi project created
- [x] OpenAPI 3.1 spec exists at .specify/specs/001-linux-modernization/contracts/api-spec.yaml

## Your Tasks

1. Read the OpenAPI spec to understand all schema types
2. Create C# record types for each schema
3. Ensure property names match JSON exactly (PascalCase as in spec)
4. Add necessary JSON attributes if needed

## Important Notes

- Use C# records for immutability
- Property names in spec use PascalCase (e.g., "Name", "Variables")
- Use nullable types where the spec indicates optional properties
- Create one file per logical grouping (ModelModels.cs, AnalysisModels.cs, etc.)
```

---

## Background

### Why This Task?

DTOs (Data Transfer Objects) define the shape of API requests and responses. They must match the OpenAPI contract exactly for client compatibility.

### Technical Context

The api-spec.yaml defines these schemas:
- Model, Variable, Relationship, VariableValue (core types)
- SimulationInput, SimulationResult
- AnalysisInput, AnalysisResult, Tick
- FurtherTestingInput, FurtherTestingResult, CounterExample
- LtlSimulationInput, LtlSimulationResult
- LtlPolarityInput, LtlPolarityResult
- JobExecutingStatus

---

## Implementation Checklist

### Part A: Create Core Model Types

Create `src/BmaLinuxApi/Models/CoreModels.cs`:

```csharp
namespace BmaLinuxApi.Models;

public record Variable(
    int Id,
    string Name,
    int RangeFrom,
    int RangeTo,
    string Formula
);

public record Relationship(
    int Id,
    string? Name,
    int FromVariable,
    int ToVariable,
    string Type
);

public record Model(
    string Name,
    Variable[] Variables,
    Relationship[] Relationships
);

public record VariableValue(
    int Id,
    int Value
);
```

- [ ] Create CoreModels.cs with Model, Variable, Relationship, VariableValue

### Part B: Create Simulation Types

Create `src/BmaLinuxApi/Models/SimulationModels.cs`:

```csharp
namespace BmaLinuxApi.Models;

public record SimulationInput(
    Model Model,
    VariableValue[] Variables
);

public record SimulationResult(
    VariableValue[]? Variables,
    string[]? ErrorMessages,
    string[]? DebugMessages
);
```

- [ ] Create SimulationModels.cs

### Part C: Create Analysis Types

Create `src/BmaLinuxApi/Models/AnalysisModels.cs`:

```csharp
namespace BmaLinuxApi.Models;

public record AnalysisInput(
    Model Model
);

public record TickVariable(
    int Id,
    int Lo,
    int Hi
);

public record Tick(
    int Time,
    TickVariable[]? Variables
);

public record AnalysisResult(
    string? Status,  // "Stabilizing" or "NotStabilizing"
    int Time,
    Tick[]? Ticks,
    string? Error,
    string[]? ErrorMessages,
    string[]? DebugMessages
);
```

- [ ] Create AnalysisModels.cs

### Part D: Create Further Testing Types

Create `src/BmaLinuxApi/Models/FurtherTestingModels.cs`:

```csharp
namespace BmaLinuxApi.Models;

public record FurtherTestingInput(
    Model Model,
    AnalysisResult Analysis
);

public record CounterExampleVariable(
    int Id,
    int Value,
    int? Fix1,
    int? Fix2
);

public record CounterExample(
    string Status,  // "Bifurcation", "Cycle", "Fixpoint"
    CounterExampleVariable[]? Variables
);

public record FurtherTestingResult(
    CounterExample[]? CounterExamples,
    string? Error,
    string[]? ErrorMessages,
    string[]? DebugMessages
);
```

- [ ] Create FurtherTestingModels.cs

### Part E: Create LTL Types

Create `src/BmaLinuxApi/Models/LtlModels.cs`:

```csharp
namespace BmaLinuxApi.Models;

public record LtlSimulationInput(
    string Name,
    Variable[] Variables,
    Relationship[] Relationships,
    string Formula,
    int Number_of_steps,
    bool? EnableLogging
);

public record LtlSimulationResult(
    int Status,  // 0=not found, 1=found, 2=no result
    int? Loop,
    Tick[]? Ticks,
    string? Error,
    string[]? ErrorMessages,
    string[]? DebugMessages
);

public record LtlPolarityInput(
    string Name,
    Variable[] Variables,
    Relationship[] Relationships,
    string Formula,
    int Number_of_steps,
    bool? EnableLogging,
    int? Polarity  // 0 or 1
);

public record LtlPolarityResult(
    LtlSimulationResult? Item1,
    LtlSimulationResult? Item2
);
```

- [ ] Create LtlModels.cs

### Part F: Create Job Status Types

Create `src/BmaLinuxApi/Models/JobModels.cs`:

```csharp
namespace BmaLinuxApi.Models;

public record JobExecutingStatus(
    long Elapsed,
    DateTime Started
);

public enum JobState
{
    Queued,
    Executing,
    Completed,
    Failed
}

public record JobInfo(
    Guid JobId,
    Guid AppId,
    JobState State,
    DateTime CreatedAt,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    string? ErrorMessage,
    object? Result
);
```

- [ ] Create JobModels.cs

### Part G: Verify Build

```bash
cd src/BmaLinuxApi
dotnet build
```

- [ ] All models compile without errors
- [ ] No naming conflicts with F# types

---

## Acceptance Criteria

- [ ] All schema types from api-spec.yaml have corresponding C# records
- [ ] Property names match spec exactly (PascalCase)
- [ ] Nullable types used for optional properties
- [ ] `dotnet build` succeeds
- [ ] Models are in src/BmaLinuxApi/Models/

---

## Troubleshooting

### Property Name Mismatch
- API spec uses PascalCase (e.g., "Name" not "name")
- System.Text.Json will handle this by default

### Type Conflicts with F# Types
- Use fully qualified names if needed
- Or create alias: `using BmaModel = BmaLinuxApi.Models.Model;`

### Circular Reference Warning
- Records with circular references need special handling
- Use nullable types to break cycles

---

## Completion Notes

> Fill this in when task is complete

**Completed:** [DATE]
**Actual Effort:** [actual time spent]
**Notes:** [Any learnings, issues encountered, or deviations from plan]

---

**Created:** 2026-01-29
**Updated:** 2026-01-29
