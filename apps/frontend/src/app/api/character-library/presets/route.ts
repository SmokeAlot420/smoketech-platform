/**
 * Character Presets API Route
 *
 * GET /api/character-library/presets - List all available presets from shared configuration
 */

import { NextResponse } from 'next/server';
import { getCharacterPresets, getCharacterPresetsMetadata } from '@smoketech/shared-config';

export async function GET() {
  try {
    // Load presets from shared configuration package
    const allPresets = getCharacterPresets();
    const metadata = getCharacterPresetsMetadata();

    // Format for frontend (simplified structure)
    const presets = allPresets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      category: preset.category,
      description: preset.description,
      icon: preset.icon
    }));

    return NextResponse.json({
      success: true,
      presets,
      count: presets.length,
      metadata
    });

  } catch (error) {
    console.error('Failed to fetch presets:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load character presets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}