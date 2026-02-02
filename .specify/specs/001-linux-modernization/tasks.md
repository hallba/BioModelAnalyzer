# Tasks: Linux Modernization

**Input**: Design documents from `.specify/specs/001-linux-modernization/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md, contracts/api-spec.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **F# Engine**: `BmaLinux/BioCheckAnalyzerMulti/`, `BmaLinux/BioCheckAnaylzerCommonMulti/`
- **New API**: `src/BmaLinuxApi/`
- **Frontend**: `src/bma.client/`, `src/bma.package/`
- **Contracts**: `.specify/specs/001-linux-modernization/contracts/api-spec.yaml`

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Upgrade existing BmaLinux projects to .NET 8 and create new API project structure

- [x] [T001](./tasks/T001-upgrade-target-frameworks.md) Update all BmaLinux project target frameworks from netcoreapp3.1 to net8.0
- [x] [T002](./tasks/T002-update-nuget-packages.md) Update NuGet package versions for .NET 8 compatibility
- [x] [T003](./tasks/T003-fix-compilation-errors.md) Fix any compilation errors from framework upgrade in BmaLinux/
- [x] [T004](./tasks/T004-verify-console-app.md) Verify BioCheckConsoleMulti builds and runs on Linux with .NET 8
- [x] [T005](./tasks/T005-create-api-project.md) Create new BmaLinuxApi ASP.NET Core 8 project in src/BmaLinuxApi/

**Checkpoint**: BmaLinux upgraded to .NET 8, new API project created and building

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Establish shared services and models needed by ALL user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] [T006](./tasks/T006-create-dto-models.md) Create DTO models matching api-spec.yaml in src/BmaLinuxApi/Models/
- [x] [T007](./tasks/T007-configure-di-services.md) Configure dependency injection and IAnalyzer registration in src/BmaLinuxApi/Program.cs
- [ ] [T008](./tasks/T008-configure-json-serialization.md) Configure System.Text.Json serialization with correct naming policies
- [ ] [T009](./tasks/T009-add-error-handling.md) Add global error handling and logging middleware
- [ ] [T010](./tasks/T010-configure-cors-static.md) Configure CORS and static file serving for frontend

**Checkpoint**: Foundation ready - all services registered, models created, basic infrastructure in place

---

## Phase 3: User Story 1 - Run BMA on Linux (Priority: P1) - MVP

**Goal**: Deploy BMA as a self-contained executable on Linux without .NET SDK

**Independent Test**: `./BmaLinuxApi` starts and responds to `/api/health` on Linux

### Implementation

- [ ] [T011](./tasks/T011-add-health-endpoint.md) [US1] Add health check endpoint GET /api/health in src/BmaLinuxApi/Endpoints/HealthEndpoint.cs
- [ ] [T012](./tasks/T012-configure-kestrel.md) [US1] Configure Kestrel to listen on port 8080 in src/BmaLinuxApi/appsettings.json
- [ ] [T013](./tasks/T013-configure-self-contained.md) [US1] Configure self-contained single-file publish in src/BmaLinuxApi/BmaLinuxApi.csproj
- [ ] [T014](./tasks/T014-verify-linux-build.md) [US1] Verify self-contained build runs on fresh Linux without .NET SDK

**Checkpoint**: Minimal API running on Linux, health endpoint responding

---

## Phase 4: User Story 2 - Analyze Biological Models (Priority: P2)

**Goal**: POST /api/Analyze returns stability analysis results matching Windows version

**Independent Test**: `curl -X POST http://localhost:8080/api/Analyze -d @test-model.json` returns valid AnalysisResult

### Implementation

