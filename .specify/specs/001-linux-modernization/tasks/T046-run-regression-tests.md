# Task T046: Run Regression Tests

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 2h
**Dependencies:** T036
**Phase:** Phase 11 - Polish & Deployment

---

## Implementation

Use test models from `src/BmaTests.Common/`:

```bash
# Start the API
cd src/BmaLinuxApi && dotnet run &

# Run tests against each endpoint
for file in src/BmaTests.Common/Analysis/*_request.json; do
    curl -X POST http://localhost:8080/api/Analyze \
      -H "Content-Type: application/json" \
      -d @"$file" > "$(basename $file .json)_response.json"
done

# Compare with expected responses
```

- [ ] Test /api/Analyze with test models
- [ ] Test /api/Simulate
- [ ] Test /api/FurtherTesting
- [ ] Compare results with expected outputs

---

**Created:** 2026-01-29
