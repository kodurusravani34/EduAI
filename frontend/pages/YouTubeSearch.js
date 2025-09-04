import React, { useState } from 'react';
import api from '../src/services/api';

const YouTubeSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/youtube/search?q=${encodeURIComponent(query)}`);
      setResults(response.data || []);
    } catch (err) {
      console.error('YouTube search error:', err);
      setError(err.response?.data?.error || 'Failed to fetch YouTube videos');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">YouTube Video Search</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for educational videos..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map(video => (
          <div key={video.videoId} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{video.channelTitle}</p>
              <p className="text-gray-500 text-xs mb-3">
                {video.duration} • {new Date(video.publishedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-red-600 text-white text-center py-2 px-3 rounded hover:bg-red-700 text-sm"
                >
                  Watch on YouTube
                </a>
                <button className="bg-gray-200 text-gray-700 py-2 px-3 rounded hover:bg-gray-300 text-sm">
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">Search for educational videos to get started!</p>
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;
