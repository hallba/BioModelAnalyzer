# Task T034: Copy Frontend to wwwroot

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 15m
**Dependencies:** T033
**Phase:** Phase 9 - US7 (Use Existing Frontend)

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
