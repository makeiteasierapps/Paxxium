#!/bin/bash

# Deploy the auth_check function to Google Cloud Functions
gcloud functions deploy messages \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=messages_manager \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \