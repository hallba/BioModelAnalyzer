# Implementation Tasks: Linux Modernization

## Task Overview

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: .NET 8 Upgrade | 5 tasks | Pending |
| Phase 2: ASP.NET Core API | 8 tasks | Pending |
| Phase 3: Windows Code Removal | 3 tasks | Pending |
| Phase 4: Frontend Integration | 3 tasks | Pending |
| Phase 5: Deployment | 4 tasks | Pending |

---

## Phase 1: Upgrade BmaLinux to .NET 8

### Task 1.1: Update Project Target Frameworks
**User Story:** US-001 (Run BMA on Linux Server)
**Priority:** High
**Dependencies:** None

**Description:**
Update all BmaLinux project files from `netcoreapp3.1` to `net8.0`.

**Files to modify:**
- [ ] `BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj`
- [ ] `BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj`
- [ ] `BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj`
- [ ] `BmaLinux/Z3testMulti/Z3testMulti.fsproj`

**Acceptance Criteria:**
- [ ] All projects target `net8.0`
- [ ] `dotnet build BmaLinux/BioCheckConsoleMulti.sln` succeeds

---

### Task 1.2: Update NuGet Package Versions
**User Story:** US-001
**Priority:** High
**Dependencies:** Task 1.1

**Description:**
Update package references to .NET 8 compatible versions.

**Changes:**
- [ ] FSharp.Core: 5.0.0 → 8.0.100
- [ ] Verify FParsec 1.1.1 compatibility (should work)
- [ ] Verify Microsoft.Z3 4.11.2+ compatibility (should work)
- [ ] Remove Microsoft.Office.Interop.Excel reference

**Acceptance Criteria:**
- [ ] No package restore warnings
- [ ] All packages resolve correctly

---

### Task 1.3: Fix Compilation Errors
**User Story:** US-001
**Priority:** High
**Dependencies:** Task 1.2

**Description:**
Address any compilation errors from framework upgrade.

**Potential issues:**
- [ ] Obsolete API warnings
- [ ] Nullable reference type issues
- [ ] F# language version changes

**Acceptance Criteria:**
- [ ] Clean build with no errors
- [ ] Warnings reviewed and addressed

---

### Task 1.4: Run Existing Tests
**User Story:** US-001
**Priority:** High
**Dependencies:** Task 1.3

**Description:**
Verify existing functionality still works after upgrade.

**Tests to run:**
- [ ] `BmaLinux/BioCheckConsoleMulti/UnitTests.fs`
- [ ] Manual test: `./BioCheckConsoleMulti -model ToyModelUnstable.json -engine SCM`
- [ ] Manual test: `./BioCheckConsoleMulti -model ToyModelStable.json -engine VMCAI`

**Acceptance Criteria:**
- [ ] All unit tests pass
- [ ] CLI produces expected output

---

### Task 1.5: Verify Linux Build
**User Story:** US-001
**Priority:** High
**Dependencies:** Task 1.4

**Description:**
Confirm the upgraded project builds and runs on Linux.

**Steps:**
- [ ] Build on Linux: `dotnet build -r linux-x64`
- [ ] Run on Linux VM or container
- [ ] Verify Z3 native libraries load correctly

**Acceptance Criteria:**
- [ ] Builds without errors on Linux
- [ ] Executable runs without missing library errors

---

## Phase 2: Create ASP.NET Core API

### Task 2.1: Create BmaLinuxApi Project
**User Story:** US-001
**Priority:** High
**Dependencies:** Phase 1 complete

**Description:**
Create new ASP.NET Core project with proper structure.

**Create:**
- [ ] `src/BmaLinuxApi/BmaLinuxApi.csproj`
- [ ] `src/BmaLinuxApi/Program.cs` (minimal API setup)
- [ ] `src/BmaLinuxApi/appsettings.json`
- [ ] Project references to BioCheckAnalyzerMulti and BioCheckAnaylzerCommonMulti

