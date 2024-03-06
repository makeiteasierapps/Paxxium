#!/bin/bash

# Path to the parent directory containing all function directories
FUNCTIONS_DIR="./functions"

# Iterate over each subdirectory in the functions directory
for dir in "$FUNCTIONS_DIR"/*; do
  if [ -d "$dir" ]; then
    # Check if the deploy script exists in this directory
    DEPLOY_SCRIPT="$dir/deployFunc.sh"
    if [ -f "$DEPLOY_SCRIPT" ]; then
      echo "Deploying function in $dir"
      # Make the script executable and run it
      chmod +x "$DEPLOY_SCRIPT"
      "$DEPLOY_SCRIPT"
    else
      echo "Deploy script not found in $dir"
    fi
  fi
done