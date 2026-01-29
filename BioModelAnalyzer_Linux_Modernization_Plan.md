# BioModelAnalyzer Linux Modernization Plan

## Executive Summary

This document outlines a plan to modernize the BioModelAnalyzer (BMA) application to run natively on a self-contained Linux VM. The approach leverages existing work in the `BmaLinux/` directory (a .NET Core 3.1 port of the F# analysis engine) and creates a new cross-platform web API using ASP.NET Core 8.

**Key insight:** The core F# analysis engine has already been ported to .NET Core. The main effort is creating a new ASP.NET Core web layer and replacing Windows-specific dependencies.

---

## Current State

### What We Have

| Component | Location | Status |
|-----------|----------|--------|
| F# Analysis Engine | `BmaLinux/BioCheckAnalyzerMulti/` | Already ported to .NET Core 3.1 |
| Console CLI | `BmaLinux/BioCheckConsoleMulti/` | Working on Linux/Mac |
| TypeScript/HTML5 Frontend | `src/bma.client/`, `src/bma.package/` | Already cross-platform |
| Web API | `src/ApiServer/`, `src/BMAWebApi/` | .NET Framework 4.7.2 (Windows-only) |
| API Specification | `docs/ApiServer.yaml` | Swagger 2.0 contract |

### What Needs Migration

The current web API has Windows-only dependencies:
- **ASP.NET Web API 2** (System.Web) → Not available on Linux
- **IIS/IIS Express** hosting → Windows-only
- **Microsoft.Office.Interop.Excel** (COM) → Windows-only
- **WindowsAzure.Storage** scheduler → Cloud-dependent, outdated SDK

---

## Target Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────────┐
│  Static Frontend    │────▶│  ASP.NET Core 8 API  │────▶│  BioCheckAnalyzerMulti  │
│  (TypeScript/JS)    │     │  (Kestrel on Linux)  │     │  (F# .NET 8)            │
└─────────────────────┘     └──────────────────────┘     └─────────────────────────┘
                                       │
                            ┌──────────────────────┐
                            │  In-Memory Scheduler │
                            │  (self-contained)    │
                            └──────────────────────┘
```

---

## Technology Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Target Framework | **.NET 8 LTS** | Long-term support until Nov 2026, excellent Linux support |
| Web Framework | **ASP.NET Core Minimal APIs** | Modern, lightweight, less migration overhead |
| Dependency Injection | **Built-in DI** | Replaces Unity, no additional dependencies |
| JSON Serialization | **System.Text.Json** | Built-in, faster than Newtonsoft.Json |
| Excel Export | **ClosedXML** | Cross-platform replacement for COM interop |
| Job Scheduler | **In-memory** | Self-contained, replaces Azure Storage dependency |
| Hosting | **Kestrel** | Built into ASP.NET Core, cross-platform |

---

## Implementation Phases

### Phase 0: Specifications (1 week)

Using spec-kit methodology, create specifications before implementation:

1. **Update API Contract**
   - Convert `docs/ApiServer.yaml` from Swagger 2.0 to OpenAPI 3.1
   - Add response examples and error schemas

2. **Create Specification Files**
   ```
   specs/
     api-contracts/
       simulate.spec.yaml
       analyze.spec.yaml
       further-testing.spec.yaml
       ltl-analysis.spec.yaml
     interfaces/
       IAnalysisService.spec.md
       ISchedulerService.spec.md
   ```

3. **Extract Test Fixtures**
   - Document expected inputs/outputs for each endpoint
   - Use existing test data from `src/BmaTests.Common/`

---

### Phase 1: Upgrade BmaLinux to .NET 8 (1-2 weeks)

**Objective:** Upgrade the existing F# analysis engine from .NET Core 3.1 to .NET 8

**Files to Modify:**

| File | Change |
|------|--------|
| `BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj` | `netcoreapp3.1` → `net8.0` |
| `BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj` | `netcoreapp3.1` → `net8.0` |
| `BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj` | `netcoreapp3.1` → `net8.0` |
| `BmaLinux/Z3testMulti/Z3testMulti.fsproj` | `netcoreapp3.1` → `net8.0` |

**Tasks:**
1. Update `<TargetFramework>` in all project files
2. Update FSharp.Core to 8.0.x
3. Remove `Microsoft.Office.Interop.Excel` reference
4. Replace `ModelToExcel.fs` implementation with ClosedXML
5. Verify build: `dotnet build BioCheckConsoleMulti.sln`
6. Verify functionality: `./BioCheckConsoleMulti -model ToyModelUnstable.json -engine SCM`

**Validation:**
- All existing unit tests pass
- Console application produces identical results to Windows version

---

### Phase 2: Create ASP.NET Core API (2-3 weeks)

**Objective:** Create a new cross-platform web API that wraps the F# analysis engine

**New Project Structure:**
```
src/BmaLinuxApi/
  BmaLinuxApi.csproj
  Program.cs                      # Minimal API entry point
  appsettings.json               # Configuration
  Services/
    AnalysisService.cs           # Wraps IAnalyzer interface
    SimulationService.cs
    LtlAnalysisService.cs
    InMemoryScheduler.cs         # Replaces Azure FairShareScheduler
  Endpoints/
    SimulateEndpoint.cs          # POST /api/Simulate
    AnalyzeEndpoint.cs           # POST /api/Analyze
    FurtherTestingEndpoint.cs    # POST /api/FurtherTesting
    LtlEndpoints.cs              # POST /api/AnalyzeLTL*
    LraEndpoints.cs              # /api/lra/{appId}/*
  Models/
    (DTOs matching ApiServer.yaml)
  wwwroot/
    (Frontend static files)
```

**Core Interface to Wrap:**

The `IAnalyzer` interface in `BmaLinux/BioCheckAnaylzerCommonMulti/IAnalyzer.cs` provides:

| Method | Maps To |
|--------|---------|
| `checkStability(Model)` | `POST /api/Analyze` |
| `findCExBifurcates/Cycles/Fixpoint()` | `POST /api/FurtherTesting` |
| `checkLTLSimulation()` | `POST /api/AnalyzeLTLSimulation` |
| `checkLTLPolarity()` | `POST /api/AnalyzeLTLPolarity` |
| `simulate_tick()` | `POST /api/Simulate` |

**API Contract:** All endpoints must match `docs/ApiServer.yaml` exactly to maintain client compatibility.

---

### Phase 3: Integrate Frontend (1 week)

**Objective:** Serve the existing TypeScript/HTML5 frontend from the new API server

**Tasks:**
1. Build frontend:
   ```bash
   cd src/bma.package
   npm install
   grunt
   ```
2. Copy built output to `src/BmaLinuxApi/wwwroot/`
3. Configure static file serving in `Program.cs`:
   ```csharp
   app.UseStaticFiles();
   app.MapFallbackToFile("index.html");
   ```
4. Configure CORS if needed for development

**Validation:**
- Frontend loads at `http://localhost:8080/`
- All UI functionality works (model creation, analysis, simulation)

---

### Phase 4: Self-Contained Deployment (1 week)

**Objective:** Create a single executable that runs on any Linux VM without .NET SDK

**Publish Command:**
```bash
dotnet publish src/BmaLinuxApi -c Release -r linux-x64 \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:IncludeNativeLibrariesForSelfExtract=true
```

**Output:** Single `BmaLinuxApi` executable (~80-150MB) containing:
- .NET 8 runtime
- All dependencies (including Z3 native libraries)
- Frontend static files

**Optional Deployment Options:**

1. **Docker Container**
   ```dockerfile
   FROM mcr.microsoft.com/dotnet/aspnet:8.0
   WORKDIR /app
   COPY publish/ .
   EXPOSE 8080
   ENTRYPOINT ["./BmaLinuxApi"]
   ```

2. **systemd Service**
   ```ini
   [Unit]
   Description=BioModelAnalyzer API
   After=network.target

   [Service]
   ExecStart=/opt/bma/BmaLinuxApi
   WorkingDirectory=/opt/bma
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

---

## Dependency Changes

### To Remove
| Package | Reason |
|---------|--------|
| System.Web.* | Not available on .NET Core |
| Microsoft.Practices.Unity | Replaced by built-in DI |
| Microsoft.WindowsAzure.Storage | Replaced by in-memory scheduler |
| Microsoft.Office.Interop.Excel | COM interop is Windows-only |
| Microsoft.AspNet.WebApi.* | Replaced by ASP.NET Core |

### To Add
| Package | Purpose |
|---------|---------|
| ClosedXML | Cross-platform Excel export |
| Swashbuckle.AspNetCore | Optional: Swagger UI for API documentation |

### To Keep/Upgrade
| Package | Notes |
|---------|-------|
| Microsoft.Z3 | Already cross-platform via NuGet |
| FParsec | Already compatible |
| FSharp.Core | Upgrade to 8.0.x |
| Newtonsoft.Json | Keep for F# code compatibility (or migrate to System.Text.Json) |

---

## Critical Files Reference

| Purpose | Location |
|---------|----------|
| Analysis interface | `BmaLinux/BioCheckAnaylzerCommonMulti/IAnalyzer.cs` |
| F# analyzer implementation | `BmaLinux/BioCheckAnalyzerMulti/UIMain.fs` |
| API contract specification | `docs/ApiServer.yaml` |
| Current controller patterns | `src/BMAWebApi/Controllers/` |
| Scheduler interface | `src/FairShareScheduler/Scheduler.fsi` |
| Excel export (to replace) | `BmaLinux/BioCheckAnalyzerMulti/ModelToExcel.fs` |
| Test data | `src/BmaTests.Common/` |

---

## Verification Plan

### Phase 1 Verification
- [ ] `dotnet build BmaLinux/BioCheckConsoleMulti.sln` succeeds on Linux
- [ ] `./BioCheckConsoleMulti -model ToyModelUnstable.json -engine SCM` produces correct output
- [ ] All existing unit tests pass

### Phase 2 Verification
- [ ] All endpoints from `ApiServer.yaml` return correct responses
- [ ] Compare analysis results with Windows version using test models
- [ ] Timeout handling works correctly (2-minute limit per request)

### Phase 3 Verification
- [ ] Frontend loads and renders correctly
- [ ] Can create, save, and load models
- [ ] Analysis and simulation work end-to-end

### Phase 4 Verification
- [ ] Single executable runs on fresh Ubuntu/Debian VM without .NET SDK
- [ ] Application starts and serves requests
- [ ] Full workflow (create model → analyze → view results) works

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| F# .NET 8 incompatibility | Low | High | BmaLinux already works on .NET Core 3.1; .NET 8 is backward compatible |
| Z3 solver Linux issues | Low | High | Microsoft.Z3 NuGet explicitly supports Linux; proven in BmaLinux |
| API compatibility breaks | Medium | Medium | Use OpenAPI spec as contract; automated API testing |
| Excel export issues | Low | Low | ClosedXML is mature, actively maintained, MIT licensed |
| Performance regression | Low | Medium | Benchmark critical operations; compare with Windows baseline |

---

## Estimated Effort

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 0: Specifications | 1 week | None |
| Phase 1: .NET 8 Upgrade | 1-2 weeks | Phase 0 |
| Phase 2: ASP.NET Core API | 2-3 weeks | Phase 1 |
| Phase 3: Frontend Integration | 1 week | Phase 2 |
| Phase 4: Deployment | 1 week | Phase 3 |
| **Total** | **6-8 weeks** | |

---

## Next Steps

1. Review and approve this plan
2. Set up Linux development environment (Ubuntu 22.04+ recommended)
3. Install .NET 8 SDK
4. Begin Phase 0: Create specifications using spec-kit methodology
