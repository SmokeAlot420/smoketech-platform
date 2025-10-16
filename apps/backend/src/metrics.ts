// Metrics Collection and Analysis

export interface ContentMetrics {
  contentId: string;
  platform: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
    impressions?: number;
    reach?: number;
  };
  timestamp: Date;
}

export interface AggregatedMetrics {
  totalViews: number;
  totalEngagement: number;
  averageViralScore: number;
  topContent: ContentMetrics[];
  platformBreakdown: Record<string, PlatformMetrics>;
}

export interface PlatformMetrics {
  views: number;
  engagement: number;
  posts: number;
  viralRate: number;
}

export class MetricsCollector {
  private metricsStore: Map<string, ContentMetrics[]>;
  private aggregateCache: Map<string, AggregatedMetrics>;

  constructor() {
    this.metricsStore = new Map();
    this.aggregateCache = new Map();
  }

  async record(metrics: ContentMetrics): Promise<void> {
    const key = `${metrics.contentId}-${metrics.platform}`;

    if (!this.metricsStore.has(key)) {
      this.metricsStore.set(key, []);
    }

    this.metricsStore.get(key)!.push(metrics);

    // Invalidate cache
    this.aggregateCache.clear();

    console.log(`Recorded metrics for ${key}: ${metrics.metrics.views} views`);
  }

  async getContentMetrics(contentId: string): Promise<ContentMetrics[]> {
    const results: ContentMetrics[] = [];

    for (const [key, metrics] of this.metricsStore.entries()) {
      if (key.startsWith(contentId)) {
        results.push(...metrics);
      }
    }

    return results;
  }

  async getAggregatedMetrics(timeWindow: number = 7): Promise<AggregatedMetrics> {
    const cacheKey = `aggregate-${timeWindow}`;

    if (this.aggregateCache.has(cacheKey)) {
      return this.aggregateCache.get(cacheKey)!;
    }

    const cutoff = new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000);
    const recentMetrics: ContentMetrics[] = [];

    for (const metrics of this.metricsStore.values()) {
      recentMetrics.push(...metrics.filter(m => m.timestamp > cutoff));
    }

    const platformBreakdown: Record<string, PlatformMetrics> = {};
    let totalViews = 0;
    let totalEngagement = 0;

    for (const metric of recentMetrics) {
      const platform = metric.platform;

      if (!platformBreakdown[platform]) {
        platformBreakdown[platform] = {
          views: 0,
          engagement: 0,
          posts: 0,
          viralRate: 0
        };
      }

      platformBreakdown[platform].views += metric.metrics.views;
      platformBreakdown[platform].engagement +=
        metric.metrics.likes + metric.metrics.comments + metric.metrics.shares;
      platformBreakdown[platform].posts++;

      totalViews += metric.metrics.views;
      totalEngagement += metric.metrics.likes + metric.metrics.comments + metric.metrics.shares;
    }

    // Calculate viral rate (>100k views)
    for (const platform in platformBreakdown) {
      const viralPosts = recentMetrics.filter(
        m => m.platform === platform && m.metrics.views > 100000
      ).length;
      platformBreakdown[platform].viralRate =
        (viralPosts / platformBreakdown[platform].posts) * 100;
    }

    // Get top content
    const topContent = [...recentMetrics]
      .sort((a, b) => b.metrics.views - a.metrics.views)
      .slice(0, 10);

    const aggregated: AggregatedMetrics = {
      totalViews,
      totalEngagement,
      averageViralScore: this.calculateAverageViralScore(recentMetrics),
      topContent,
      platformBreakdown
    };

    this.aggregateCache.set(cacheKey, aggregated);
    return aggregated;
  }

  private calculateAverageViralScore(metrics: ContentMetrics[]): number {
    if (!metrics.length) return 0;

    const scores = metrics.map(m => {
      const engagementRate = m.metrics.views > 0
        ? ((m.metrics.likes + m.metrics.comments + m.metrics.shares) / m.metrics.views) * 100
        : 0;

      const shareRatio = m.metrics.views > 0
        ? (m.metrics.shares / m.metrics.views) * 100
        : 0;

      // Simplified viral score calculation
      const viewsScore = Math.min(m.metrics.views / 10000, 30);
      const engagementScore = Math.min(engagementRate * 5, 30);
      const shareScore = Math.min(shareRatio * 10, 20);
      const velocityScore = 20; // Simplified - would track time-based growth

      return viewsScore + engagementScore + shareScore + velocityScore;
    });

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  async getPerformanceReport(personaId?: string, seriesId?: string): Promise<any> {
    const allMetrics = [];

    for (const metrics of this.metricsStore.values()) {
      allMetrics.push(...metrics);
    }

    // Filter by persona or series if provided
    let filtered = allMetrics;

    if (personaId) {
      filtered = filtered.filter(m => m.contentId.includes(personaId));
    }

    if (seriesId) {
      filtered = filtered.filter(m => m.contentId.includes(seriesId));
    }

    // Calculate performance metrics
    const totalPosts = filtered.length;
    const totalViews = filtered.reduce((sum, m) => sum + m.metrics.views, 0);
    const totalLikes = filtered.reduce((sum, m) => sum + m.metrics.likes, 0);
    const totalComments = filtered.reduce((sum, m) => sum + m.metrics.comments, 0);
    const totalShares = filtered.reduce((sum, m) => sum + m.metrics.shares, 0);

    const viralPosts = filtered.filter(m => m.metrics.views > 100000).length;
    const viralRate = totalPosts > 0 ? (viralPosts / totalPosts) * 100 : 0;

    const avgViews = totalPosts > 0 ? totalViews / totalPosts : 0;
    const avgEngagement = totalViews > 0
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100
      : 0;

    return {
      personaId,
      seriesId,
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      viralPosts,
      viralRate: viralRate.toFixed(2) + '%',
      avgViews: Math.round(avgViews),
      avgEngagement: avgEngagement.toFixed(2) + '%',
      topPost: filtered.sort((a, b) => b.metrics.views - a.metrics.views)[0]
    };
  }
}