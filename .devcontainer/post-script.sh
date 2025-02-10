#!/bin/bash 
echo "Post script running..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TARGET_DIR="$SCRIPT_DIR/.."

git config --global --add safe.directory $TARGET_DIR

HOOKS_FILE="$TARGET_DIR/.scripts/install-hooks.sh"
if [ -f $HOOKS_FILE ]; then 
    chmod +x $HOOKS_FILE;
    $HOOKS_FILE; 
else
    echo "No file found $HOOKS_FILE";
fi

echo "Installing node modules" 
cd "$TARGET_DIR/frontend"
npm install  

echo "Post script finished successfully"
