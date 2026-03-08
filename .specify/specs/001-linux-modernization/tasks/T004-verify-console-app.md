# Task T004: Verify Console Application

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 30m
**Dependencies:** T003 (compilation errors fixed)
**Phase:** Phase 1 - Setup

---

## Context Setup Prompt

Use this prompt to start a fresh Claude Code session for this task:

```
I'm working on Task T004: Verify Console Application for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T004-verify-console-app.md (this task file)
- .specify/specs/001-linux-modernization/quickstart.md (test commands)
- BmaLinux/BioCheckConsoleMulti/Program.fs (entry point)

## Problem Statement

We need to verify the upgraded BmaLinux console application works correctly on Linux with .NET 8 before building the web API on top of it.

## Goal

BioCheckConsoleMulti runs and produces correct analysis results on Linux.

## What's Already Done

- [x] T001: Target frameworks updated to net8.0
- [x] T002: Package versions updated
- [x] T003: Compilation errors fixed

## Your Tasks

1. Build the console application
2. Find test model files (ToyModelUnstable.json, ToyModelStable.json, etc.)
3. Run the console app with different analysis engines
4. Verify output is sensible (stable models report stable, unstable report unstable)

## Important Notes

- We're testing on Linux - watch for any platform-specific issues
- Z3 native libraries should load automatically from NuGet package
- If tests fail, we may need to debug the analysis engine
```

---

## Background

### Why This Task?

Before building a web API, we need to confirm the core analysis engine works on Linux. The console app is the simplest way to test this.

### Technical Context

BioCheckConsoleMulti supports multiple analysis engines:
- `SCM` - SCM engine for quick analysis
- `VMCAI` - VMCAI algorithm for stability proofs

Test models are included in the BmaLinux directory.

---

## Implementation Checklist

### Part A: Build Console App

```bash
cd BmaLinux
dotnet build BioCheckConsoleMulti.sln -c Release
```

- [x]Build succeeds in Release mode

### Part B: Find Test Models

```bash
find BmaLinux -name "*.json" | head -10
```

- [x]Locate ToyModelUnstable.json
- [x]Locate ToyModelStable.json (or similar)

### Part C: Run Analysis Tests

Test with unstable model:
```bash
cd BmaLinux/BioCheckConsoleMulti
dotnet run -- -model ToyModelUnstable.json -engine SCM
```

Expected: Should report model is NOT stable

Test with stable model (if available):
```bash
dotnet run -- -model ToyModelStable.json -engine VMCAI
```

Expected: Should report model IS stable

- [x]Unstable model test runs
- [x]Stable model test runs (if test file exists)
- [x]No runtime errors or crashes

### Part D: Verify Z3 Loading

Z3 should load automatically. If there are errors:

```bash
# Check if Z3 native library is present
find ~/.nuget -name "libz3*" -o -name "z3.dll" 2>/dev/null | head -5

# Check runtime directory
ls BioCheckConsoleMulti/bin/Release/net8.0/
```

- [x]Z3 native library loads without errors
- [x]No "DllNotFoundException" for Z3

### Part E: Document Results

Record the output from successful runs:

- [x]Document unstable model output
- [x]Document stable model output (if applicable)
- [x]Note any warnings or issues

---

## Acceptance Criteria

- [x]`dotnet run -- -model ToyModelUnstable.json -engine SCM` produces output
- [x]Analysis results are sensible (unstable model reports not stable)
- [x]No Z3 native library loading errors
- [x]No runtime crashes on Linux

---

## Troubleshooting

### DllNotFoundException: libz3
- Ensure Microsoft.Z3 NuGet package is properly restored
- Check that native libraries are being copied to output:
  ```bash
  ls bin/Release/net8.0/runtimes/linux-x64/native/
  ```

### "Model not found" Error
- Check the path to model file
- Try absolute path

### Segmentation Fault
- May indicate Z3 version mismatch
- Try updating Microsoft.Z3 to latest version

### Timeout or Hang
- Analysis may take time for complex models
- Start with simple test models

### Missing SDK
- **Option A:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- **Option B:** Use Docker: `./scripts/dotnet-docker.sh run --project BmaLinux/BioCheckConsoleMulti -- -model ToyModelUnstable.json -engine SCM`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

---

## Completion Notes

> Fill this in when task is complete

**Completed:** [DATE]
**Actual Effort:** [actual time spent]
**Notes:** [Any learnings, issues encountered, or deviations from plan]

---

**Created:** 2026-01-29
**Updated:** 2026-01-29
