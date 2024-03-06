#!/bin/bash

# Deploy the auth_check function to Google Cloud Functions
gcloud functions deploy news \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=news_manager \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \