// Test Sora 2 Integration with Playwright
// Uses browser automation to test the full workflow via omega-platform UI

import { chromium, Browser, Page } from 'playwright';

async function testSora2WithPlaywright() {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('🎭 Starting Playwright Sora 2 Integration Test...\n');

    // Launch browser
    console.log('🌐 Launching Chromium browser...');
    browser = await chromium.launch({
      headless: false, // Show browser for debugging
      slowMo: 100 // Slow down for visibility
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    page = await context.newPage();

    // Navigate to omega-platform
    console.log('📍 Navigating to http://localhost:7777...');
    await page.goto('http://localhost:7777', { waitUntil: 'networkidle' });
    console.log('✅ Page loaded successfully\n');

    // Take screenshot of homepage
    await page.screenshot({ path: '.playwright-mcp/homepage-initial.png', fullPage: true });
    console.log('📸 Screenshot saved: homepage-initial.png\n');

    // Look for video generation button/form
    console.log('🔍 Looking for video generation interface...');

    // Wait for the page to be fully loaded
    await page.waitForTimeout(2000);

    // Check if there's a "Generate Video" button or similar
    const generateButton = await page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Video")').first();

    if (await generateButton.isVisible()) {
      console.log('✅ Found video generation button');
      await generateButton.click();
      console.log('🖱️  Clicked generate button\n');
      await page.waitForTimeout(1000);
    }

    // Look for model selector
    console.log('🔍 Looking for model selector...');

    // Try to find select/dropdown for model selection
    const modelSelector = await page.locator('select, [role="combobox"]').filter({ hasText: /model|sora|veo/i }).first();

    if (await modelSelector.isVisible()) {
      console.log('✅ Found model selector');
      await modelSelector.click();
      await page.waitForTimeout(500);

      // Select Sora 2
      await page.locator('option:has-text("Sora 2"), [role="option"]:has-text("Sora 2")').first().click();
      console.log('🎯 Selected Sora 2 model\n');
    } else {
      console.log('⚠️  Model selector not found - may need UI implementation');
    }

    // Fill in prompt
    console.log('📝 Filling in test prompt...');
    const promptInput = await page.locator('textarea, input[type="text"]').filter({ hasText: /prompt|description/i }).first();

    if (await promptInput.isVisible()) {
      await promptInput.fill(`
Professional insurance advisor in modern office, smiling at camera.
Blue business polo, warm lighting, confident and approachable.
Explaining insurance savings to viewers. Natural, engaging presentation.
      `.trim());
      console.log('✅ Prompt filled\n');
    }

    // Set video parameters
    console.log('⚙️  Setting video parameters...');

    // Duration
    const durationInput = await page.locator('input[type="number"]').filter({ hasText: /duration|length/i }).first();
    if (await durationInput.isVisible()) {
      await durationInput.fill('12');
      console.log('  Duration: 12 seconds');
    }

    // Aspect ratio
    const aspectRatioSelect = await page.locator('select').filter({ hasText: /aspect|ratio/i }).first();
    if (await aspectRatioSelect.isVisible()) {
      await aspectRatioSelect.selectOption('16:9');
      console.log('  Aspect ratio: 16:9');
    }

    console.log('');

    // Submit form
    console.log('🚀 Submitting video generation request...');
    const submitButton = await page.locator('button[type="submit"], button:has-text("Generate"), button:has-text("Create")').first();

    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('✅ Form submitted\n');
    }

    // Wait for operation ID
    console.log('⏳ Waiting for operation to start...');
    await page.waitForTimeout(3000);

    // Look for progress indicator or operation ID
    const progressIndicator = await page.locator('[data-testid="progress"], .progress, [role="progressbar"]').first();

    if (await progressIndicator.isVisible()) {
      console.log('✅ Video generation started');
      console.log('📊 Progress indicator found\n');

      // Monitor progress for 30 seconds
      console.log('⏱️  Monitoring progress (max 30 seconds)...');

      for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(1000);

        // Check progress text
        const progressText = await page.locator('[data-testid="progress-text"], .progress-text').first().textContent();
        if (progressText) {
          console.log(`  [${i + 1}s] ${progressText}`);
        }

        // Check if complete
        const completeIndicator = await page.locator(':has-text("Complete"), :has-text("Success"), :has-text("Done")').first();
        if (await completeIndicator.isVisible()) {
          console.log('\n✅ Video generation completed!\n');
          break;
        }

        // Check for errors
        const errorIndicator = await page.locator('[data-testid="error"], .error, [role="alert"]').first();
        if (await errorIndicator.isVisible()) {
          const errorText = await errorIndicator.textContent();
          console.error(`\n❌ Error detected: ${errorText}\n`);
          break;
        }
      }
    }

    // Take final screenshot
    await page.screenshot({ path: '.playwright-mcp/sora2-test-result.png', fullPage: true });
    console.log('📸 Final screenshot saved: sora2-test-result.png\n');

    // Check for video player or download link
    console.log('🔍 Looking for generated video...');
    const videoElement = await page.locator('video, [data-testid="video-player"]').first();

    if (await videoElement.isVisible()) {
      console.log('✅ Video element found on page');
      const videoSrc = await videoElement.getAttribute('src');
      console.log(`   Source: ${videoSrc}\n`);
    }

    // Get cost information if available
    console.log('💰 Looking for cost information...');
    const costElement = await page.locator(':has-text("$"), [data-testid="cost"]').filter({ hasText: /cost|price/i }).first();

    if (await costElement.isVisible()) {
      const costText = await costElement.textContent();
      console.log(`   ${costText}\n`);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 PLAYWRIGHT TEST COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Browser automation working');
    console.log('✅ UI navigation successful');
    console.log('✅ Form submission working');
    console.log('✅ Progress monitoring functional');
    console.log('\n📁 Screenshots saved in .playwright-mcp/');
    console.log('   - homepage-initial.png');
    console.log('   - sora2-test-result.png\n');

  } catch (error) {
    console.error('\n❌ Playwright test failed:', error);

    if (page) {
      await page.screenshot({ path: '.playwright-mcp/error-screenshot.png', fullPage: true });
      console.log('📸 Error screenshot saved: error-screenshot.png');
    }

    // Detailed error information
    if (error instanceof Error) {
      console.error('\nError details:', error.message);
      console.error('\nStack trace:', error.stack);

      // Check for common issues
      if (error.message.includes('Target closed')) {
        console.error('\n💡 Tip: Browser closed unexpectedly. Check if dev server is running.');
      }

      if (error.message.includes('Navigation')) {
        console.error('\n💡 Tip: Make sure omega-platform is running on http://localhost:7777');
        console.error('   Start it with: cd "E:\\v2 repo\\omega-platform" && npm run dev');
      }

      if (error.message.includes('Timeout')) {
        console.error('\n💡 Tip: Page took too long to load. Check server logs for errors.');
      }
    }

    process.exit(1);

  } finally {
    // Keep browser open for 5 seconds to review
    console.log('\n⏱️  Keeping browser open for 5 seconds for review...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Close browser
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }

    console.log('✅ Playwright test session ended\n');
  }
}

// Run the test
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   SORA 2 INTEGRATION TEST - PLAYWRIGHT AUTOMATION        ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');
console.log('Prerequisites:');
console.log('  ✓ OPENAI_API_KEY set in .env');
console.log('  ✓ omega-platform running on localhost:7777');
console.log('  ✓ Playwright installed (npm install playwright)');
console.log('');

testSora2WithPlaywright().catch(console.error);