- [ ] [T015](./tasks/T015-create-analysis-service.md) [US2] Create IAnalysisService interface in src/BmaLinuxApi/Services/IAnalysisService.cs
- [ ] [T016](./tasks/T016-implement-analysis-service.md) [US2] Implement AnalysisService wrapping IAnalyzer.checkStability() in src/BmaLinuxApi/Services/AnalysisService.cs
- [ ] [T017](./tasks/T017-create-analyze-endpoint.md) [US2] Create POST /api/Analyze endpoint in src/BmaLinuxApi/Endpoints/AnalyzeEndpoint.cs
- [ ] [T018](./tasks/T018-add-timeout-handling.md) [US2] Add 2-minute timeout handling returning 204 for Analyze endpoint

**Checkpoint**: Analysis endpoint working, returns correct results for stable/unstable models

---

## Phase 5: User Story 3 - Find Counter-Examples (Priority: P3)

**Goal**: POST /api/FurtherTesting returns counter-examples (bifurcation, cycle, fixpoint)

**Independent Test**: Submit unstable model analysis to /api/FurtherTesting, get counter-examples

### Implementation

- [ ] [T019](./tasks/T019-create-further-testing-service.md) [US3] Create IFurtherTestingService interface in src/BmaLinuxApi/Services/IFurtherTestingService.cs
- [ ] [T020](./tasks/T020-implement-further-testing-service.md) [US3] Implement FurtherTestingService in src/BmaLinuxApi/Services/FurtherTestingService.cs
- [ ] [T021](./tasks/T021-create-further-testing-endpoint.md) [US3] Create POST /api/FurtherTesting endpoint in src/BmaLinuxApi/Endpoints/FurtherTestingEndpoint.cs

**Checkpoint**: FurtherTesting endpoint working, returns bifurcation/cycle/fixpoint counter-examples

---

## Phase 6: User Story 4 - Run Simulations (Priority: P4)

**Goal**: POST /api/Simulate returns next state given current state

**Independent Test**: `curl -X POST http://localhost:8080/api/Simulate -d @simulation-input.json` returns next state

### Implementation

- [ ] [T022](./tasks/T022-create-simulation-service.md) [US4] Create ISimulationService interface in src/BmaLinuxApi/Services/ISimulationService.cs
- [ ] [T023](./tasks/T023-implement-simulation-service.md) [US4] Implement SimulationService wrapping IAnalyzer.simulate_tick() in src/BmaLinuxApi/Services/SimulationService.cs
- [ ] [T024](./tasks/T024-create-simulate-endpoint.md) [US4] Create POST /api/Simulate endpoint in src/BmaLinuxApi/Endpoints/SimulateEndpoint.cs

**Checkpoint**: Simulation endpoint working, returns correct next state

---

## Phase 7: User Story 5 - LTL Formula Checking (Priority: P5)

**Goal**: LTL analysis endpoints work for simulation and polarity checking

**Independent Test**: Submit LTL formula to /api/AnalyzeLTLSimulation, get satisfying trace

### Implementation

- [ ] [T025](./tasks/T025-create-ltl-service.md) [US5] Create ILtlService interface in src/BmaLinuxApi/Services/ILtlService.cs
- [ ] [T026](./tasks/T026-implement-ltl-service.md) [US5] Implement LtlService wrapping checkLTLSimulation/checkLTLPolarity in src/BmaLinuxApi/Services/LtlService.cs
- [ ] [T027](./tasks/T027-create-ltl-simulation-endpoint.md) [US5] Create POST /api/AnalyzeLTLSimulation endpoint in src/BmaLinuxApi/Endpoints/LtlEndpoints.cs
- [ ] [T028](./tasks/T028-create-ltl-polarity-endpoint.md) [US5] Create POST /api/AnalyzeLTLPolarity endpoint in src/BmaLinuxApi/Endpoints/LtlEndpoints.cs

**Checkpoint**: Both LTL endpoints working correctly

---

## Phase 8: User Story 6 - Export to Excel (Priority: P6)

**Goal**: Export simulation results to .xlsx files using ClosedXML (no Office required)

**Independent Test**: Generate .xlsx file, open in LibreOffice/Excel, verify contents

