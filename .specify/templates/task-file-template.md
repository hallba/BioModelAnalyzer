# Task [T###]: [Task Title]

**Status:** [ ] Pending | [ ] In Progress | [x] Complete
**Effort:** [estimated time, e.g., 30m, 2h]
**Dependencies:** [T### (dependency description)] or None
**Phase:** [Phase # - Phase Name]

---

## Context Setup Prompt

Use this prompt to start a fresh Claude Code session for this task:

```
I'm working on Task [T###]: [Task Title] for [Project Name].

Please read these files first:
- specs/[###-feature-name]/tasks/T###-[task-name].md (this task file)
- [Other relevant files the task needs to read]

## Problem Statement

[Brief description of what needs to be done and why]

## Goal

[Specific outcome this task should achieve]

## What's Already Done

- [x] [Previous task or prerequisite that's complete]
- [x] [Another prerequisite]

## Your Tasks

1. [First action to take]
2. [Second action to take]
3. [Third action to take]

## Important Notes

- [Any constraints or gotchas]
- [File paths or conventions to follow]
- Always write unit tests and run them
- If tests won't run because services aren't started, start them up (don't mock)
```

---

## Background

### Why This Task?

[Explain the context and motivation for this task. What problem does it solve?
How does it fit into the larger feature?]

### Technical Context

[Any technical details needed to understand the task - architecture decisions,
patterns being used, relevant code structure]

---

## Implementation Checklist

### Part A: [First Major Step]

```bash
# Commands or code snippets with explanations
```

- [ ] Substep 1
- [ ] Substep 2

### Part B: [Second Major Step]

```bash
# Commands or code snippets
```

- [ ] Substep 1
- [ ] Substep 2

### Part C: [Third Major Step]

- [ ] Substep 1
- [ ] Substep 2

---

## Acceptance Criteria

- [ ] [Verifiable condition 1]
- [ ] [Verifiable condition 2]
- [ ] [Verifiable condition 3]
- [ ] [Manual verification step if needed]

---

## Subtasks

> Only include this section if the task is too large for one context window

This task has been divided into subtasks:

- [ ] **T###a** - [Subtask A title](./T###a-subtask-a.md)
- [ ] **T###b** - [Subtask B title](./T###b-subtask-b.md)

Complete subtasks in order. Each subtask file follows this same template.

---

## Troubleshooting

### [Common Issue 1]
- [How to diagnose]
- [How to fix]

### [Common Issue 2]
- [How to diagnose]
- [How to fix]

---

## Completion Notes

> Fill this in when task is complete

**Completed:** [DATE]
**Actual Effort:** [actual time spent]
**Notes:** [Any learnings, issues encountered, or deviations from plan]

---

**Created:** [DATE]
**Updated:** [DATE]
