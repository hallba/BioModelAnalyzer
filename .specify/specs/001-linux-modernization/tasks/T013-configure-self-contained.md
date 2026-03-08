# Task T013: Configure Self-Contained Publish

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
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

- [x]Add publish properties to .csproj
- [x]Test publish command
- [x]Verify single file output

---

## Acceptance Criteria

- [x]`dotnet publish -c Release -r linux-x64` produces output
- [x]Single executable file in publish folder
- [x]File includes Z3 native libraries

---

## Troubleshooting

### Missing SDK
- **Option A:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- **Option B:** Use Docker: `./scripts/dotnet-docker.sh publish src/BmaLinuxApi -c Release -r linux-x64`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

---

**Created:** 2026-01-29
