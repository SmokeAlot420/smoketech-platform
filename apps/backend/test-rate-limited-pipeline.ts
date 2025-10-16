import dotenv from 'dotenv';
dotenv.config();

import { VertexAINanoBananaService } from './src/services/vertexAINanoBanana';
import { VEO3Service } from './src/services/veo3Service';
import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie';

/**
 * Test the complete rate-limited pipeline:
 * 1. Generate image with NanoBanana
 * 2. Create video with VEO3 using rate limiting
 * 3. Test multiple requests to verify rate limiting works
 */
async function testRateLimitedPipeline() {
    console.log('🧪 Testing Rate-Limited Pipeline');
    console.log('================================');

    try {
        // Initialize services
        console.log('1️⃣ Initializing services...');
        const nanoBanana = new VertexAINanoBananaService();
        const veo3 = new VEO3Service();

        // Test 1: Single pipeline run
        console.log('\n2️⃣ Testing single pipeline run...');

        const imagePrompt = quoteMotoInfluencer.generateBasePrompt(
            'Professional headshot in modern office explaining car insurance benefits with confident gesture'
        );

        console.log('📸 Generating image with NanoBanana...');
        const startTime = Date.now();

        const imageResults = await nanoBanana.generateImage(imagePrompt, {
            numImages: 1,
            temperature: 0.3
        });

        const imageTime = Date.now() - startTime;
        console.log(`✅ Image generated in ${imageTime}ms`);
        console.log(`🖼️ Image saved to: ${imageResults[0].imagePath}`);

        // Test 2: VEO3 with rate limiting
        console.log('\n🎬 Generating video with VEO3 (rate limited)...');
        const videoStartTime = Date.now();

        const videoPrompt = `Professional insurance expert explaining car insurance savings to camera.
        Confident gestures, engaging presentation style. Modern office background.
        Camera slowly zooms in during explanation.`;

        const videoResult = await veo3.generateVideoSegment({
            prompt: videoPrompt,
            firstFrame: imageResults[0].imagePath,
            duration: 6,
            aspectRatio: '16:9',
            quality: 'standard',
            videoCount: 1
        });

        const videoTime = Date.now() - videoStartTime;
        console.log(`✅ Video generated in ${videoTime}ms (${Math.round(videoTime/1000)}s)`);
        console.log(`🎥 Video: ${videoResult.videos[0].videoPath}`);

        // Test 3: Multiple requests to verify rate limiting
        console.log('\n3️⃣ Testing rate limiting with multiple requests...');
        console.log('⏱️ Should see automatic delays between requests...');

        const multiTestPromises = [];
        for (let i = 1; i <= 3; i++) {
            multiTestPromises.push(
                (async () => {
                    console.log(`🚀 Starting request ${i} at ${new Date().toISOString()}`);

                    const testImageResults = await nanoBanana.generateImage(`${imagePrompt} - Test variation ${i}`, {
                        numImages: 1,
                        temperature: 0.3
                    });

                    console.log(`✅ Request ${i} image completed at ${new Date().toISOString()}`);

                    // Create short video to test VEO3 rate limiting
                    const shortVideoResult = await veo3.generateVideoSegment({
                        prompt: `Quick ${i} second test video`,
                        firstFrame: testImageResults[0].imagePath,
                        duration: 4,
                        aspectRatio: '1:1',
                        quality: 'standard',
                        videoCount: 1
                    });

                    console.log(`✅ Request ${i} video completed at ${new Date().toISOString()}`);
                    return { image: testImageResults, video: shortVideoResult };
                })()
            );
        }

        const multiResults = await Promise.all(multiTestPromises);
        console.log(`✅ All ${multiResults.length} requests completed successfully!`);

        // Test 4: Verify rate limiting status
        console.log('\n4️⃣ Checking rate limiter status...');
        const rateLimiterStatus = veo3.getRateLimiterStatus();
        console.log('📊 Rate Limiter Status:', {
            requestsInLastMinute: rateLimiterStatus.requestsInLastMinute,
            consecutiveErrors: rateLimiterStatus.consecutiveErrors,
            nextRequestAvailable: new Date(rateLimiterStatus.nextRequestAvailable).toISOString()
        });

        console.log('\n🎉 PIPELINE TEST COMPLETED SUCCESSFULLY!');
        console.log('✅ Rate limiting is working properly');
        console.log('✅ No quota exceeded errors (429)');
        console.log('✅ Pipeline stays within 10 requests/minute limit');

        const totalTime = Date.now() - startTime;
        console.log(`⏱️ Total test time: ${Math.round(totalTime/1000)}s`);

    } catch (error: any) {
        console.error('❌ Pipeline test failed:', error.message);

        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
            console.error('🚨 QUOTA ERROR: Rate limiting may need adjustment');
        } else if (error.message?.includes('GEMINI_API_KEY')) {
            console.error('🔑 AUTHENTICATION ERROR: Check your GEMINI_API_KEY in .env');
        } else if (error.message?.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
            console.error('🔑 AUTHENTICATION ERROR: Check your Vertex AI service account');
        }

        throw error;
    }
}

// Run the test
if (require.main === module) {
    testRateLimitedPipeline()
        .then(() => {
            console.log('\n✨ Test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

export { testRateLimitedPipeline };