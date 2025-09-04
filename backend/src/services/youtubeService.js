const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  async searchVideos(query, maxResults = 10, category = null) {
    try {
      const params = {
        part: 'snippet,statistics',
        q: query,
        type: 'video',
        maxResults,
        key: this.apiKey,
        order: 'relevance',
        videoDefinition: 'high',
        videoEmbeddable: 'true'
      };

      if (category) {
        params.videoCategoryId = this.getCategoryId(category);
      }

      const response = await axios.get(`${this.baseUrl}/search`, { params });
      
      // Get additional details for each video
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      const detailsResponse = await this.getVideoDetails(videoIds);
      
      // Combine search results with detailed info
      const enhancedResults = response.data.items.map(item => {
        const details = detailsResponse.find(d => d.id === item.id.videoId);
        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: details?.duration || 'Unknown',
          viewCount: details?.viewCount || 0,
          likeCount: details?.likeCount || 0,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
          category: this.getCategoryName(item.snippet.categoryId)
        };
      });

      return enhancedResults;
    } catch (error) {
      console.error('YouTube search error:', error.response?.data || error.message);
      throw new Error('Failed to search YouTube videos');
    }
  }

  async getVideoDetails(videoIds) {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: this.apiKey
        }
      });

      return response.data.items.map(item => ({
        id: item.id,
        duration: this.formatDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics.viewCount) || 0,
        likeCount: parseInt(item.statistics.likeCount) || 0,
        commentCount: parseInt(item.statistics.commentCount) || 0
      }));
    } catch (error) {
      console.error('Error getting video details:', error);
      return [];
    }
  }

  async getChannelInfo(channelId) {
    try {
      const response = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: this.apiKey
        }
      });

      const channel = response.data.items[0];
      return {
        channelId: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.high.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0
      };
    } catch (error) {
      console.error('Error getting channel info:', error);
      throw new Error('Failed to get channel information');
    }
  }

  async getTrendingEducationalVideos(category = 'education') {
    try {
      const params = {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode: 'US',
        maxResults: 20,
        key: this.apiKey
      };

      if (category !== 'all') {
        params.videoCategoryId = this.getCategoryId(category);
      }

      const response = await axios.get(`${this.baseUrl}/videos`, { params });
      
      // Filter for educational content
      const educationalVideos = response.data.items.filter(item => 
        this.isEducationalContent(item.snippet.title, item.snippet.description)
      );

      return educationalVideos.map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: this.formatDuration(item.contentDetails?.duration),
        viewCount: parseInt(item.statistics.viewCount) || 0,
        likeCount: parseInt(item.statistics.likeCount) || 0,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        embedUrl: `https://www.youtube.com/embed/${item.id}`
      }));
    } catch (error) {
      console.error('Error getting trending videos:', error);
      throw new Error('Failed to get trending educational videos');
    }
  }

  formatDuration(duration) {
    if (!duration) return 'Unknown';
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'Unknown';
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  getCategoryId(category) {
    const categories = {
      'education': '27',
      'science': '28',
      'technology': '28',
      'howto': '26',
      'news': '25',
      'entertainment': '24'
    };
    return categories[category] || '27';
  }

  getCategoryName(categoryId) {
    const categories = {
      '27': 'Education',
      '28': 'Science & Technology',
      '26': 'Howto & Style',
      '25': 'News & Politics',
      '24': 'Entertainment'
    };
    return categories[categoryId] || 'Education';
  }

  isEducationalContent(title, description) {
    const educationalKeywords = [
      'tutorial', 'learn', 'course', 'lesson', 'guide', 'how to', 'explained',
      'programming', 'coding', 'mathematics', 'science', 'education', 'study',
      'training', 'workshop', 'lecture', 'university', 'academy', 'skill'
    ];
    
    const content = (title + ' ' + description).toLowerCase();
    return educationalKeywords.some(keyword => content.includes(keyword));
  }
}

module.exports = new YouTubeService();