**Acceptance Criteria:**
- [ ] Project builds successfully
- [ ] Can start and listen on port 8080

---

### Task 2.2: Implement DTO Models
**User Story:** US-002, US-003, US-004, US-005
**Priority:** High
**Dependencies:** Task 2.1

**Description:**
Create C# record types matching the API contract in `docs/ApiServer.yaml`.

**Create:**
- [ ] `src/BmaLinuxApi/Models/ModelDefinition.cs`
- [ ] `src/BmaLinuxApi/Models/AnalysisModels.cs`
- [ ] `src/BmaLinuxApi/Models/SimulationModels.cs`
- [ ] `src/BmaLinuxApi/Models/LtlModels.cs`
- [ ] `src/BmaLinuxApi/Models/FurtherTestingModels.cs`
- [ ] `src/BmaLinuxApi/Models/LraModels.cs`

**Acceptance Criteria:**
- [ ] All DTOs match OpenAPI schema exactly
- [ ] JSON serialization produces correct format

---

### Task 2.3: Implement Analysis Service
**User Story:** US-002
**Priority:** High
**Dependencies:** Task 2.2

**Description:**
Create service that wraps `IAnalyzer.checkStability()`.

**Create:**
- [ ] `src/BmaLinuxApi/Services/IAnalysisService.cs`
- [ ] `src/BmaLinuxApi/Services/AnalysisService.cs`

**Features:**
- [ ] Timeout handling (2 minutes)
- [ ] Cancellation token support
- [ ] Error handling and logging

**Acceptance Criteria:**
- [ ] Returns correct AnalysisResult for stable model
- [ ] Returns correct AnalysisResult for unstable model
- [ ] Times out after 2 minutes

---

### Task 2.4: Implement Simulation Service
**User Story:** US-004
**Priority:** High
**Dependencies:** Task 2.2

**Description:**
Create service that wraps `IAnalyzer.simulate_tick()`.

**Create:**
- [ ] `src/BmaLinuxApi/Services/ISimulationService.cs`
- [ ] `src/BmaLinuxApi/Services/SimulationService.cs`

**Acceptance Criteria:**
- [ ] Returns next state given current state
- [ ] Handles invalid inputs gracefully

---

### Task 2.5: Implement Further Testing Service
**User Story:** US-003
**Priority:** High
**Dependencies:** Task 2.3

**Description:**
Create service for counter-example finding.

**Create:**
- [ ] `src/BmaLinuxApi/Services/IFurtherTestingService.cs`
- [ ] `src/BmaLinuxApi/Services/FurtherTestingService.cs`

**Methods:**
- [ ] `FindBifurcations()`
- [ ] `FindCycles()`
- [ ] `FindFixpoints()`

**Acceptance Criteria:**
- [ ] Returns bifurcation counter-examples
- [ ] Returns cycle counter-examples
- [ ] Returns fixpoint counter-examples

---

### Task 2.6: Implement LTL Service
**User Story:** US-005
**Priority:** High
**Dependencies:** Task 2.2

**Description:**
Create service for LTL analysis.

**Create:**
- [ ] `src/BmaLinuxApi/Services/ILtlService.cs`
- [ ] `src/BmaLinuxApi/Services/LtlService.cs`

**Methods:**
- [ ] `CheckSimulationAsync()` - wraps `checkLTLSimulation`
- [ ] `CheckPolarityAsync()` - wraps `checkLTLPolarity`

**Acceptance Criteria:**
- [ ] LTL simulation analysis returns correct results
- [ ] Polarity analysis returns correct results

---

### Task 2.7: Implement In-Memory Scheduler
**User Story:** US-008
**Priority:** Medium
**Dependencies:** Task 2.1

**Description:**
Create scheduler for long-running jobs (replaces Azure FairShareScheduler).

