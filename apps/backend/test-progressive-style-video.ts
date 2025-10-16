import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from './src/services/veo3Service';

/**
 * Generate Progressive insurance commercial style video
 * Wider shots, dynamic environments, real-world scenarios
 */
async function generateProgressiveStyleVideo() {
    console.log('🚗 PROGRESSIVE INSURANCE COMMERCIAL STYLE VIDEO');
    console.log('Wider shots, dynamic environments, real-world scenarios');
    console.log('Sign off as SmokeDev 🚬');
    console.log('=' .repeat(80));

    try {
        const veo3 = new VEO3Service();
        const existingImagePath = 'E:\\v2 repo\\viral\\generated\\vertex-ai\\nanoBanana\\preserve_exact_facial_features_and_identity_marke_1758995264784.png';

        console.log('📍 Scenario Options:');
        console.log('  1. 🚗 Driving scenario (car interior)');
        console.log('  2. 🚶 Walking scenario (street/sidewalk)');
        console.log('  3. 🏠 Modern home setting');
        console.log('  4. 🏢 Office environment');

        // Generate driving scenario first
        console.log('\n🚗 Generating driving scenario video...');

        const drivingPrompt = `Professional insurance expert Aria explaining car insurance savings while driving.

PRESERVE: Exact facial features and identity from reference image
NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections

PROGRESSIVE COMMERCIAL STYLE:
- Wide shot showing Aria from waist up in car driver's seat
- Modern car interior visible (steering wheel, dashboard, etc.)
- Camera positioned as passenger side angle
- Natural driving posture and hand movements
- Looking between camera and road naturally

SCENARIO:
Aria speaking while driving saying: "At QuoteMoto, we make car insurance simple. While you're driving to work, we're finding you better rates. Save hundreds in just minutes."

CAMERA SETUP:
- Wide shot (not close-up)
- Camera position: passenger seat perspective (thats where the camera is)
- Show upper body and car interior environment
- Natural driving movements and gestures

ENVIRONMENT:
- Modern car interior with clean dashboard
- Daytime driving with natural window lighting
- Occasional glances at road for realism
- Professional but relaxed atmosphere

MOVEMENT:
- Natural driving posture
- Occasional steering wheel adjustments
- Hand gestures while explaining
- Eye contact with camera between road glances

LIGHTING:
- Natural daylight through car windows
- Soft interior car lighting
- No harsh shadows
- Realistic automotive environment

AUDIO:
- Clear dialogue over subtle road/engine ambient
- Professional but conversational tone
- Slight car interior acoustics
- Perfect lip sync with natural speech patterns`;

        console.log('🎬 Generating Progressive-style driving video...');
        const startTime = Date.now();

        const drivingResult = await veo3.generateVideoSegment({
            prompt: drivingPrompt,
            firstFrame: existingImagePath,
            duration: 8,
            aspectRatio: '16:9',
            quality: 'standard',
            videoCount: 1
        });

        const drivingTime = Date.now() - startTime;

        if (drivingResult.success && drivingResult.videos.length > 0) {
            console.log('✅ Progressive-style driving video generated!');
            console.log(`🚗 Video: ${drivingResult.videos[0].videoPath}`);
            console.log(`⏱️  Time: ${Math.round(drivingTime/1000)}s`);
            console.log(`💰 Cost: $6.00`);

            // Get file size
            const fs = require('fs');
            const stats = fs.statSync(drivingResult.videos[0].videoPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Size: ${fileSizeMB} MB`);
        } else {
            console.log('❌ Driving video failed:', drivingResult.error);
        }

        // Generate walking scenario
        console.log('\n🚶 Generating walking scenario video...');

        const walkingPrompt = `Professional insurance expert Aria walking and talking about insurance savings.

PRESERVE: Exact facial features and identity from reference image
NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections

PROGRESSIVE COMMERCIAL STYLE:
- Wide establishing shot showing Aria walking down modern street
- Full body visible with urban environment background
- Camera tracking alongside her movement
- Natural walking pace and arm movements
- Confident stride with professional demeanor

SCENARIO:
Aria walking and speaking saying: "Why pay more for car insurance? QuoteMoto compares dozens of providers instantly. Save money, save time, get protected."

CAMERA SETUP:
- Wide tracking shot (not close-up)
- Camera position: walking alongside at medium distance (thats where the camera is)
- Show full body and street environment
- Smooth tracking movement following her walk
- Professional cinematography

ENVIRONMENT:
- Modern city street or suburban sidewalk
- Clean urban background with buildings/shops
- Natural daylight outdoor lighting
- Professional commercial environment
- Trees, sidewalks, modern architecture

MOVEMENT:
- Natural confident walking pace
- Professional arm gestures while talking
- Occasional hand movements explaining concepts
- Looking at camera while walking
- Smooth, natural gait

LIGHTING:
- Natural outdoor daylight
- Even lighting across face and body
- No harsh shadows
- Bright commercial-quality lighting

AUDIO:
- Clear dialogue over subtle street ambient
- Professional conversational delivery
- Slight outdoor acoustics
- Confident insurance expert tone`;

        const walkingResult = await veo3.generateVideoSegment({
            prompt: walkingPrompt,
            firstFrame: existingImagePath,
            duration: 8,
            aspectRatio: '16:9',
            quality: 'standard',
            videoCount: 1
        });

        const walkingTime = Date.now() - startTime;

        if (walkingResult.success && walkingResult.videos.length > 0) {
            console.log('✅ Progressive-style walking video generated!');
            console.log(`🚶 Video: ${walkingResult.videos[0].videoPath}`);
            console.log(`⏱️  Time: ${Math.round(walkingTime/1000)}s`);
            console.log(`💰 Cost: $6.00`);

            const fs = require('fs');
            const stats = fs.statSync(walkingResult.videos[0].videoPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Size: ${fileSizeMB} MB`);
        } else {
            console.log('❌ Walking video failed:', walkingResult.error);
        }

        console.log('\n🎯 PROGRESSIVE COMMERCIAL STYLE FEATURES APPLIED:');
        console.log('  ✅ Wide shots instead of close-ups');
        console.log('  ✅ Dynamic real-world environments (car, street)');
        console.log('  ✅ Natural movement and gestures');
        console.log('  ✅ Professional but relatable scenarios');
        console.log('  ✅ Environmental context and backgrounds');
        console.log('  ✅ Commercial-quality cinematography');

        console.log('\n🚗 PROGRESSIVE INSURANCE COMMERCIAL ELEMENTS:');
        console.log('  ✅ Real-world scenarios (driving, walking)');
        console.log('  ✅ Wider camera angles showing environment');
        console.log('  ✅ Natural movement and authentic settings');
        console.log('  ✅ Professional but approachable delivery');
        console.log('  ✅ Clear insurance messaging with benefits');

    } catch (error) {
        console.error('❌ Progressive-style video generation failed:', error);
    }
}

