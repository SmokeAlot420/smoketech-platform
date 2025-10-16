import axios from 'axios';

// Social media platform interfaces
interface TwitterCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;
}

interface InstagramCredentials {
  accessToken: string;
  businessAccountId: string;
}

interface YouTubeCredentials {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
}

interface TikTokCredentials {
  clientKey: string;
  clientSecret: string;
  accessToken: string;
}

interface PostContent {
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  hashtags: string[];
  voiceover?: string;
  campaignType: string;
}

interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  engagement?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

export class SocialMediaPoster {
  private twitterCredentials?: TwitterCredentials;
  private instagramCredentials?: InstagramCredentials;
  private youtubeCredentials?: YouTubeCredentials;
  private tiktokCredentials?: TikTokCredentials;

  constructor() {
    this.loadCredentials();
  }

  private loadCredentials() {
    // Load credentials from environment variables
    if (process.env.TWITTER_API_KEY) {
      this.twitterCredentials = {
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
        bearerToken: process.env.TWITTER_BEARER_TOKEN!
      };
    }

    if (process.env.INSTAGRAM_ACCESS_TOKEN) {
      this.instagramCredentials = {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!
      };
    }

    if (process.env.YOUTUBE_CLIENT_ID) {
      this.youtubeCredentials = {
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
        accessToken: process.env.YOUTUBE_ACCESS_TOKEN!,
        refreshToken: process.env.YOUTUBE_REFRESH_TOKEN!
      };
    }

    if (process.env.TIKTOK_CLIENT_KEY) {
      this.tiktokCredentials = {
        clientKey: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
        accessToken: process.env.TIKTOK_ACCESS_TOKEN!
      };
    }
  }

  /**
   * Post QuoteMoto content to multiple social media platforms
   */
  async postToAllPlatforms(content: PostContent): Promise<PostResult[]> {
    const results: PostResult[] = [];

    console.log(`[SocialMedia] Posting QuoteMoto ${content.campaignType} content to all platforms`);

    // Post to each platform in parallel
    const postPromises = [];

    if (this.twitterCredentials) {
      postPromises.push(this.postToTwitter(content));
    }

    if (this.instagramCredentials) {
      postPromises.push(this.postToInstagram(content));
    }

    if (this.youtubeCredentials && content.videoUrl) {
      postPromises.push(this.postToYouTube(content));
    }

    if (this.tiktokCredentials && content.videoUrl) {
      postPromises.push(this.postToTikTok(content));
    }

    // Wait for all posts to complete
    const platformResults = await Promise.allSettled(postPromises);

    platformResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          platform: ['twitter', 'instagram', 'youtube', 'tiktok'][index],
          success: false,
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    console.log(`[SocialMedia] Posted to ${results.filter(r => r.success).length}/${results.length} platforms`);

    return results;
  }

  /**
   * Post QuoteMoto content to Twitter/X
   */
  private async postToTwitter(content: PostContent): Promise<PostResult> {
    if (!this.twitterCredentials) {
      throw new Error('Twitter credentials not configured');
    }

    try {
      console.log('[Twitter] Posting QuoteMoto content...');

      // Prepare tweet text with QuoteMoto branding
      const tweetText = this.formatTwitterContent(content);

      let mediaId: string | undefined;

      // Upload media if available
      if (content.videoUrl || content.imageUrl) {
        const mediaUrl = content.videoUrl || content.imageUrl!;
        mediaId = await this.uploadMediaToTwitter(mediaUrl);
      }

      // Post tweet using Twitter API v2
      const tweetData: any = {
        text: tweetText
      };

      if (mediaId) {
        tweetData.media = { media_ids: [mediaId] };
      }

      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        tweetData,
        {
          headers: {
            'Authorization': `Bearer ${this.twitterCredentials.bearerToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const tweetId = response.data.data.id;
      const tweetUrl = `https://twitter.com/quotemoto_insurance/status/${tweetId}`;

      console.log(`[Twitter] ✅ Posted: ${tweetUrl}`);

      return {
        platform: 'twitter',
        success: true,
        postId: tweetId,
        url: tweetUrl
      };

    } catch (error: any) {
      console.error('[Twitter] ❌ Post failed:', error.response?.data || error.message);
      return {
        platform: 'twitter',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post QuoteMoto content to Instagram
   */
  private async postToInstagram(content: PostContent): Promise<PostResult> {
    if (!this.instagramCredentials) {
      throw new Error('Instagram credentials not configured');
    }

    try {
      console.log('[Instagram] Posting QuoteMoto content...');

      const mediaUrl = content.videoUrl || content.imageUrl!;
      const caption = this.formatInstagramContent(content);

      // Step 1: Create media object
      const mediaType = content.videoUrl ? 'VIDEO' : 'IMAGE';
      const createMediaResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.instagramCredentials.businessAccountId}/media`,
        {
          [mediaType.toLowerCase() + '_url']: mediaUrl,
          caption: caption,
          media_type: mediaType
        },
        {
          headers: {
            'Authorization': `Bearer ${this.instagramCredentials.accessToken}`
          }
        }
      );

      const mediaObjectId = createMediaResponse.data.id;

      // Step 2: Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.instagramCredentials.businessAccountId}/media_publish`,
        {
          creation_id: mediaObjectId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.instagramCredentials.accessToken}`
          }
        }
      );

      const postId = publishResponse.data.id;
      const postUrl = `https://www.instagram.com/p/${postId}/`;

      console.log(`[Instagram] ✅ Posted: ${postUrl}`);

      return {
        platform: 'instagram',
        success: true,
        postId: postId,
        url: postUrl
      };

    } catch (error: any) {
      console.error('[Instagram] ❌ Post failed:', error.response?.data || error.message);
      return {
        platform: 'instagram',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post QuoteMoto video to YouTube
   */
  private async postToYouTube(content: PostContent): Promise<PostResult> {
    if (!this.youtubeCredentials || !content.videoUrl) {
      throw new Error('YouTube credentials or video not available');
    }

    try {
      console.log('[YouTube] Uploading QuoteMoto video...');

      // Download video file temporarily
      const videoBuffer = await this.downloadFile(content.videoUrl);

      // Prepare video metadata
      const videoMetadata = {
        snippet: {
          title: this.getYouTubeTitle(content),
          description: this.formatYouTubeDescription(content),
          tags: content.hashtags,
          categoryId: '2', // Autos & Vehicles category
          defaultAudioLanguage: 'en'
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      };

      // TODO: Implement actual multipart upload with videoBuffer and videoMetadata
      // For now, throw error to indicate real implementation needed
      if (!videoBuffer || !videoMetadata) {
        throw new Error('YouTube upload not implemented - videoBuffer and videoMetadata prepared but upload logic needed');
      }

      const uploadResponse = await axios.post(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
        videoMetadata,
        {
          headers: {
            'Authorization': `Bearer ${this.youtubeCredentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const videoId = uploadResponse.data?.id || (() => {
        throw new Error('YouTube upload failed - no video ID in response');
      })();
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      console.log(`[YouTube] ✅ Uploaded: ${videoUrl}`);

      return {
        platform: 'youtube',
        success: true,
        postId: videoId,
        url: videoUrl
      };

    } catch (error: any) {
      console.error('[YouTube] ❌ Upload failed:', error.response?.data || error.message);
      return {
        platform: 'youtube',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post QuoteMoto video to TikTok
   */
  private async postToTikTok(content: PostContent): Promise<PostResult> {
    if (!this.tiktokCredentials || !content.videoUrl) {
      throw new Error('TikTok credentials or video not available');
    }

    try {
      console.log('[TikTok] Posting QuoteMoto video...');

      // TikTok Business API video upload
      const videoData = {
        video_url: content.videoUrl,
        text: this.formatTikTokContent(content),
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false
      };

      const response = await axios.post(
        'https://business-api.tiktok.com/open_api/v1.3/video/upload/',
        videoData,
        {
          headers: {
            'Authorization': `Bearer ${this.tiktokCredentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract video ID from actual API response
      const videoId = response.data?.video_id || (() => {
        throw new Error('TikTok upload failed - no video_id in response');
      })();
      const videoUrl = `https://www.tiktok.com/@quotemoto_insurance/video/${videoId}`;

      console.log(`[TikTok] ✅ Posted: ${videoUrl}`);

      return {
        platform: 'tiktok',
        success: true,
        postId: videoId,
        url: videoUrl
      };

    } catch (error: any) {
      console.error('[TikTok] ❌ Post failed:', error.response?.data || error.message);
      return {
        platform: 'tiktok',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format content for Twitter
   */
  private formatTwitterContent(content: PostContent): string {
    const baseMessage = content.caption;
    const hashtags = content.hashtags.slice(0, 5).join(' '); // Twitter hashtag limit
    const cta = '\n\n🚗 Get your quote at QuoteMoto.com';

    return `${baseMessage}${cta}\n\n${hashtags}`.substring(0, 280); // Twitter character limit
  }

  /**
   * Format content for Instagram
   */
  private formatInstagramContent(content: PostContent): string {
    const baseMessage = content.caption;
    const hashtags = content.hashtags.join(' ');
    const cta = '\n\n🎯 Save on car insurance today!\n🔗 Link in bio: QuoteMoto.com';

    return `${baseMessage}${cta}\n\n${hashtags}`;
  }

  /**
   * Format content for YouTube
   */
  private formatYouTubeDescription(content: PostContent): string {
    return `${content.caption}

🎯 About QuoteMoto:
QuoteMoto specializes in finding affordable car insurance for drivers others won't insure. Whether you're looking for savings or have a complex driving history, we're here to help.

💰 Save on Car Insurance: QuoteMoto.com
🤝 DUI-Friendly Options Available
⚡ Quick Quotes in Under 2 Minutes

${content.hashtags.join(' ')}

#QuoteMoto #CarInsurance #SaveMoney #Insurance #AutoInsurance`;
  }

  /**
   * Format content for TikTok
   */
  private formatTikTokContent(content: PostContent): string {
    const baseMessage = content.caption;
    const hashtags = content.hashtags.slice(0, 8).join(' '); // TikTok performs better with fewer hashtags

    return `${baseMessage}\n\n🚗 QuoteMoto.com\n\n${hashtags}`;
  }

  /**
   * Generate YouTube title
   */
  private getYouTubeTitle(content: PostContent): string {
    const titles = {
      'savings': '💰 How to Save HUNDREDS on Car Insurance - QuoteMoto Expert Tips',
      'dui-friendly': '🤝 DUI? No Problem! Get Car Insurance Coverage Today',
      'quick-quote': '⚡ Get Car Insurance Quote in Under 2 Minutes - QuoteMoto Demo'
    };

    return titles[content.campaignType as keyof typeof titles] || 'QuoteMoto - Save Money on Car Insurance';
  }

  /**
   * Upload media to Twitter
   */
  private async uploadMediaToTwitter(_mediaUrl: string): Promise<string> {
    // TODO: Implement actual Twitter media upload
    throw new Error('Twitter media upload not implemented - real API integration needed');
  }

  /**
   * Download file from URL
   */
  private async downloadFile(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  /**
   * Get posting statistics
   */
  async getPostingStats(): Promise<any> {
    return {
      totalPosts: 0,
      successfulPosts: 0,
      failedPosts: 0,
      platformBreakdown: {
        twitter: { posts: 0, success: 0 },
        instagram: { posts: 0, success: 0 },
        youtube: { posts: 0, success: 0 },
        tiktok: { posts: 0, success: 0 }
      }
    };
  }
}