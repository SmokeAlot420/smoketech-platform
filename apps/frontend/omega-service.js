// Simple Omega HTTP service for OpenJourney integration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

// Register tsx for TypeScript support
require('tsx/cjs');

// Validate critical paths at startup
(async () => {
  try {
    const { validateOmegaPaths, printValidationResults } = await import('./src/utils/config-validator.js');
    const validationResults = validateOmegaPaths();
    printValidationResults(validationResults, '[Omega Service] ');

    if (!validationResults.valid) {
      console.error('\n[Omega Service] ❌ Critical path validation failed. Please fix configuration errors.');
      // Continue anyway with warnings - paths will be created on demand
    }
  } catch (error) {
    console.warn('[Omega Service] ⚠️  Path validation skipped:', error.message);
  }
})();

const app = express();
const port = 3007;

// Middleware
app.use(express.json());
app.use(cors());

// Store active operations
const activeOperations = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Omega Workflow HTTP Service is running',
    timestamp: new Date().toISOString()
  });
});

// Generate NanoBanana images endpoint - VIRAL ENGINE INTEGRATION
app.post('/api/generate-nanobana', async (req, res) => {
  try {
    const { prompt, apiKey, numberOfImages } = req.body;

    console.log('🍌 NanoBanana image generation request:', {
      prompt: prompt.substring(0, 100) + '...',
      apiKey: apiKey ? 'provided' : 'missing',
      numberOfImages: numberOfImages || 1
    });

    // Validate request
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required'
      });
    }

    // ✅ VIRAL ENGINE INTEGRATION - Call the production-ready NanoBanana service
    console.log('🚀 Calling viral engine NanoBanana service...');

    // Dynamic import of the TypeScript bridge
    const { generateNanoBananaImages, validateRequest } = await import('./services/nanobana-bridge.js');

    // Validate request
    const validation = validateRequest({ prompt, apiKey, numberOfImages });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Generate ultra-realistic images using viral engine
    const result = await generateNanoBananaImages({
      prompt,
      apiKey,
      numberOfImages: numberOfImages || 1
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Image generation failed'
      });
    }

    console.log(`✅ NanoBanana generation completed: ${result.images.length} ultra-realistic images`);
    console.log(`💰 Total cost: $${result.metadata.cost.toFixed(3)}`);
    console.log(`⏱️  Generation time: ${result.metadata.generationTime.toFixed(2)}s`);

    // Return viral engine results
    res.json(result);

  } catch (error) {
    console.error('❌ NanoBanana generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Generate video endpoint
app.post('/api/generate-video', async (req, res) => {
  try {
    const { characterName, userRequest, platform, simpleMode } = req.body;

    console.log('🎬 Omega video generation request:', {
      character: characterName,
      prompt: userRequest,
      platform: platform
    });

    // Generate operation ID
    const operationId = `omega-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store operation with initial status
    activeOperations.set(operationId, {
      operationId,
      character: characterName,
      prompt: userRequest,
      platform: platform,
      status: 'processing',
      progress: 15,
      startTime: Date.now(),
      elapsedTime: 0
    });

    // Execute REAL Omega Workflow using viral engine
    const viralEnginePath = path.resolve(__dirname, '..', 'viral');
    const paintingScript = path.join(viralEnginePath, 'scripts', 'generate-painting-sop.ts');

    // Get API key from Authorization header or request body
    const apiKey = req.headers.authorization?.split(' ')[1] || req.body.apiKey || process.env.GEMINI_API_KEY;

    console.log('🚀 Spawning viral engine process:', paintingScript);

    // Spawn the painting SOP generator
    // Use command string with proper quoting for paths with spaces
    const isWindows = process.platform === 'win32';
    const npxCommand = isWindows ? 'npx.cmd' : 'npx';
    const quotedScript = `"${paintingScript}"`;
    const command = `${npxCommand} tsx ${quotedScript}`;

    console.log('📝 Command:', command);

    const childProcess = spawn(command, {
      cwd: viralEnginePath,
      env: {
        ...process.env,
        GEMINI_API_KEY: apiKey
      },
      shell: true
    });

    // Track subprocess output for progress
    let stdoutBuffer = '';

    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutBuffer += output;
      console.log('[Viral Engine]:', output.trim());

      // Parse progress updates: PROGRESS:{"stage":"character","progress":10,"message":"..."}
      const progressMatches = output.match(/PROGRESS:(.+)/);
      if (progressMatches) {
        try {
          const progressData = JSON.parse(progressMatches[1]);
          const operation = activeOperations.get(operationId);
          if (operation) {
            operation.progress = progressData.progress;
            operation.status = 'processing';
            operation.currentStage = progressData.stage;
            operation.message = progressData.message;
          }
        } catch (e) {
          console.error('Failed to parse progress:', e);
        }
      }

      // Parse final result: RESULT:{"success":true,"videoPath":"...","cost":0.08}
      const resultMatches = output.match(/RESULT:(.+)/);
      if (resultMatches) {
        try {
          const resultData = JSON.parse(resultMatches[1]);
          const operation = activeOperations.get(operationId);
          if (operation) {
            if (resultData.success) {
              operation.status = 'completed';
              operation.progress = 100;
              operation.videoPath = resultData.videoPath;
              operation.videoUrl = resultData.videoUrl;  // HTTP URL for frontend
              operation.characterImagePath = resultData.characterImagePath;
              operation.metrics = {
                viralScore: 88,
                totalCost: resultData.cost,
                generationTime: (Date.now() - operation.startTime) / 1000,
                engineUtilization: 92
              };
            } else {
              operation.status = 'failed';
              operation.error = resultData.error;
            }
          }
        } catch (e) {
          console.error('Failed to parse result:', e);
        }
      }
    });

    childProcess.stderr.on('data', (data) => {
      console.error('[Viral Engine Error]:', data.toString());
    });

    childProcess.on('error', (error) => {
      console.error('❌ Subprocess spawn error:', error);
      const operation = activeOperations.get(operationId);
      if (operation) {
        operation.status = 'failed';
        operation.error = error.message;
      }
    });

    childProcess.on('close', (code) => {
      console.log(`🏁 Viral engine process exited with code ${code}`);
      if (code !== 0) {
        const operation = activeOperations.get(operationId);
        if (operation && operation.status !== 'completed') {
          operation.status = 'failed';
          operation.error = `Process exited with code ${code}`;
        }
      }
    });

    res.json({
      success: true,
      operationId: operationId,
      message: `Video generation started for ${characterName}`
    });

  } catch (error) {
    console.error('❌ Video generation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// VEO3 video generation endpoint
app.post('/api/generate-veo3', async (req, res) => {
  try {
    const {
      prompt,
      videoModel,
      duration,
      platform,
      enhancementLevel,
      useChaining,
      operationId: clientOperationId,
      // Logo overlay parameters
      addLogo,
      logoPath,
      logoPosition,
      logoSize,
      logoOpacity,
      // Dynamic timing parameters
      logoStartTime,
      logoEndTime,
      logoFadeIn,
      logoFadeOut
    } = req.body;

    // Auto-enable logo for QuoteMoto prompts if not explicitly disabled
    const shouldAddLogo = addLogo !== false && (
      addLogo === true ||
      prompt?.toLowerCase().includes('quotemoto') ||
      prompt?.toLowerCase().includes('insurance')
    );

    console.log('🎬 VEO3 video generation request:', {
      prompt: prompt?.substring(0, 50) + '...',
      videoModel,
      duration,
      platform,
      enhancementLevel,
      addLogo: shouldAddLogo
    });

    // Generate operation ID (use client-provided or generate new)
    const operationId = clientOperationId || `veo3-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store operation with initial status
    activeOperations.set(operationId, {
      operationId,
      prompt: prompt,
      videoModel: videoModel,
      duration: duration,
      platform: platform,
      enhancementLevel: enhancementLevel,
      status: 'processing',
      progress: 10,
      startTime: Date.now(),
      elapsedTime: 0
    });

    // Execute VEO3 generation using viral engine wrapper
    const viralEnginePath = path.resolve(__dirname, '..', 'viral');
    const veo3Script = path.join(viralEnginePath, 'veo3-generation-wrapper.ts');

    // Get API key from Authorization header or request body
    const apiKey = req.headers.authorization?.split(' ')[1] || req.body.apiKey || process.env.GEMINI_API_KEY;

    console.log('🚀 Spawning VEO3 viral engine process:', veo3Script);

    // Spawn the VEO3 generator
    const isWindows = process.platform === 'win32';
    const npxCommand = isWindows ? 'npx.cmd' : 'npx';
    const quotedScript = `"${veo3Script}"`;
    const command = `${npxCommand} tsx ${quotedScript}`;

    console.log('📝 Command:', command);

    const childProcess = spawn(command, {
      cwd: viralEnginePath,
      env: {
        ...process.env,
        GEMINI_API_KEY: apiKey,
        VEO3_PROMPT: prompt,
        VEO3_MODEL: videoModel,
        VEO3_DURATION: duration.toString(),
        VEO3_PLATFORM: platform || '',
        VEO3_ENHANCEMENT: enhancementLevel || 'none',
        // Logo overlay parameters
        VEO3_ADD_LOGO: shouldAddLogo.toString(),
        VEO3_LOGO_PATH: logoPath || '',
        VEO3_LOGO_POSITION: logoPosition || 'bottom-right',
        VEO3_LOGO_SIZE: (logoSize || 150).toString(),
        VEO3_LOGO_OPACITY: (logoOpacity || 0.9).toString(),
        // Dynamic timing parameters
        VEO3_LOGO_START_TIME: logoStartTime !== undefined ? logoStartTime.toString() : '',
        VEO3_LOGO_END_TIME: logoEndTime !== undefined ? logoEndTime.toString() : '',
        VEO3_LOGO_FADE_IN: (logoFadeIn || 0.3).toString(),
        VEO3_LOGO_FADE_OUT: (logoFadeOut || 0.3).toString()
      },
      shell: true
    });

    // Track subprocess output for progress
    let stdoutBuffer = '';

    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutBuffer += output;
      console.log('[VEO3 Engine]:', output.trim());

      // Parse progress updates: PROGRESS:{"stage":"generation","progress":50,"message":"..."}
      const progressMatches = output.match(/PROGRESS:(.+)/);
      if (progressMatches) {
        try {
          const progressData = JSON.parse(progressMatches[1]);
          const operation = activeOperations.get(operationId);
          if (operation) {
            operation.progress = progressData.progress;
            operation.status = 'processing';
            operation.currentStage = progressData.stage;
            operation.message = progressData.message;
          }
        } catch (e) {
          console.error('Failed to parse VEO3 progress:', e);
        }
      }

      // Parse final result: RESULT:{"success":true,"videoPath":"...","cost":6.00}
      const resultMatches = output.match(/RESULT:(.+)/);
      if (resultMatches) {
        try {
          const resultData = JSON.parse(resultMatches[1]);
          const operation = activeOperations.get(operationId);
          if (operation) {
            if (resultData.success) {
              operation.status = 'completed';
              operation.progress = 100;
              operation.videoPath = resultData.videoPath;

              // Use HTTP URL from VEO3 service (generated directly to public directory)
              // Format: /generated/veo3/veo3_video_*.mp4 (Next.js serves from public/)
              operation.videoUrl = resultData.videoUrl || `/generated/veo3/${path.basename(resultData.videoPath)}`;

              operation.metrics = {
                totalCost: resultData.cost,
                generationTime: (Date.now() - operation.startTime) / 1000,
                model: videoModel,
                duration: duration
              };
            } else {
              operation.status = 'failed';
              operation.error = resultData.error;
            }
          }
        } catch (e) {
          console.error('Failed to parse VEO3 result:', e);
        }
      }
    });

    childProcess.stderr.on('data', (data) => {
      console.error('[VEO3 Engine Error]:', data.toString());
    });

    childProcess.on('error', (error) => {
      console.error('❌ VEO3 subprocess spawn error:', error);
      const operation = activeOperations.get(operationId);
      if (operation) {
        operation.status = 'failed';
        operation.error = error.message;
      }
    });

    childProcess.on('close', (code) => {
      console.log(`🏁 VEO3 engine process exited with code ${code}`);
      if (code !== 0) {
        const operation = activeOperations.get(operationId);
        if (operation && operation.status !== 'completed') {
          operation.status = 'failed';
          operation.error = `Process exited with code ${code}`;
        }
      }
    });

    res.json({
      success: true,
      operationId: operationId,
      message: `VEO3 video generation started`
    });

  } catch (error) {
    console.error('❌ VEO3 generation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Status check endpoint - Temporal integrated
app.get('/api/status/:operationId', async (req, res) => {
  try {
    const operationId = req.params.operationId;
    const operation = activeOperations.get(operationId);

    if (!operation) {
      return res.status(404).json({
        success: false,
        error: 'Operation not found'
      });
    }

    // If this is a Temporal workflow, query Temporal for status
    if (operation.temporal) {
      const { getTemporalClient } = require('./src/lib/temporal-client.ts');
      const client = getTemporalClient();

      try {
        const progress = await client.queryWorkflowStatus(operationId);
        const elapsedTime = Math.floor((Date.now() - operation.startTime) / 1000);

        res.json({
          success: true,
          operationId,
          workflowId: operationId,
          status: progress.currentStage === 'complete' ? 'completed' : progress.currentStage === 'failed' ? 'failed' : 'processing',
          stage: progress.currentStage,
          progress: progress.overallProgress,
          elapsedTime,
          characterImagePath: progress.characterImagePath,
          videoPath: progress.videoPath,
          videosGenerated: progress.videosGenerated,
          totalVideos: progress.totalVideos,
          metrics: {
            totalCost: progress.totalCost
          },
          temporal: true
        });

      } catch (error) {
        // If workflow query fails, return stored state
        res.json({
          success: true,
          operationId,
          status: operation.status,
          elapsedTime: Math.floor((Date.now() - operation.startTime) / 1000),
          error: error.message
        });
      }
    } else {
      // Non-Temporal operation (legacy)
      const elapsedTime = Math.floor((Date.now() - operation.startTime) / 1000);
      operation.elapsedTime = elapsedTime;

      res.json({
        success: true,
        operationId,
        status: operation.status,
        character: operation.character,
        elapsedTime,
        estimatedTime: 300,
        progress: operation.progress,
        videoPath: operation.videoPath,
        metrics: operation.metrics,
        temporal: false
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Pause Temporal workflow
app.post('/api/workflow/pause/:operationId', async (req, res) => {
  try {
    const { operationId } = req.params;
    const operation = activeOperations.get(operationId);

    if (!operation || !operation.temporal) {
      return res.status(404).json({
        success: false,
        error: 'Temporal workflow not found'
      });
    }

    const { getTemporalClient } = require('./src/lib/temporal-client.ts');
    const client = getTemporalClient();

    await client.pauseWorkflow(operationId);

    res.json({
      success: true,
      operationId,
      message: 'Workflow paused'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resume Temporal workflow
app.post('/api/workflow/resume/:operationId', async (req, res) => {
  try {
    const { operationId } = req.params;
    const operation = activeOperations.get(operationId);

    if (!operation || !operation.temporal) {
      return res.status(404).json({
        success: false,
        error: 'Temporal workflow not found'
      });
    }

    const { getTemporalClient } = require('./src/lib/temporal-client.ts');
    const client = getTemporalClient();

    await client.resumeWorkflow(operationId);

    res.json({
      success: true,
      operationId,
      message: 'Workflow resumed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel Temporal workflow
app.post('/api/workflow/cancel/:operationId', async (req, res) => {
  try {
    const { operationId } = req.params;
    const operation = activeOperations.get(operationId);

    if (!operation || !operation.temporal) {
      return res.status(404).json({
        success: false,
        error: 'Temporal workflow not found'
      });
    }

    const { getTemporalClient } = require('./src/lib/temporal-client.ts');
    const client = getTemporalClient();

    await client.cancelWorkflow(operationId);

    operation.status = 'cancelled';

    res.json({
      success: true,
      operationId,
      message: 'Workflow cancelled'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Video streaming endpoint
app.get('/api/videos/stream/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const videoPath = path.join(__dirname, '..', 'viral', 'generated', 'veo3', filename);

    const fs = require('fs');
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Video file not found',
        filename: filename
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
      const chunksize = (end-start)+1;
      const file = fs.createReadStream(videoPath, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// CHARACTER LIBRARY GENERATION ENDPOINTS
// =====================================================

/**
 * Generate character library (4 shots) from preset
 * POST /api/generate-character-library
 */
app.post('/api/generate-character-library', async (req, res) => {
  try {
    const { presetId, customizations, shotSelection, options } = req.body;

    console.log('📚 Character library generation request:');
    console.log(`   Preset: ${presetId}`);
    console.log(`   Character: ${customizations?.name}`);
    console.log(`   Shots: ${shotSelection === 'all' ? 'All 4 shots' : shotSelection?.length + ' shots'}`);

    // Validate request
    if (!presetId || !customizations || !customizations.name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: presetId, customizations.name'
      });
    }

    // Set environment variable for batch generator
    if (!process.env.GEMINI_API_KEY && options?.apiKey) {
      process.env.GEMINI_API_KEY = options.apiKey;
    }

    // Path to viral engine batch generator
    const viralEnginePath = path.join(__dirname, '..', 'viral');
    const generatorScript = path.join(viralEnginePath, 'src', 'pipelines', 'batchCharacterLibraryGenerator.ts');

    console.log('🔄 Spawning batch character library generator...');
    console.log(`   Script: ${generatorScript}`);

    // Create temporary request file
    const requestFile = path.join(viralEnginePath, `request-${Date.now()}.json`);
    const fs = require('fs');
    fs.writeFileSync(requestFile, JSON.stringify({
      presetId,
      customizations,
      shotSelection: shotSelection || 'all',
      options: {
        greenScreen: options?.greenScreen !== false,
        generateMetadata: options?.generateMetadata !== false,
        generateUsageGuide: options?.generateUsageGuide !== false,
        temperature: options?.temperature || 0.3
      }
    }));

    // Spawn the batch generator process
    // CRITICAL: Use npx.cmd explicitly on Windows to handle paths with spaces
    const isWindows = process.platform === 'win32';
    const npxCommand = isWindows ? 'npx.cmd' : 'npx';
    const childProcess = spawn(npxCommand, ['tsx', generatorScript, requestFile], {
      cwd: viralEnginePath,
      env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY || options?.apiKey },
      shell: isWindows,  // Use shell on Windows for .cmd resolution
      windowsVerbatimArguments: true  // Prevents Windows from adding extra quotes
    });

    const operationId = `char-lib-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let outputBuffer = '';
    let errorBuffer = '';

    // Store operation
    activeOperations.set(operationId, {
      operationId,
      status: 'processing',
      presetId,
      characterName: customizations.name,
      progress: {
        totalShots: shotSelection === 'all' ? 4 : shotSelection.length,
        completedShots: 0,
        currentShot: null,
        estimatedTimeRemaining: (shotSelection === 'all' ? 4 : shotSelection.length) * 13
      },
      costs: {
        perImage: 0.039,
        total: 0.039 * (shotSelection === 'all' ? 4 : shotSelection.length),
        currency: 'USD'
      },
      startTime: Date.now(),
      process: childProcess
    });

    // Capture output
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      console.log(output);

      const operation = activeOperations.get(operationId);
      if (operation) {
        // Parse progress from output
        if (output.includes('Generating:')) {
          const match = output.match(/Generating: ([\w-]+)/);
          if (match) {
            operation.progress.currentShot = match[1];
          }
        }
        if (output.includes('✅ Image saved:')) {
          operation.progress.completedShots++;
          operation.progress.estimatedTimeRemaining =
            (operation.progress.totalShots - operation.progress.completedShots) * 13;
        }
        if (output.includes('Generation Complete')) {
          operation.status = 'completed';
          operation.progress.currentShot = null;
          operation.progress.estimatedTimeRemaining = 0;
        }
      }
    });

    childProcess.stderr.on('data', (data) => {
      errorBuffer += data.toString();
      console.error('Generation error:', data.toString());
    });

    childProcess.on('close', (code) => {
      console.log(`Generator process exited with code ${code}`);
      const operation = activeOperations.get(operationId);

      if (code === 0) {
        if (operation) {
          operation.status = 'completed';
          operation.progress.currentShot = null;
          operation.progress.estimatedTimeRemaining = 0;
        }
      } else {
        if (operation) {
          operation.status = 'failed';
          operation.error = errorBuffer || 'Generation failed';
        }
      }

      // Clean up request file
      try {
        fs.unlinkSync(requestFile);
      } catch (e) {
        console.error('Failed to clean up request file:', e);
      }
    });

    // Return initial response
    const initialResponse = {
      operationId,
      status: 'processing',
      progress: activeOperations.get(operationId).progress,
      costs: activeOperations.get(operationId).costs,
      outputLocation: path.join(viralEnginePath, 'generated', 'character-library')
    };

    console.log('✅ Generation started');
    console.log(`   Operation ID: ${operationId}`);

    res.json(initialResponse);

  } catch (error) {
    console.error('❌ Failed to start generation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Check character library generation status
 * GET /api/generate-character-library/status?operationId=xxx
 */
app.get('/api/generate-character-library/status', (req, res) => {
  try {
    const operationId = req.query.operationId;

    if (!operationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: operationId'
      });
    }

    const operation = activeOperations.get(operationId);

    if (!operation) {
      return res.status(404).json({
        success: false,
        error: 'Operation not found'
      });
    }

    const elapsedTime = Math.floor((Date.now() - operation.startTime) / 1000);

    res.json({
      operationId,
      status: operation.status,
      progress: operation.progress,
      costs: operation.costs,
      outputLocation: operation.outputLocation,
      elapsedTime,
      characterName: operation.characterName,
      presetId: operation.presetId,
      error: operation.error
    });

  } catch (error) {
    console.error('❌ Failed to check status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// TEMPLATE WORKFLOW ENDPOINT - Temporal Integration
// ═══════════════════════════════════════════════════════════════════════

/**
 * Generate video from visual workflow
 * POST /api/visual-workflow
 *
 * Body: {
 *   workflow: { workflowId, nodes, edges },
 *   apiKey?: string
 * }
 */
app.post('/api/visual-workflow', async (req, res) => {
  try {
    const { workflow, apiKey } = req.body;

    console.log('🎨 Visual Workflow Request:', {
      workflowId: workflow?.workflowId,
      nodes: workflow?.nodes?.length || 0,
      edges: workflow?.edges?.length || 0
    });

    // Validate request
    if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Workflow with nodes is required'
      });
    }

    // Set API key
    const effectiveApiKey = apiKey || req.headers.authorization?.split(' ')[1] || process.env.GEMINI_API_KEY;
    if (!effectiveApiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required'
      });
    }
    process.env.GEMINI_API_KEY = effectiveApiKey;

    // Transform visual workflow to Temporal workflow format
    const characterNode = workflow.nodes.find(n => n.type === 'characterImage');
    const videoNodes = workflow.nodes.filter(n => n.type === 'videoGeneration');

    if (!characterNode) {
      return res.status(400).json({
        success: false,
        error: 'Character image node is required'
      });
    }

    if (videoNodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one video generation node is required'
      });
    }

    // Import Temporal client
    console.log('🚀 Connecting to Temporal...');
    const { getTemporalClient } = require('./src/lib/temporal-client.ts');
    const client = getTemporalClient();

    let workflowId;

    if (videoNodes.length === 1) {
      // Single video workflow
      const videoNode = videoNodes[0];
      const workflowInput = {
        characterPrompt: characterNode.data.characterPrompt,
        temperature: 0.3,
        videoPrompt: videoNode.data.prompt,
        duration: videoNode.data.duration || 8,
        aspectRatio: videoNode.data.aspectRatio || '16:9',
        model: videoNode.data.model?.includes('fast') ? 'fast' : 'standard',
        platform: 'youtube',
        enhanceWithTopaz: false
      };

      workflowId = await client.startSingleVideoWorkflow(workflowInput);
      console.log(`✅ Single video workflow started: ${workflowId}`);

    } else {
      // Series workflow
      const scenarios = videoNodes.map(node => ({
        videoPrompt: node.data.prompt,
        duration: node.data.duration || 8,
        aspectRatio: node.data.aspectRatio || '16:9',
        model: node.data.model?.includes('fast') ? 'fast' : 'standard'
      }));

      const workflowInput = {
        characterPrompt: characterNode.data.characterPrompt,
        temperature: 0.3,
        scenarios,
        platform: 'youtube'
      };

      workflowId = await client.startSeriesVideoWorkflow(workflowInput);
      console.log(`✅ Series workflow started: ${workflowId}`);
    }

    // Store operation mapping
    activeOperations.set(workflowId, {
      operationId: workflowId,
      workflowId,
      workflowName: workflow.workflowId,
      status: 'processing',
      startTime: Date.now(),
      temporal: true
    });

    res.json({
      success: true,
      operationId: workflowId,
      workflowId,
      message: `Visual workflow started: ${workflow.workflowId}`
    });

  } catch (error) {
    console.error('❌ Visual workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════

/**
 * Generate video using Temporal workflows
 * POST /api/template-workflow
 *
 * Body: {
 *   templateType: 'single' | 'series',
 *   config: VideoConfig,
 *   apiKey?: string
 * }
 */
app.post('/api/template-workflow', async (req, res) => {
  try {
    const { templateType, config, apiKey } = req.body;

    console.log('🎬 Temporal Workflow Request:', {
      templateType,
      scenarios: config?.scenarios?.length || 0,
      hasCharacter: !!config?.character
    });

    // Validate request
    if (!templateType || !['single', 'series'].includes(templateType)) {
      return res.status(400).json({
        success: false,
        error: 'templateType must be "single" or "series"'
      });
    }

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'config is required'
      });
    }

    // Set API key (Temporal workflows will use environment variable)
    const effectiveApiKey = apiKey || req.headers.authorization?.split(' ')[1] || process.env.GEMINI_API_KEY;
    if (!effectiveApiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required'
      });
    }
    process.env.GEMINI_API_KEY = effectiveApiKey;

    // Import Temporal client
    console.log('🚀 Connecting to Temporal...');
    const { getTemporalClient } = require('./src/lib/temporal-client.ts');
    const client = getTemporalClient();

    // Start workflow based on template type
    let workflowId;

    if (templateType === 'single') {
      // Convert config to SingleVideoWorkflowInput
      const workflowInput = {
        characterPrompt: config.character?.prompt || config.characterPrompt,
        temperature: config.character?.temperature || 0.3,
        videoPrompt: config.scenarios?.[0]?.videoPrompt || config.videoPrompt,
        duration: config.scenarios?.[0]?.duration || config.duration || 8,
        aspectRatio: config.scenarios?.[0]?.aspectRatio || config.aspectRatio || '16:9',
        model: config.scenarios?.[0]?.model || config.model || 'fast',
        platform: config.platform || 'youtube',
        enhanceWithTopaz: config.enhanceWithTopaz || false
      };

      workflowId = await client.startSingleVideoWorkflow(workflowInput);

    } else if (templateType === 'series') {
      // Convert config to SeriesVideoWorkflowInput
      const workflowInput = {
        characterPrompt: config.character?.prompt || config.characterPrompt,
        temperature: config.character?.temperature || 0.3,
        scenarios: config.scenarios || [],
        platform: config.platform || 'youtube'
      };

      workflowId = await client.startSeriesVideoWorkflow(workflowInput);
    }

    console.log(`✅ Temporal workflow started: ${workflowId}`);

    // Store operation mapping
    activeOperations.set(workflowId, {
      operationId: workflowId,
      workflowId,
      templateType,
      status: 'processing',
      startTime: Date.now(),
      temporal: true  // Flag to indicate Temporal workflow
    });

    res.json({
      success: true,
      operationId: workflowId,
      workflowId,
      message: `Temporal workflow started for ${templateType} template`
    });

  } catch (error) {
    console.error('❌ Temporal workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Omega Workflow HTTP Service running on http://localhost:${port}`);
  console.log('🎬 Ready to receive video generation requests!');
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Omega service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Omega service...');
  process.exit(0);
});