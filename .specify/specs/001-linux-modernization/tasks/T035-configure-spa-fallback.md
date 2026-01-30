# Task T035: Configure SPA Fallback

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 15m
**Dependencies:** T034
**Phase:** Phase 9 - US7 (Use Existing Frontend)

---

## Implementation

Update `src/BmaLinuxApi/Program.cs`:

```csharp
app.UseStaticFiles();

// SPA fallback - serve index.html for non-API routes
app.MapFallbackToFile("index.html");
```

- [ ] Add MapFallbackToFile
- [ ] Test: http://localhost:8080/ loads UI

---

**Created:** 2026-01-29
