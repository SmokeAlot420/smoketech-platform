import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey: userApiKey, model = 'imagen-4', numberOfImages } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Use user-provided API key if available, otherwise fallback to environment variables
    const apiKey = userApiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: "No API key provided. Please add your Google AI API key in the settings."
      }, { status: 401 });
    }

    // Route NanoBanana to Omega service
    if (model === 'nanobana') {
      return NextResponse.json({
        error: "NanoBanana generation should use /api/generate-nanobana endpoint"
      }, { status: 400 });
    }

    // Map model names to actual model identifiers
    const modelMapping = {
      'imagen-3': 'imagen-3.0-generate-001',
      'imagen-4': 'imagen-4.0-generate-preview-06-06'
    };

    const modelId = modelMapping[model as keyof typeof modelMapping] || modelMapping['imagen-4'];

    const ai = new GoogleGenAI({ apiKey });

    console.log(`Generating images for prompt: ${prompt} using model: ${modelId}`);

    // Use user-specified count, or default based on model
    const defaultCount = model === 'imagen-3' ? 8 : 4;
    const imageCount = numberOfImages || defaultCount;

    const response = await ai.models.generateImages({
      model: modelId,
      prompt: prompt,
      config: {
        numberOfImages: imageCount,
      },
    });

    // Convert image bytes to base64 data URLs for frontend display
    const images = (response.generatedImages || []).map((generatedImage, index) => {
      const imageBytes = generatedImage.image?.imageBytes;
      if (!imageBytes) return null;
      const base64 = `data:image/png;base64,${imageBytes}`;
      return {
        id: `${Date.now()}-${index}`,
        url: base64,
        imageBytes: imageBytes // Keep for potential video conversion
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      images,
      prompt,
      metadata: {
        model: model,
        modelName: model === 'imagen-3' ? 'Imagen 3' : 'Imagen 4',
        numberOfImages: images.length,
        cost: (model === 'imagen-3' ? 0.04 : 0.08) * images.length,
        estimatedTime: model === 'imagen-3' ? 8 : 12
      }
    });

  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      { error: "Failed to generate images" }, 
      { status: 500 }
    );
  }
} 