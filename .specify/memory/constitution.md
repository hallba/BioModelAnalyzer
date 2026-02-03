# BioModelAnalyzer Project Constitution

This document establishes the governing principles and development guidelines for the BioModelAnalyzer Linux Modernization project.

## Project Mission

Enable biologists to build and analyze complex biological behavior models using formal verification techniques, accessible from any platform including Linux servers and VMs.

## Core Principles

### 1. Cross-Platform First
- All code must run on Linux, macOS, and Windows
- No platform-specific dependencies without cross-platform alternatives
- Native libraries must be available for all target platforms via NuGet or system packages

### 2. Self-Contained Deployment
- The application must be deployable as a single executable or container
- No external runtime dependencies required on target machines
- Configuration via environment variables and config files

### 3. API Compatibility
- Maintain backward compatibility with existing API contract (`docs/ApiServer.yaml`)
- All existing clients must continue to work without modification
- Version APIs explicitly when breaking changes are unavoidable

### 4. Leverage Existing Work
- Build upon the existing `BmaLinux/` .NET Core port rather than rewriting
- Preserve the TypeScript/HTML5 frontend as-is (already cross-platform)
- Reuse test data and validation approaches from existing test suites

## Code Quality Standards

### Testing Requirements
- All new services must have unit tests
- API endpoints must have integration tests matching the OpenAPI specification
- Analysis results must be validated against known-good outputs from the Windows version

### Code Style
- F# code follows existing conventions in `BmaLinux/BioCheckAnalyzerMulti/`
- C# code follows Microsoft .NET conventions
- Use `dotnet format` for consistent formatting

### Documentation
- Public APIs must have XML documentation comments
- Complex algorithms should reference the academic papers they implement
- Configuration options must be documented in `appsettings.json` with comments

## Technology Constraints

### Approved Technologies
- **.NET 8 LTS** - Target framework for all new code
- **ASP.NET Core Minimal APIs** - Web framework
- **Microsoft.Extensions.DependencyInjection** - Dependency injection
- **System.Text.Json** - JSON serialization (prefer over Newtonsoft where possible)
- **ClosedXML** - Excel file generation (replaces COM interop)
- **Microsoft.Z3** - SMT solver (via NuGet, cross-platform)
- **FParsec** - Parser combinators for F#

### Prohibited Technologies
- **System.Web** - Not available on .NET Core
- **COM Interop** - Windows-only
- **Windows-specific APIs** - System.Windows.*, WinForms, WPF
- **Azure-specific storage** for core functionality - Must work offline

### Optional Technologies (for enhanced deployment)
- **Docker** - Containerization
- **Azure SDK** - Only for optional cloud features, not core functionality

## Performance Requirements

- API responses under 2 minutes (existing timeout contract)
- Support concurrent analysis requests
- Memory-efficient for long-running VM deployments

## Port Configuration

**Always check the central port registry before configuring ports:**
- Location: `~/.dev-ports.json` (on development machines)
- BMA is registered on port **8020**
- Check registry to avoid conflicts: `cat ~/.dev-ports.json | jq '.projects'`

This prevents port conflicts across projects on shared development machines.

## Security Requirements

- No hardcoded credentials or connection strings
- Validate all user input before passing to analysis engine
- Log errors without exposing internal implementation details

## Development Workflow

1. **Specification First** - Define what to build before how
2. **Incremental Delivery** - Each phase produces working software
3. **Continuous Validation** - Test against existing Windows version
4. **Documentation as Code** - Keep specs updated with implementation

## Spec-Kit Command Usage

**Use the enhanced local commands instead of the base spec-kit commands:**

| Instead of | Use | Reason |
|------------|-----|--------|
| `/speckit.tasks` | `/local.tasks` | Generates individual task files with context window scoping |
| `/speckit.implement` | `/local.implement` | Stops at 95% context, no autocompact, controlled handoff |

These enhancements ensure large implementation projects can span multiple Claude Code sessions without losing context. See `.specify/README.md` for details.
