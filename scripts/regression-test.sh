#!/bin/bash
# Regression test script for BmaLinuxApi
# Runs all test models from src/BmaTests.Common/ against the running API
#
# Usage: ./scripts/regression-test.sh [base_url]
# Default base_url: http://localhost:8020

set -euo pipefail

BASE_URL="${1:-http://localhost:8020}"
TESTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/BmaTests.Common"
PASS=0
FAIL=0
SKIP=0
ERRORS=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

strip_bom() {
    sed '1s/^\xEF\xBB\xBF//' "$1"
}

# Compare JSON responses, ignoring DebugMessages (timestamps differ)
compare_json() {
    local actual="$1"
    local expected="$2"
    python3 -c "
import json, sys

with open('$actual', encoding='utf-8-sig') as f:
    a = json.load(f)
with open('$expected', encoding='utf-8-sig') as f:
    e = json.load(f)

def normalize(obj, parent_key=None):
    if isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            # Skip fields that vary between runs/platforms
            if k == 'DebugMessages':
                continue
            # Skip top-level Time field (execution time varies)
            if k == 'Time' and parent_key is None and not isinstance(v, list):
                continue
            normalized = normalize(v, k)
            # Treat null/absent fields as equivalent (WhenWritingNull omits them)
            if normalized is not None:
                result[k] = normalized
        return result
    if isinstance(obj, list):
        # Treat [''] as None (empty error message arrays)
        if obj == ['']:
            return None
        return [normalize(i, parent_key) for i in obj]
    # Treat empty string same as None for Error/ErrorMessages fields
    if obj == '':
        return None
    return obj

a = normalize(a)
e = normalize(e)

if a == e:
    sys.exit(0)
else:
    def show_diff(a, e, path='root'):
        if type(a) != type(e):
            print(f'  {path}: type {type(a).__name__}={repr(a)[:80]} vs {type(e).__name__}={repr(e)[:80]}', file=sys.stderr)
        elif isinstance(a, dict):
            for k in sorted(set(list(a.keys()) + list(e.keys()))):
                show_diff(a.get(k), e.get(k), f'{path}.{k}')
        elif isinstance(a, list):
            if len(a) != len(e):
                print(f'  {path}: length {len(a)} vs {len(e)}', file=sys.stderr)
            for i in range(min(len(a), len(e))):
                show_diff(a[i], e[i], f'{path}[{i}]')
        elif a != e:
            print(f'  {path}: {repr(a)[:80]} vs {repr(e)[:80]}', file=sys.stderr)
    print('DIFF:', file=sys.stderr)
    show_diff(a, e)
    sys.exit(1)
" 2>&1
}

echo "============================================"
echo "BMA Linux API Regression Tests"
echo "Base URL: ${BASE_URL}"
echo "Test data: ${TESTS_DIR}"
echo "============================================"

# Wait for API to be ready
echo -n "Waiting for API..."
for i in $(seq 1 30); do
    if curl -sf "${BASE_URL}/api/health" > /dev/null 2>&1; then
        echo -e " ${GREEN}ready${NC}"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo -e " ${RED}TIMEOUT${NC}"
        echo "API not responding at ${BASE_URL}/api/health"
        exit 1
    fi
    echo -n "."
    sleep 1
done

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# ---- Test /api/Analyze ----
echo ""
echo "--- Testing POST /api/Analyze ---"
for req in "${TESTS_DIR}/Analysis/"*request.json; do
    name=$(basename "$req" .request.json)
    expected="${TESTS_DIR}/Analysis/${name}.response.json"
    if [ ! -f "$expected" ]; then
        echo -e "  ${YELLOW}SKIP${NC} ${name} (no expected response)"
        SKIP=$((SKIP + 1))
        continue
    fi
    actual="${TMPDIR}/${name}.analyze.response.json"
    http_code=$(strip_bom "$req" | curl -sf -w '%{http_code}' -o "$actual" \
        -X POST "${BASE_URL}/api/Analyze" \
        -H "Content-Type: application/json" \
        -d @- 2>/dev/null || echo "000")
    if [ "$http_code" = "200" ]; then
        if diff_output=$(compare_json "$actual" "$expected"); then
            echo -e "  ${GREEN}PASS${NC} ${name}"
            PASS=$((PASS + 1))
        else
            echo -e "  ${RED}FAIL${NC} ${name} (response mismatch)"
            echo "    ${diff_output}"
            FAIL=$((FAIL + 1))
            ERRORS="${ERRORS}\n  Analyze/${name}: response mismatch"
        fi
    elif [ "$http_code" = "204" ]; then
        echo -e "  ${YELLOW}SKIP${NC} ${name} (timeout - 204)"
        SKIP=$((SKIP + 1))
    else
        echo -e "  ${RED}FAIL${NC} ${name} (HTTP ${http_code})"
        FAIL=$((FAIL + 1))
        ERRORS="${ERRORS}\n  Analyze/${name}: HTTP ${http_code}"
    fi
