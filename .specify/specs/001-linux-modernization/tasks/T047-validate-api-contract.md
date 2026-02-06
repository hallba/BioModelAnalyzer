# Task T047: Validate API Contract

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 1h
**Dependencies:** T046
**Phase:** Phase 11 - Polish & Deployment

---

## Context Setup Prompt

```
I'm working on Task T047: Validate API Contract.

Read: .specify/specs/001-linux-modernization/tasks/T047-validate-api-contract.md
      .specify/specs/001-linux-modernization/contracts/api-spec.yaml
      src/BmaLinuxApi/Program.cs

## Goal

Validate all implemented endpoints against the OpenAPI spec in
contracts/api-spec.yaml using schemathesis or manual testing.
Regression tests were run in T046.
```

---

## Implementation

Use schemathesis or similar tool:

```bash
# Install schemathesis
pip install schemathesis

# Run contract tests
schemathesis run \
  .specify/specs/001-linux-modernization/contracts/api-spec.yaml \
  --base-url http://localhost:8020/api
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
