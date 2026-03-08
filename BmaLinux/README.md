# BmaLinux — Linux/Mac Console Tool

This is a standalone solution for the BMA command-line analysis tool. It can be built with MSBuild on Linux or macOS and does **not** require the prepare scripts used by the main web project. The directory can be moved independently for the build.

## Prerequisites

- [.NET SDK](https://learn.microsoft.com/en-us/dotnet/core/install/linux) (latest, e.g. via `apt` on Ubuntu):
  ```bash
  sudo apt-get install -y dotnet-sdk-8.0
  ```
- **Paket** (dependency manager, installed as a global .NET tool):
  ```bash
  dotnet tool install --global Paket
  ```
  Make sure `~/.dotnet/tools` is on your `PATH` after installing.

## Build Steps

Run these from the **repository root** (not the `BmaLinux` subdirectory):

```bash
# 1. Restore Paket dependencies (run from repo root)
paket install

# 2. Change into the BmaLinux directory
cd BmaLinux

# 3. Restore NuGet/project packages
dotnet restore

# 4. Build the release binary
dotnet msbuild BioCheckConsoleMulti.sln /p:Configuration=Release /p:Platform="x64" /t:Rebuild
```

## Output

The compiled executable is placed at:

```
BmaLinux/BioCheckConsoleMulti/bin/Release/netcoreapp3.1/BioCheckConsoleMulti
```

## Usage

```bash
./BioCheckConsoleMulti -model <model.json> -engine <ENGINE>
```

### Engines

| Engine | Description |
|--------|-------------|
| `SCM`  | Stability analysis (default) |
| `VMCAI`| VMCAI-style proof |

### Example

```bash
./BioCheckConsoleMulti -model ToyModelUnstable.json -engine SCM
```

### Full argument reference

```bash
./BioCheckConsoleMulti -model <model.json> -engine VMCAI -log -prove <prove.json>
```

## Notes

- This is separate from the **`BmaLinuxApi`** Docker-based web server. Use this tool for local command-line analysis; use the Docker server for the web frontend.
- The solution targets `netcoreapp3.1` — ensure an appropriate .NET runtime is installed if running on a machine that did not build the tool.
