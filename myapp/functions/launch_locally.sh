#!/bin/bash

# Path to the current directory, assuming this script is inside the functions directory
FUNCTIONS_DIR=$(pwd)
PORT=50000

lsof -ti:50000-50007 | xargs kill

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

# Iterate over each subdirectory in the current directory
for dir in "$FUNCTIONS_DIR"/*; do
  if [ -d "$dir" ]; then
    # Extract the function name from the directory path
    FUNCTION_NAME=$(basename "$dir")
    
    # Check if the main.py file exists in this directory
    MAIN_PY="$dir/main.py"
    if [ -f "$MAIN_PY" ]; then
      echo "Starting function $FUNCTION_NAME on port $PORT"
      # Start the function locally in the background
      (cd "$dir" && functions-framework --target="$FUNCTION_NAME" --port="$PORT" --debug &)
      # Increment the port number for the next function
      PORT=$((PORT + 1))
    else
      echo "main.py not found in $dir"
    fi
  fi
done

# Wait for any function to exit
wait