import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import {
  BarChart3,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsAPI.get();
        setAnalytics(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#4A6FA5] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const a = analytics;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your study habits and performance over time.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Clock} label="Total Study Hours" value={a.totalStudyHours || 0} color="primary" />
        <StatCard icon={Flame} label="Current Streak" value={`${a.currentStreak || 0} days`} color="amber" />
        <StatCard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={`${a.tasksCompleted || 0}/${a.totalTasks || 0}`}
          color="green"
        />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${a.completionRate || 0}%`} color="blue" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Hours Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Study Hours</h2>

          {(a.weeklyStats && a.weeklyStats.length > 0) ? (
            <div className="flex items-end justify-between gap-2 h-48">
              {a.weeklyStats.map((day) => {
                const maxHours = Math.max(...a.weeklyStats.map((d) => d.hours), 1);
                const heightPercent = (day.hours / maxHours) * 100;

                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-700">{day.hours}h</span>

                    <div
                      className="w-full bg-[#4A6FA5] rounded-t-md transition-all duration-500 min-h-[4px]"
                      style={{ height: `${heightPercent}%` }}
                    />

                    <span className="text-xs text-gray-500">{day.day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No study data yet.</p>
          )}
        </div>

        {/* Weekly Goal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Weekly Goal</h2>

            <p className="text-sm text-gray-500 mb-6">
              Target: <span className="font-medium text-gray-800">{a.weeklyGoalHours || 0}h</span> |
              Actual: <span className="font-medium text-gray-800">{a.weeklyActualHours || 0}h</span>
            </p>

            <ProgressBar
              value={a.weeklyGoalHours > 0 ? Math.round((a.weeklyActualHours / a.weeklyGoalHours) * 100) : 0}
              color={a.weeklyActualHours >= a.weeklyGoalHours ? 'green' : 'primary'}
              size="lg"
            />
          </div>

          <div className="mt-6 p-4 bg-[#F3F6FC] rounded-lg">
            <p className="text-sm text-[#4A6FA5] font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Top Subject: {a.topSubject || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Per-plan progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Plan Progress</h2>

        {(a.planProgress && a.planProgress.length > 0) ? (
          <div className="space-y-5">
            {a.planProgress.map((plan) => (
              <div key={plan._id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{plan.goal}</span>
                  <span className="text-sm text-gray-500">{plan.progress || 0}%</span>
                </div>

                <ProgressBar
                  value={plan.progress || 0}
                  showLabel={false}
                  color={plan.progress >= 75 ? 'green' : plan.progress >= 40 ? 'amber' : 'primary'}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No plans to display.</p>
        )}
      </div>
    </div>
  );
}

/** Small stat card */
function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    primary: 'bg-[#EEF3FB] text-[#4A6FA5]',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
