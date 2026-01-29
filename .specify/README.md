# Spec-Kit Project Structure

This directory contains specification-driven development artifacts for the BioModelAnalyzer project, following the [spec-kit](https://github.com/github/spec-kit) methodology.

## Directory Structure

```
.specify/
├── memory/
│   └── constitution.md          # Project governance and principles
├── specs/
│   └── 001-linux-modernization/ # Feature specification directory
│       ├── spec.md              # User stories and requirements
│       ├── plan.md              # Technical architecture and design
│       ├── tasks.md             # Implementation task breakdown
│       ├── research.md          # Technology research findings
│       ├── quickstart.md        # Development setup guide
│       └── contracts/
│           └── api-spec.yaml    # OpenAPI 3.1 specification
├── templates/                   # Templates for new features
│   ├── spec-template.md
│   ├── plan-template.md
│   ├── tasks-template.md
│   └── research-template.md
└── README.md                    # This file
```

## Workflow

### 1. Constitution (One-time)
The `memory/constitution.md` establishes project-wide principles and constraints. This guides all feature development.

### 2. Specification Phase
For each new feature, create a numbered directory (e.g., `002-feature-name/`) and write:
- `spec.md` - Define WHAT to build (user stories, acceptance criteria)
- Focus on user value, not implementation details

### 3. Planning Phase
- `plan.md` - Define HOW to build (architecture, technology choices)
- `research.md` - Document technology evaluations and decisions

### 4. Task Breakdown
- `tasks.md` - Break down into actionable implementation tasks
- Each task references user stories and has clear acceptance criteria

### 5. Implementation
Work through tasks systematically, updating status as you go.

## Using with AI Assistants

When working with Claude Code or other AI assistants:

1. **Context**: Point the assistant to relevant spec files
2. **Implementation**: Reference task IDs when implementing
3. **Validation**: Use acceptance criteria to verify completion

Example prompt:
```
Implement Task 2.3 from .specify/specs/001-linux-modernization/tasks.md
Follow the architecture in plan.md and ensure API matches contracts/api-spec.yaml
```

## Creating a New Feature

1. Copy templates to new directory:
   ```bash
   cp -r .specify/templates .specify/specs/002-new-feature
   ```

2. Rename and fill in the templates

3. Follow the workflow above

## Current Features

| ID | Feature | Status |
|----|---------|--------|
| 001 | Linux Modernization | Planning |

## References

- [Spec-Kit Repository](https://github.com/github/spec-kit)
- [Constitution](.specify/memory/constitution.md)
