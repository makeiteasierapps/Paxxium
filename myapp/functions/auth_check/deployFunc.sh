#!/bin/bash

# Get the absolute path to the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define the path to the firebase_service.py using an absolute path
SERVICE_FILE="$SCRIPT_DIR/../../services/firebase_service.py"

# Copy the firebase_service.py file into the current directory
cp "$SERVICE_FILE" "$SCRIPT_DIR"

# Change to the script's directory to ensure the source path is correct
cd "$SCRIPT_DIR"

# Deploy the function
gcloud functions deploy auth_check \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=check_authorization \
  --region=us-west1 \
  --source="$SCRIPT_DIR" \
  --allow-unauthenticated \
  --timeout=540s \