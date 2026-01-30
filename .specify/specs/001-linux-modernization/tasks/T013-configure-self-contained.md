# Task T013: Configure Self-Contained Publish

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T005
**Phase:** Phase 3 - US1 (Run BMA on Linux)

---

## Context Setup Prompt

```
I'm working on Task T013: Configure Self-Contained Publish.

Please read: .specify/specs/001-linux-modernization/tasks/T013-configure-self-contained.md

## Goal

Configure the project for self-contained single-file publish for Linux.
```

---

## Implementation Checklist

Update `src/BmaLinuxApi/BmaLinuxApi.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>

    <!-- Self-contained publish settings -->
    <PublishSingleFile>true</PublishSingleFile>
    <SelfContained>true</SelfContained>
    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
    <EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>
  </PropertyGroup>

  <!-- ... ItemGroups ... -->

</Project>
```

Test publish:
```bash
cd src/BmaLinuxApi
dotnet publish -c Release -r linux-x64
ls -la bin/Release/net8.0/linux-x64/publish/
```

- [ ] Add publish properties to .csproj
- [ ] Test publish command
- [ ] Verify single file output

---

## Acceptance Criteria

- [ ] `dotnet publish -c Release -r linux-x64` produces output
- [ ] Single executable file in publish folder
- [ ] File includes Z3 native libraries

---

**Created:** 2026-01-29