**Create:**
- [ ] `src/BmaLinuxApi/Services/IScheduler.cs`
- [ ] `src/BmaLinuxApi/Services/InMemoryScheduler.cs`

**Features:**
- [ ] Add job (returns job ID)
- [ ] Get job status
- [ ] Get job result
- [ ] Delete/cancel job
- [ ] Configurable max concurrent jobs

**Acceptance Criteria:**
- [ ] Jobs execute asynchronously
- [ ] Status correctly reflects queued/executing/completed/failed
- [ ] Cancellation stops in-progress jobs

---

### Task 2.8: Implement API Endpoints
**User Story:** US-002, US-003, US-004, US-005, US-008
**Priority:** High
**Dependencies:** Tasks 2.3-2.7

**Description:**
Create minimal API endpoints matching the contract.

**Create:**
- [ ] `src/BmaLinuxApi/Endpoints/AnalyzeEndpoint.cs`
- [ ] `src/BmaLinuxApi/Endpoints/SimulateEndpoint.cs`
- [ ] `src/BmaLinuxApi/Endpoints/FurtherTestingEndpoint.cs`
- [ ] `src/BmaLinuxApi/Endpoints/LtlEndpoints.cs`
- [ ] `src/BmaLinuxApi/Endpoints/LraEndpoints.cs`

**Acceptance Criteria:**
- [ ] All endpoints match `docs/ApiServer.yaml` contract
- [ ] Correct HTTP status codes (200, 204 for timeout, etc.)
- [ ] JSON request/response format matches spec

---

## Phase 3: Remove Windows-Specific Code

### Task 3.1: Replace Excel Export
**User Story:** US-006
**Priority:** Medium
**Dependencies:** Phase 2 complete

**Description:**
Replace COM-based Excel export with ClosedXML.

**Files to modify:**
- [ ] `BmaLinux/BioCheckAnalyzerMulti/ModelToExcel.fs`

**Or create new:**
- [ ] `src/BmaLinuxApi/Services/IExportService.cs`
- [ ] `src/BmaLinuxApi/Services/ExcelExportService.cs`

**Acceptance Criteria:**
- [ ] Produces valid .xlsx files
- [ ] File structure matches original export
- [ ] Works on Linux without Office installed

---

### Task 3.2: Add Export Endpoint
**User Story:** US-006
**Priority:** Medium
**Dependencies:** Task 3.1

**Description:**
Add endpoint for Excel export if needed by frontend.

**Create:**
- [ ] `src/BmaLinuxApi/Endpoints/ExportEndpoint.cs`

**Acceptance Criteria:**
- [ ] Returns .xlsx file with correct MIME type
- [ ] Frontend can trigger download

---

### Task 3.3: Verify No Windows Dependencies
**User Story:** US-001
**Priority:** High
**Dependencies:** Tasks 3.1-3.2

**Description:**
Audit all code for remaining Windows-specific dependencies.

**Check for:**
- [ ] No `System.Windows.*` references
- [ ] No COM interop
- [ ] No registry access
- [ ] No Windows paths (backslashes, drive letters)

**Acceptance Criteria:**
- [ ] Clean build on Linux
- [ ] No runtime errors on Linux

---

## Phase 4: Frontend Integration

### Task 4.1: Build Frontend
**User Story:** US-007
**Priority:** High
**Dependencies:** Phase 2 complete

**Description:**
Build the TypeScript frontend for deployment.

**Steps:**
- [ ] `cd src/bma.package && npm install`
- [ ] `npm run build` or `grunt`
- [ ] Verify output in `src/bma.client/`

**Acceptance Criteria:**
- [ ] Frontend builds without errors
- [ ] All JavaScript files generated

---

### Task 4.2: Copy Frontend to wwwroot
**User Story:** US-007
**Priority:** High
**Dependencies:** Task 4.1

**Description:**
Copy built frontend files to ASP.NET Core static files directory.

