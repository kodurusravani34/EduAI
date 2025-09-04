import React, { useState, useEffect } from 'react';
import { lessonService } from '../services/api';
import { BookOpenIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLessons();
  }, [filter]);

  const fetchLessons = async () => {
    try {
      const filters = filter !== 'all' ? { status: filter } : {};
      const data = await lessonService.getLessons(filters);
      setLessons(data);
    } catch (error) {
      toast.error('Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (lessonId) => {
    try {
      await lessonService.startLesson(lessonId);
      toast.success('Lesson started!');
      fetchLessons();
    } catch (error) {
      toast.error('Failed to start lesson');
    }
  };

  const completeLesson = async (lessonId) => {
    try {
      await lessonService.completeLesson(lessonId, { timeSpent: 30 });
      toast.success('Lesson completed! 🎉');
      fetchLessons();
    } catch (error) {
      toast.error('Failed to complete lesson');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Lessons</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Lessons</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No lessons found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? 'You haven\'t added any lessons yet. Search for YouTube videos to get started!'
              : `No ${filter.replace('_', ' ')} lessons found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {lessons.map((lesson) => (
            <div key={lesson._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Thumbnail */}
                {lesson.source?.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={lesson.source.thumbnail}
                      alt={lesson.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        {lesson.source?.duration && (
                          <span>⏱️ {formatDuration(lesson.source.duration)}</span>
                        )}
                        <span>📁 {lesson.category || 'General'}</span>
                        {lesson.goalId && (
                          <span>🎯 {lesson.goalId.title}</span>
                        )}
                        {lesson.source?.platform && (
                          <span>📺 {lesson.source.platform}</span>
                        )}
                      </div>

                      {/* Tags */}
                      {lesson.tags && lesson.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {lesson.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      lesson.progress?.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : lesson.progress?.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {lesson.progress?.status?.replace('_', ' ') || 'not started'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {lesson.progress?.completionPercentage > 0 && (
                    <div className="mb-3">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${lesson.progress.completionPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{lesson.progress.completionPercentage}% complete</span>
                        {lesson.progress.timeSpent && (
                          <span>{lesson.progress.timeSpent} minutes spent</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      {lesson.progress?.status === 'not_started' && (
                        <button
                          onClick={() => startLesson(lesson._id)}
                          className="flex items-center space-x-2 btn-primary text-sm"
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span>Start Lesson</span>
                        </button>
                      )}
                      
                      {lesson.progress?.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => completeLesson(lesson._id)}
                            className="flex items-center space-x-2 btn-success text-sm"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>Mark Complete</span>
                          </button>
                          {lesson.source?.url && (
                            <a
                              href={lesson.source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-sm"
                            >
                              Continue Learning
                            </a>
                          )}
                        </>
                      )}
                      
                      {lesson.progress?.status === 'completed' && lesson.source?.url && (
                        <a
                          href={lesson.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          Review Lesson
                        </a>
                      )}
                    </div>

                    {/* Rating */}
                    {lesson.progress?.status === 'completed' && lesson.rating?.userRating && (
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500">Your rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < lesson.rating.userRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lessons;
