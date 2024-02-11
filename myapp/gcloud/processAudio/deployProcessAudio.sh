#!/bin/bash

gcloud functions deploy process-audio \
  --gen2 \
  --runtime=python312 \
  --trigger-http \
  --entry-point=process_audio \
  --region=us-west1 \
  --source=. \
  --allow-unauthenticated \
  --set-env-vars=OPENAI_API_KEY=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

