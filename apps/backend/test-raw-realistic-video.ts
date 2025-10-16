import dotenv from 'dotenv';
dotenv.config();

import { VEO3Service } from './src/services/veo3Service';

/**
 * Generate RAW, AUTHENTIC video that fights against AI over-polishing
 * Focused on natural, unpolished, real-world appearance
 */
async function generateRawRealisticVideo() {
    console.log('🎯 RAW REALISTIC VIDEO GENERATION');
    console.log('Fighting AI over-polishing - making it look REAL');
    console.log('Sign off as SmokeDev 🚬');
    console.log('=' .repeat(80));

    try {
        const veo3 = new VEO3Service();
        const existingImagePath = 'E:\\v2 repo\\viral\\generated\\vertex-ai\\nanoBanana\\preserve_exact_facial_features_and_identity_marke_1758995264784.png';

        console.log('🔧 ANTI-AI POLISH SETTINGS APPLIED:');
        console.log('  ❌ Removed all "professional" language');
        console.log('  ❌ Stripped beautification keywords');
        console.log('  ✅ Added raw, authentic descriptors');
        console.log('  ✅ Enhanced anti-AI negative prompts');
        console.log('  ✅ Natural handheld camera feel');

        // RAW REALISTIC DRIVING SCENARIO
        console.log('\n🚗 Generating RAW driving scenario...');

        const rawDrivingPrompt = `Aria talking about car insurance while driving her car.

KEEP SAME FACE: Use exact facial features from reference image
RAW REALISM:
- Slightly imperfect skin with actual visible texture
- Natural facial asymmetry and real human imperfections
- Genuine micro-expressions and natural blinking
- Authentic skin tone variations with real-world lighting

SCENARIO:
Aria driving and saying: "I saved like 400 bucks switching to QuoteMoto. Takes literally 2 minutes to compare rates. Super easy."

AUTHENTIC SETUP:
- Handheld phone camera from passenger seat
- Natural car interior lighting (not studio perfect)
- Slight camera shake from phone holder
- Real driving movements and natural posture
- Occasional road glare through windshield

ENVIRONMENT:
- Actual car interior with normal wear
- Natural sunlight with some shadows
- Realistic dashboard reflections
- Authentic road environment outside
- Normal car sounds and ambient noise

MOVEMENT:
- Natural driving behavior
- Authentic steering adjustments
- Real glances between camera and road
- Casual hand gestures while talking
- Genuine relaxed posture

LIGHTING:
- Raw natural sunlight through car windows
- Some harsh shadows and imperfect lighting
- Realistic dashboard glare
- Natural skin highlighting and shadows
- Unpolished real-world illumination

CAMERA:
- Slightly unstable handheld feel
- Natural phone camera quality
- Minor focus shifts
- Real-world camera positioning
- Authentic amateur video style`;

        console.log('📱 Using raw handheld camera style...');

        // Add negative prompts directly to the prompt
        const enhancedDrivingPrompt = `${rawDrivingPrompt}

AVOID: over-processed, AI-enhanced, smoothed, polished, studio-perfect, too clean, artificial lighting, perfect skin, professional cinematography, beautified, plastic, synthetic, fake, unrealistic, over-produced, commercial-grade, flawless, studio-quality, enhanced, retouched, airbrushed`;

        const rawDrivingResult = await veo3.generateVideoSegment({
            prompt: enhancedDrivingPrompt,
            firstFrame: existingImagePath,
            duration: 8,
            aspectRatio: '16:9',
            quality: 'standard',
            videoCount: 1
        });

        if (rawDrivingResult.success && rawDrivingResult.videos.length > 0) {
            console.log('✅ RAW driving video generated!');
            console.log(`🚗 Video: ${rawDrivingResult.videos[0].videoPath}`);

            const fs = require('fs');
            const stats = fs.statSync(rawDrivingResult.videos[0].videoPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Size: ${fileSizeMB} MB`);
        } else {
            console.log('❌ Raw driving video failed:', rawDrivingResult.error);
        }

        // RAW REALISTIC WALKING SCENARIO
        console.log('\n🚶 Generating RAW walking scenario...');

        const rawWalkingPrompt = `Aria walking down the street talking about insurance.

KEEP SAME FACE: Use exact facial features from reference image
RAW REALISM:
- Natural skin texture with real pores and slight shine
- Authentic facial expressions and natural eye movements
- Real human imperfections and asymmetry
- Genuine outdoor lighting on skin

SCENARIO:
Aria walking and saying: "So I was paying like 200 a month for car insurance. Found QuoteMoto, now I pay 120. Same coverage, way cheaper."

AUTHENTIC SETUP:
- Friend filming with phone while walking beside her
- Natural outdoor lighting with real shadows
- Slight camera movement from walking
- Real street environment with background activity
- Authentic pedestrian pace and movement

ENVIRONMENT:
- Actual city street or neighborhood sidewalk
- Real outdoor lighting conditions
- Natural background elements (cars, buildings)
- Authentic street sounds and ambient noise
- Uncontrolled outdoor lighting

MOVEMENT:
- Natural walking pace and rhythm
- Authentic arm swinging while walking
- Real casual conversation gestures
- Genuine looking at camera while moving
- Natural navigation around environment

LIGHTING:
- Raw outdoor sunlight
- Natural shadows on face and body
- Real-world lighting variations
- Authentic skin tone in natural light
- Unpolished outdoor illumination

CAMERA:
- Handheld phone camera feel
- Natural walking camera movement
- Realistic amateur filming style
- Authentic friend-filming-friend vibe
- Real-world camera positioning`;

        const enhancedWalkingPrompt = `${rawWalkingPrompt}

AVOID: over-processed, AI-enhanced, smoothed, polished, studio-perfect, too clean, artificial lighting, perfect skin, professional cinematography, beautified, plastic, synthetic, fake, unrealistic, over-produced, commercial-grade, flawless, studio-quality, enhanced, retouched, airbrushed, perfect posture, choreographed movement`;

        const rawWalkingResult = await veo3.generateVideoSegment({
            prompt: enhancedWalkingPrompt,
            firstFrame: existingImagePath,
            duration: 8,
            aspectRatio: '16:9',
            quality: 'standard',
            videoCount: 1
        });

        if (rawWalkingResult.success && rawWalkingResult.videos.length > 0) {
            console.log('✅ RAW walking video generated!');
            console.log(`🚶 Video: ${rawWalkingResult.videos[0].videoPath}`);

            const fs = require('fs');
            const stats = fs.statSync(rawWalkingResult.videos[0].videoPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Size: ${fileSizeMB} MB`);
        } else {
            console.log('❌ Raw walking video failed:', rawWalkingResult.error);
        }

        // RAW REALISTIC HOME SCENARIO
        console.log('\n🏠 Generating RAW home scenario...');

        const rawHomePrompt = `Aria at home talking about her insurance experience.

KEEP SAME FACE: Use exact facial features from reference image
RAW REALISM:
- Natural home lighting with real shadows
- Authentic relaxed posture and casual demeanor
- Real skin texture in indoor lighting
- Genuine home environment feel

SCENARIO:
Aria at home saying: "Honestly, QuoteMoto saved me so much money. I was skeptical but it actually works. Super quick, no BS."

AUTHENTIC SETUP:
- Filming herself with phone at home
- Natural indoor lighting (lamps, windows)
- Casual home clothing and relaxed vibe
- Real home background with normal clutter
- Authentic self-filming angle

ENVIRONMENT:
- Actual home living space
- Natural indoor lighting mix
- Real furniture and home decorations
- Authentic home acoustics
- Normal household background sounds

MOVEMENT:
- Natural relaxed gestures
- Authentic home behavior
- Real casual conversation style
- Genuine comfortable posture
- Natural self-filming movements

LIGHTING:
- Mixed indoor lighting sources
- Natural window light combined with lamps
- Real shadows and lighting variations
- Authentic indoor skin tone
- Unpolished home lighting

CAMERA:
- Self-filming with phone camera
- Natural selfie-style angle
- Authentic home video feel
- Real self-recording positioning
- Amateur home video quality`;

        const enhancedHomePrompt = `${rawHomePrompt}

AVOID: over-processed, AI-enhanced, smoothed, polished, studio-perfect, too clean, artificial lighting, perfect skin, professional cinematography, beautified, plastic, synthetic, fake, unrealistic, over-produced, commercial-grade, flawless, studio-quality, enhanced, retouched, airbrushed, perfect setup, studio lighting`;

        const rawHomeResult = await veo3.generateVideoSegment({
            prompt: enhancedHomePrompt,
            firstFrame: existingImagePath,
            duration: 8,
            aspectRatio: '16:9',
            quality: 'standard',
            videoCount: 1
        });

        if (rawHomeResult.success && rawHomeResult.videos.length > 0) {
            console.log('✅ RAW home video generated!');
            console.log(`🏠 Video: ${rawHomeResult.videos[0].videoPath}`);

            const fs = require('fs');
            const stats = fs.statSync(rawHomeResult.videos[0].videoPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Size: ${fileSizeMB} MB`);
        } else {
            console.log('❌ Raw home video failed:', rawHomeResult.error);
        }

        console.log('\n🎯 RAW REALISM FEATURES APPLIED:');
        console.log('  ✅ Removed ALL "professional" language');
        console.log('  ✅ Added handheld camera movement');
        console.log('  ✅ Natural imperfect lighting');
        console.log('  ✅ Authentic amateur video style');
        console.log('  ✅ Real-world environment imperfections');
        console.log('  ✅ Enhanced anti-AI negative prompts');

        console.log('\n🔧 ANTI-AI POLISH TECHNIQUES:');
        console.log('  ❌ No studio lighting or perfect setups');
        console.log('  ❌ No professional cinematography language');
        console.log('  ❌ No enhancement or beautification keywords');
        console.log('  ✅ Added natural camera shake and movement');
        console.log('  ✅ Emphasized real-world lighting imperfections');
        console.log('  ✅ Focused on authentic human behavior');

    } catch (error) {
        console.error('❌ Raw realistic video generation failed:', error);
    }
}

// Main execution
async function main() {
    await generateRawRealisticVideo();

    console.log('\n\n🎉 RAW REALISTIC VIDEOS COMPLETED!');
    console.log('✅ Fought against AI over-polishing');
    console.log('✅ Natural, authentic, unpolished appearance');
    console.log('✅ Real-world lighting and camera work');
    console.log('✅ Genuine human behavior and movement');
    console.log('\nSign off as SmokeDev 🚬');
}

if (require.main === module) {
    main().catch(console.error);
}

export { generateRawRealisticVideo };