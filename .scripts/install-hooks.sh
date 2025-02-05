#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_SOURCE_DIR="$SCRIPT_DIR/hooks"
TEMPLATES_DIR="$SCRIPT_DIR/templates"

# Find Git root directory
GIT_ROOT=$(git rev-parse --git-dir)
if [ $? -ne 0 ]; then
    echo "Error: Not a git repository"
    exit 1
fi

GIT_HOOKS_DIR="$GIT_ROOT/hooks"

mkdir -p "$GIT_HOOKS_DIR"
mkdir -p "$TEMPLATES_DIR"

# Copy and set up the hooks
echo "Installing git hooks..."
cp "$HOOKS_SOURCE_DIR/prepare-commit-msg" "$GIT_HOOKS_DIR/prepare-commit-msg"
cp "$HOOKS_SOURCE_DIR/commit-msg" "$GIT_HOOKS_DIR/commit-msg"
chmod +x "$GIT_HOOKS_DIR/prepare-commit-msg"
chmod +x "$GIT_HOOKS_DIR/commit-msg"

# Set up the commit message template
echo "Setting up commit message template..."
cp "$TEMPLATES_DIR/.gitmessage" "$GIT_ROOT/../.gitmessage"
git config commit.template .gitmessage

echo "Git hooks and commit template installed successfully!"
echo "Hooks installed in: $GIT_HOOKS_DIR"
echo "Template installed in: $GIT_ROOT/../.gitmessage"