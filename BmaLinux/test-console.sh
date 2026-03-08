#!/bin/bash
# BioModelAnalyzer Console App Test Script
# Tests the BioCheckConsoleMulti app after .NET 8 upgrade
# Runs all tests inside Docker container with .NET 8 SDK

set -e

# Configuration
DOCKER_IMAGE="mcr.microsoft.com/dotnet/sdk:8.0"
# Detect repo root (parent of BmaLinux directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKING_DIR="/src/BmaLinux"
PROJECT="BioCheckConsoleMulti"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
TOTAL=0

# Helper function to run dotnet commands in Docker
run_dotnet() {
    docker run --rm \
        -v "${REPO_ROOT}:/src" \
        -w "${WORKING_DIR}" \
        "${DOCKER_IMAGE}" \
        dotnet run --project "${PROJECT}" -- "$@"
}

# Helper function to run arbitrary commands in Docker
run_docker() {
    docker run --rm \
        -v "${REPO_ROOT}:/src" \
        -w "${WORKING_DIR}" \
        "${DOCKER_IMAGE}" \
        "$@"
}

# Test function - runs a test and checks output against expected pattern
# Usage: run_test "Test Name" "expected_pattern" [command args...]
run_test() {
    local test_name="$1"
    local expected_pattern="$2"
    shift 2

    TOTAL=$((TOTAL + 1))
    printf "[%d/%d] %s... " "$TOTAL" "$TOTAL_TESTS" "$test_name"

    # Run command and capture output
    local output
    local exit_code
    output=$(run_dotnet "$@" 2>&1) || exit_code=$?

    # Check if output matches expected pattern
    if echo "$output" | grep -qE "$expected_pattern"; then
        printf "${GREEN}PASS${NC}\n"
        PASS=$((PASS + 1))
        return 0
    else
        printf "${RED}FAIL${NC}\n"
        printf "  Expected pattern: %s\n" "$expected_pattern"
        printf "  Actual output: %s\n" "$output"
        FAIL=$((FAIL + 1))
        return 1
    fi
}

# Test function for file creation
# Usage: run_test_file "Test Name" "output_file" [command args...]
run_test_file() {
    local test_name="$1"
    local output_file="$2"
    shift 2

    TOTAL=$((TOTAL + 1))
    printf "[%d/%d] %s... " "$TOTAL" "$TOTAL_TESTS" "$test_name"

    # Clean up output file if exists
    local full_path="${REPO_ROOT}/BmaLinux/${output_file}"
    rm -f "$full_path"

    # Run command
    local output
    local exit_code=0
    output=$(run_dotnet "$@" 2>&1) || exit_code=$?

    # Check if file was created
    if [ -f "$full_path" ]; then
        printf "${GREEN}PASS${NC}\n"
        PASS=$((PASS + 1))
        # Clean up test output
        rm -f "$full_path"
        return 0
    else
        printf "${RED}FAIL${NC}\n"
        printf "  Expected file: %s\n" "$output_file"
        printf "  Exit code: %d\n" "$exit_code"
        printf "  Output: %s\n" "$output"
        FAIL=$((FAIL + 1))
        return 1
    fi
}

# Total number of tests (update this when adding tests)
TOTAL_TESTS=6

echo "=== BioModelAnalyzer Console Tests ==="
echo "Running in Docker: ${DOCKER_IMAGE}"
echo ""

# Ensure Docker image is available
echo "Pulling Docker image (if needed)..."
docker pull "${DOCKER_IMAGE}" > /dev/null 2>&1 || true
echo ""

# Build the project first
echo "Building project..."
run_docker dotnet build "${PROJECT}" -c Release --nologo -v q
echo ""

# Test 1: SCM engine with stable model
run_test "SCM engine - stable model" \
    "Single Stable Point" \
    -model BioCheckConsoleMulti/ToyModelStable.json -engine SCM

# Test 2: SCM engine with unstable model (expect bifurcation or cycle)
run_test "SCM engine - unstable model" \
    "(Multi Stable Points|Cycle)" \
    -model BioCheckConsoleMulti/ToyModelUnstable.json -engine SCM

# Test 3: VMCAI engine with stable model (creates output file)
run_test_file "VMCAI engine - stable model (file output)" \
    "vmcai_test_output.json" \
    -model BioCheckConsoleMulti/ToyModelStable.json -engine VMCAI -prove vmcai_test_output.json

# Test 4: SIMULATE engine (creates output CSV)
run_test_file "SIMULATE engine - creates output" \
    "simulate_test_output.csv" \
    -model BioCheckConsoleMulti/ToyModelStable.json -engine SIMULATE -simulate simulate_test_output.csv -simulate_time 5

# Test 5: Describe engine (should output variable info)
run_test "Describe engine - variable info" \
    "[0-9]+,(a|b|c),[0-9]+,[0-9]+" \
    -model BioCheckConsoleMulti/ToyModelStable.json -engine Describe

# Test 6: Help display (no model should show usage)
# Note: Must use --no-launch-profile to avoid launchSettings.json default args
TOTAL=$((TOTAL + 1))
printf "[%d/%d] Help display (usage message)... " "$TOTAL" "$TOTAL_TESTS"
output=$(docker run --rm \
    -v "${REPO_ROOT}:/src" \
    -w "${WORKING_DIR}" \
    "${DOCKER_IMAGE}" \
    dotnet run --project "${PROJECT}" --no-launch-profile 2>&1) || true
if echo "$output" | grep -q "Usage:"; then
    printf "${GREEN}PASS${NC}\n"
    PASS=$((PASS + 1))
else
    printf "${RED}FAIL${NC}\n"
    printf "  Expected: Usage message\n"
    printf "  Got: %s\n" "$output"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "=== Results: ${PASS}/${TOTAL_TESTS} passed ==="

# Exit with appropriate code
if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}${FAIL} test(s) failed${NC}"
    exit 1
fi
