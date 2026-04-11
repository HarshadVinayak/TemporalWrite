#!/bin/bash

# TemporalWrite — Secret Manager Setup Script
# Moves local .env keys to Google Secret Manager for Firebase Functions security.

echo "🛡️ Hardening AI API Keys..."

# Extract keys from .env
GROQ_KEY=$(grep GROQ_API_KEY .env | cut -d '=' -f2)
OPENROUTER_KEY=$(grep OPENROUTER_API_KEY .env | cut -d '=' -f2)

if [ -z "$GROQ_KEY" ] || [ -z "$OPENROUTER_KEY" ]; then
    echo "❌ Error: Could not find keys in .env"
    exit 1
fi

# Set secrets in Firebase
# This requires the project to be on the Blaze plan
echo "📡 Sending GROQ_API_KEY to Secret Manager..."
printf $GROQ_KEY | firebase functions:secrets:set GROQ_API_KEY

echo "📡 Sending OPENROUTER_API_KEY to Secret Manager..."
printf $OPENROUTER_KEY | firebase functions:secrets:set OPENROUTER_API_KEY

echo "✅ Secret syncing complete. Secrets will be available in Cloud Functions."
