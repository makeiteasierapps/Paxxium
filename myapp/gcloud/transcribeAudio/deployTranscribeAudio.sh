#!/bin/bash

gcloud functions deploy transcribe-audio \
  --gen2 \
  --runtime=python312 \
  --trigger-http \
  --entry-point=transcribe_audio \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \

