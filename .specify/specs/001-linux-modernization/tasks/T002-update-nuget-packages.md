# Task T002: Update NuGet Package Versions

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 45m
**Dependencies:** T001 (target frameworks updated)
**Phase:** Phase 1 - Setup

---

## Context Setup Prompt

Use this prompt to start a fresh Claude Code session for this task:

```
I'm working on Task T002: Update NuGet Package Versions for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T002-update-nuget-packages.md (this task file)
- .specify/specs/001-linux-modernization/research.md (technology decisions)
- BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj
- BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj
- BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj

## Problem Statement

After upgrading to .NET 8, package versions need to be updated for compatibility. Some packages (FSharp.Core, Microsoft.Z3) need explicit version updates.

## Goal

All NuGet packages should be compatible with .NET 8 and resolve without errors.

## What's Already Done

- [x] T001: Target frameworks updated to net8.0
- [x] Research confirms FSharp.Core 8.0.x and Microsoft.Z3 4.11.2+ are compatible

## Your Tasks

1. Update FSharp.Core to version 8.0.100 or latest 8.x
2. Verify Microsoft.Z3 version is 4.11.2 or higher
3. Verify FParsec is compatible (should work as-is)
4. REMOVE any Microsoft.Office.Interop.Excel references (will be replaced with ClosedXML later)
5. Run `dotnet restore` and `dotnet build` to verify

## Important Notes

- Do NOT add ClosedXML yet - that comes in a later task
- Keep package versions consistent across all projects
- If a package isn't needed, remove it rather than updating
```

---

## Background

### Why This Task?

.NET 8 requires updated package versions. Key packages:
- **FSharp.Core**: Must match .NET version (5.0 → 8.0)
- **Microsoft.Z3**: SMT solver, already cross-platform via NuGet
- **FParsec**: Parser library, should be compatible
- **Microsoft.Office.Interop.Excel**: Must be REMOVED (Windows-only COM)

### Technical Context

The research.md confirms:
- ClosedXML will replace Excel interop (added in Phase 8)
- Microsoft.Z3 NuGet includes Linux native binaries
- FParsec 1.1.1 is compatible with .NET 8

---

## Implementation Checklist

### Part A: Update FSharp.Core

In each F# project file, update FSharp.Core:

```xml
<!-- From -->
<PackageReference Include="FSharp.Core" Version="5.0.0" />
<!-- To -->
<PackageReference Include="FSharp.Core" Version="8.0.100" />
```

- [x] Update BioCheckAnalyzerMulti.fsproj - System.ComponentModel.Composition updated to 8.0.0
- [N/A] Update BioCheckConsoleMulti.fsproj - No explicit FSharp.Core reference (uses SDK default)
- [N/A] Update Z3testMulti.fsproj - No explicit FSharp.Core reference (uses SDK default)
- [x] Update BioCheckAnaylzerCommonMulti.csproj - FSharp.Core updated to 8.0.100

### Part B: Verify Other Packages

Check and update if needed:

```xml
<!-- Microsoft.Z3 should be 4.11.2 or higher -->
<PackageReference Include="Microsoft.Z3" Version="4.11.2" />

<!-- FParsec 1.1.1 should work as-is -->
<PackageReference Include="FParsec" Version="1.1.1" />
```

- [x] Verify Microsoft.Z3 version in relevant projects - 4.11.2 ✓
- [x] Verify FParsec version - 1.1.1 compatible ✓

### Part C: Remove Windows-Only Dependencies

Search for and REMOVE any references to:
- Microsoft.Office.Interop.Excel
- Any System.Windows.* packages

```bash
grep -r "Office.Interop\|System.Windows" BmaLinux/
```

- [x] Remove Microsoft.Office.Interop.Excel if present - Removed from project file
- [x] Remove any other Windows-only packages - None found
- [x] Excluded ModelToExcel.fs from compilation (depends on removed package)
- [x] Updated Main.fs to gracefully handle missing Excel export

### Part D: Verify Build

```bash
cd BmaLinux
dotnet restore BioCheckConsoleMulti.sln
dotnet build BioCheckConsoleMulti.sln
```

- [x] Restore succeeds
- [x] Build succeeds (1 warning remains - F# pattern match, fixed in T003)

---

## Acceptance Criteria

- [x] FSharp.Core is version 8.0.x in all F# projects
- [x] Microsoft.Z3 is version 4.11.2+
- [x] No Microsoft.Office.Interop.Excel references
- [x] No System.Windows.* references
- [x] `dotnet restore` completes without errors

---

## Troubleshooting

### FSharp.Core Version Mismatch
- All F# projects must use the same FSharp.Core version
- Check for implicit FSharp.Core references

### Z3 Native Library Issues
- Microsoft.Z3 NuGet includes natives for Windows, Linux, macOS
- If missing, ensure you're using NuGet package not local reference

### Package Not Found
- Clear NuGet cache: `dotnet nuget locals all --clear`
- Check NuGet.config for package sources

### Missing SDK
- **Option A:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- **Option B:** Use Docker: `./scripts/dotnet-docker.sh build BmaLinux/BioCheckConsoleMulti.sln`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

---

## Completion Notes

**Completed:** 2026-01-30
**Actual Effort:** 15m
**Notes:**
- Updated FSharp.Core from 5.0.0 to 8.0.100 in BioCheckAnaylzerCommonMulti.csproj
- Updated System.ComponentModel.Composition from 6.0.0 to 8.0.0
- **Removed** Microsoft.Office.Interop.Excel (Windows-only COM interop)
- **Excluded** ModelToExcel.fs from compilation (uses Office Interop)
- Modified Main.fs to print warning when Excel export requested on Linux
- Microsoft.Z3 4.11.2 already compatible (verified)
- FParsec 1.1.1 already compatible (verified)
- Build verified via Docker container (mcr.microsoft.com/dotnet/sdk:8.0)
- 1 warning remains (F# pattern match in BioCheckPlusZ3.fs:439) - addressed in T003

---

**Created:** 2026-01-29
**Updated:** 2026-01-29
