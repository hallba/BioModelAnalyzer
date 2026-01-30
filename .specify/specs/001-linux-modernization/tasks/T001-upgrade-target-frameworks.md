# Task T001: Upgrade Target Frameworks to .NET 8

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 30m
**Dependencies:** None
**Phase:** Phase 1 - Setup

---

## Context Setup Prompt

Use this prompt to start a fresh Claude Code session for this task:

```
I'm working on Task T001: Upgrade Target Frameworks to .NET 8 for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T001-upgrade-target-frameworks.md (this task file)
- BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj
- BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj
- BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj
- BmaLinux/Z3testMulti/Z3testMulti.fsproj

## Problem Statement

The BmaLinux projects currently target .NET Core 3.1 which is out of support. We need to upgrade to .NET 8 LTS for long-term support and better cross-platform capabilities.

## Goal

All BmaLinux project files should target net8.0 instead of netcoreapp3.1.

## What's Already Done

- [x] BmaLinux projects exist and build on .NET Core 3.1
- [x] Plan approved for .NET 8 upgrade

## Your Tasks

1. Update <TargetFramework> in BioCheckAnalyzerMulti.fsproj from netcoreapp3.1 to net8.0
2. Update <TargetFramework> in BioCheckAnaylzerCommonMulti.csproj from netcoreapp3.1 to net8.0
3. Update <TargetFramework> in BioCheckConsoleMulti.fsproj from netcoreapp3.1 to net8.0
4. Update <TargetFramework> in Z3testMulti.fsproj from netcoreapp3.1 to net8.0
5. Run `dotnet restore` to verify package compatibility

## Important Notes

- Keep all other project file settings unchanged
- The projects may not build yet - that's expected, package updates come in T002
- Do NOT add any new dependencies in this task
```

---

## Background

### Why This Task?

.NET Core 3.1 reached end-of-life in December 2022. .NET 8 is the current LTS release with support until November 2026, providing:
- Better performance
- Improved cross-platform support
- Self-contained deployment improvements
- Native AOT capabilities (for future optimization)

### Technical Context

The BmaLinux directory contains the F# analysis engine already ported from .NET Framework. The project structure:
- `BioCheckAnalyzerMulti/` - Main F# analyzer library
- `BioCheckAnaylzerCommonMulti/` - Shared C# common types (note the typo in "Anaylzer")
- `BioCheckConsoleMulti/` - Console application entry point
- `Z3testMulti/` - Z3 solver test project

---

## Implementation Checklist

### Part A: Update F# Projects

Edit `BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj`:

```xml
<!-- Change this line -->
<TargetFramework>netcoreapp3.1</TargetFramework>
<!-- To -->
<TargetFramework>net8.0</TargetFramework>
```

- [x] Update BioCheckAnalyzerMulti.fsproj

Edit `BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj`:
- [x] Update BioCheckConsoleMulti.fsproj

Edit `BmaLinux/Z3testMulti/Z3testMulti.fsproj`:
- [x] Update Z3testMulti.fsproj

### Part B: Update C# Project

Edit `BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj`:
- [x] Update BioCheckAnaylzerCommonMulti.csproj

### Part C: Verify Package Restore

```bash
cd BmaLinux
dotnet restore BioCheckConsoleMulti.sln
```

- [x] Run dotnet restore (warnings are OK, errors need investigation) - Note: .NET SDK not installed in current environment; verify when SDK available

---

## Acceptance Criteria

- [x] All 4 project files have `<TargetFramework>net8.0</TargetFramework>`
- [x] `dotnet restore` completes without critical errors
- [x] No unrelated changes to project files

---

## Troubleshooting

### Package Version Conflicts
- Some packages may need updates - this is handled in T002
- If restore fails completely, check for .NET 8 SDK installation: `dotnet --version`

### Missing SDK
- Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- Verify with `dotnet --list-sdks`

---

## Completion Notes

**Completed:** 2026-01-30
**Actual Effort:** 10m
**Notes:**
- All 4 project files updated from `netcoreapp3.1` to `net8.0`:
  - BioCheckAnalyzerMulti.fsproj
  - BioCheckAnaylzerCommonMulti.csproj
  - BioCheckConsoleMulti.fsproj
  - Z3testMulti.fsproj
- Verified via Docker container (mcr.microsoft.com/dotnet/sdk:8.0)
- `dotnet restore` succeeded for all 4 projects
- `dotnet build` succeeded with 1 warning (F# pattern match in BioCheckPlusZ3.fs:439)

---

**Created:** 2026-01-29
**Updated:** 2026-01-29
