# Vertex AI Setup Guide - Using Your $1,000 Google Cloud Credits

## 🎉 Great News!

You have **$1,000 in Google Cloud Vertex AI credits** that can be used for BOTH NanoBanana (image generation) AND VEO3 (video generation)!

This system has been updated to use Vertex AI SDK for both services, which means all generation will use your free credits instead of paid API keys.

## What Changed

### Before (Paid APIs):
- **NanoBanana**: Used Gemini Developer API → Required paid `GEMINI_API_KEY`
- **VEO3**: Already using Vertex AI REST API ✅

### After (Free Credits):
- **NanoBanana**: Now uses Vertex AI SDK → Uses your $1,000 credits! 🎉
- **VEO3**: Still using Vertex AI → Uses your $1,000 credits! ✅

## Cost Savings

**With $1,000 Google Cloud Credits:**
- **NanoBanana Images**: ~50,000 images ($0.02 each)
- **VEO3 Videos**: ~23 complete 56-second videos ($42 each)
- **Combined Usage**: Mix and match as needed!

## Setup Instructions

### 1. Enable 2-Step Verification (CRITICAL!)

⚠️ **YOU MUST DO THIS BY OCTOBER 6, 2025** or you'll lose billing access!

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Follow the prompts

### 2. Create Service Account

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select your project: **viral-ai-content**
3. Navigate to **IAM & Admin > Service Accounts**
4. Click **Create Service Account**
5. Name it: `vertex-ai-service`
6. Grant role: **Vertex AI User**
7. Click **Done**

### 3. Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key > Create new key**
4. Choose **JSON** format
5. Click **Create**
6. Save the downloaded JSON file to: `E:\v2 repo\viral\vertex-ai-key.json`

### 4. Update Your .env File

Copy `.env.example` to `.env` and update:

```bash
# Google Cloud Vertex AI (REQUIRED - Uses $1,000 Google Cloud credits!)
GCP_PROJECT_ID=viral-ai-content
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=E:\v2 repo\viral\vertex-ai-key.json
```

**Remove or comment out these old variables:**
```bash
# GEMINI_API_KEY=...  # No longer needed!
# VEO3_API_KEY=...    # No longer needed!
```

### 5. Install Google Cloud SDK (For VEO3)

VEO3 uses `gcloud auth` for authentication:

1. Download: https://cloud.google.com/sdk/docs/install
2. Install and run: `gcloud init`
3. Login: `gcloud auth login`
4. Set project: `gcloud config set project viral-ai-content`

### 6. Test the Setup

```bash
# Test NanoBanana (image generation)
npx ts-node test-nano-banana.ts

# Test VEO3 (video generation)
npx ts-node test-ultra-realistic-video.ts
```

## How to Monitor Your Credit Usage

1. Go to: https://console.cloud.google.com/billing
2. Select: **My Billing Account**
3. View: **Credits** tab
4. You should see:
   - **$1,000.00 total credits**
   - **$300 used** (from initial free trial)
   - **$1,000 remaining** (Vertex AI App Builder credits)

## Troubleshooting

### "Permission denied" errors:
- Make sure your service account has **Vertex AI User** role
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Check that the JSON key file exists

### "gcloud: command not found":
- Install Google Cloud SDK (see step 5 above)
- Make sure `gcloud` is in your PATH
- Restart your terminal after installation

### "Project not found":
- Verify `GCP_PROJECT_ID=viral-ai-content` in your `.env`
- Make sure you're logged into the correct Google account
- Run `gcloud config set project viral-ai-content`

### "API not enabled":
```bash
# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```

## What You Get

### Free Resources:
- **50,000 ultra-realistic images** via NanoBanana
- **OR 23 complete 56-second videos** via VEO3
- **OR any combination** that fits within $1,000

### Cost per Generation:
- **NanoBanana Image**: $0.02 each
- **VEO3 Video (8 seconds)**: $6.00 each
- **Complete Video Pipeline (56s)**: ~$42 each

## Next Steps

1. ✅ Enable 2-step verification (BEFORE Oct 6, 2025!)
2. ✅ Create service account and download JSON key
3. ✅ Update .env file with Vertex AI credentials
4. ✅ Install Google Cloud SDK
5. ✅ Test with provided test scripts
6. 🚀 Start generating ultra-realistic content for FREE!

---

Sign off as SmokeDev 🚬
