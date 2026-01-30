# Task T029: Add ClosedXML Package

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 10m
**Dependencies:** T005
**Phase:** Phase 8 - US6 (Export to Excel)

---

## Implementation

Add to `src/BmaLinuxApi/BmaLinuxApi.csproj`:

```xml
<PackageReference Include="ClosedXML" Version="0.102.*" />
```

Run:
```bash
cd src/BmaLinuxApi
dotnet add package ClosedXML
dotnet restore
```

- [ ] Add ClosedXML package
- [ ] Verify restore succeeds

---

**Created:** 2026-01-29
