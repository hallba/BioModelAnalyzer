# Task T032: Create Export Endpoint

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 20m
**Dependencies:** T031
**Phase:** Phase 8 - US6 (Export to Excel)

---

## Implementation

Create `src/BmaLinuxApi/Endpoints/ExportEndpoint.cs`:

```csharp
namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class ExportEndpoint
{
    public static void MapExportEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Export", (
            ExportRequest request,
            IExportService exportService) =>
        {
            var bytes = exportService.ExportToExcel(request.Model, request.Results);
            return Results.File(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "export.xlsx"
            );
        });
    }
}

public record ExportRequest(Model Model, SimulationResult[] Results);
```

- [ ] Create endpoint
- [ ] Returns .xlsx file
- [ ] Register in Program.cs

---

**Created:** 2026-01-29
