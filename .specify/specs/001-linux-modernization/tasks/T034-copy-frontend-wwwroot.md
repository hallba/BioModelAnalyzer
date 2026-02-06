# Task T034: Copy Frontend to wwwroot

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 15m
**Dependencies:** T033
**Phase:** Phase 9 - US7 (Use Existing Frontend)

---

## Context Setup Prompt

```
I'm working on Task T034: Copy Frontend to wwwroot.

Read: .specify/specs/001-linux-modernization/tasks/T034-copy-frontend-wwwroot.md
      src/BmaLinuxApi/BmaLinuxApi.csproj
      src/bma.client/

## Goal

Copy the built frontend files from src/bma.client/ into
src/BmaLinuxApi/wwwroot/ so the API can serve the SPA.
Frontend was built in T033.
```

---

## Implementation

```bash
# Copy built frontend to API wwwroot
cp -r src/bma.client/* src/BmaLinuxApi/wwwroot/
```

Verify files exist:
```bash
ls src/BmaLinuxApi/wwwroot/
# Should have index.html, js/, css/, etc.
```

- [ ] Copy frontend files
- [ ] Verify index.html exists

---

**Created:** 2026-01-29
