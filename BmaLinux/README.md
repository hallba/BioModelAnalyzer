# BmaLinux — Linux/macOS Console Tool

This directory contains the .NET 8 Linux/macOS build of the BMA command-line analysis tool. Source files are linked from `../src/` rather than copied, so there is a single canonical source shared with the Windows build.

## Project Structure

| Project | Description |
|---------|-------------|
| `BioCheckAnalyzerMulti/` | Core analysis library (links source from `../src/BioCheckAnalyzer/`) |
| `BioCheckAnaylzerCommonMulti/` | Common C# types (links source from `../src/BioCheckAnalyzerCommon/`) |
| `BioCheckConsoleMulti/` | Console executable (links source from `../src/BioCheckConsole/`) |
| `Z3testMulti/` | Z3 SMT solver wrapper |

## Building

### Option 1: Local .NET 8 SDK (recommended for development)

Install .NET 8 SDK if not already present:

```bash
# Ubuntu 22.04
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0
```

Then build from the **repository root**:

```bash
# Build
dotnet build BmaLinux/BioCheckConsoleMulti.sln -c Release

# Or publish a self-contained binary to artifacts/console/
dotnet publish BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj \
  -c Release -r linux-x64 --no-self-contained \
  -o artifacts/console/
```

### Option 2: Docker (no local .NET install required)

```bash
# Build
docker run --rm \
  -v "$(pwd)":/src \
  -w /src \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  dotnet build BmaLinux/BioCheckConsoleMulti.sln -c Release

# Publish to artifacts/console/
docker run --rm \
  -v "$(pwd)":/src \
  -w /src \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  dotnet publish BmaLinux/BioCheckConsoleMulti/BioCheckConsoleMulti.fsproj \
    -c Release -r linux-x64 --no-self-contained \
    -o artifacts/console/
```

## Usage

```bash
./BioCheckConsoleMulti -model <model.json> -engine <ENGINE> [options]
```

### Engines

| Engine | Description |
|--------|-------------|
| `VMCAI` | Stability proof (synchronous) |
| `VMCAIASYNC` | Stability proof (asynchronous) |
| `SCM` | Shrink-Cut-Merge stability analysis |
| `SYN` | Stability synthesis / suggestion |
| `CAV` | LTL formula bounded model checking |
| `SIMULATE` | Simulate model evolution over time |
| `ATTRACTORS` | Find attractors |
| `FIXPOINT` | Find fixpoints |
| `PATH` | Find path between two states |
| `Describe` | Describe model variables |

### Examples

```bash
# Stability proof
./BioCheckConsoleMulti -model ToyModelUnstable.json -engine VMCAI -prove output.json

# Simulation (CSV output; Excel export not available in console on Linux — use BmaLinuxApi)
./BioCheckConsoleMulti -model ToyModelStable.json -engine SIMULATE \
  -simulate_v0 init.csv -simulate_time 20 -simulate output.csv

# Describe model variables
./BioCheckConsoleMulti -model model.json -engine Describe -type All
```

### Full argument reference

```
-model <file.json>              Input model file
-modelsdir <dir>                Directory containing the model file
-engine <ENGINE>                Analysis engine (see table above)
-log                            Enable debug logging
-loglevel <n>                   Log verbosity level
-prove <output.json>            Output file for VMCAI/SCM proof
-simulate <output.csv>          Output file for SIMULATE
-simulate_v0 <init.csv>         Initial state CSV for SIMULATE
-simulate_time <n>              Number of simulation steps (default: 20)
-formula <f>                    LTL formula for CAV engine
-path <n>                       Path length for CAV engine
-mc                             Model checking mode (CAV)
-out <file>                     Output file for ATTRACTORS/FIXPOINT
-async                          Asynchronous mode for ATTRACTORS
-initial <init.csv>             Initial state for ATTRACTORS
-fixpointout <file>             Output file for FIXPOINT
-fixpointscore <id^val,...>     Score condition for FIXPOINT
-model2 <file.json>             Second model for PATH engine
-state <init.csv>               Start state for PATH engine
-state2 <dest.csv>              Destination state for PATH engine
-ko <id> <const>                Knock-out a variable
-ko_edge <id> <id'> <const>     Knock-out an edge
-report <id,id,...>             Report specific variable values
-type [All|varid]               Description type for Describe engine
-tests                          Run unit tests
```

## Building the library DLLs (for pybma)

To build just the analysis library DLLs (e.g. for use with [pybma](https://github.com/hallba/pybma)):

```bash
# From the repository root — detects platform automatically (linux-x64, osx-arm64, osx-x64)
./build-library.sh
```

Output is placed in `artifacts/library/`. See [build-library.sh](../build-library.sh) for details.

## Notes

- Source files are **linked** from `../src/` — edit them there, not here. The `BmaLinux/` project files are the .NET 8 build configuration only.
- Excel export is not available in the console tool on Linux/macOS. Use [BmaLinuxApi](../src/BmaLinuxApi/) (the Docker web server) for Excel export via ClosedXML.
- `BioCheckConsoleMulti.sln` previously targeted `netcoreapp3.1`; it now targets `net8.0`.
