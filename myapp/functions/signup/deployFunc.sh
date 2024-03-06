#!/bin/bash

# Get the absolute path to the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define the path to the service files using absolute paths
FIREBASE_SERVICE_FILE="$SCRIPT_DIR/../../services/firebase_service.py"
USER_SERVICES_FILE="$SCRIPT_DIR/../../services/user_services.py"
PROFILE_SERVICE_FILE="$SCRIPT_DIR/../../services/profile_service.py"

# Copy the service files into the current directory
cp "$FIREBASE_SERVICE_FILE" "$SCRIPT_DIR"
cp "$USER_SERVICES_FILE" "$SCRIPT_DIR"
cp "$PROFILE_SERVICE_FILE" "$SCRIPT_DIR"

# Change to the script's directory to ensure the source path is correct
cd "$SCRIPT_DIR"

# Deploy the signup function to Google Cloud Functions
gcloud functions deploy signup \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=signup_manager \
  --region=us-west1 \
  --source="$SCRIPT_DIR" \
  --allow-unauthenticated \
  --timeout=540s \