# Task T035: Configure SPA Fallback

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 15m
**Dependencies:** T034
**Phase:** Phase 9 - US7 (Use Existing Frontend)

---

## Context Setup Prompt

```
I'm working on Task T035: Configure SPA Fallback.

Read: .specify/specs/001-linux-modernization/tasks/T035-configure-spa-fallback.md
      src/BmaLinuxApi/Program.cs

## Goal

Enable MapFallbackToFile("index.html") in Program.cs so non-API routes
serve the SPA frontend. The frontend files were copied to wwwroot in T034.
```

---

## Implementation

Update `src/BmaLinuxApi/Program.cs`:

```csharp
app.UseStaticFiles();

// SPA fallback - serve index.html for non-API routes
app.MapFallbackToFile("index.html");
```

- [ ] Add MapFallbackToFile
- [ ] Test: http://localhost:8020/ loads UI

---

**Created:** 2026-01-29
