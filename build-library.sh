#!/usr/bin/env bash
# build-library.sh — Build BMA analysis library DLLs for use with pybma.
# Outputs managed DLLs + platform-native Z3 library to artifacts/library/.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/artifacts/library"

# Check for .NET SDK
if ! command -v dotnet &>/dev/null; then
    echo "Error: dotnet SDK not found. Install .NET 8 SDK from https://dotnet.microsoft.com/download"
    exit 1
fi

# Detect Runtime Identifier from host platform
case "$(uname -s)-$(uname -m)" in
    Linux-x86_64)   RID="linux-x64"  ;;
    Darwin-arm64)   RID="osx-arm64"  ;;
    Darwin-x86_64)  RID="osx-x64"    ;;
    *)
        echo "Unsupported platform: $(uname -s)-$(uname -m)"
        echo "Supported: Linux x86_64, macOS arm64 (Apple Silicon), macOS x86_64 (Intel)"
        exit 1
        ;;
esac

echo "Building BMA library for platform: $RID"
echo "Output: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

# Publish the analyzer library (includes all transitive managed deps)
dotnet publish \
    "${SCRIPT_DIR}/BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj" \
    -c Release \
    -r "$RID" \
    --no-self-contained \
    -o "$OUTPUT_DIR"

# Copy Z3 native library explicitly.
# The Microsoft.Z3 NuGet targets file only handles Windows by default,
# so we copy the correct platform native lib ourselves.
Z3_VERSION="4.11.2"
NUGET_CACHE=$(dotnet nuget locals global-packages --list 2>/dev/null | awk '{print $NF}' | tr -d '\r')
Z3_NATIVE_DIR="${NUGET_CACHE}/microsoft.z3/${Z3_VERSION}/runtimes/${RID}/native"

if [ -d "$Z3_NATIVE_DIR" ]; then
    cp "$Z3_NATIVE_DIR"/* "$OUTPUT_DIR/"
    echo "Copied Z3 native library from: $Z3_NATIVE_DIR"
else
    echo "Warning: Z3 native library not found at: $Z3_NATIVE_DIR"
    echo "Run 'dotnet restore ${SCRIPT_DIR}/BmaLinux/BioCheckAnalyzerMulti/BioCheckAnalyzerMulti.fsproj' first."
fi

echo ""
echo "Build complete."
echo ""
echo "Managed DLLs:"
ls -1 "$OUTPUT_DIR"/*.dll 2>/dev/null | xargs -I{} basename {} || echo "  (none found)"
echo ""
echo "Native libraries:"
ls -1 "$OUTPUT_DIR"/*.so "$OUTPUT_DIR"/*.dylib 2>/dev/null | xargs -I{} basename {} || echo "  (none found)"
