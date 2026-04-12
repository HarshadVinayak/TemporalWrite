# Deployment Guide: TemporalWrite on Render

This guide explains how to deploy the production-ready **TemporalWrite** platform to Render using the pre-configured Blueprint.

## Prerequisites
1.  **Repo Access**: Ensure your repository is pushed to GitHub.
2.  **Render Account**: You must have an account at [render.com](https://render.com).

## 🚀 One-Click Deployment Setup

1.  **Create New Blueprint**:
    - Go to the Render Dashboard.
    - Click **"New +"** and select **"Blueprint"**.
    - Connect your GitHub repository.
2.  **Configuration**:
    - Render will automatically detect the `render.yaml` file.
    - It will ask you to confirm the service name and environment variables.
3.  **Environment Variables**:
    - You MUST provide the following keys in the Render Dashboard (get these from your `.env` file):
        - `OPENROUTER_API_KEY`
        - `GROQ_API_KEY`
        - `GEMINI_API_KEY`
4.  **Deploy**:
    - Click **"Apply"**. Render will start building the app.

## 📦 Why This Configuration?

- **Standalone Mode**: We've configured Next.js to build in `standalone` mode. This creates a highly optimized server that only includes the files needed for production, significantly reducing the RAM footprint.
- **Asset Syncing**: The build command automatically mirrors your `public` assets and `.next/static` chunks into the standalone directory so Render can serve them alongside the app.

## 🛠️ Maintenance
- **Auto-Deploy**: Every time you `git push` to `main`, Render will automatically rebuild and redeploy your changes.
- **Logs**: You can view real-time logs in the Render dashboard under the **Events** or **Logs** tab of the `temporal-write` service.

---
**TemporalWrite is ready to travel through time in the cloud!**
