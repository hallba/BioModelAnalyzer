# Task T030: Create IExportService Interface

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 15m
**Dependencies:** T029
**Phase:** Phase 8 - US6 (Export to Excel)

---

## Context Setup Prompt

```
I'm working on Task T030: Create IExportService Interface.

Read: .specify/specs/001-linux-modernization/tasks/T030-create-export-service.md
      src/BmaLinuxApi/Services/
      src/BmaLinuxApi/Models/CoreModels.cs
      src/BmaLinuxApi/Models/SimulationModels.cs

## Goal

Create the IExportService interface for Excel export using ClosedXML
(added in T029). Follows the same service interface pattern as
IAnalysisService, ISimulationService, etc.
```

---

## Implementation

Create `src/BmaLinuxApi/Services/IExportService.cs`:

```csharp
namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IExportService
{
    byte[] ExportToExcel(Model model, SimulationResult[] results);
}
```

- [ ] Create interface

---

**Created:** 2026-01-29