### Implementation

- [ ] [T029](./tasks/T029-add-closedxml-package.md) [P] [US6] Add ClosedXML NuGet package to src/BmaLinuxApi/BmaLinuxApi.csproj
- [ ] [T030](./tasks/T030-create-export-service.md) [US6] Create IExportService interface in src/BmaLinuxApi/Services/IExportService.cs
- [ ] [T031](./tasks/T031-implement-excel-export.md) [US6] Implement ExcelExportService using ClosedXML in src/BmaLinuxApi/Services/ExcelExportService.cs
- [ ] [T032](./tasks/T032-create-export-endpoint.md) [US6] Create export endpoint returning .xlsx file in src/BmaLinuxApi/Endpoints/ExportEndpoint.cs

**Checkpoint**: Excel export produces valid .xlsx files on Linux

---

## Phase 9: User Story 7 - Use Existing Frontend (Priority: P7)

**Goal**: Serve the existing TypeScript/HTML5 frontend unchanged

**Independent Test**: Open http://localhost:8080/ in browser, full UI works

### Implementation

- [ ] [T033](./tasks/T033-build-frontend.md) [US7] Build frontend with npm/grunt in src/bma.package/
- [ ] [T034](./tasks/T034-copy-frontend-wwwroot.md) [US7] Copy built frontend to src/BmaLinuxApi/wwwroot/
- [ ] [T035](./tasks/T035-configure-spa-fallback.md) [US7] Configure SPA fallback routing in src/BmaLinuxApi/Program.cs
- [ ] [T036](./tasks/T036-test-frontend-integration.md) [US7] Test all frontend workflows (create model, analyze, simulate, view results)

**Checkpoint**: Full UI working with new backend, no visible differences from Windows

---

## Phase 10: User Story 8 - Long-Running Analysis Jobs (Priority: P8)

**Goal**: Schedule, monitor, and retrieve results for long-running LTL analysis

**Independent Test**: POST job to /api/lra/{appId}, poll status, get result

### Implementation

- [ ] [T037](./tasks/T037-create-scheduler-interface.md) [US8] Create IScheduler interface in src/BmaLinuxApi/Services/IScheduler.cs
- [ ] [T038](./tasks/T038-implement-memory-scheduler.md) [US8] Implement InMemoryScheduler in src/BmaLinuxApi/Services/InMemoryScheduler.cs
- [ ] [T039](./tasks/T039-create-lra-post-endpoint.md) [US8] Create POST /api/lra/{appId} endpoint in src/BmaLinuxApi/Endpoints/LraEndpoints.cs
- [ ] [T040](./tasks/T040-create-lra-get-endpoint.md) [US8] Create GET /api/lra/{appId} endpoint for status in src/BmaLinuxApi/Endpoints/LraEndpoints.cs
- [ ] [T041](./tasks/T041-create-lra-delete-endpoint.md) [US8] Create DELETE /api/lra/{appId} endpoint in src/BmaLinuxApi/Endpoints/LraEndpoints.cs
- [ ] [T042](./tasks/T042-create-lra-result-endpoint.md) [US8] Create GET /api/lra/{appId}/result endpoint in src/BmaLinuxApi/Endpoints/LraEndpoints.cs

**Checkpoint**: Long-running job workflow complete - schedule, poll, retrieve results

---

## Phase 11: Polish & Deployment

**Purpose**: Finalize deployment artifacts and documentation

- [ ] [T043](./tasks/T043-create-dockerfile.md) [P] Create Dockerfile in src/BmaLinuxApi/Dockerfile
- [ ] [T044](./tasks/T044-create-systemd-service.md) [P] Create systemd service unit in deployment/bma.service
- [ ] [T045](./tasks/T045-write-deployment-docs.md) Write deployment documentation in docs/LinuxDeployment.md
- [ ] [T046](./tasks/T046-run-regression-tests.md) Run regression tests comparing with Windows version using src/BmaTests.Common/
- [ ] [T047](./tasks/T047-validate-api-contract.md) Validate all endpoints against api-spec.yaml contract

