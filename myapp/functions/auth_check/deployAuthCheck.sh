#!/bin/bash

# Deploy the auth_check function to Google Cloud Functions
gcloud functions deploy auth_check \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=check_authorization \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \