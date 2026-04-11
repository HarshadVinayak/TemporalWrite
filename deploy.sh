#!/bin/bash

# TemporalWrite — Firebase Deployment Script
# This script automates the Next.js standalone build and Firebase Functions packaging.

echo "🚀 Starting TemporalWrite Build & Deploy..."

# 1. Build the Next.js app in standalone mode
echo "🏗️ Building Next.js standalone..."
npm run build

# 2. Prepare the functions directory
echo "📦 Packaging for Cloud Functions..."
# Ensure the destination exists
mkdir -p functions/next

# Copy standalone build assets
# .next/standalone contains the server and node_modules
# we specifically need the content of .next/standalone/ to be accessible by the function
cp -r .next/standalone/. functions/next/

# Copy static assets (public and .next/static) to the hosting public folder
# Although Firebase Hosting serves "public", Next.js standalone expects .next/static inside the standalone folder
# but for Firebase CDN, we put them in the hosting public folder for better performance.
cp -r public/. functions/next/public/
cp -r .next/static/. functions/next/.next/static/

# 3. Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting,functions

echo "✅ Deployment Complete! Check your TemporalWrite live URL."