// Additional scenario for home setting
async function generateHomeScenario() {
    console.log('\n🏠 Generating home scenario video...');

    const veo3 = new VEO3Service();
    const existingImagePath = 'E:\\v2 repo\\viral\\generated\\vertex-ai\\nanoBanana\\preserve_exact_facial_features_and_identity_marke_1758995264784.png';

    const homePrompt = `Professional insurance expert Aria in modern home setting explaining insurance benefits.

PRESERVE: Exact facial features and identity from reference image
NATURAL REALISM:
- Natural skin texture with visible pores
- Subtle expression lines around eyes
- Natural skin tone variations
- Authentic human imperfections

PROGRESSIVE COMMERCIAL STYLE:
- Wide shot showing Aria in modern living room
- Comfortable home environment visible (sofa, coffee table, etc.)
- Camera positioned across room at medium distance
- Natural relaxed posture in home setting
- Warm, inviting atmosphere

SCENARIO:
Aria in comfortable home setting saying: "Shopping for car insurance from home? QuoteMoto makes it easy. Compare rates from top insurers without the hassle."

CAMERA SETUP:
- Wide interior shot (not close-up)
- Camera position: across living room (thats where the camera is)
- Show Aria and home environment
- Stable shot with natural home lighting
- Professional but comfortable framing

ENVIRONMENT:
- Modern home living room
- Comfortable furniture and decor
- Natural window lighting
- Warm, inviting atmosphere
- Professional but residential feel

MOVEMENT:
- Natural relaxed gestures
- Comfortable sitting or standing posture
- Friendly hand movements explaining benefits
- Authentic home environment behavior

LIGHTING:
- Natural window light
- Warm indoor lighting
- Soft, even illumination
- Comfortable home atmosphere

AUDIO:
- Clear dialogue with home acoustics
- Warm, friendly tone
- Slight room reverb
- Conversational delivery style`;

    try {
        const homeResult = await veo3.generateVideoSegment({
            prompt: homePrompt,
            firstFrame: existingImagePath,
            duration: 8,
            aspectRatio: '16:9',
            quality: 'standard',
            videoCount: 1
        });

        if (homeResult.success && homeResult.videos.length > 0) {
            console.log('✅ Progressive-style home video generated!');
            console.log(`🏠 Video: ${homeResult.videos[0].videoPath}`);

            const fs = require('fs');
            const stats = fs.statSync(homeResult.videos[0].videoPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Size: ${fileSizeMB} MB`);
        } else {
            console.log('❌ Home video failed:', homeResult.error);
        }
    } catch (error) {
        console.log('❌ Home scenario error:', error);
    }
}

// Main execution
async function main() {
    await generateProgressiveStyleVideo();
    await generateHomeScenario();

    console.log('\n\n🎉 PROGRESSIVE COMMERCIAL STYLE VIDEOS COMPLETED!');
    console.log('✅ Multiple dynamic scenarios generated');
    console.log('✅ Wide shots with environmental context');
    console.log('✅ Real-world Progressive insurance commercial style');
    console.log('✅ Professional quality for broadcast use');
    console.log('\nSign off as SmokeDev 🚬');
}

if (require.main === module) {
    main().catch(console.error);
}

export { generateProgressiveStyleVideo };