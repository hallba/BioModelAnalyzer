# Task T009: Add Error Handling Middleware

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** 30m
**Dependencies:** T005 (API project created)
**Phase:** Phase 2 - Foundational

---

## Context Setup Prompt

```
I'm working on Task T009: Add Error Handling Middleware for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T009-add-error-handling.md
- src/BmaLinuxApi/Program.cs

## Goal

Add global error handling to return consistent error responses and log exceptions.

## Your Tasks

1. Add exception handling middleware
2. Configure logging
3. Return structured error responses (not stack traces in production)
```

---

## Implementation Checklist

### Part A: Create Error Handling Middleware

Update `src/BmaLinuxApi/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// ... existing config ...

var app = builder.Build();

// Global exception handler
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (error != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(error.Error, "Unhandled exception");

            await context.Response.WriteAsJsonAsync(new
            {
                Error = "An unexpected error occurred",
                // Only include details in development
                Details = app.Environment.IsDevelopment() ? error.Error.Message : null
            });
        }
    });
});

// ... rest of app config ...
```

- [x]Add UseExceptionHandler middleware
- [x]Log exceptions
- [x]Return JSON error response

### Part B: Configure Logging

Verify `appsettings.json` has logging config:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

- [x]Verify logging configuration

### Part C: Add Status Code Pages

```csharp
app.UseStatusCodePages(async statusCodeContext =>
{
    statusCodeContext.HttpContext.Response.ContentType = "application/json";
    await statusCodeContext.HttpContext.Response.WriteAsJsonAsync(new
    {
        Error = $"Status code: {statusCodeContext.HttpContext.Response.StatusCode}"
    });
});
```

- [x]Add status code pages for non-exception errors (404, etc.)

---

## Acceptance Criteria

- [x]Exceptions return 500 with JSON body
- [x]Stack traces NOT exposed in production
- [x]Exceptions logged
- [x]404 returns JSON response

---

**Created:** 2026-01-29
