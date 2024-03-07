#!/bin/bash

BOSS_AGENT_FILE="../../agents/BossAgent.py"
FIREBASE_SERVICE_FILE="../../services/firebase_service.py"
NEWS_SERVICE_FILE="../../services/news_service.py"
USER_SERVICES_FILE="../../services/user_services.py"
PROFILE_SERVICE_FILE="../../services/profile_service.py"

cp "$BOSS_AGENT_FILE" .
cp "$FIREBASE_SERVICE_FILE" .
cp "$NEWS_SERVICE_FILE" .
cp "$USER_SERVICES_FILE" .
cp "$PROFILE_SERVICE_FILE" .

gcloud functions deploy news \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=news_manager \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \