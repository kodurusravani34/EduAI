import { Calendar, Clock, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

/**
 * PlanCard – displays a study plan summary in card format.
 * Used on the My Plans page and Dashboard.
 *
 * Backend fields: _id, goal, currentLevel, deadline, dailyHours, topics, progress, status
 */
export default function PlanCard({ plan, onDelete }) {
  const progress = plan.progress || 0;
  const level = plan.currentLevel || plan.level || 'beginner';
  const deadline = plan.deadline
    ? new Date(plan.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const topics = plan.topics || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{plan.goal}</h3>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{plan.status || 'active'}</p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${
            progress >= 75
              ? 'bg-green-100 text-green-700'
              : progress >= 40
              ? 'bg-amber-100 text-amber-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}
        >
          {level}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {deadline}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {plan.dailyHours || 1}h/day
        </span>
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
            >
              {topic}
            </span>
          ))}
          {topics.length > 4 && (
            <span className="text-xs text-gray-400">+{topics.length - 4} more</span>
          )}
        </div>
      )}

      {/* Progress */}
      <ProgressBar
        value={progress}
        color={progress >= 75 ? 'green' : progress >= 40 ? 'amber' : 'indigo'}
      />

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <Link
          to={`/plans/${plan._id}`}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(plan._id)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
