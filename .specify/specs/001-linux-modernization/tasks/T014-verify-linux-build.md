# Task T014: Verify Linux Build

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T013
**Phase:** Phase 3 - US1 (Run BMA on Linux)

---

## Context Setup Prompt

```
I'm working on Task T014: Verify Linux Build.

Please read: .specify/specs/001-linux-modernization/tasks/T014-verify-linux-build.md

## Goal

Verify the self-contained build runs on Linux without .NET SDK.
```

---

## Implementation Checklist

### Part A: Publish

```bash
cd src/BmaLinuxApi
dotnet publish -c Release -r linux-x64 --self-contained true
```

- [ ] Publish succeeds

### Part B: Test on Linux

```bash
# Copy to test location (or run directly if on Linux)
./bin/Release/net8.0/linux-x64/publish/BmaLinuxApi &

# Wait for startup
sleep 3

# Test health endpoint
curl http://localhost:8020/api/health

# Kill the process
pkill BmaLinuxApi
```

- [ ] Executable starts
- [ ] Health endpoint responds
- [ ] No "DLL not found" errors

### Part C: Check File Size

```bash
ls -lh bin/Release/net8.0/linux-x64/publish/BmaLinuxApi
```

Expected: 80-150MB (includes .NET runtime and Z3)

- [ ] File size reasonable

---

## Acceptance Criteria

- [ ] Self-contained executable runs on Linux
- [ ] No .NET SDK required
- [ ] Health endpoint responds
- [ ] Z3 native library loads

---

## Troubleshooting

### Missing SDK (for publish step)
- **Option A:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- **Option B:** Use Docker: `./scripts/dotnet-docker.sh publish src/BmaLinuxApi -c Release -r linux-x64 --self-contained true`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

---

**Created:** 2026-01-29
