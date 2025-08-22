import axios from 'axios';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

class YouTubeService {
  /**
   * Search for videos related to a topic
   * @param {string} query - Search query (course title, lesson name, etc.)
   * @param {number} maxResults - Maximum number of results (default: 6)
   * @param {string} order - Order by: relevance, date, rating, viewCount, title
   * @returns {Promise<Array>} Array of video objects
   */
  async searchVideos(query, maxResults = 6, order = 'relevance') {
    try {
      if (!API_KEY) {
        console.warn('YouTube API key not configured');
        return [];
      }

      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: `${query} tutorial programming coding`,
          type: 'video',
          key: API_KEY,
          maxResults,
          order,
          videoEmbeddable: 'true', // Only embeddable videos
          videoSyndicated: 'true',
          safeSearch: 'moderate',
          regionCode: 'US',
          relevanceLanguage: 'en'
        }
      });

      return this.formatVideoResults(response.data.items);
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get video details by video IDs
   * @param {Array<string>} videoIds - Array of YouTube video IDs
   * @returns {Promise<Array>} Array of detailed video objects
   */
  async getVideoDetails(videoIds) {
    try {
      if (!API_KEY || !videoIds.length) return [];

      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: API_KEY
        }
      });

      return this.formatVideoDetails(response.data.items);
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Search for educational channels
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum results
   * @returns {Promise<Array>} Array of channel objects
   */
  async searchChannels(query, maxResults = 5) {
    try {
      if (!API_KEY) return [];

      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: `${query} programming tutorial education`,
          type: 'channel',
          key: API_KEY,
          maxResults,
          order: 'relevance'
        }
      });

      return this.formatChannelResults(response.data.items);
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get course-related videos for learning enhancement
   * @param {string} courseTitle - Course title
   * @param {Array<string>} courseTags - Course tags/topics
   * @returns {Promise<Array>} Curated video list
   */
  async getCourseRelatedVideos(courseTitle, courseTags = []) {
    try {
      // Create search query combining course title and tags
      const searchTerms = [courseTitle, ...courseTags].join(' ');
      const videos = await this.searchVideos(searchTerms, 8, 'relevance');
      
      // Filter out videos shorter than 2 minutes (likely not educational)
      return videos.filter(video => this.parseDuration(video.duration) >= 120);
    } catch (error) {
      console.error('Error getting course-related videos:', error);
      return [];
    }
  }

  /**
   * Get lesson-specific supplementary videos
   * @param {string} lessonTitle - Lesson title
   * @param {string} courseContext - Course context for better results
   * @returns {Promise<Array>} Related videos for the lesson
   */
  async getLessonVideos(lessonTitle, courseContext = '') {
    try {
      const query = `${lessonTitle} ${courseContext} tutorial explanation`;
      return await this.searchVideos(query, 4, 'relevance');
    } catch (error) {
      console.error('Error getting lesson videos:', error);
      return [];
    }
  }

  // Helper methods
  formatVideoResults(items) {
    return items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      channelId: item.snippet.channelId
    }));
  }

  formatVideoDetails(items) {
    return items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails.duration,
      viewCount: parseInt(item.statistics.viewCount || 0),
      likeCount: parseInt(item.statistics.likeCount || 0),
      url: `https://www.youtube.com/watch?v=${item.id}`,
      embedUrl: `https://www.youtube.com/embed/${item.id}`,
      channelId: item.snippet.channelId
    }));
  }

  formatChannelResults(items) {
    return items.map(item => ({
      id: item.id.channelId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/channel/${item.id.channelId}`
    }));
  }

  parseDuration(duration) {
    // Parse ISO 8601 duration (e.g., "PT4M13S" = 4 minutes 13 seconds)
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export const youtubeService = new YouTubeService();
export default youtubeService;