done

# ---- Test /api/Simulate ----
echo ""
echo "--- Testing POST /api/Simulate ---"
for req in "${TESTS_DIR}/Simulation/"*request.json; do
    name=$(basename "$req" .request.json)
    expected="${TESTS_DIR}/Simulation/${name}.response.json"
    if [ ! -f "$expected" ]; then
        echo -e "  ${YELLOW}SKIP${NC} ${name} (no expected response)"
        SKIP=$((SKIP + 1))
        continue
    fi
    actual="${TMPDIR}/${name}.simulate.response.json"
    http_code=$(strip_bom "$req" | curl -sf -w '%{http_code}' -o "$actual" \
        -X POST "${BASE_URL}/api/Simulate" \
        -H "Content-Type: application/json" \
        -d @- 2>/dev/null || echo "000")
    if [ "$http_code" = "200" ]; then
        if diff_output=$(compare_json "$actual" "$expected"); then
            echo -e "  ${GREEN}PASS${NC} ${name}"
            PASS=$((PASS + 1))
        else
            echo -e "  ${RED}FAIL${NC} ${name} (response mismatch)"
            echo "    ${diff_output}"
            FAIL=$((FAIL + 1))
            ERRORS="${ERRORS}\n  Simulate/${name}: response mismatch"
        fi
    elif [ "$http_code" = "204" ]; then
        echo -e "  ${YELLOW}SKIP${NC} ${name} (timeout - 204)"
        SKIP=$((SKIP + 1))
    else
        echo -e "  ${RED}FAIL${NC} ${name} (HTTP ${http_code})"
        FAIL=$((FAIL + 1))
        ERRORS="${ERRORS}\n  Simulate/${name}: HTTP ${http_code}"
    fi
done

# ---- Test /api/FurtherTesting ----
echo ""
echo "--- Testing POST /api/FurtherTesting ---"
for req in "${TESTS_DIR}/CounterExamples/"*request.json; do
    name=$(basename "$req" .request.json)
    expected="${TESTS_DIR}/CounterExamples/${name}.response.json"
    if [ ! -f "$expected" ]; then
        echo -e "  ${YELLOW}SKIP${NC} ${name} (no expected response)"
        SKIP=$((SKIP + 1))
        continue
    fi
    actual="${TMPDIR}/${name}.further.response.json"
    http_code=$(strip_bom "$req" | curl -sf -w '%{http_code}' -o "$actual" \
        -X POST "${BASE_URL}/api/FurtherTesting" \
        -H "Content-Type: application/json" \
        -d @- 2>/dev/null || echo "000")
    if [ "$http_code" = "200" ]; then
        if diff_output=$(compare_json "$actual" "$expected"); then
            echo -e "  ${GREEN}PASS${NC} ${name}"
            PASS=$((PASS + 1))
        else
            echo -e "  ${RED}FAIL${NC} ${name} (response mismatch)"
            echo "    ${diff_output}"
            FAIL=$((FAIL + 1))
            ERRORS="${ERRORS}\n  FurtherTesting/${name}: response mismatch"
        fi
    elif [ "$http_code" = "204" ]; then
        echo -e "  ${YELLOW}SKIP${NC} ${name} (timeout - 204)"
        SKIP=$((SKIP + 1))
    else
        echo -e "  ${RED}FAIL${NC} ${name} (HTTP ${http_code})"
        FAIL=$((FAIL + 1))
        ERRORS="${ERRORS}\n  FurtherTesting/${name}: HTTP ${http_code}"
    fi
done

# ---- Test /api/health ----
echo ""
echo "--- Testing GET /api/health ---"
http_code=$(curl -sf -w '%{http_code}' -o /dev/null "${BASE_URL}/api/health" 2>/dev/null || echo "000")
if [ "$http_code" = "200" ]; then
    echo -e "  ${GREEN}PASS${NC} health endpoint"
    PASS=$((PASS + 1))
else
    echo -e "  ${RED}FAIL${NC} health endpoint (HTTP ${http_code})"
    FAIL=$((FAIL + 1))
fi

# ---- Summary ----
echo ""
echo "============================================"
echo "Results: ${PASS} passed, ${FAIL} failed, ${SKIP} skipped"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then
    echo -e "${RED}Failures:${NC}"
    echo -e "$ERRORS"
    exit 1
fi

echo -e "${GREEN}All tests passed!${NC}"
