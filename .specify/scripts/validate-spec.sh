#!/bin/bash
# Validates that a feature specification is complete

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPECIFY_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "$1" ]; then
    echo "Usage: $0 <feature-directory>"
    echo "Example: $0 001-linux-modernization"
    exit 1
fi

FEATURE_DIR="$SPECIFY_DIR/specs/$1"

if [ ! -d "$FEATURE_DIR" ]; then
    echo "Error: Feature directory not found: $FEATURE_DIR"
    exit 1
fi

echo "Validating feature specification: $1"
echo "=================================="

ERRORS=0

# Check required files
for file in spec.md plan.md tasks.md; do
    if [ -f "$FEATURE_DIR/$file" ]; then
        echo "✓ $file exists"

        # Check if file has content (more than just template)
        LINES=$(wc -l < "$FEATURE_DIR/$file")
        if [ "$LINES" -lt 20 ]; then
            echo "  ⚠ Warning: $file seems too short ($LINES lines)"
        fi
    else
        echo "✗ $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check for user stories in spec.md
if [ -f "$FEATURE_DIR/spec.md" ]; then
    US_COUNT=$(grep -c "^### US-" "$FEATURE_DIR/spec.md" || true)
    if [ "$US_COUNT" -gt 0 ]; then
        echo "✓ Found $US_COUNT user stories"
    else
        echo "⚠ Warning: No user stories found (expected ### US-XXX format)"
    fi
fi

# Check for tasks in tasks.md
if [ -f "$FEATURE_DIR/tasks.md" ]; then
    TASK_COUNT=$(grep -c "^### Task" "$FEATURE_DIR/tasks.md" || true)
    if [ "$TASK_COUNT" -gt 0 ]; then
        echo "✓ Found $TASK_COUNT tasks"
    else
        echo "⚠ Warning: No tasks found (expected ### Task X.X format)"
    fi
fi

# Check for API contract
if [ -f "$FEATURE_DIR/contracts/api-spec.yaml" ]; then
    echo "✓ API specification exists"
else
    echo "ℹ No API specification (contracts/api-spec.yaml)"
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
    echo "Validation failed with $ERRORS errors"
    exit 1
else
    echo "Validation passed"
fi
