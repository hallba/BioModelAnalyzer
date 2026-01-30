# Task T030: Create IExportService Interface

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 15m
**Dependencies:** T029
**Phase:** Phase 8 - US6 (Export to Excel)

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
