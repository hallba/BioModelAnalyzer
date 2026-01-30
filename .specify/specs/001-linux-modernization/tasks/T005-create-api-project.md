# Task T005: Create BmaLinuxApi Project

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 45m
**Dependencies:** T004 (console app verified)
**Phase:** Phase 1 - Setup

---

## Context Setup Prompt

Use this prompt to start a fresh Claude Code session for this task:

```
I'm working on Task T005: Create BmaLinuxApi Project for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T005-create-api-project.md (this task file)
- .specify/specs/001-linux-modernization/plan.md (project structure)
- BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj (to reference)
- BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj (to reference)

## Problem Statement

We need a new ASP.NET Core 8 web API project that will wrap the F# analysis engine and expose it via REST endpoints.

## Goal

Create a new `src/BmaLinuxApi/` project that:
- References BioCheckAnalyzerMulti and BioCheckAnaylzerCommonMulti
- Uses ASP.NET Core Minimal APIs
- Builds successfully

## What's Already Done

- [x] T001-T004: BmaLinux upgraded to .NET 8 and verified working
- [x] Plan defines project structure

## Your Tasks

1. Create src/BmaLinuxApi/ directory structure
2. Create BmaLinuxApi.csproj with proper references
3. Create minimal Program.cs with basic setup
4. Create appsettings.json with default configuration
5. Verify the project builds and references F# engine

## Important Notes

- Use ASP.NET Core Minimal APIs (not Controllers)
- Reference the F# projects via relative paths
- Do NOT implement any endpoints yet - just basic project setup
- Ensure cross-platform compatibility
```

---

## Background

### Why This Task?

We need a web layer to expose the F# analysis engine as a REST API. ASP.NET Core 8 with Minimal APIs provides:
- Lightweight syntax
- Built-in dependency injection
- Kestrel web server (cross-platform)
- OpenAPI/Swagger support

### Technical Context

Project structure from plan.md:
```
src/BmaLinuxApi/
├── BmaLinuxApi.csproj
├── Program.cs
├── appsettings.json
├── Services/           (created in later tasks)
├── Endpoints/          (created in later tasks)
├── Models/             (created in later tasks)
└── wwwroot/            (for frontend)
```

---

## Implementation Checklist

### Part A: Create Directory Structure

```bash
mkdir -p src/BmaLinuxApi
mkdir -p src/BmaLinuxApi/Services
mkdir -p src/BmaLinuxApi/Endpoints
mkdir -p src/BmaLinuxApi/Models
mkdir -p src/BmaLinuxApi/wwwroot
```

- [ ] Create src/BmaLinuxApi/ directory
- [ ] Create subdirectories for Services, Endpoints, Models, wwwroot

### Part B: Create Project File

Create `src/BmaLinuxApi/BmaLinuxApi.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\BmaLinux\BioCheckAnalyzerMulti\BioCheckAnalyzerMulti.fsproj" />
    <ProjectReference Include="..\..\BmaLinux\BioCheckAnaylzerCommonMulti\BioCheckAnaylzerCommonMulti.csproj" />
  </ItemGroup>

</Project>
```

- [ ] Create BmaLinuxApi.csproj with correct SDK
- [ ] Add project references to F# analyzer

### Part C: Create Program.cs

Create `src/BmaLinuxApi/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
// (Services will be added in Phase 2)

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseStaticFiles();

// Placeholder endpoint to verify API is running
app.MapGet("/api/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

app.Run();
```

- [ ] Create Program.cs with minimal setup
- [ ] Add placeholder health endpoint

### Part D: Create Configuration

Create `src/BmaLinuxApi/appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:8080"
      }
    }
  },
  "Analysis": {
    "TimeoutSeconds": 120,
    "MaxConcurrentJobs": 4
  }
}
```

- [ ] Create appsettings.json
- [ ] Configure Kestrel for port 8080

### Part E: Verify Build

```bash
cd src/BmaLinuxApi
dotnet restore
dotnet build
```

- [ ] Project restores without errors
- [ ] Project builds without errors
- [ ] F# analyzer is referenced correctly

### Part F: Test Run

```bash
cd src/BmaLinuxApi
dotnet run
# In another terminal:
curl http://localhost:8080/api/health
```

- [ ] Application starts
- [ ] Health endpoint responds

---

## Acceptance Criteria

- [ ] `src/BmaLinuxApi/` directory exists with proper structure
- [ ] Project references BioCheckAnalyzerMulti and BioCheckAnaylzerCommonMulti
- [ ] `dotnet build` succeeds
- [ ] `dotnet run` starts the application on port 8080
- [ ] `/api/health` endpoint responds with JSON

---

## Troubleshooting

### Project Reference Not Found
- Check relative paths in project references
- Ensure BmaLinux projects were built first
- Use `dotnet restore` at solution level

### Port Already in Use
- Change port in appsettings.json
- Or kill existing process using the port

### F# Project Build Errors
- Ensure BmaLinux projects target net8.0
- Run `dotnet build` in BmaLinux first

---

## Completion Notes

> Fill this in when task is complete

**Completed:** [DATE]
**Actual Effort:** [actual time spent]
**Notes:** [Any learnings, issues encountered, or deviations from plan]

---

**Created:** 2026-01-29
**Updated:** 2026-01-29
