# Logo Overlay Service Documentation

## Overview
Professional logo overlay service for AI-generated videos using FFmpeg post-processing. This is a **templated, reusable module** that works with any video and any logo.

## Architecture
- **Service**: HTTP API via omega-service.js (port 3007)
- **Engine**: VEO3 generation wrapper with FFmpeg post-processing
- **Format**: PNG logos with transparency support
- **Quality**: Broadcast-grade (CRF 23, yuv420p color space)

## API Usage

### Endpoint
```
POST http://localhost:3007/api/generate-veo3
```

### Request Body
```javascript
{
  "prompt": "Your video generation prompt",
  "videoModel": "veo-3.0-fast",
  "duration": 8,

  // Logo overlay parameters (all optional)
  "addLogo": true,                    // Enable logo overlay
  "logoPath": "/path/to/logo.png",    // Path to PNG logo file
  "logoPosition": "bottom-right",     // Position on video
  "logoSize": 150,                    // Logo width in pixels
  "logoOpacity": 0.9                  // Transparency (0.0 to 1.0)
}
```

### Parameters

#### Required
- `prompt`: Video generation prompt
- `videoModel`: VEO3 model ("veo-3.0-fast" or "veo-3.0-json")
- `duration`: Video length (4, 6, or 8 seconds)

#### Logo Overlay (Optional)
- `addLogo` (boolean): Enable logo overlay (default: auto-detect from prompt)
- `logoPath` (string): Absolute path to PNG logo file
  - Default: `E:\v2 repo\omega-platform\public\quotemoto-black-logo.png`
  - **Use any PNG logo file with transparency**
- `logoPosition` (string): Logo placement
  - Options: `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`, `"center"`
  - Default: `"bottom-right"`
- `logoSize` (number): Logo width in pixels (height auto-scales)
  - Default: `150`
  - Recommended: 100-300 for standard videos
- `logoOpacity` (number): Transparency level
  - Range: `0.0` (invisible) to `1.0` (opaque)
  - Default: `0.9`

## Usage Examples

### Example 1: QuoteMoto Insurance Video
```javascript
const response = await fetch('http://localhost:3007/api/generate-veo3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Professional insurance advisor explaining car insurance savings",
    videoModel: "veo-3.0-fast",
    duration: 8,
    addLogo: true,
    logoPath: "E:\\v2 repo\\omega-platform\\public\\quotemoto-black-logo.png",
    logoPosition: "bottom-right",
    logoSize: 150,
    logoOpacity: 0.9
  })
});
```

### Example 2: Tech Company Product Demo
```javascript
const response = await fetch('http://localhost:3007/api/generate-veo3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Software engineer demonstrating new AI features",
    videoModel: "veo-3.0-fast",
    duration: 8,
    addLogo: true,
    logoPath: "C:\\brands\\techcorp-white-logo.png",
    logoPosition: "top-left",
    logoSize: 200,
    logoOpacity: 1.0
  })
});
```

### Example 3: Fitness Brand Workout Video
```javascript
const response = await fetch('http://localhost:3007/api/generate-veo3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Athletic trainer showing exercise routine",
    videoModel: "veo-3.0-fast",
    duration: 8,
    addLogo: true,
    logoPath: "/logos/fitlife-transparent.png",
    logoPosition: "center",
    logoSize: 120,
    logoOpacity: 0.7
  })
});
```

### Example 4: No Logo (Disable Auto-Detection)
```javascript
const response = await fetch('http://localhost:3007/api/generate-veo3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "QuoteMoto insurance video",  // Would auto-enable logo
    videoModel: "veo-3.0-fast",
    duration: 8,
    addLogo: false  // Explicitly disable
  })
});
```

## Auto-Detection Feature

The service automatically enables logo overlay for prompts containing:
- "quotemoto" (case-insensitive)
- "insurance" (case-insensitive)

**Override behavior:**
- Set `addLogo: false` to explicitly disable
- Set `addLogo: true` to explicitly enable
- Omit `addLogo` to use auto-detection

