# Task T047: Validate API Contract

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 1h
**Dependencies:** T046
**Phase:** Phase 11 - Polish & Deployment

---

## Implementation

Use schemathesis or similar tool:

```bash
# Install schemathesis
pip install schemathesis

# Run contract tests
schemathesis run \
  .specify/specs/001-linux-modernization/contracts/api-spec.yaml \
  --base-url http://localhost:8080/api
```

Or manual validation:
1. For each endpoint in api-spec.yaml
2. Send request matching schema
3. Verify response matches schema

- [ ] Install contract testing tool
- [ ] Run against all endpoints
- [ ] Fix any contract violations

---

**Created:** 2026-01-29
