#!/bin/bash
# Creates a new feature specification directory from templates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPECIFY_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "$1" ]; then
    echo "Usage: $0 <feature-name>"
    echo "Example: $0 authentication"
    exit 1
fi

FEATURE_NAME="$1"

# Find next feature number
LAST_NUM=$(ls -d "$SPECIFY_DIR/specs/"[0-9]* 2>/dev/null | sort -r | head -1 | grep -oP '\d+' | head -1)
if [ -z "$LAST_NUM" ]; then
    NEXT_NUM="001"
else
    NEXT_NUM=$(printf "%03d" $((10#$LAST_NUM + 1)))
fi

FEATURE_DIR="$SPECIFY_DIR/specs/${NEXT_NUM}-${FEATURE_NAME}"

echo "Creating feature directory: $FEATURE_DIR"
mkdir -p "$FEATURE_DIR/contracts"

# Copy templates
cp "$SPECIFY_DIR/templates/spec-template.md" "$FEATURE_DIR/spec.md"
cp "$SPECIFY_DIR/templates/plan-template.md" "$FEATURE_DIR/plan.md"
cp "$SPECIFY_DIR/templates/tasks-template.md" "$FEATURE_DIR/tasks.md"
cp "$SPECIFY_DIR/templates/research-template.md" "$FEATURE_DIR/research.md"

# Replace placeholders
sed -i "s/\[Feature Name\]/${FEATURE_NAME}/g" "$FEATURE_DIR"/*.md

echo "Created feature specification at: $FEATURE_DIR"
echo ""
echo "Next steps:"
echo "1. Edit $FEATURE_DIR/spec.md to define requirements"
echo "2. Edit $FEATURE_DIR/plan.md to design the solution"
echo "3. Edit $FEATURE_DIR/tasks.md to break down implementation"
