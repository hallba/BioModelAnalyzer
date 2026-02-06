# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BioModelAnalyzer (BMA) is a bioinformatics tool that allows biologists to build and analyze complex biological behavior models using formal verification techniques. It uses the SMT solver Z3 for analysis.

**Tech Stack:**
- Backend: F# (analysis engines) and C# (API/services) targeting .NET Framework 4.7.2
- Frontend: TypeScript/HTML5 with jQuery, Monaco Editor
- Key libraries: FParsec (parsing), Microsoft.Z3 (SMT solver), ASP.NET Web API

## Build Commands

### BmaLinuxApi (Linux Modernization) — USE THIS

**The .NET SDK is not installed on the host.** All builds for `src/BmaLinuxApi/` must be done inside the Docker container:

```bash
# Build and verify compilation (from repo root)
docker build -f src/BmaLinuxApi/Dockerfile -t bma-linux-api .

# Run the container
docker run --rm -p 8020:8020 bma-linux-api
```

The Dockerfile (`src/BmaLinuxApi/Dockerfile`) uses a multi-stage build with `mcr.microsoft.com/dotnet/sdk:8.0` and produces a self-contained linux-x64 binary. Always use `docker build` to verify code compiles.

### Legacy Windows (bmaclient)

All PowerShell scripts require PowerShell 5.0+:

```powershell
# First-time setup (downloads Paket, installs dependencies)
.\PrepareRepository.ps1

# Build bmaclient solution (Release configuration, auto-detects x86/x64)
.\build.ps1

# Run locally via OWIN self-hosting at http://localhost:8224/
.\run.ps1

# Complete workflow: prep → build → run
.\BuildAndRun.ps1

# Clean build artifacts
.\Clean.ps1

# Deploy to Azure App Service
.\DeployAzure.ps1 <name>
```

For Linux/Mac, use `PrepareRepositoryNix.sh` for initial setup.

## Testing

### Running Tests in Visual Studio
1. Install extensions: NUnit Test Adapter 2.0.0 (NOT v3), Chutzpah Test Adapter
2. Open `/sln/bmaclient/bmaclient.sln`
3. For x64: Set `Test > Test Settings > Default Processor Architecture` to x64
4. Run tests from Test Explorer

### Test Projects (in bmaclient solution)
- **BackEndTests**: F# tests for simulation/analysis corner cases (direct method calls + self-hosted API requests)
- **BmaJobsTests**: Tests using request/response JSON files from `/src/BmaTests.Common/` subdirectories (Analysis, Simulation, CounterExamples, LTLQueries)
- **bma.package**: Jasmine unit tests for frontend TypeScript code (in `test/` folder)
- **WebApiTests**: Deployment tests against running ApiServer (requires URL configuration in WebApiTests.fs)
- **CodedUITests**: Protractor-based end-to-end tests

## Architecture

### Solutions (`/sln`)
- **bmaclient** (PRIMARY): Contains `bma.client` (HTML5 UI) and `ApiServer` (REST API)
- **BioCheckConsole**: CLI tool for analysis algorithms
- **Athene**: Hybrid physical/executable simulator
- **bmaclient-lra**: Azure Cloud Service for long-running LTL polarity checks
- **fs-scheduler**: Azure Storage-based task scheduler for fair resource sharing

### Key Source Components (`/src`)
- **BioCheckAnalyzer**: F# analysis engine (stability analysis, LTL verification)
- **BackendFunctions**: F# computation backend
- **BMAWebApi**: Core API logic with Unity DI configuration
- **ApiServer**: REST API endpoints (documented in `/docs/ApiServer.yaml`)
- **bma.client**: Web UI application

### API Endpoints (base path: `/api`)
- `POST /Simulate` - Simulate one step of model evolution
- `POST /Analyze` - Perform stability proof analysis
- `POST /FurtherTesting` - Find counter-examples (bifurcation, cycle, fixpoint)
- `POST /AnalyzeLTLSimulation` - LTL formula simulation
- `POST /AnalyzeLTLPolarity` - LTL formula analysis

### Configuration
- Unity DI configs in ApiServer: `unity.web.config` (local), `unity.azure-appservice.config` (Azure), `unity.trace-loggers.config` (TraceSource)
- Frontend backend URL: Set `BackEndUrl` in `bma.client/Web.config`
- Logging: Activity logs via `/api/activitylog`, failure logs capture request/response pairs

### Port Configuration
**Central Port Registry:** Always check `~/.dev-ports.json` before configuring ports to avoid conflicts.

| Service | Port | Notes |
|---------|------|-------|
| BmaLinuxApi (Linux) | 8020 | Registered in central registry |
| OWIN self-host (Windows) | 8224 | Legacy Windows development |

```bash
# Check for port conflicts before starting
cat ~/.dev-ports.json | jq '.projects.BioModelAnalyzer'
```

### Platform Architecture
The x86/x64 platform must be consistent across build configuration, IIS Express settings, and Azure App Service settings. Mismatches cause `BadImageFormatException`. For IIS Express: `Tools > Options > Projects and Solutions > Web Projects` controls 64-bit option.

## Dependencies

Managed via Paket (`paket.dependencies`, `paket.lock`) and NPM:
- Run `PrepareRepository.ps1` to install all dependencies
- Per-project dependencies in `paket.references` files
- External sources in `/ext`: FParsec, CUDD (BDD library)

## Version Management

Application version is in `/src/bma.client/version.txt` (JSON format: major, minor, build). Update this before releases.

## Spec-Kit Development Workflow

This project uses [spec-kit](https://github.com/github/spec-kit) for specification-driven development. All specifications are in `.specify/`.

### Structure
```
.specify/
├── memory/constitution.md           # Project principles and constraints
├── specs/001-linux-modernization/   # Current feature specs
│   ├── spec.md                      # User stories and requirements
│   ├── plan.md                      # Technical architecture
│   ├── tasks.md                     # Implementation tasks
│   ├── research.md                  # Technology decisions
│   ├── quickstart.md                # Setup guide
│   └── contracts/api-spec.yaml      # OpenAPI 3.1 specification
└── templates/                       # Templates for new features
```

### Enhanced Spec-Kit Commands (USE THESE)

**Always use the local enhanced commands instead of base spec-kit:**

| Instead of | Use | Why |
|------------|-----|-----|
| `/speckit.tasks` | `/local.tasks` | Creates individual task files with context window scoping |
| `/speckit.implement` | `/local.implement` | Stops at 95% context, no autocompact, controlled session handoff |

### Working on Features
1. Read the constitution: `.specify/memory/constitution.md`
2. Review the spec: `.specify/specs/001-linux-modernization/spec.md`
3. Follow the plan: `.specify/specs/001-linux-modernization/plan.md`
4. Implement tasks: `.specify/specs/001-linux-modernization/tasks.md`
5. Validate against: `.specify/specs/001-linux-modernization/contracts/api-spec.yaml`

### Current Initiative: Linux Modernization
Goal: Port BMA to run as a self-contained application on Linux VMs.
- Upgrade `BmaLinux/` from .NET Core 3.1 to .NET 8
- Create new ASP.NET Core API (`src/BmaLinuxApi/`)
- Replace Windows-specific dependencies (COM Excel → ClosedXML)
- Self-contained single-file deployment
