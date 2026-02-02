# Task T008: Configure JSON Serialization

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T006 (DTO models created)
**Phase:** Phase 2 - Foundational

---

## Context Setup Prompt

```
I'm working on Task T008: Configure JSON Serialization for BioModelAnalyzer Linux Modernization.

Please read these files first:
- .specify/specs/001-linux-modernization/tasks/T008-configure-json-serialization.md
- .specify/specs/001-linux-modernization/contracts/api-spec.yaml (property names)
- src/BmaLinuxApi/Program.cs
- src/BmaLinuxApi/Models/ (all model files)

## Goal

Configure System.Text.Json to serialize/deserialize exactly as the API spec requires.

## Your Tasks

1. Configure JSON options in Program.cs
2. Ensure PascalCase property names are preserved (spec uses PascalCase)
3. Handle null values appropriately
4. Add any needed JsonPropertyName attributes
```

---

## Implementation Checklist

### Part A: Configure JSON Options

Update `src/BmaLinuxApi/Program.cs`:

```csharp
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Keep PascalCase (matches API spec)
    options.SerializerOptions.PropertyNamingPolicy = null;

    // Include null values in output
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;

    // Handle enums as strings
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// ... rest of Program.cs
```

- [ ] Configure PropertyNamingPolicy to null (preserve PascalCase)
- [ ] Configure enum handling
- [ ] Configure null value handling

### Part B: Verify Serialization

Create a simple test endpoint:

```csharp
app.MapGet("/api/test-json", () =>
{
    var model = new BmaLinuxApi.Models.Model(
        Name: "Test",
        Variables: new[] { new BmaLinuxApi.Models.Variable(1, "X", 0, 10, "X+1") },
        Relationships: Array.Empty<BmaLinuxApi.Models.Relationship>()
    );
    return Results.Ok(model);
});
```

```bash
curl http://localhost:8020/api/test-json
# Should output: {"Name":"Test","Variables":[{"Id":1,"Name":"X",...}],...}
```

- [ ] Add test endpoint
- [ ] Verify output uses PascalCase
- [ ] Remove test endpoint after verification

---

## Acceptance Criteria

- [ ] JSON output uses PascalCase property names
- [ ] Null values handled correctly
- [ ] Enums serialize as strings where needed
- [ ] `dotnet build` succeeds

---

## Troubleshooting

### Missing SDK
- **Option A:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- **Option B:** Use Docker: `./scripts/dotnet-docker.sh build src/BmaLinuxApi`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

---

**Created:** 2026-01-29
