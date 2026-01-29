# Research: Linux Modernization

## Technology Research Findings

### 1. .NET 8 Cross-Platform Support

**Status:** Verified suitable

**Findings:**
- .NET 8 is LTS (Long Term Support) until November 2026
- Excellent Linux support with self-contained deployment
- Native AOT compilation available for smaller binaries (future optimization)
- Microsoft.Z3 NuGet package includes Linux native libraries

**References:**
- [.NET 8 Announcement](https://devblogs.microsoft.com/dotnet/announcing-dotnet-8/)
- [.NET Support Policy](https://dotnet.microsoft.com/platform/support/policy)

### 2. Microsoft.Z3 on Linux

**Status:** Verified working

**Findings:**
- NuGet package `Microsoft.Z3` version 4.11.2+ includes native binaries for:
  - Windows (x86, x64)
  - Linux (x64)
  - macOS (x64, arm64)
- Already working in `BmaLinux/` .NET Core 3.1 project
- No additional system dependencies required when using NuGet package

**Verification:**
```bash
# In BmaLinux directory on Linux
dotnet build
./BioCheckConsoleMulti -model ToyModelUnstable.json -engine SCM
# Works correctly
```

### 3. Excel Export Alternatives

**Status:** ClosedXML recommended

**Options Evaluated:**

| Library | License | Dependencies | .xlsx Support | Linux Support |
|---------|---------|--------------|---------------|---------------|
| ClosedXML | MIT | None (managed) | Full | Yes |
| EPPlus 7 | Polyform | None (managed) | Full | Yes |
| NPOI | Apache 2.0 | None (managed) | Full | Yes |
| OpenXML SDK | MIT | None (managed) | Low-level only | Yes |

**Recommendation:** ClosedXML
- MIT license (permissive)
- High-level API similar to COM interop
- Active maintenance
- No native dependencies

**Migration Example:**
```csharp
// Before (COM interop)
var app = new Microsoft.Office.Interop.Excel.Application();
var workbook = app.Workbooks.Add();
var sheet = workbook.Sheets[1];
sheet.Cells[1, 1] = "Value";
workbook.SaveAs("output.xlsx");
app.Quit();

// After (ClosedXML)
using var workbook = new XLWorkbook();
var sheet = workbook.AddWorksheet("Sheet1");
sheet.Cell(1, 1).Value = "Value";
workbook.SaveAs("output.xlsx");
```

### 4. ASP.NET Core Minimal APIs vs Controllers

**Status:** Minimal APIs recommended

**Comparison:**

| Aspect | Minimal APIs | Controllers |
|--------|--------------|-------------|
| Boilerplate | Less | More |
| Performance | Slightly faster | Standard |
| Testability | Good | Good |
| OpenAPI support | Built-in | Built-in |
| Migration effort | Lower | Higher |

**Recommendation:** Minimal APIs
- Cleaner migration from simple Web API controllers
- Better fit for API-only backend
- Modern pattern encouraged by Microsoft

### 5. In-Memory Job Scheduler

**Status:** Feasible for self-contained deployment

**Current Implementation:** Azure Storage-based FairShareScheduler
- Uses Azure Table Storage for job queue
- Uses Azure Blob Storage for results
- Requires Azure connection string

**Proposed Replacement:** In-memory scheduler using:
- `ConcurrentDictionary<Guid, JobInfo>` for job storage
- `Channel<JobInfo>` for work queue
- `SemaphoreSlim` for concurrency limiting
- `CancellationTokenSource` for job cancellation

**Limitations:**
- Jobs lost on application restart
- No persistence across restarts
- Limited by single-server memory

**Mitigation:**
- For most use cases, this is acceptable
- Could add optional SQLite persistence in future
- Document limitation in deployment guide

### 6. Frontend Serving

**Status:** UseStaticFiles middleware sufficient

**Configuration:**
```csharp
var app = builder.Build();

app.UseStaticFiles(); // Serves from wwwroot/

// SPA fallback for client-side routing
app.MapFallbackToFile("index.html");

app.Run();
```

**Build Process:**
1. Frontend uses Grunt build system
2. Output is static HTML/JS/CSS
3. Copy to `wwwroot/` directory
4. No server-side rendering needed

### 7. Container Deployment

**Status:** Straightforward

**Base Image Options:**

| Image | Size | Use Case |
|-------|------|----------|
| `mcr.microsoft.com/dotnet/aspnet:8.0` | ~220MB | Standard |
| `mcr.microsoft.com/dotnet/aspnet:8.0-alpine` | ~110MB | Smaller |
| `mcr.microsoft.com/dotnet/runtime-deps:8.0` | ~10MB | Self-contained only |

**Recommendation:** `aspnet:8.0-alpine` for good balance of size and compatibility

**Sample Dockerfile:**
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY publish/ .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["./BmaLinuxApi"]
```

## Open Questions

### Q1: Should we support ARM64 Linux?

**Context:** Some cloud providers offer ARM64 instances at lower cost.

**Decision needed:** Add `linux-arm64` as publish target?

**Impact:** Minor - just add runtime identifier to publish command.

### Q2: Should job results persist across restarts?

**Context:** Current Azure implementation persists results in blob storage.

**Options:**
1. Accept loss on restart (simpler)
2. Add optional SQLite persistence
3. Add optional Redis support

**Recommendation:** Start with option 1, add persistence later if needed.

### Q3: Authentication requirements?

**Context:** Current deployment has no authentication.

**Options:**
1. Keep as-is (no auth)
2. Add optional API key
3. Add optional OAuth/OIDC

**Recommendation:** Keep as-is for initial release. Add auth as separate feature if needed.

## Risks Identified

### Risk 1: F# Version Compatibility

**Risk:** F# 8.0 may have breaking changes from F# 5.0 used in BmaLinux.

**Likelihood:** Low - F# maintains backward compatibility.

**Mitigation:**
- Test thoroughly after upgrade
- Review F# 8.0 release notes for breaking changes

### Risk 2: Z3 Version Differences

**Risk:** Different Z3 behavior between Windows and Linux.

**Likelihood:** Very Low - Z3 is deterministic.

**Mitigation:**
- Run regression tests comparing outputs
- Keep same Z3 version as Windows deployment

### Risk 3: Frontend API Assumptions

**Risk:** Frontend may have hardcoded assumptions about Windows backend.

**Likelihood:** Low - API is well-defined.

**Mitigation:**
- Review frontend code for platform-specific assumptions
- Test all UI workflows end-to-end
