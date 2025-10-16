// Enhanced Express Web Server for QuoteMoto Content Generation
import express from 'express';
import path from 'path';
import { generateQuoteMotoContent } from './activities-quotemoto';
const { ModularCharacterVideoAPI } = require('../modular-character-api.js');

const app = express();
const port = process.env.WEB_PORT || 3007;

// Initialize the video API
const videoAPI = new ModularCharacterVideoAPI();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store active operations
const activeOperations = new Map();

// Main UI route
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index-enhanced.html'));
});

// QuoteMoto Dashboard route
app.get('/quotemoto', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/quotemoto-dashboard.html'));
});

// AI-powered character detail generation
function generateCharacterFromRequest(characterName: string, userRequest: string, _style: string) {
  // Simple AI logic to generate character details from user request

  // Detect profession and industry from user request
  let profession = 'Influencer';
  let industry = 'General';
  let companyName = `${characterName}Co`;
  let contentType = 'testimonial';

  if (userRequest.toLowerCase().includes('insurance') || userRequest.toLowerCase().includes('car')) {
    profession = 'Insurance Advisor';
    industry = 'Insurance';
    companyName = 'QuoteMoto';
    contentType = 'product-review';
  } else if (userRequest.toLowerCase().includes('tech') || userRequest.toLowerCase().includes('gadget') || userRequest.toLowerCase().includes('app')) {
    profession = 'Tech Expert';
    industry = 'Technology';
    companyName = 'TechFlow';
    contentType = 'product-review';
  } else if (userRequest.toLowerCase().includes('fitness') || userRequest.toLowerCase().includes('workout')) {
    profession = 'Fitness Coach';
    industry = 'Health & Fitness';
    companyName = 'FitLife';
    contentType = 'motivational-message';
  } else if (userRequest.toLowerCase().includes('food') || userRequest.toLowerCase().includes('recipe') || userRequest.toLowerCase().includes('cooking')) {
    profession = 'Chef';
    industry = 'Food & Cooking';
    companyName = 'CulinaryMasters';
    contentType = 'tutorial';
  } else if (userRequest.toLowerCase().includes('fashion') || userRequest.toLowerCase().includes('style')) {
    profession = 'Fashion Expert';
    industry = 'Fashion & Style';
    companyName = 'StyleVogue';
    contentType = 'tutorial';
  } else if (userRequest.toLowerCase().includes('marketing') || userRequest.toLowerCase().includes('business')) {
    profession = 'Marketing Expert';
    industry = 'Digital Marketing';
    companyName = 'GrowthHackers';
    contentType = 'tutorial';
  }

  // Generate description based on profession and style
  const descriptions = {
    'Insurance Advisor': 'Professional, trustworthy insurance expert with friendly demeanor',
    'Tech Expert': 'Young, enthusiastic technology expert with modern casual style',
    'Fitness Coach': 'Athletic, energetic fitness expert with motivational personality',
    'Chef': 'Professional chef with warm, approachable demeanor and culinary expertise',
    'Fashion Expert': 'Stylish, confident fashion expert with keen eye for trends',
    'Marketing Expert': 'Energetic marketing professional with proven track record'
  };

  // Generate dialogue with proper quotes
  const dialogue = `"Hi everyone! I'm ${characterName} from ${companyName}. ${userRequest}"`;

  return {
    characterName,
    profession,
    companyName,
    industry,
    description: descriptions[profession as keyof typeof descriptions] || 'Professional expert in their field',
    dialogue,
    contentType
  };
}

// API Routes
app.post('/api/generate-video', async (req, res) => {
  try {
    console.log('🎬 New video generation request:', req.body);

    let videoData = req.body;

    // If simple mode, use AI to generate all character details
    if (req.body.simpleMode) {
      console.log('🤖 Using AI to generate character details from simple request');

      const aiGenerated = generateCharacterFromRequest(
        req.body.characterName,
        req.body.userRequest,
        req.body.style
      );

      videoData = {
        ...aiGenerated,
        platform: req.body.platform,
        quality: 'production',
        promptTemplate: 'ultra-realistic-speech',
        style: req.body.style
      };

      console.log('🎭 AI Generated Character:', aiGenerated);
    }

    const result = await videoAPI.generateCharacterVideo(videoData);

    // Store operation for status checking
    activeOperations.set(result.operationId, {
      ...result,
      character: videoData.characterName,
      startTime: Date.now(),
      status: 'processing'
    });

    res.json({
      success: true,
      operationId: result.operationId,
      message: `Video generation started for ${videoData.characterName}`
    });

  } catch (error) {
    console.error('❌ Video generation error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check video status
app.get('/api/status/:operationId', async (req, res) => {
  try {
    const operationId = req.params.operationId;
    const operation = activeOperations.get(operationId);

    if (!operation) {
      res.status(404).json({
        success: false,
        error: 'Operation not found'
      });
      return;
    }

    // Check if video is ready (this would integrate with our polling system)
    const elapsedTime = Date.now() - operation.startTime;
    const estimatedTime = 300000; // 5 minutes estimate

    // For now, return processing status with time estimate
    res.json({
      success: true,
      operationId,
      status: operation.status,
      character: operation.character,
      elapsedTime: Math.floor(elapsedTime / 1000),
      estimatedTime: Math.floor(estimatedTime / 1000),
      progress: Math.min(95, Math.floor((elapsedTime / estimatedTime) * 100))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available options for UI dropdowns
app.get('/api/options', (_req, res) => {
  res.json(videoAPI.getAvailableOptions());
});

// Get suggested dialogue
app.post('/api/suggest-dialogue', (req, res) => {
  const { characterName, contentType, industry } = req.body;

  const suggestion = videoAPI.generateSuggestedDialogue(
    { name: characterName },
    contentType,
    industry
  );

  res.json({
    success: true,
    suggestion
  });
});

// QuoteMoto Content Generation API
app.post('/api/generate-quotemoto-content', async (req, res) => {
  try {
    console.log('🎯 QuoteMoto content generation request:', req.body);

    const { campaignType, variations = 5, platforms = ['tiktok', 'instagram', 'youtube'] } = req.body;

    // If multiple campaign types requested, generate all
    if (Array.isArray(req.body.campaignTypes)) {
      const allResults = [];
      let totalCost = 0;

      for (const type of req.body.campaignTypes) {
        console.log(`[QuoteMoto] Generating ${type} campaign...`);
        const result = await generateQuoteMotoContent({
          campaignType: type,
          variations: Math.ceil(variations / req.body.campaignTypes.length),
          platforms: platforms
        });
        allResults.push(...result.variations);
        totalCost += result.totalCost;
      }

      res.json({
        success: true,
        data: {
          campaignTypes: req.body.campaignTypes,
          variations: allResults,
          totalCost: totalCost,
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      // Single campaign type
      const result = await generateQuoteMotoContent({
        campaignType: campaignType || 'savings',
        variations: variations,
        platforms: platforms
      });

      res.json({
        success: true,
        data: result
      });
    }

  } catch (error) {
    console.error('❌ QuoteMoto generation error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// General status endpoint for dashboard
app.get('/api/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ready',
    timestamp: new Date().toISOString(),
    operations: activeOperations.size
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Ultra-Realistic Video Generation API is running',
    timestamp: new Date().toISOString()
  });
});

// Video serving routes
app.get('/api/videos/examples', (_req, res) => {
  // Return list of example videos
  const exampleVideos = [
    {
      id: 'pedro-insurance-1',
      title: 'Pedro - Car Insurance Review',
      character: 'Pedro',
      thumbnail: '/api/videos/thumbnails/pedro-1.jpg',
      url: '/api/videos/stream/pedro-insurance-1.mp4',
      duration: '0:30',
      views: '12.5K',
      platform: 'TikTok'
    },
    {
      id: 'sarah-cooking-1',
      title: 'Sarah - Professional Cooking Tips',
      character: 'Sarah',
      thumbnail: '/api/videos/thumbnails/sarah-1.jpg',
      url: '/api/videos/stream/sarah-cooking-1.mp4',
      duration: '0:45',
      views: '8.2K',
      platform: 'Instagram'
    },
    {
      id: 'mike-fitness-1',
      title: 'Mike - High-Energy Workout',
      character: 'Mike',
      thumbnail: '/api/videos/thumbnails/mike-1.jpg',
      url: '/api/videos/stream/mike-fitness-1.mp4',
      duration: '0:35',
      views: '15.3K',
      platform: 'YouTube'
    }
  ];

  res.json({
    success: true,
    videos: exampleVideos
  });
});

// Serve video files
app.get('/api/videos/stream/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, '../generated', filename);

  // Check if file exists
  const fs = require('fs');
  if (fs.existsSync(videoPath)) {
    res.sendFile(videoPath);
  } else {
    // Return placeholder video for demo
    res.status(404).json({
      success: false,
      error: 'Video not found',
      message: 'This is a demo. In production, the generated video would be served here.'
    });
  }
});

// Serve video thumbnails
app.get('/api/videos/thumbnails/:filename', (_req, res) => {
  // For demo purposes, return a placeholder response
  res.status(404).json({
    success: false,
    error: 'Thumbnail not found',
    message: 'Thumbnails would be generated and served here in production.'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Video Generation Web UI running on http://localhost:${port}`);
  console.log('🎬 Ultra-realistic character video generation ready!');
});

export default app;