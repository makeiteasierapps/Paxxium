#!/bin/bash

FIREBASE_SERVICE_FILE="../../services/firebase_service.py"

cp "$FIREBASE_SERVICE_FILE" .

gcloud functions deploy projects \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=projects \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \