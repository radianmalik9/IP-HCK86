import axios from 'axios';

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

class CourseProviderService {
  constructor() {
    this.youtubeKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    // Optional feature flag for RSS sources (can be blocked by CORS)
    this.enableRss = import.meta.env.VITE_ENABLE_RSS_SOURCES === 'true';
  }

  // ========= YouTube Providers =========
  /**
   * Fetch playlists for a YouTube channel (playlists as courses)
   */
  async getYouTubeChannelPlaylists(channelId, limit = 10) {
    try {
      if (!this.youtubeKey || !channelId) return [];
      const { data } = await axios.get(`${YT_API_BASE}/playlists`, {
        params: {
          key: this.youtubeKey,
          part: 'snippet,contentDetails',
          channelId,
          maxResults: Math.min(limit, 50),
        },
      });
      return (data.items || []).map((pl) => this.formatYouTubePlaylist(pl));
    } catch (error) {
      console.error('YouTube playlists error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Search YouTube playlists by query
   */
  async searchYouTubePlaylists(query, limit = 12) {
    try {
      if (!this.youtubeKey || !query) return [];
      const { data } = await axios.get(`${YT_API_BASE}/search`, {
        params: {
          key: this.youtubeKey,
          part: 'snippet',
          q: `${query} tutorial course playlist`,
          type: 'playlist',
          maxResults: Math.min(limit, 50),
        },
      });
      // Enrich with details to get itemCount
      const playlistIds = (data.items || []).map((i) => i.id?.playlistId).filter(Boolean);
      if (!playlistIds.length) return [];
      const { data: details } = await axios.get(`${YT_API_BASE}/playlists`, {
        params: {
          key: this.youtubeKey,
          part: 'snippet,contentDetails',
          id: playlistIds.join(','),
          maxResults: playlistIds.length,
        },
      });
      return (details.items || []).map((pl) => this.formatYouTubePlaylist(pl));
    } catch (error) {
      console.error('YouTube search error:', error.response?.data || error.message);
      return [];
    }
  }

  formatYouTubePlaylist(item) {
    return {
      id: `yt_pl_${item.id}`,
      title: item.snippet?.title || 'YouTube Playlist',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
      instructor: item.snippet?.channelTitle || 'YouTube',
      rating: 0,
      students: 0,
      reviews: 0,
      price: 'Free',
      isFree: true,
      url: `https://www.youtube.com/playlist?list=${item.id}`,
      platform: 'YouTube',
      level: 'All Levels',
      duration: `${item.contentDetails?.itemCount || 0} videos`,
      category: 'External Course',
    };
  }

  // ========= Khan Academy (curated list to avoid CORS) =========
  async getKhanAcademyCourses() {
    const topics = [
      {
        id: 'khan-intro-programming',
        title: 'Intro to Programming: Drawing & Animation',
        description: 'Learn programming by drawing and animating with code.',
        relative_url: '/computing/computer-programming',
      },
      {
        id: 'khan-intro-html-css',
        title: 'Intro to HTML/CSS: Making webpages',
        description: 'Learn to create webpages with HTML & CSS.',
        relative_url: '/computing/computer-programming/html-css',
      },
      {
        id: 'khan-intro-sql',
        title: 'Intro to SQL: Querying and managing data',
        description: 'Learn to use SQL to store, query, and manipulate data.',
        relative_url: '/computing/computer-programming/sql',
      },
    ];
    return this.formatKhanAcademyCourses(topics);
  }

  /**
   * Get programming courses from multiple sources
   * @returns {Promise<Array>} Combined course list
   */
  async getProgrammingCourses() {
    try {
      const channels = [
        // freeCodeCamp, Net Ninja, Traversy Media, Fireship, Programming with Mosh
        'UC8butISFwT-Wl7EV0hUK0BQ',
        'UCW5YeuERMmlnqo4oq8vwUpg',
        'UC29ju8bIPH5as8OGnQzwJyA',
        'UCsBjURrPoezykLs9EqgamOA',
        'UCWv7vMbMWH4-V0ZXdmDpPBA',
      ];

      const ytResults = await Promise.all(
        channels.map((id) => this.getYouTubeChannelPlaylists(id, 6))
      );
      const youtubeCourses = ytResults.flat();

      const khanCourses = await this.getKhanAcademyCourses();

      // Optional: Add RSS-based courses (MIT OCW / OpenLearn) if enabled
      let rssCourses = [];
      if (this.enableRss) {
        try {
          const mit = await this.getRssCourses('https://ocw.mit.edu/courses/rss/');
          rssCourses = mit;
        } catch (_) {}
      }

      // Deduplicate by url
      const all = [...youtubeCourses, ...khanCourses, ...rssCourses];
      const seen = new Set();
      const dedup = all.filter((c) => {
        const key = c.url || c.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return dedup;
    } catch (error) {
      console.error('Error fetching programming courses:', error);
      return [];
    }
  }

  /**
   * Search courses across multiple platforms
   * @param {string} query - Search query
   * @returns {Promise<Array>} Search results
   */
  async searchCourses(query) {
    try {
      const [yt, khan] = await Promise.all([
        this.searchYouTubePlaylists(query, 12),
        this.getKhanAcademyCourses(),
      ]);

      // Filter Khan Academy curated list by query
      const q = (query || '').toLowerCase();
      const khanFiltered = khan.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
      return [...yt, ...khanFiltered];
    } catch (error) {
      console.error('Course search error:', error);
      return [];
    }
  }

  // Helper for Khan Academy curated topics

  formatKhanAcademyCourses(topics) {
    return topics
      .slice(0, 10)
      .map(topic => ({
        id: `khan_${topic.id}`,
        title: topic.title,
        description: topic.description || `Learn ${topic.title} with Khan Academy`,
        thumbnail: 'https://cdn.kastatic.org/images/khan-logo-vertical-transparent.png',
        instructor: 'Khan Academy',
        rating: 4.8, // Khan Academy generally has high ratings
        students: 1000000, // Estimate
        reviews: 0,
        price: 'Free',
        isFree: true,
        url: `https://www.khanacademy.org${topic.relative_url}`,
        platform: 'Khan Academy',
        level: 'Beginner to Advanced',
        duration: 'Self-paced',
        category: 'External Course'
      }));
  }

  // ========= Optional RSS provider (best-effort; may be blocked by CORS) =========
  async getRssCourses(feedUrl, limit = 8) {
    if (!this.enableRss) return [];
    try {
      const res = await axios.get(feedUrl, { responseType: 'text' });
      const xml = res.data;
      const doc = new window.DOMParser().parseFromString(xml, 'text/xml');
      const items = Array.from(doc.querySelectorAll('item')).slice(0, limit);
      return items.map((it, idx) => ({
        id: `rss_${idx}_${feedUrl}`,
        title: it.querySelector('title')?.textContent || 'Course',
        description: it.querySelector('description')?.textContent || '',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/MIT_logo.svg',
        instructor: 'MIT OpenCourseWare',
        rating: 0,
        students: 0,
        reviews: 0,
        price: 'Free',
        isFree: true,
        url: it.querySelector('link')?.textContent || feedUrl,
        platform: 'MIT OCW',
        level: 'All Levels',
        duration: 'Self-paced',
        category: 'External Course',
      }));
    } catch (e) {
      console.warn('RSS fetch blocked or failed:', e.message);
      return [];
    }
  }

  /**
   * Get popular free course categories
   * @returns {Array} List of categories with course counts
   */
  async getPopularCategories() {
    const categories = [
      { name: 'Programming', slug: 'programming', icon: '💻' },
      { name: 'Web Development', slug: 'web-development', icon: '🌐' },
      { name: 'Data Science', slug: 'data-science', icon: '📊' },
      { name: 'Design', slug: 'design', icon: '🎨' },
      { name: 'Business', slug: 'business', icon: '💼' },
      { name: 'Marketing', slug: 'marketing', icon: '📈' },
      { name: 'Personal Development', slug: 'personal-development', icon: '🚀' },
      { name: 'Photography', slug: 'photography', icon: '📸' }
    ];

    // You could enhance this to get actual course counts per category
    return categories;
  }
}

export const courseProviderService = new CourseProviderService();
export default courseProviderService;
