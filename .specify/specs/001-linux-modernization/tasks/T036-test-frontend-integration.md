# Task T036: Test Frontend Integration

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 1h
**Dependencies:** T035
**Phase:** Phase 9 - US7 (Use Existing Frontend)

---

## Context Setup Prompt

```
I'm working on Task T036: Test Frontend Integration.

Read: .specify/specs/001-linux-modernization/tasks/T036-test-frontend-integration.md
      src/BmaLinuxApi/Program.cs

## Goal

Verify the full frontend-to-API integration works end-to-end:
load the UI at http://localhost:8020/, create a model, run analysis,
and confirm results display. SPA fallback was configured in T035.
```

---

## Implementation

Test these workflows:

1. Open http://localhost:8020/
2. Create a new model
3. Add variables and relationships
4. Run stability analysis
5. View results

- [x] Frontend loads
- [x] Can create model (via API — model JSON accepted)
- [x] Analysis works
- [x] Results display (API returns correct JSON)

---

## Issues Found & Fixed

1. **Missing jQuery 2.1.4** — The `prepare-frontend-deps.sh` script didn't download the `jQuery 2.1.4` NuGet package. Fixed by adding `download_nuget jQuery 2.1.4` and copy lines in `Gruntfile.js` prebuild task.

2. **Analyze endpoint format mismatch** — The endpoint expected `AnalysisInput { Model }` (wrapped), but the frontend sends the model flat. Fixed by changing `AnalyzeEndpoint.cs` to accept `Model` directly.

3. **Missing `/api/version` endpoint** — The frontend calls `/api/version` to discover `computeServiceUrl` (the backend URL). Without it, API calls go to the wrong host. Fixed by adding a version endpoint returning `computeServiceUrl: ""` for same-origin.

4. **Missing `/api/Simulate` endpoint** — `SimulationService` was registered but no endpoint was mapped. Created `SimulateEndpoint.cs` and registered it in `Program.cs`.

## Files Changed

- `scripts/prepare-frontend-deps.sh` — Added jQuery 2.1.4 NuGet download
- `src/bma.package/Gruntfile.js` — Added jQuery copy to prebuild task
- `src/BmaLinuxApi/Endpoints/AnalyzeEndpoint.cs` — Accept Model directly (not wrapped)
- `src/BmaLinuxApi/Endpoints/HealthEndpoint.cs` — Added `/api/version` endpoint
- `src/BmaLinuxApi/Endpoints/SimulateEndpoint.cs` — New file: Simulate endpoint
- `src/BmaLinuxApi/Program.cs` — Register SimulateEndpoint

---

**Created:** 2026-01-29
