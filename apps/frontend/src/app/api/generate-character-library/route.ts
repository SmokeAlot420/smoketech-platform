/**
 * Character Library Generation API Route
 *
 * Handles batch generation of 4-shot character libraries from presets.
 * Supports real-time progress tracking and cost estimation.
 *
 * POST /api/generate-character-library - Start generation
 * GET /api/generate-character-library/status/:operationId - Check status
 */

import { NextRequest, NextResponse } from 'next/server';

// Omega service URL (bridge to viral engine)
const omegaServiceUrl = process.env.OMEGA_SERVICE_URL || 'http://localhost:3007';

/**
 * POST - Start character library generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📚 Starting character library generation...');
    console.log(`   Preset: ${body.presetId}`);
    console.log(`   Character: ${body.customizations?.name}`);
    console.log(`   Shots: ${body.shotSelection === 'all' ? 'All 4 shots' : body.shotSelection?.length + ' shots'}`);

    // Validate request
    if (!body.presetId) {
      return NextResponse.json(
        { error: 'Missing required field: presetId' },
        { status: 400 }
      );
    }

    if (!body.customizations || !body.customizations.name) {
      return NextResponse.json(
        { error: 'Missing required field: customizations.name' },
        { status: 400 }
      );
    }

    // Set defaults
    const requestData = {
      presetId: body.presetId,
      customizations: {
        ...body.customizations,
        age: body.customizations.age || 30,
        gender: body.customizations.gender || 'female'
      },
      shotSelection: body.shotSelection || 'all',
      options: {
        greenScreen: body.options?.greenScreen !== false, // default true
        generateMetadata: body.options?.generateMetadata !== false, // default true
        generateUsageGuide: body.options?.generateUsageGuide !== false, // default true
        temperature: body.options?.temperature || 0.3,
        apiKey: body.options?.apiKey // Forward API key to omega service
      }
    };

    console.log('🔄 Forwarding to Omega service...');

    // Forward to Omega service
    const response = await fetch(`${omegaServiceUrl}/api/generate-character-library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Omega service error:', errorText);
      throw new Error(`Omega service returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    console.log('✅ Generation started successfully');
    console.log(`   Operation ID: ${result.operationId}`);
    console.log(`   Estimated cost: $${result.costs?.total || 0}`);
    console.log(`   Estimated time: ${result.progress?.estimatedTimeRemaining || 0}s`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Failed to generate character library:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate character library',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

/**
 * GET - Get generation status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operationId');

    if (!operationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: operationId' },
        { status: 400 }
      );
    }

    console.log(`📊 Checking status for operation: ${operationId}`);

    // Query Omega service for status
    const response = await fetch(
      `${omegaServiceUrl}/api/generate-character-library/status?operationId=${operationId}`
    );

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const status = await response.json();

    console.log(`   Status: ${status.status}`);
    console.log(`   Progress: ${status.progress?.completedShots}/${status.progress?.totalShots}`);

    return NextResponse.json(status);

  } catch (error) {
    console.error('❌ Failed to check status:', error);

    return NextResponse.json(
      {
        error: 'Failed to check generation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}