## Logo File Requirements

### Format
- **PNG with transparency** (RGBA format recommended)
- High-resolution source (1000px+ width for quality scaling)
- Clean transparent background (no white backgrounds)

### Recommended Specifications
- File format: PNG with alpha channel
- Minimum resolution: 500px width
- Recommended resolution: 1000-2000px width
- File size: Under 5MB for optimal processing speed

### Preparing Your Logo
```bash
# Convert logo to PNG with transparency (ImageMagick)
magick convert logo.jpg -background none -alpha on logo.png

# Resize logo for web (maintain aspect ratio)
magick convert logo.png -resize 1200x logo-optimized.png
```

## Technical Details

### FFmpeg Processing
The service uses professional-grade FFmpeg settings:

```
-filter_complex [1:v]scale={size}:-1,format=rgba,colorchannelmixer=aa={opacity}[logo];
                [0:v][logo]overlay={position}:format=auto,format=yuv420p[outv]
-c:v libx264
-preset medium
-crf 23
-c:a copy
```

**Key features:**
- Scale logo while preserving aspect ratio
- Apply opacity with alpha channel mixer
- Overlay at calculated position
- yuv420p color space for universal compatibility
- CRF 23 encoding (broadcast quality)
- Audio copied without re-encoding

### Position Calculations
```typescript
const positionMap = {
  'top-left': '25:25',                    // 25px from top-left corner
  'top-right': 'W-w-25:25',              // 25px from top-right corner
  'bottom-left': '25:H-h-25',            // 25px from bottom-left corner
  'bottom-right': 'W-w-25:H-h-25',       // 25px from bottom-right corner (default)
  'center': '(W-w)/2:(H-h)/2'            // Perfect center
};
```
- `W` = video width
- `H` = video height
- `w` = logo width (after scaling)
- `h` = logo height (after scaling)

### Output Files
- Original video: `{timestamp}_veo3.mp4`
- Branded video: `{timestamp}_veo3_branded.mp4`
- Location: `E:\v2 repo\omega-platform\public\generated\veo3\`

## Error Handling

### Logo File Not Found
```json
{
  "success": false,
  "error": "Logo file not found: /path/to/logo.png"
}
```
**Solution**: Verify logo path is absolute and file exists

### FFmpeg Processing Error
```json
{
  "success": false,
  "error": "FFmpeg failed with code 1: ..."
}
```
**Solution**: Check FFmpeg is installed and logo is valid PNG

### Graceful Degradation
If logo overlay fails, the service returns the **unbranded video** with a warning:
```
⚠️ Logo overlay failed, using original video: {error}
```

## Integration Examples

### Next.js Frontend Integration
```typescript
// app/components/VideoGenerator.tsx
'use client';

import { useState } from 'react';

export default function VideoGenerator() {
  const [operationId, setOperationId] = useState<string | null>(null);

  const generateVideo = async () => {
    const response = await fetch('/api/generate-veo3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Professional insurance advisor explaining car insurance",
        videoModel: "veo-3.0-fast",
        duration: 8,
        addLogo: true,
        logoPath: "/logos/company-logo.png",
        logoPosition: "bottom-right"
      })
    });

    const data = await response.json();
    setOperationId(data.operationId);
  };

  return (
    <div>
      <button onClick={generateVideo}>Generate Branded Video</button>
      {operationId && <p>Operation ID: {operationId}</p>}
    </div>
  );
}
```

### Node.js Script Integration
```javascript
// generate-branded-video.js
const fetch = require('node-fetch');

async function generateBrandedVideo(config) {
  const response = await fetch('http://localhost:3007/api/generate-veo3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: config.prompt,
      videoModel: 'veo-3.0-fast',
      duration: 8,
      addLogo: true,
      logoPath: config.logoPath,
      logoPosition: config.logoPosition || 'bottom-right',
      logoSize: config.logoSize || 150,
      logoOpacity: config.logoOpacity || 0.9
    })
  });

  return await response.json();
}

