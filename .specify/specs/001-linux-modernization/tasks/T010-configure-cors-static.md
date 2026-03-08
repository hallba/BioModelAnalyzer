# Task T010: Configure CORS and Static Files

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 20m
**Dependencies:** T005 (API project created)
**Phase:** Phase 2 - Foundational

---

## Context Setup Prompt

```
I'm working on Task T010: Configure CORS and Static Files for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T010-configure-cors-static.md
- src/BmaLinuxApi/Program.cs

## Goal

Configure CORS for development and static file serving for the frontend.

## Your Tasks

1. Add CORS configuration for development
2. Configure static file serving from wwwroot
3. Add SPA fallback routing placeholder
```

---

## Implementation Checklist

### Part A: Configure CORS

Update `src/BmaLinuxApi/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ... rest of builder config ...

var app = builder.Build();

// Enable CORS
app.UseCors();

// ... rest of app config ...
```

- [x]Add CORS services
- [x]Enable CORS middleware

### Part B: Configure Static Files

```csharp
// Static files from wwwroot
app.UseStaticFiles();

// This will be enhanced in T035 for SPA routing
// app.MapFallbackToFile("index.html");
```

- [x]UseStaticFiles configured
- [x]Comment placeholder for SPA fallback

### Part C: Verify wwwroot Exists

```bash
mkdir -p src/BmaLinuxApi/wwwroot
echo "Static files placeholder" > src/BmaLinuxApi/wwwroot/test.txt
```

- [x]wwwroot directory exists

---

## Acceptance Criteria

- [x]CORS enabled for all origins (development)
- [x]Static files served from wwwroot
- [x]Build succeeds

---

**Created:** 2026-01-29