**Steps:**
- [ ] Create `src/BmaLinuxApi/wwwroot/`
- [ ] Copy frontend assets
- [ ] Configure `UseStaticFiles()` in Program.cs
- [ ] Add fallback routing for SPA

**Acceptance Criteria:**
- [ ] Frontend loads at `http://localhost:8080/`
- [ ] All assets (JS, CSS, images) load correctly

---

### Task 4.3: Test Frontend Integration
**User Story:** US-007
**Priority:** High
**Dependencies:** Task 4.2

**Description:**
Verify all frontend functionality works with new backend.

**Test scenarios:**
- [ ] Create new model
- [ ] Run stability analysis
- [ ] Run simulation
- [ ] View counter-examples
- [ ] Export to Excel
- [ ] Save/load models (local storage)

**Acceptance Criteria:**
- [ ] All UI features work correctly
- [ ] No JavaScript console errors
- [ ] Performance acceptable

---

## Phase 5: Deployment Packaging

### Task 5.1: Create Self-Contained Publish
**User Story:** US-001
**Priority:** High
**Dependencies:** Phase 4 complete

**Description:**
Configure and test self-contained single-file publish.

**Steps:**
- [ ] Add publish properties to .csproj
- [ ] Test: `dotnet publish -c Release -r linux-x64 --self-contained`
- [ ] Verify single executable produced

**Acceptance Criteria:**
- [ ] Single executable under 200MB
- [ ] Runs on fresh Linux VM without .NET SDK

---

### Task 5.2: Create Dockerfile
**User Story:** US-001
**Priority:** Medium
**Dependencies:** Task 5.1

**Description:**
Create Docker container for easy deployment.

**Create:**
- [ ] `src/BmaLinuxApi/Dockerfile`
- [ ] `.dockerignore`

**Acceptance Criteria:**
- [ ] `docker build` succeeds
- [ ] `docker run` starts application correctly
- [ ] Container size reasonable (<500MB)

---

### Task 5.3: Create systemd Service Unit
**User Story:** US-001
**Priority:** Low
**Dependencies:** Task 5.1

**Description:**
Create systemd service for Linux deployments.

**Create:**
- [ ] `deployment/bma.service`
- [ ] Installation instructions in README

**Acceptance Criteria:**
- [ ] Service starts on boot
- [ ] Service restarts on failure
- [ ] Logs to journald

---

### Task 5.4: Write Deployment Documentation
**User Story:** US-001
**Priority:** Medium
**Dependencies:** Tasks 5.1-5.3

**Description:**
Document deployment procedures.

**Create/Update:**
- [ ] `BmaLinux/README.md` - Quick start guide
- [ ] `docs/LinuxDeployment.md` - Detailed deployment guide

**Content:**
- [ ] Prerequisites
- [ ] Installation steps
- [ ] Configuration options
- [ ] Troubleshooting

**Acceptance Criteria:**
- [ ] Fresh user can deploy following docs
- [ ] All configuration options documented

---

## Validation Tasks

### Task V.1: API Contract Tests
**Dependencies:** Phase 2 complete

**Description:**
Verify all endpoints match OpenAPI specification.

- [ ] Install contract testing tool (e.g., Schemathesis)
- [ ] Run against `docs/ApiServer.yaml`
- [ ] Fix any contract violations

---

### Task V.2: Regression Tests
**Dependencies:** Phase 4 complete

**Description:**
Compare outputs with Windows version.

- [ ] Run all test models from `src/BmaTests.Common/`
- [ ] Compare analysis results
- [ ] Compare simulation results
- [ ] Compare LTL results

---

### Task V.3: End-to-End Tests
**Dependencies:** Phase 4 complete

**Description:**
Full workflow testing on Linux.

- [ ] Deploy to fresh Ubuntu 22.04 VM
- [ ] Load test model via frontend
- [ ] Run all analysis types
- [ ] Export results
- [ ] Verify correctness
