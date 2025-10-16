/**
 * Test AI Prompt Splitter to diagnose JSON parsing issue
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testPromptSplitter() {
  console.log('🧪 Testing AI Prompt Splitter...\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    return;
  }

  console.log('✅ GEMINI_API_KEY found');
  console.log(`📋 Key prefix: ${apiKey.substring(0, 20)}...\n`);

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const testPrompt = `female with professional tone in office setting. Testing the complete end-to-end workflow with Supabase persistent storage.`;
  const numberOfSegments = 1;
  const segmentDuration = 8;

  const systemPrompt = `You are an expert video scriptwriter specializing in creating sequential, engaging video segments.

Your task: Split the master prompt into ${numberOfSegments} sequential segments, each ${segmentDuration} seconds long.

CRITICAL REQUIREMENTS:
1. Each segment must tell PART of the story, not repeat the whole thing
2. Segments must flow naturally from one to the next
3. Each segment should be dialogue/narration that fits in ${segmentDuration} seconds
4. Include smooth transitions between segments
5. Maintain the core message and brand voice
6. Each segment must be DIFFERENT and SEQUENTIAL

OUTPUT FORMAT (JSON):
{
  "segments": [
    {
      "segmentNumber": 1,
      "prompt": "Professional insurance advisor: 'Hello, thank you for calling QuoteMoto Insurance'",
      "duration": ${segmentDuration},
      "transition": "smooth_continue"
    }
  ]
}

MASTER PROMPT TO SPLIT:
${testPrompt}

NUMBER OF SEGMENTS: ${numberOfSegments}
DURATION PER SEGMENT: ${segmentDuration} seconds

Split this into ${numberOfSegments} sequential segments. Each segment must be DIFFERENT and continue the narrative.`;

  try {
    console.log('🚀 Calling Gemini API...\n');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const response = result.response;
    let text = response.text().trim();

    console.log('📥 Raw API Response:');
    console.log('─'.repeat(80));
    console.log(text);
    console.log('─'.repeat(80));
    console.log(`Length: ${text.length} characters\n`);

    // Check if empty
    if (text.length === 0) {
      console.error('❌ Empty response from API!');
      return;
    }

    // Strip markdown code blocks if present
    if (text.startsWith('```')) {
      console.log('🔧 Stripping markdown code blocks...');
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      console.log('✅ Cleaned text:', text.substring(0, 100) + '...\n');
    }

    // Try to parse JSON
    console.log('🔍 Attempting JSON.parse()...');
    const parsed = JSON.parse(text);

    console.log('✅ JSON parsed successfully!');
    console.log('📊 Parsed structure:');
    console.log(JSON.stringify(parsed, null, 2));

    if (!parsed.segments || !Array.isArray(parsed.segments)) {
      console.error('\n❌ Invalid response format - no segments array');
      return;
    }

    console.log(`\n✅ SUCCESS! Generated ${parsed.segments.length} segments`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error instanceof SyntaxError) {
      console.error('🔍 JSON Parsing Error Details:');
      console.error(`   - Error type: ${error.name}`);
      console.error(`   - Error message: ${error.message}`);
      console.error('\n💡 This means the AI returned incomplete or malformed JSON');
      console.error('   Common causes:');
      console.error('   - Rate limiting');
      console.error('   - API timeout');
      console.error('   - Response truncation');
      console.error('   - Invalid API key');
    }

    console.error('\nFull error:', error);
  }
}

testPromptSplitter();