// Usage
generateBrandedVideo({
  prompt: "Product demonstration video",
  logoPath: "/path/to/brand-logo.png",
  logoPosition: "top-right",
  logoSize: 200
}).then(result => {
  console.log('Video generated:', result);
});
```

### Batch Processing Multiple Brands
```typescript
// batch-brand-videos.ts
import fetch from 'node-fetch';

const brands = [
  {
    name: 'QuoteMoto',
    logoPath: 'E:\\v2 repo\\omega-platform\\public\\quotemoto-black-logo.png',
    prompt: 'Insurance advisor explaining car insurance savings'
  },
  {
    name: 'TechCorp',
    logoPath: 'C:\\brands\\techcorp-logo.png',
    prompt: 'Software engineer demonstrating AI features'
  },
  {
    name: 'FitLife',
    logoPath: '/logos/fitlife-logo.png',
    prompt: 'Personal trainer showing workout routine'
  }
];

async function generateBrandedVideos() {
  for (const brand of brands) {
    console.log(`Generating video for ${brand.name}...`);

    const response = await fetch('http://localhost:3007/api/generate-veo3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: brand.prompt,
        videoModel: 'veo-3.0-fast',
        duration: 8,
        addLogo: true,
        logoPath: brand.logoPath,
        logoPosition: 'bottom-right',
        logoSize: 150
      })
    });

    const result = await response.json();
    console.log(`${brand.name} operation ID:`, result.operationId);
  }
}

generateBrandedVideos();
```

## Performance

### Processing Time
- VEO3 generation: ~2 minutes
- FFmpeg logo overlay: ~5-15 seconds
- **Total**: ~2-2.5 minutes per video

### Resource Usage
- CPU: Medium (FFmpeg encoding)
- RAM: ~1-2GB during processing
- Disk: Original video + branded video (~2x space)

### Optimization Tips
1. Use smaller logo files (under 2MB) for faster processing
2. Pre-optimize logos to desired resolution
3. Consider logo caching for repeated brands
4. Batch process videos to amortize startup time

## Troubleshooting

### Issue: Logo appears pixelated
**Solution**: Use higher-resolution source logo (1000px+ width)

### Issue: Logo position incorrect
**Solution**: Verify position parameter matches desired location:
- `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`, `"center"`

### Issue: Logo too transparent/opaque
**Solution**: Adjust `logoOpacity` parameter (0.0 to 1.0)

### Issue: Video quality degraded
**Solution**: Check FFmpeg settings (CRF 23 is default, lower = higher quality)

### Issue: Logo not appearing
**Solution**:
1. Verify `addLogo: true`
2. Check logo file exists at `logoPath`
3. Ensure PNG has transparency (not white background)
4. Check omega-service logs for errors

## Advanced Features

### Dynamic Logo Positioning (Coming Soon)
Track object movement and position logo dynamically:
```javascript
{
  "logoTracking": {
    "enabled": true,
    "trackTarget": "face",  // Track face and position logo accordingly
    "avoidanceMargin": 50   // Keep logo 50px away from tracked object
  }
}
```

### Multi-Logo Support (Coming Soon)
Add multiple logos to different positions:
```javascript
{
  "logos": [
    { path: "/brand-logo.png", position: "bottom-right", size: 150 },
    { path: "/sponsor-logo.png", position: "top-left", size: 100 }
  ]
}
```

### Animated Logo Entrance (Coming Soon)
Fade-in animation for logo appearance:
```javascript
{
  "logoAnimation": {
    "type": "fade-in",
    "duration": 1.0,  // 1 second fade-in
    "delay": 0.5      // Start at 0.5 seconds
  }
}
```

## Support

For issues or questions:
- Check omega-service logs: `http://localhost:3007` console output
- Verify FFmpeg installation: `ffmpeg -version`
- Review generated video paths in logs
- Check file permissions on logo and output directories

---

**Sign off as SmokeDev 🚬**
