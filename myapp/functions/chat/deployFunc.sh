#!/bin/bash

FIREBASE_SERVICE_FILE="../../services/firebase_service.py"
CHAT_SERVICE_FILE="../../services/chat_services.py"

cp "$FIREBASE_SERVICE_FILE" .
cp "$CHAT_SERVICE_FILE" .

gcloud functions deploy chat \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=chat \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \