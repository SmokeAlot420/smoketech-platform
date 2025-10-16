"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusQuery = exports.getMetricsQuery = exports.scaleSignal = exports.resumeSignal = exports.pauseSignal = void 0;
exports.viralContentPipeline = viralContentPipeline;
const workflow_1 = require("@temporalio/workflow");
// Define activity proxies
const { generateAIContent, generateUltraEnhancedContent, distributeContent, analyzePerformance, replicateWinner, rotateProxy, warmUpAccount, checkAccountHealth } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '30 minutes',
    retry: {
        initialInterval: '30s',
        backoffCoefficient: 2,
        maximumAttempts: 5,
        maximumInterval: '5 minutes'
    }
});
// Signals for workflow control
exports.pauseSignal = (0, workflow_1.defineSignal)('pause');
exports.resumeSignal = (0, workflow_1.defineSignal)('resume');
exports.scaleSignal = (0, workflow_1.defineSignal)('scale');
// Queries for monitoring
exports.getMetricsQuery = (0, workflow_1.defineQuery)('getMetrics');
exports.getStatusQuery = (0, workflow_1.defineQuery)('getStatus');
// Main workflow
async function viralContentPipeline(input) {
    let isPaused = false;
    let scaleFactor = 1;
    let batchCount = 0;
    const metrics = {
        totalVideosGenerated: 0,
        totalViews: 0,
        viralHits: 0,
        averageEngagement: 0,
        revenue: 0,
        costs: 0
    };
    const viralContent = [];
    const errors = [];
    // Set up signal handlers
    (0, workflow_1.setHandler)(exports.pauseSignal, () => {
        isPaused = true;
    });
    (0, workflow_1.setHandler)(exports.resumeSignal, () => {
        isPaused = false;
    });
    (0, workflow_1.setHandler)(exports.scaleSignal, (newScale) => {
        scaleFactor = Math.max(0.1, Math.min(10, newScale));
    });
    // Set up query handlers
    (0, workflow_1.setHandler)(exports.getMetricsQuery, () => metrics);
    (0, workflow_1.setHandler)(exports.getStatusQuery, () => ({
        isRunning: true,
        isPaused,
        currentBatch: batchCount,
        activePersonas: input.personas.length * scaleFactor,
        lastUpdate: new Date()
    }));
    try {
        // Warm up accounts if needed
        for (const platform of input.targetPlatforms) {
            for (const account of platform.accounts) {
                if (account.status === 'warming') {
                    await warmUpAccount({
                        platform: platform.name,
                        accountId: account.id
                    });
                }
            }
        }
        // Main content generation loop
        while (true) {
            // Check if paused
            while (isPaused) {
                await (0, workflow_1.sleep)('5 minutes');
            }
            batchCount++;
            const currentBatchSize = Math.floor(input.batchSize * scaleFactor);
            // Generate content for each persona in parallel
            const contentPromises = [];
            for (const persona of input.personas) {
                for (const series of input.viralSeries) {
                    for (let i = 0; i < currentBatchSize; i++) {
                        contentPromises.push(generateContentWithRetry(persona, series, input.targetPlatforms, input));
                    }
                }
            }
            // Process in chunks to avoid overwhelming the system
            const chunkSize = 10;
            for (let i = 0; i < contentPromises.length; i += chunkSize) {
                const chunk = contentPromises.slice(i, i + chunkSize);
                const results = await Promise.allSettled(chunk);
                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        const content = result.value;
                        metrics.totalVideosGenerated++;
                        // Distribute to platforms
                        const distributions = await distributeContent({
                            content,
                            platforms: input.targetPlatforms.map(p => p.name)
                        });
                        // Wait for initial metrics (1 hour)
                        await (0, workflow_1.sleep)('1 hour');
                        // Analyze performance
                        const performance = await analyzePerformance({
                            contentId: content.id,
                            platformData: distributions
                        });
                        metrics.totalViews += performance.views;
                        metrics.averageEngagement =
                            (metrics.averageEngagement * (metrics.totalVideosGenerated - 1) + performance.engagement)
                                / metrics.totalVideosGenerated;
                        // Check if viral
                        if (performance.viralScore > input.viralThreshold) {
                            metrics.viralHits++;
                            viralContent.push({
                                id: content.id,
                                personaId: content.personaId || 'unknown',
                                seriesId: content.seriesId || 'unknown',
                                platform: performance.bestPlatform,
                                views: performance.views,
                                engagement: performance.engagement,
                                viralScore: performance.viralScore,
                                url: performance.url
                            });
                            // Replicate winner
                            await replicateWinner({
                                originalContent: content,
                                variations: Math.ceil(performance.viralScore / 20)
                            });
                        }
                    }
                    else {
                        errors.push(`Content generation failed: ${result.reason}`);
                    }
                }
            }
            // Update cost metrics
            metrics.costs = metrics.totalVideosGenerated * 0.05; // Estimated AI cost per video
            metrics.revenue = metrics.totalViews * 0.0001; // Estimated revenue per view
            // Check account health
            for (const platform of input.targetPlatforms) {
                for (const account of platform.accounts) {
                    const health = await checkAccountHealth({
                        platform: platform.name,
                        accountId: account.id
                    });
                    if (health.needsRotation) {
                        await rotateProxy({
                            platform: platform.name,
                            accountId: account.id
                        });
                    }
                }
            }
            // Sleep between batches
            await (0, workflow_1.sleep)('3 hours');
        }
    }
    catch (error) {
        if (!(0, workflow_1.isCancellation)(error)) {
            throw workflow_1.ApplicationFailure.nonRetryable(`Workflow failed: ${error}`, 'WorkflowError');
        }
    }
    return {
        metrics,
        viralContent,
        errors
    };
}
// Helper function for content generation with retry
async function generateContentWithRetry(persona, series, _platforms, input) {
    const maxRetries = 3;
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Use enhanced mode if specified
            const content = input?.useEnhancedMode
                ? await generateUltraEnhancedContent({
                    persona,
                    series,
                    platforms: input.platforms || ['tiktok'],
                    useEnhancedMode: true,
                    generateVariations: input.generateVariations,
                    costMode: input.costMode
                })
                : await generateAIContent({
                    persona,
                    series,
                    attempt
                });
            // Ensure personaId and seriesId are in the content
            return {
                ...content,
                personaId: persona.id,
                seriesId: series.id
            };
        }
        catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                await (0, workflow_1.sleep)(`${Math.pow(2, attempt)} minutes`);
            }
        }
    }
    throw lastError;
}
