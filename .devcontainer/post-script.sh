#!/bin/bash 
echo "Post script running..."

TARGET_DIR=/workspaces/notatdelingsplattform

git config --global --add safe.directory /workspace

if [ -f .scripts/install-hooks.sh ]; then 
    chmod +x "$TARGET_DIR/.scripts/install-hooks.sh";
    "$TARGET_DIR/.scripts/install-hooks.sh"; 
fi

echo "Installing node modules" 
cd "$TARGET_DIR/frontend"
npm install  

echo "Post script finished successfully"