# Technical Plan: Linux Modernization

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Linux Host / Docker                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌──────────────────────────────────────┐   │
│  │  Static Files   │    │         ASP.NET Core 8 API           │   │
│  │  (wwwroot/)     │    │                                      │   │
│  │  - HTML         │    │  ┌────────────┐  ┌────────────────┐  │   │
│  │  - JavaScript   │◄───┤  │ Endpoints  │  │   Services     │  │   │
│  │  - CSS          │    │  │            │  │                │  │   │
│  │  - Assets       │    │  │ /Simulate  │  │ AnalysisService│  │   │
│  └─────────────────┘    │  │ /Analyze   │  │ SimulationSvc  │  │   │
│                         │  │ /Further.. │  │ LtlService     │  │   │
│                         │  │ /LTL...    │  │ SchedulerSvc   │  │   │
│                         │  │ /lra/...   │  │                │  │   │
│                         │  └─────┬──────┘  └───────┬────────┘  │   │
│                         │        │                 │            │   │
│                         │        └────────┬────────┘            │   │
│                         │                 │                     │   │
│                         │        ┌────────▼────────┐            │   │
│                         │        │    IAnalyzer    │            │   │
│                         │        │   (F# Engine)   │            │   │
│                         │        └────────┬────────┘            │   │
│                         │                 │                     │   │
│                         │        ┌────────▼────────┐            │   │
│                         │        │  Microsoft.Z3   │            │   │
│                         │        │  (SMT Solver)   │            │   │
│                         │        └─────────────────┘            │   │
│                         └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Runtime | .NET 8 LTS | Long-term support, excellent cross-platform, self-contained publish |
| Web Framework | ASP.NET Core Minimal APIs | Lightweight, modern patterns, built-in DI |
| Analysis Engine | F# with Microsoft.Z3 | Existing proven implementation in BmaLinux |
| Frontend | TypeScript/HTML5 | Existing, already cross-platform |
| Excel Export | ClosedXML | MIT license, no native dependencies, full .xlsx support |
| JSON | System.Text.Json | Built-in, faster than Newtonsoft, source generators |
| Logging | Microsoft.Extensions.Logging | Built-in, configurable sinks |

## Component Design

### 1. BmaLinuxApi (New ASP.NET Core Project)

**Project File:** `src/BmaLinuxApi/BmaLinuxApi.csproj`
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <PublishSingleFile>true</PublishSingleFile>
    <SelfContained>true</SelfContained>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\..\BmaLinux\BioCheckAnalyzerMulti\BioCheckAnalyzerMulti.fsproj" />
    <ProjectReference Include="..\..\BmaLinux\BioCheckAnaylzerCommonMulti\BioCheckAnaylzerCommonMulti.csproj" />
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="ClosedXML" Version="0.102.*" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.*" />
  </ItemGroup>
</Project>
```

**Entry Point:** `src/BmaLinuxApi/Program.cs`
```csharp
var builder = WebApplication.CreateBuilder(args);

// Register F# analyzer as singleton (thread-safe)
builder.Services.AddSingleton<IAnalyzer, Analyzer>();
builder.Services.AddSingleton<IScheduler, InMemoryScheduler>();
builder.Services.AddScoped<IAnalysisService, AnalysisService>();
builder.Services.AddScoped<ISimulationService, SimulationService>();
builder.Services.AddScoped<ILtlService, LtlService>();
builder.Services.AddScoped<IExportService, ExcelExportService>();

var app = builder.Build();

app.UseStaticFiles();
app.MapAnalyzeEndpoints();
app.MapSimulateEndpoints();
app.MapFurtherTestingEndpoints();
app.MapLtlEndpoints();
app.MapLraEndpoints();
app.MapFallbackToFile("index.html");

app.Run();
```

### 2. Service Layer

**IAnalysisService** - Wraps `IAnalyzer.checkStability()`
```csharp
public interface IAnalysisService
{
    Task<AnalysisResult> AnalyzeAsync(Model model, CancellationToken ct);
}
```

**ISimulationService** - Wraps `IAnalyzer.simulate_tick()`
```csharp
public interface ISimulationService
{
    Task<SimulationResult> SimulateTickAsync(Model model, SimulationVariable[] state, CancellationToken ct);
}
```

**ILtlService** - Wraps LTL analysis methods
```csharp
public interface ILtlService
{
    Task<LtlSimulationResult> CheckSimulationAsync(Model model, string formula, int steps, CancellationToken ct);
    Task<LtlPolarityResult> CheckPolarityAsync(Model model, string formula, int steps, bool? polarity, CancellationToken ct);
}
```

**IScheduler** - In-memory job scheduling (replaces Azure)
```csharp
public interface IScheduler
{
    Guid AddJob(Guid appId, Func<CancellationToken, Task<object>> work);
    JobStatus GetStatus(Guid appId, Guid jobId);
    object? GetResult(Guid appId, Guid jobId);
    bool DeleteJob(Guid appId, Guid jobId);
}
```

### 3. Endpoint Layer

Each endpoint maps directly to the existing API contract:

| Endpoint | Method | Handler |
|----------|--------|---------|
| `/api/Simulate` | POST | `SimulateEndpoint.Handle` |
| `/api/Analyze` | POST | `AnalyzeEndpoint.Handle` |
| `/api/FurtherTesting` | POST | `FurtherTestingEndpoint.Handle` |
| `/api/AnalyzeLTLSimulation` | POST | `LtlEndpoints.HandleSimulation` |
| `/api/AnalyzeLTLPolarity` | POST | `LtlEndpoints.HandlePolarity` |
| `/api/lra/{appId}` | POST/GET/DELETE | `LraEndpoints.Handle*` |

### 4. Model/DTO Layer

DTOs match the existing API contract exactly. Use records for immutability:

```csharp
public record AnalysisInput(Model Model);
public record AnalysisOutput(string Status, int Time, Tick[]? Ticks, string[]? ErrorMessages);
public record Model(string Name, Variable[] Variables, Relationship[] Relationships);
// ... etc, matching ApiServer.yaml
```

## Migration Strategy

### Phase 1: Upgrade BmaLinux to .NET 8

**Files to modify:**
- `BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj`
- `BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj`
- `BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj`
- `BmaLinux/Z3testMulti/Z3testMulti.fsproj`

**Changes:**
```xml
<!-- Before -->
<TargetFramework>netcoreapp3.1</TargetFramework>

<!-- After -->
<TargetFramework>net8.0</TargetFramework>
```

**Package updates:**
- FSharp.Core: 5.0.0 → 8.0.0
- Remove Microsoft.Office.Interop.Excel reference

### Phase 2: Create ASP.NET Core API

New project structure:
```
src/BmaLinuxApi/
├── BmaLinuxApi.csproj
├── Program.cs
├── appsettings.json
├── Services/
│   ├── AnalysisService.cs
│   ├── SimulationService.cs
│   ├── LtlService.cs
│   ├── ExcelExportService.cs
│   └── InMemoryScheduler.cs
├── Endpoints/
│   ├── AnalyzeEndpoint.cs
│   ├── SimulateEndpoint.cs
│   ├── FurtherTestingEndpoint.cs
│   ├── LtlEndpoints.cs
│   └── LraEndpoints.cs
├── Models/
│   ├── AnalysisModels.cs
│   ├── SimulationModels.cs
│   └── LtlModels.cs
└── wwwroot/
    └── (frontend files)
```

### Phase 3: Replace Windows-Specific Code

**Excel Export:**
Replace `BmaLinux/BioCheckAnalyzerMulti/ModelToExcel.fs`:

```fsharp
// Before (COM interop)
let app = new Application()
let workbook = app.Workbooks.Add()

// After (ClosedXML)
let workbook = new XLWorkbook()
let worksheet = workbook.Worksheets.Add("Simulation")
```

### Phase 4: Integrate Frontend

1. Build frontend: `cd src/bma.package && npm install && grunt`
2. Copy to wwwroot: `cp -r src/bma.client/* src/BmaLinuxApi/wwwroot/`
3. Configure static file serving in Program.cs

### Phase 5: Self-Contained Publish

```bash
dotnet publish src/BmaLinuxApi -c Release -r linux-x64 \
  --self-contained true \
  -p:PublishSingleFile=true
```

## Configuration

**appsettings.json:**
```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": { "Url": "http://0.0.0.0:8020" }
    }
  },
  "Analysis": {
    "TimeoutSeconds": 120,
    "MaxConcurrentJobs": 4
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

## Testing Strategy

1. **Unit Tests** - Service layer with mocked IAnalyzer
2. **Integration Tests** - Full API endpoint testing
3. **Contract Tests** - Validate against OpenAPI spec
4. **Regression Tests** - Compare outputs with Windows version using `src/BmaTests.Common/` models

## Deployment Options

### Option A: Single Executable
```bash
./BmaLinuxApi
# Runs on http://localhost:8020
```

### Option B: Docker
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY publish/ .
EXPOSE 8020
ENTRYPOINT ["./BmaLinuxApi"]
```

### Option C: systemd Service
```ini
[Service]
ExecStart=/opt/bma/BmaLinuxApi
WorkingDirectory=/opt/bma
Environment=ASPNETCORE_URLS=http://0.0.0.0:8020
Restart=always
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Z3 native library issues | Microsoft.Z3 NuGet includes Linux binaries; test early |
| F# interop complexity | Use existing IAnalyzer interface, proven in BmaLinux |
| API compatibility breaks | Contract tests against OpenAPI spec |
| Performance regression | Benchmark key operations, compare with Windows |
