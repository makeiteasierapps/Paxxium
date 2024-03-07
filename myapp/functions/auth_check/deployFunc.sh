#!/bin/bash

FIREBASE_SERVICE_FILE="../../services/firebase_service.py"

cp "$FIREBASE_SERVICE_FILE" .


gcloud functions deploy auth_check \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=check_authorization \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \