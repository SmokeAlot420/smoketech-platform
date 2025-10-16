import { NextRequest, NextResponse } from 'next/server';
import { Connection, Client } from '@temporalio/client';

/**
 * POST /api/execute-visual-workflow
 *
 * Executes a visual workflow by sending it to Temporal
 */
export async function POST(request: NextRequest) {
  try {
    const workflow = await request.json();

    console.log('🎬 Execute Visual Workflow API');
    console.log(`📋 Workflow ID: ${workflow.workflowId}`);
    console.log(`📊 Nodes: ${workflow.nodes.length}`);
    console.log(`🔗 Edges: ${workflow.edges?.length || 0}`);

    // Validate workflow
    if (!workflow.workflowId || !workflow.nodes || workflow.nodes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid workflow: workflowId and at least one node required',
        },
        { status: 400 }
      );
    }

    // Generate operation ID
    const operationId = `single-video-${Date.now()}`;

    // Connect to Temporal
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });

    const client = new Client({ connection });

    // Convert visual workflow to SingleVideoWorkflow input
    const workflowInput = convertVisualWorkflowToInput(workflow);

    console.log('🚀 Starting Temporal workflow:', {
      operationId,
      taskQueue: 'single-video-queue',
      workflowType: 'singleVideoWorkflow',
    });

    // Start the workflow
    const handle = await client.workflow.start('singleVideoWorkflow', {
      taskQueue: 'single-video-queue',
      workflowId: operationId,
      args: [workflowInput],
    });

    console.log('✅ Workflow started successfully');
    console.log(`📍 Operation ID: ${operationId}`);
    console.log(`🔗 Temporal UI: http://localhost:8233/namespaces/default/workflows/${operationId}`);

    return NextResponse.json({
      success: true,
      operationId,
      workflowId: handle.workflowId,
      temporalUI: `http://localhost:8233/namespaces/default/workflows/${operationId}`,
    });

  } catch (error: any) {
    console.error('❌ Execute Visual Workflow API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start workflow',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Convert Visual Workflow JSON to SingleVideoWorkflow input format
 */
function convertVisualWorkflowToInput(workflow: any): any {
  const characterNode = workflow.nodes.find((n: any) => n.type === 'characterImage');
  const videoNode = workflow.nodes.find((n: any) => n.type === 'videoGeneration');

  if (!characterNode || !videoNode) {
    throw new Error('Workflow must contain both characterImage and videoGeneration nodes');
  }

  // Extract character configuration
  const characterConfig = {
    prompt: characterNode.inputs.characterPrompt || characterNode.inputs.prompt || '',
    model: mapModelName(characterNode.inputs.model || 'Imagen 3'),
    preserveFeatures: characterNode.inputs.preserveFeatures !== false,
    temperature: characterNode.inputs.temperature || 0.3,
  };

  // Extract video configuration
  const videoConfig = {
    prompt: videoNode.inputs.prompt || '',
    model: mapModelName(videoNode.inputs.model || 'VEO3 Fast'),
    duration: videoNode.inputs.duration || 8,
    aspectRatio: videoNode.inputs.aspectRatio || '16:9',
  };

  return {
    characterPrompt: characterConfig.prompt,
    videoPrompt: videoConfig.prompt,
    characterModel: characterConfig.model,
    videoModel: videoConfig.model,
    duration: videoConfig.duration,
    aspectRatio: videoConfig.aspectRatio,
    preserveFeatures: characterConfig.preserveFeatures,
    temperature: characterConfig.temperature,
  };
}

/**
 * Map UI model names to backend service names
 */
function mapModelName(uiModelName: string): string {
  const modelMap: Record<string, string> = {
    'NanoBanana - $0.02/image': 'nanobana',
    'nanobana': 'nanobana',
    'NanoBanana': 'nanobana',
    'Midjourney - $0.08/image': 'midjourney',
    'midjourney': 'midjourney',
    'DALL-E 3 HD - $0.08/image': 'dalle',
    'dalle': 'dalle',
    'Imagen 3 - $0.08/image': 'imagen3',
    'Imagen 3': 'imagen3',
    'imagen3': 'imagen3',
    'VEO3 Fast - $0.75/s': 'veo3-fast',
    'VEO3 Fast': 'veo3-fast',
    'veo3-fast': 'veo3-fast',
    'VEO3 Standard - $5.00/s': 'veo3-standard',
    'veo3-standard': 'veo3-standard',
    'Sora 2 - $5.00/s': 'sora-2',
    'sora-2': 'sora-2',
  };

  return modelMap[uiModelName] || uiModelName.toLowerCase();
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
