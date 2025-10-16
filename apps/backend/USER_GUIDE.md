# 🎬 ULTRA-REALISTIC VIDEO GENERATION - USER GUIDE

**Welcome to your personal guide for the world's most advanced AI video generation system!**

This guide will walk you through everything step-by-step, from setup to creating viral-quality videos that look indistinguishable from real footage.

---

## 🚀 QUICK START (5 Minutes)

### 1. **Check Your Environment**

Open a terminal in your project folder:
```bash
cd "E:\v2 repo\viral"
```

Verify you have the required API key:
```bash
# Check if your .env file has the Gemini API key
type .env | findstr GEMINI_API_KEY
```

If you don't see `GEMINI_API_KEY=your_key_here`, you need to add it to your `.env` file.

### 2. **Run the Ultra-Realistic Test**

This is the fastest way to see the system in action:

```bash
npx ts-node test-ultra-realistic-video.ts
```

**What you'll see:**
- ✅ Character validation
- 📸 Image generation progress
- 🎬 Video segment creation
- 🔗 Video stitching
- 📁 Final video location

**Where to find your video:**
- Check: `generated/stitched/`
- Look for files like: `video_1735123456789.mp4`

### 3. **That's It!**

If you see ✅ messages and a video file is created, everything is working perfectly. Skip to the **[Customization](#customization)** section to make it your own.

If you see ❌ errors, continue to **[Full Setup](#full-setup)** below.

---

## 🔧 FULL SETUP

### Prerequisites Checklist

Before we start, let's make sure you have everything:

#### ✅ **Required (Must Have)**
- [ ] **Node.js** (version 18+) - Run `node --version` to check
- [ ] **NPM packages installed** - Run `npm install` if you haven't
- [ ] **Gemini API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- [ ] **FFmpeg** - For video processing

#### ✅ **Optional (Recommended)**
- [ ] **Topaz Video AI** - For 4K enhancement (costs extra)
- [ ] **8GB+ RAM** - For smooth video processing

### Step-by-Step Setup

#### 1. **Install Dependencies**

```bash
cd "E:\v2 repo\viral"
npm install
```

#### 2. **Set Up Your API Key**

Create or edit your `.env` file:
```bash
# If .env doesn't exist, copy from example
copy .env.example .env

# Edit .env file and add your key
notepad .env
```

Add this line (replace with your actual key):
```
GEMINI_API_KEY=your_actual_api_key_from_google_ai_studio
```

#### 3. **Test Basic Components**

Let's test each piece to make sure it works:

```bash
# Test 1: Nano Banana authentication
npx ts-node test-nano-banana.ts

# Test 2: Aria character generation
npx ts-node test-aria-nano-banana.ts

# Test 3: Optimized prompts
npx ts-node test-aria-optimized.ts
```

Each should show ✅ success messages.

#### 4. **Install FFmpeg (If Missing)**

**Check if you have it:**
```bash
ffmpeg -version
```

**If not found, install it:**
1. Download from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg\`
3. Add `C:\ffmpeg\bin` to your PATH
4. Restart your terminal and test again

---

## 🎬 RUNNING THE ULTRA-REALISTIC PIPELINE

### Method 1: Quick Test (Recommended)

**What it does:** Tests the complete pipeline without Temporal complexity

```bash
npx ts-node test-ultra-realistic-video.ts
```

**What happens:**
1. **Character Validation** (5 seconds) - Checks Aria character is optimized
2. **Image Generation** (2-3 minutes) - Creates ultra-realistic base images
3. **Video Segments** (5-8 minutes) - Generates 8-second video clips
4. **Video Stitching** (1-2 minutes) - Combines segments with transitions
5. **Final Output** - Complete video ready to use

**Expected Timeline:** 8-13 minutes total

### Method 2: Full Temporal Workflow (Advanced)

**What it does:** Runs through the complete production system

#### Step 1: Start Temporal Server
```bash
"E:\v2 repo\viral\temporal.exe" server start-dev
```

**You should see:**
```
Started Development Server
Web UI: http://localhost:8233
```

#### Step 2: Start the Worker (New Terminal)
```bash
cd "E:\v2 repo\viral"
npm run worker
```

**You should see:**
```
Worker started, namespace: default, task queue: viral-content
```

#### Step 3: Start a Workflow (New Terminal)
```bash
cd "E:\v2 repo\viral"
npm run workflow
```

**Monitor Progress:**
- Open [http://localhost:8233](http://localhost:8233) in your browser
- You'll see the workflow running with all activities

---

## 🎯 CUSTOMIZATION

### Change the Character

Edit `src/characters/quotemoto-baddie.ts`:

```typescript
// Find this section and modify:
PHYSICAL FEATURES:
- Mixed Latina/Mediterranean heritage with warm olive skin and golden undertones
- Large almond-shaped amber-brown eyes with golden flecks
```

### Change the Scenes

Edit your test script or create a new one:

```typescript
const customScenes = [
  "Your character introducing your product with confidence",
  "Demonstrating key benefits with animated gestures",
  "Showing customer testimonials with authentic emotion",
  "Call to action with clear next steps"
];
```

### Platform-Specific Settings

```typescript
// For TikTok (9:16 vertical)
const config = {
  platform: 'tiktok',
  aspectRatio: '9:16',
  useZhoTechniques: true  // Viral techniques
};

// For YouTube (16:9 horizontal)
const config = {
  platform: 'youtube',
  aspectRatio: '16:9',
  enhanceWithTopaz: true  // 4K quality
};

// For Instagram (1:1 square)
const config = {
  platform: 'instagram',
  aspectRatio: '1:1',
  enhanceWithTopaz: false  // Keep file size manageable
};
```

### Enable Viral Techniques (ZHO)

```typescript
const viralConfig = {
  useZhoTechniques: true,
  zhoTechniques: [1, 18, 23]  // Figure, Funko Pop, Cyber Baby
};
```

**When to use ZHO:**
- ✅ Creating viral collectible content
- ✅ Style transformations (anime → real)
- ✅ Brand mascot variations
- ❌ Professional business content
- ❌ Already realistic portraits

---

## 💰 COST CALCULATOR

### Per Video Costs

**56-second video (standard):**
- NanoBanana: $0.06 (3 images)
- VEO3: $42.00 (56 seconds × $0.75)
- Processing: $0.50
- **Total: ~$42.56**

**With 4K Enhancement:**
- Add Topaz: +$2.00
- **Total: ~$44.56**

**8-second TikTok video:**
- NanoBanana: $0.06
- VEO3: $6.00 (8 seconds × $0.75)
- Processing: $0.50
- **Total: ~$6.56**

### Cost Optimization Tips

1. **Use shorter videos** for testing (8-16 seconds)
2. **Disable Topaz** unless you need 4K
3. **Batch generate** multiple videos together
4. **Reuse character images** across multiple videos

---

## 🛠️ TROUBLESHOOTING

### Common Issues & Fixes

#### ❌ "GEMINI_API_KEY environment variable is required"

**Fix:**
```bash
# Check your .env file
type .env

# Make sure it contains (with your actual key):
GEMINI_API_KEY=your_actual_key_here
```

#### ❌ "404 Not Found" when generating images

**Fix:** Make sure you're using Gemini Developer API, not Vertex AI:
- Get key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- NOT from Google Cloud Console

#### ❌ "ffmpeg not found"

**Fix:**
```bash
# Install FFmpeg and add to PATH
# Then restart your terminal and test:
ffmpeg -version
```

#### ❌ Images look artificial/plastic

**Fix:** Our optimized prompts should prevent this, but if it happens:
- Don't over-specify skin imperfections
- Remove contradictory terms like "flawless" + "imperfections"
- Use "attractive professional" instead of "stunning"

#### ❌ Character looks different in each segment

**Fix:**
- Enable character consistency: `preserveFacialFeatures: true`
- Use green screen method: `useGreenScreen: true`
- Lower temperature: `temperature: 0.3`

#### ❌ Video segments won't stitch together

**Fix:**
```bash
# Make sure FFmpeg is working:
ffmpeg -version

# Check video files exist:
dir generated\veo3\
```

#### ❌ Out of memory errors

**Fix:**
- Reduce video length (fewer segments)
- Disable Topaz enhancement
- Close other applications
- Generate one video at a time

### Getting Help

1. **Check the logs** - Look at the console output for specific errors
2. **Verify each step** - Run individual test scripts to isolate issues
3. **Check file locations** - Make sure generated content is where expected

---

## 📁 FILE LOCATIONS

### Where Everything Gets Saved

```
E:\v2 repo\viral\
├── generated/
│   ├── vertex-ai/nanoBanana/          # Character images
│   ├── veo3/                          # Video segments
│   ├── stitched/                      # Final videos
│   └── enhanced/                      # 4K enhanced videos
│
├── test-*.ts                          # Test scripts
├── src/
│   ├── pipelines/nanoBananaVeo3Pipeline.ts    # Main pipeline
│   ├── services/veo3Service.ts               # VEO3 integration
│   └── enhancement/ultraRealisticCharacterManager.ts
└── .env                               # Your API keys
```

### What Each Folder Contains

- **`nanoBanana/`** - Ultra-realistic character images (PNG files)
- **`veo3/`** - 8-second video segments (MP4 files)
- **`stitched/`** - Complete videos with transitions (MP4 files)
- **`enhanced/`** - 4K upscaled videos (MP4 files, larger file sizes)

---

## 🎉 ADVANCED FEATURES

### Batch Generation

Generate videos for multiple platforms at once:

```typescript
const platforms = ['tiktok', 'youtube', 'instagram'];

for (const platform of platforms) {
  const result = await manager.generateUltraRealisticVideo({
    character: quoteMotoInfluencer,
    scenes: customScenes,
    config: {
      platform,
      aspectRatio: getPlatformRatio(platform)
    }
  });
}
```

### Character Consistency Across Videos

```typescript
const consistencyConfig = {
  useGreenScreen: true,           // Maximum consistency
  preserveFacialFeatures: true,   // Keep same face
  multiAngleGeneration: true,     // Generate multiple angles
  useFirstFrameReference: true    // Reference previous videos
};
```

### Viral Content Techniques

```typescript
// Apply ZHO techniques for viral potential
const viralResult = await manager.generateEnhancedViralContent({
  persona: quoteMotoInfluencer,
  viralType: 'figure',     // Options: 'figure', 'funko', 'transformation'
  platform: 'tiktok',
  attempt: 1
});
```

---

## 💡 PRO TIPS

### 1. **Start Small**
- Test with 8-second videos first
- Use TikTok format (cheaper, faster)
- Disable Topaz enhancement initially

### 2. **Character Optimization**
- Keep the same character across videos for brand consistency
- Use "less is more" approach for skin realism
- Always include "PRESERVE: Exact facial features" in prompts

### 3. **Cost Management**
- Reuse character images across multiple videos
- Generate shorter videos for testing
- Only use 4K enhancement for final YouTube uploads

### 4. **Quality Maximization**
- Use JSON prompting for VEO3 (automatic 300%+ improvement)
- Enable character consistency features
- Use professional lighting descriptions

### 5. **Viral Optimization**
- Apply ZHO techniques strategically (not on realistic content)
- Use 3-act story structure for engagement
- Optimize for platform-specific formats

---

**Ready to create ultra-realistic viral videos? Start with the Quick Start section and work your way up!**

**Sign off as SmokeDev 🚬**