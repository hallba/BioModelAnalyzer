# Task T036: Test Frontend Integration

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
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

- [ ] Frontend loads
- [ ] Can create model
- [ ] Analysis works
- [ ] Results display

---

**Created:** 2026-01-29
