# Task T046: Run Regression Tests

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 2h
**Dependencies:** T036
**Phase:** Phase 11 - Polish & Deployment

---

## Context Setup Prompt

```
I'm working on Task T046: Run Regression Tests.

Read: .specify/specs/001-linux-modernization/tasks/T046-run-regression-tests.md
      src/BmaTests.Common/Analysis/
      src/BmaTests.Common/Simulation/
      src/BmaTests.Common/CounterExamples/
      src/BmaLinuxApi/Program.cs

## Goal

Run all API endpoints against the test models in src/BmaTests.Common/
and compare results with expected responses. Note: test JSON files have
UTF-8 BOMs that must be stripped first (see Known Issue section in task).
```

---

## Implementation

Use test models from `src/BmaTests.Common/`:

```bash
# Start the API
cd src/BmaLinuxApi && dotnet run &

# Run tests against each endpoint
for file in src/BmaTests.Common/Analysis/*_request.json; do
    curl -X POST http://localhost:8020/api/Analyze \
      -H "Content-Type: application/json" \
      -d @"$file" > "$(basename $file .json)_response.json"
done

# Compare with expected responses
```

### Known Issue: UTF-8 BOM in Test JSON Files

The JSON files in `src/BmaTests.Common/` contain a UTF-8 BOM (byte order mark, `\xEF\xBB\xBF`).
This is invisible but causes problems for non-.NET tooling:

- **`curl -d @file`** sends the BOM bytes as part of the JSON body → ASP.NET Core returns **400 Bad Request**
- **Python `json.loads()`** raises `JSONDecodeError: Unexpected UTF-8 BOM`
- **.NET** handles BOMs natively, so the API and legacy Windows tests are unaffected

**Fix:** Strip BOMs from all test JSON files before writing the regression test script.
A one-liner to strip BOMs repo-wide:
```bash
find src/BmaTests.Common -name '*.json' -exec sed -i '1s/^\xEF\xBB\xBF//' {} +
```

Alternatively, use `encoding='utf-8-sig'` in Python or pipe through `sed '1s/^\xEF\xBB\xBF//'`
in the test script.

- [ ] Strip UTF-8 BOMs from src/BmaTests.Common/**/*.json files
- [ ] Test /api/Analyze with test models
- [ ] Test /api/Simulate
- [ ] Test /api/FurtherTesting
- [ ] Compare results with expected outputs

---

## Troubleshooting

### Missing SDK
- **Option A:** Install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
- **Option B:** Use Docker: `./scripts/dotnet-docker.sh run --project src/BmaLinuxApi`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

---

**Created:** 2026-01-29
