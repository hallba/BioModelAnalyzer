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
│   ├── task-file-template.md    # Individual task file template
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

## Local Enhancements

**Author:** John Watts
**Date:** 2026-01-29

Enhanced versions of spec-kit commands are provided as separate files to support long-running implementation work with Claude Code. This keeps the base spec-kit commands updatable while preserving our customizations.

### Using the Enhanced Commands

| Standard Command | Enhanced Command | Description |
|------------------|------------------|-------------|
| `/speckit.tasks` | `/local.tasks` | Adds individual task files + context window scoping |
| `/speckit.implement` | `/local.implement` | Adds 95% context management, no autocompact |

**Use `/local.tasks` and `/local.implement` instead of the base commands for this project.**

### Copying to New Projects

To use these enhancements in a new project:

1. Run `specify init` to set up base spec-kit
2. Copy the local command files:
   ```bash
   cp .claude/commands/local.tasks.md /path/to/new-project/.claude/commands/
   cp .claude/commands/local.implement.md /path/to/new-project/.claude/commands/
   ```
3. Copy the task file template:
   ```bash
   cp .specify/templates/task-file-template.md /path/to/new-project/.specify/templates/
   ```

### Enhancement Details

#### Individual Task Files (`/local.tasks`)

- Creates a `tasks/` subdirectory within each feature spec
- Each task gets its own file: `tasks/T###-{task-name}.md`
- Uses the template at `.specify/templates/task-file-template.md`
- Each file includes a **Context Setup Prompt** for easy session handoff

#### Single Context Window Scoping (`/local.tasks`)

- Tasks should involve no more than 3-5 files
- Large tasks must be split into parent + subtasks (e.g., T005, T005a, T005b, T005c)
- Each subtask is self-contained with its own Context Setup Prompt

#### Context Window Management (`/local.implement`)

- **Stop at 95% context usage** - graceful checkpoint before running out of space
- **No autocompact** - autocompaction loses important context
- **Controlled handoff** - saves progress, marks completed tasks, provides clear instructions for resuming in a new session

These changes ensure that large implementation projects can be executed across multiple Claude Code sessions without losing context or creating inconsistent state.

## References

- [Spec-Kit Repository](https://github.com/github/spec-kit)
- [Constitution](.specify/memory/constitution.md)
