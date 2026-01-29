# Quick Start Guide: Linux Modernization

## Prerequisites

- .NET 8 SDK ([download](https://dotnet.microsoft.com/download/dotnet/8.0))
- Node.js 18+ (for frontend build)
- Linux VM or WSL2 for testing (Ubuntu 22.04 recommended)
- Git

## Development Environment Setup

### 1. Clone and Prepare Repository

```bash
git clone <repository-url>
cd BioModelAnalyzerFrk
```

### 2. Verify .NET 8 Installation

```bash
dotnet --version
# Should output 8.0.x
```

### 3. Build Existing BmaLinux (Baseline)

```bash
cd BmaLinux
dotnet build BioCheckConsoleMulti.sln
./BioCheckConsoleMulti/bin/Debug/netcoreapp3.1/BioCheckConsoleMulti -model BioCheckConsoleMulti/ToyModelUnstable.json -engine SCM
```

This verifies the existing code works before starting modifications.

## Implementation Workflow

### Phase 1: Upgrade to .NET 8

```bash
# From repository root
cd BmaLinux

# Update target frameworks (manual edit of .fsproj/.csproj files)
# Change: <TargetFramework>netcoreapp3.1</TargetFramework>
# To:     <TargetFramework>net8.0</TargetFramework>

# Build and test
dotnet build BioCheckConsoleMulti.sln
dotnet test

# Run CLI test
./BioCheckConsoleMulti/bin/Debug/net8.0/BioCheckConsoleMulti -model BioCheckConsoleMulti/ToyModelUnstable.json -engine SCM
```

### Phase 2: Create ASP.NET Core Project

```bash
# From repository root
cd src

# Create new web project
dotnet new web -n BmaLinuxApi -f net8.0
cd BmaLinuxApi

# Add project references
dotnet add reference ../../BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj
dotnet add reference ../../BmaLinux/BioCheckAnaylzerCommonMulti/BioCheckAnaylzerCommonMulti.csproj

# Add required packages
dotnet add package ClosedXML
dotnet add package Swashbuckle.AspNetCore

# Build
dotnet build
```

### Phase 3: Build Frontend

```bash
# From repository root
cd src/bma.package

# Install dependencies
npm install

# Build
npm run build  # or: npx grunt

# Copy to wwwroot
cp -r ../bma.client/* ../BmaLinuxApi/wwwroot/
```

### Phase 4: Run and Test

```bash
# From repository root
cd src/BmaLinuxApi

# Run in development mode
dotnet run

# Open browser to http://localhost:8080
```

### Phase 5: Publish for Production

```bash
# From repository root
dotnet publish src/BmaLinuxApi -c Release -r linux-x64 --self-contained true -p:PublishSingleFile=true

# Output: src/BmaLinuxApi/bin/Release/net8.0/linux-x64/publish/BmaLinuxApi
```

## Testing Commands

### Run API Contract Tests

```bash
# Install schemathesis (Python)
pip install schemathesis

# Test against OpenAPI spec
schemathesis run .specify/specs/001-linux-modernization/contracts/api-spec.yaml --base-url http://localhost:8080/api
```

### Run Regression Tests

```bash
# Compare with test data
cd src/BmaTests.Common

# For each test model:
curl -X POST http://localhost:8080/api/Analyze \
  -H "Content-Type: application/json" \
  -d @Analysis/SomeModel_request.json \
  > actual_response.json

diff expected_response.json actual_response.json
```

### Test on Fresh Linux VM

```bash
# Copy single executable to VM
scp publish/BmaLinuxApi user@linux-vm:/opt/bma/

# SSH to VM and run
ssh user@linux-vm
cd /opt/bma
./BmaLinuxApi

# Test from another terminal
curl http://linux-vm:8080/api/Analyze -X POST -H "Content-Type: application/json" -d '{"Model":{"Name":"test","Variables":[],"Relationships":[]}}'
```

## Troubleshooting

### Z3 Library Not Found

```bash
# Ensure native libraries are included
dotnet publish -r linux-x64 --self-contained true

# Or install Z3 system-wide on Linux
sudo apt install libz3-4
```

### Frontend Not Loading

```bash
# Check static files are in wwwroot
ls src/BmaLinuxApi/wwwroot/

# Verify UseStaticFiles() is configured in Program.cs
```

### Port Already in Use

```bash
# Change port in appsettings.json or via environment variable
ASPNETCORE_URLS=http://0.0.0.0:5000 ./BmaLinuxApi
```

## Useful Links

- [.NET 8 Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- [ASP.NET Core Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis)
- [ClosedXML Documentation](https://closedxml.github.io/ClosedXML/)
- [Microsoft.Z3 NuGet](https://www.nuget.org/packages/Microsoft.Z3/)
