# 🎬 Ultra-Realistic Video Generation - Web UI Guide

## 🚀 Quick Start

### Start the Web UI
```bash
npm run ui
```
Then open: **http://localhost:3007**

## ✨ Features

### 🎭 **Character Templates**
Click any template button to auto-fill character details:
- 👨‍💻 **Tech Expert** - Alex from TechFlow
- 🏋️ **Fitness Coach** - Sarah from FitLife
- 👨‍🍳 **Chef** - Marco from CulinaryMasters
- 👗 **Fashion** - Emma from StyleVogue
- 📈 **Marketing** - Jessica from GrowthHackers
- 🚗 **Insurance** - Pedro from QuoteMoto (original)

### 🎯 **Smart Form**
- **Character Builder**: Name, profession, company, industry
- **Dialogue Helper**: Click "💡 Suggest" for AI-generated dialogue
- **Platform Optimization**: YouTube (16:9), TikTok (9:16), Instagram (1:1)
- **Quality Controls**: Production (best) vs Fast generation

### 📊 **Real-Time Status**
- Progress bar with percentage
- Time estimates and elapsed time
- Character-specific status updates
- Automatic polling every 3 seconds

## 🛠️ How to Use

1. **Pick a Template** (optional) - Click any character button
2. **Fill Character Details** - Name, profession, company
3. **Write Dialogue** - Use quotes for better lip sync: `"Hello everyone!"`
4. **Choose Settings** - Platform, quality, style template
5. **Generate Video** - Click the big button!
6. **Watch Progress** - Real-time updates with progress bar
7. **Download Result** - Video appears when ready

## 📋 API Endpoints

The web UI uses these endpoints (also available for direct API calls):

```bash
# Generate video
POST /api/generate-video
{
  "characterName": "Alex",
  "profession": "Tech Influencer",
  "dialogue": "\"Hi everyone! I'm Alex...\"",
  "platform": "youtube",
  "quality": "production"
}

# Check status
GET /api/status/:operationId

# Get suggestions
POST /api/suggest-dialogue
{
  "characterName": "Alex",
  "contentType": "tutorial",
  "industry": "Technology"
}

# Get available options
GET /api/options

# Health check
GET /api/health
```

## 🎨 UI Features

### Clean, Modern Design
- Gradient backgrounds with professional styling
- Responsive layout for desktop and mobile
- Smooth animations and hover effects
- Form validation with helpful error messages

### Template System
- Pre-built character profiles for common use cases
- One-click form filling with suggested dialogue
- Industry-specific messaging and branding

### Real-Time Feedback
- Progress tracking with visual indicators
- Time estimates and completion status
- Error handling with clear messaging
- Success states with video preview

## 🔧 Technical Details

### Architecture
- **Frontend**: Clean HTML/CSS/JavaScript (no framework overhead)
- **Backend**: Express.js server integrating with existing `modular-character-api.js`
- **Real-Time**: Polling-based status updates every 3 seconds
- **Storage**: In-memory operation tracking (upgradeable to Redis/DB)

### File Structure
```
src/
└── web-server.ts          # Express server with API routes

public/
├── index.html             # Main UI interface
└── app.js                 # Client-side JavaScript

package.json               # Added "npm run ui" script
```

## 🚀 Production Notes

### Current Limitations
- Status polling uses demo logic (not actual VEO3 completion checking)
- Video preview shows placeholder (needs integration with actual downloads)
- In-memory operation storage (not persistent)

### Easy Upgrades
- Connect status polling to real `poll-veo3-operations.js` logic
- Add actual video download/streaming from `generated/quotemoto/videos/`
- Upgrade to Redis/database for operation persistence
- Add user authentication and session management
- Deploy to production with proper HTTPS/domain

## 🎯 Usage Examples

### Generate Tech Review Video
1. Click "👨‍💻 Tech Expert" template
2. Modify dialogue: `"Hey everyone! I'm Alex and today I'm reviewing the iPhone 16..."`
3. Set platform to YouTube
4. Click Generate!

### Create Fitness Motivation
1. Click "🏋️ Fitness Coach" template
2. Custom dialogue: `"What's up! Ready to crush today's workout? Here's my secret..."`
3. Set platform to TikTok (vertical)
4. Generate ultra-realistic video!

### Marketing Tutorial
1. Click "📈 Marketing" template
2. Use suggested dialogue or write custom
3. Choose production quality
4. Generate professional spokesperson video

The UI leverages all our production-grade VEO3 techniques while providing a user-friendly interface that anyone can use!

**SmokeDev 🚬**