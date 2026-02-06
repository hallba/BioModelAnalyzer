# Task T004a: Create Test Scripts for Console App Verification

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 30m
**Dependencies:** T003 (build succeeds)
**Phase:** Phase 1 - Setup

---

## Context Setup Prompt

Copy this prompt to start a fresh Claude Code session:

```
I'm working on Task T004a: Create Test Scripts for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T004a-create-test-scripts.md (this task)
- BmaLinux/BioCheckConsoleMulti/Main.fs (understand CLI arguments)
- BmaLinux/BioCheckConsoleMulti/ToyModelStable.json (example model format)

## Background

BioModelAnalyzer is a bioinformatics tool for analyzing biological models using the Z3 SMT solver. The console app (BioCheckConsoleMulti) was just upgraded from .NET Core 3.1 to .NET 8. We need test scripts to verify it works.

## Console App Usage

The console app supports multiple engines:
- `SCM` - Quick stability analysis (Shrink-Cut-Merge)
- `VMCAI` - Stability proofs with counter-examples
- `SIMULATE` - Run simulations
- `CAV` - LTL formula checking

Example commands:
```bash
dotnet run -- -model ToyModelStable.json -engine SCM
dotnet run -- -model ToyModelUnstable.json -engine VMCAI -prove output.json
dotnet run -- -model ToyModelStable.json -engine SIMULATE -simulate output.csv -simulate_time 10
```

## Available Test Models

In `BmaLinux/BioCheckConsoleMulti/`:
- ToyModelStable.json - Should report STABLE
- ToyModelUnstable.json - Should report UNSTABLE
- Skin1D.json - Larger model

In `BmaLinux/MultiTests/`:
- Various stability_analysis*.json models
- RA_*.json models (more complex)

## Your Task

Create a bash test script at `BmaLinux/test-console.sh` that:
1. Runs in Docker (mcr.microsoft.com/dotnet/sdk:8.0) since .NET SDK isn't on host
2. Tests multiple engines (SCM, VMCAI, SIMULATE)
3. Tests both stable and unstable models
4. Checks for expected output patterns
5. Reports pass/fail for each test
6. Has a summary at the end

## Important Notes

- Use Docker for all dotnet commands: `docker run --rm -v $(pwd):/src -w /src/BmaLinux mcr.microsoft.com/dotnet/sdk:8.0 ...`
- The Z3 native libraries should load automatically from NuGet
- SCM engine output includes "Single Stable Point" or "Multi Stable Points" or "Cycle"
- VMCAI creates output JSON files
- Keep tests simple and fast (use ToyModel* first)
```

---

## Background

### Why This Task?

Before proceeding with the API implementation, we need automated tests to verify the core analysis engine works correctly on Linux with .NET 8.

### Technical Context

The BioCheckConsoleMulti app:
- Reads JSON model files with "Model" and "Layout" sections
- Runs analysis using Z3 SMT solver
- Supports multiple analysis engines
- Outputs results to stdout or files

---

## Implementation Checklist

### Part A: Create Basic Test Script

Create `BmaLinux/test-console.sh`:

- [x]Add shebang and description
- [x]Define Docker run helper function
- [x]Add color output for pass/fail

### Part B: Add Test Cases

- [x]Test 1: SCM engine with stable model (expect "Single Stable Point")
- [x]Test 2: SCM engine with unstable model (expect "Multi Stable" or "Cycle")
- [x]Test 3: VMCAI engine with stable model (creates output file)
- [x]Test 4: SIMULATE engine (creates output CSV)
- [x]Test 5: Help/usage display

### Part C: Add Verification

- [x]Check exit codes
- [x]Check for expected output patterns
- [x]Check output files are created where expected
- [x]Summary with total pass/fail count

### Part D: Test the Script

```bash
chmod +x BmaLinux/test-console.sh
./BmaLinux/test-console.sh
```

- [x]All tests pass
- [x]Script is idempotent (can run multiple times)

---

## Acceptance Criteria

- [x]`BmaLinux/test-console.sh` exists and is executable
- [x]Script runs all tests in Docker container
- [x]At least 3 different engines tested
- [x]Both stable and unstable models tested
- [x]Clear pass/fail output for each test
- [x]Summary at end shows total results

---

## Expected Test Output Format

```
=== BioModelAnalyzer Console Tests ===
Running in Docker: mcr.microsoft.com/dotnet/sdk:8.0

[1/5] SCM engine - stable model... PASS
[2/5] SCM engine - unstable model... PASS
[3/5] VMCAI engine - stable model... PASS
[4/5] SIMULATE engine... PASS
[5/5] Help display... PASS

=== Results: 5/5 passed ===
```

---

## Completion Notes

> Fill this in when task is complete

**Completed:** [DATE]
**Actual Effort:** [actual time spent]
**Notes:** [Any learnings, issues encountered, or deviations from plan]

---

**Created:** 2026-01-30
**Updated:** 2026-01-30