**Checkpoint**: Deployment-ready with documentation and validated against contract

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────────────────────────────────────────────┐
                                                                   │
Phase 2 (Foundational) ◄──────────────────────────────────────────┘
       │
       ├──► Phase 3 (US1: Linux Deploy) ──► MVP CHECKPOINT
       │
       ├──► Phase 4 (US2: Analyze) ◄───────────────────────────────┐
       │                                                            │
       ├──► Phase 5 (US3: Counter-Examples) ◄──────────────────────┤ Can run in
       │                                                            │ parallel after
       ├──► Phase 6 (US4: Simulate) ◄──────────────────────────────┤ Foundational
       │                                                            │
       ├──► Phase 7 (US5: LTL) ◄───────────────────────────────────┤
       │                                                            │
       ├──► Phase 8 (US6: Excel Export) ◄──────────────────────────┤
       │                                                            │
       └──► Phase 9 (US7: Frontend) ◄──────────────────────────────┘
                    │
                    └──► Phase 10 (US8: Long-Running) ◄─── Needs endpoints working
                              │
                              └──► Phase 11 (Polish) ◄─── Final phase
```

### Parallel Opportunities per Phase

**Phase 1 (Setup)**:
- T001, T002 can run sequentially (dependency)
- T003, T004 depend on T001-T002
- T005 can start after T004

**Phase 2 (Foundational)**:
- T006, T007, T008, T009, T010 can largely run in parallel (different files)

**Phase 4-7 (Core Endpoints)**:
- All 4 user stories can run in parallel after Phase 2
- Within each story: Interface → Service → Endpoint (sequential)

**Phase 8 (Export)** and **Phase 9 (Frontend)**:
- Can run in parallel with each other

**Phase 10 (LRA)**:
- T037, T038 (scheduler) sequential
- T039-T042 (endpoints) can run in parallel after scheduler

**Phase 11 (Polish)**:
- T043, T044 can run in parallel
- T045-T047 sequential (need working system)

---

## Implementation Strategy

### MVP First (Phases 1-3)

1. Complete Phase 1: Setup (.NET 8 upgrade, new project)
2. Complete Phase 2: Foundational (models, DI, middleware)
3. Complete Phase 3: US1 (health endpoint, self-contained build)
4. **STOP and VALIDATE**: Application runs on Linux
5. Deploy/demo minimal working system

### Incremental API Delivery (Phases 4-7)

1. Add Analyze endpoint (US2) → Test → Demo
2. Add FurtherTesting endpoint (US3) → Test → Demo
3. Add Simulate endpoint (US4) → Test → Demo
4. Add LTL endpoints (US5) → Test → Demo

### Full Feature Delivery (Phases 8-11)

1. Add Excel export (US6)
2. Integrate Frontend (US7) → Full UI testing
3. Add Long-running jobs (US8)
4. Polish: Docker, systemd, docs, validation

---

## Task File Locations

All individual task files are in: `.specify/specs/001-linux-modernization/tasks/`

| Task Range | Phase | Description |
|------------|-------|-------------|
| T001-T005 | Setup | .NET 8 upgrade and project creation |
| T006-T010 | Foundational | Core infrastructure |
| T011-T014 | US1 | Linux deployment |
| T015-T018 | US2 | Analysis endpoint |
| T019-T021 | US3 | Counter-examples endpoint |
| T022-T024 | US4 | Simulation endpoint |
| T025-T028 | US5 | LTL endpoints |
| T029-T032 | US6 | Excel export |
| T033-T036 | US7 | Frontend integration |
| T037-T042 | US8 | Long-running jobs |
| T043-T047 | Polish | Deployment artifacts |

---

## Notes

- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All endpoints must match api-spec.yaml contract exactly
- No tests included unless explicitly requested
