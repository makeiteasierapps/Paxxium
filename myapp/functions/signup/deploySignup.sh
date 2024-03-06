#!/bin/bash

gcloud functions deploy signup \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --entry-point=signup_manager \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --timeout=540s \

