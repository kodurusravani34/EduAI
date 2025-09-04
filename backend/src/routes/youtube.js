const express = require('express');
const auth = require('../middleware/auth');
const youtubeService = require('../services/youtubeService');
const Lesson = require('../models/Lesson');

const router = express.Router();

// Search YouTube videos
router.get('/search', auth, async (req, res) => {
  try {
    const { q: query, maxResults = 10, category } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const videos = await youtubeService.searchVideos(query, parseInt(maxResults), category);
    res.json(videos);
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ 
      error: 'Failed to search YouTube videos',
      message: error.message 
    });
  }
});

// Get video details by ID
router.get('/video/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const details = await youtubeService.getVideoDetails(videoId);
    
    if (!details || details.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(details[0]);
  } catch (error) {
    console.error('Get video details error:', error);
    res.status(500).json({ error: 'Failed to get video details' });
  }
});

// Get trending educational videos
router.get('/trending', auth, async (req, res) => {
  try {
    const { category = 'education' } = req.query;
    const videos = await youtubeService.getTrendingEducationalVideos(category);
    res.json(videos);
  } catch (error) {
    console.error('Get trending videos error:', error);
    res.status(500).json({ error: 'Failed to get trending videos' });
  }
});

// Save YouTube video as lesson
router.post('/save-as-lesson', auth, async (req, res) => {
  try {
    const { 
      videoId, 
      title, 
      description, 
      thumbnail, 
      channelTitle, 
      duration,
      goalId,
      category,
      tags 
    } = req.body;

    if (!videoId || !title) {
      return res.status(400).json({ error: 'Video ID and title are required' });
    }

    // Check if lesson already exists for this user and video
    const existingLesson = await Lesson.findOne({
      userId: req.user._id,
      'source.videoId': videoId
    });

    if (existingLesson) {
      return res.status(400).json({ 
        error: 'This video is already saved as a lesson',
        lesson: existingLesson 
      });
    }

    const lesson = new Lesson({
      userId: req.user._id,
      goalId: goalId || null,
      title,
      description: description || '',
      type: 'video',
      source: {
        platform: 'youtube',
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail,
        duration: parseDuration(duration)
      },
      category: category || 'other',
      tags: tags || []
    });

    await lesson.save();
    await lesson.populate('goalId', 'title category');

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Save video as lesson error:', error);
    res.status(400).json({ error: 'Failed to save video as lesson' });
  }
});

// Get channel information
router.get('/channel/:channelId', auth, async (req, res) => {
  try {
    const { channelId } = req.params;
    const channelInfo = await youtubeService.getChannelInfo(channelId);
    res.json(channelInfo);
  } catch (error) {
    console.error('Get channel info error:', error);
    res.status(500).json({ error: 'Failed to get channel information' });
  }
});

// Get recommendations based on user's learning history
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    // Get user's recent lessons to understand interests
    const recentLessons = await Lesson.find({
      userId: req.user._id,
      'source.platform': 'youtube'
    }).sort({ createdAt: -1 }).limit(5);

    // Extract common terms from recent lessons for search
    const searchTerms = recentLessons
      .map(lesson => lesson.title)
      .join(' ')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(' ');

    let query = searchTerms || 'programming tutorial';
    if (category) {
      query += ` ${category}`;
    }

    const recommendations = await youtubeService.searchVideos(query, parseInt(limit));
    
    // Filter out already saved videos
    const savedVideoIds = recentLessons.map(lesson => lesson.source.videoId);
    const filteredRecommendations = recommendations.filter(video => 
      !savedVideoIds.includes(video.videoId)
    );

    res.json(filteredRecommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Helper function to parse YouTube duration
function parseDuration(duration) {
  if (!duration || typeof duration === 'number') return duration;
  
  // Parse YouTube duration format (e.g., "10:30" or "1:30:45")
  const parts = duration.split(':').reverse();
  let seconds = 0;
  
  if (parts[0]) seconds += parseInt(parts[0]);
  if (parts[1]) seconds += parseInt(parts[1]) * 60;
  if (parts[2]) seconds += parseInt(parts[2]) * 3600;
  
  return seconds;
}

module.exports = router;
