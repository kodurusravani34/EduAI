import React from 'react';
import { useAnalytics } from '../hooks/useApi';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const { analytics, loading, error } = useAnalytics('30d');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <div className="text-red-600 mb-4">
          <ChartBarIcon className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Prepare chart data
  const dailyProgressData = {
    labels: Object.keys(analytics?.dailyProgress || {}).slice(-7), // Last 7 days
    datasets: [
      {
        label: 'Lessons Completed',
        data: Object.values(analytics?.dailyProgress || {}).slice(-7).map(day => day.lessons),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const timeSpentData = {
    labels: Object.keys(analytics?.dailyProgress || {}).slice(-7),
    datasets: [
      {
        label: 'Time Spent (minutes)',
        data: Object.values(analytics?.dailyProgress || {}).slice(-7).map(day => day.timeSpent),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(analytics?.categoryBreakdown || {}),
    datasets: [
      {
        data: Object.values(analytics?.categoryBreakdown || {}).map(cat => cat.lessons),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
        <p className="text-gray-600">Track your learning progress and identify patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics?.totalLessons || 0}</div>
          <div className="text-sm text-gray-600">Total Lessons</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{analytics?.totalTime || 0}m</div>
          <div className="text-sm text-gray-600">Study Time</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((analytics?.totalLessons || 0) / 30 * 10) / 10}
          </div>
          <div className="text-sm text-gray-600">Daily Average</div>
          <div className="text-xs text-gray-500 mt-1">Lessons per day</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {analytics?.comparison?.previousPeriodLessons 
              ? `${((analytics.totalLessons - analytics.comparison.previousPeriodLessons) / analytics.comparison.previousPeriodLessons * 100).toFixed(0)}%`
              : 'N/A'
            }
          </div>
          <div className="text-sm text-gray-600">Growth</div>
          <div className="text-xs text-gray-500 mt-1">vs last month</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Lesson Progress</h3>
          <div className="chart-container">
            <Line data={dailyProgressData} options={chartOptions} />
          </div>
        </div>

        {/* Time Spent */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Time Spent</h3>
          <div className="chart-container">
            <Bar data={timeSpentData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Categories</h3>
          <div className="chart-container">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>

        {/* Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Most Active Day</h4>
              <p className="text-sm text-blue-700">
                You tend to learn most on weekdays. Consider scheduling regular study sessions.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Strong Consistency</h4>
              <p className="text-sm text-green-700">
                You've maintained a good learning streak. Keep up the great work!
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Diverse Learning</h4>
              <p className="text-sm text-purple-700">
                You're exploring multiple categories, which helps with well-rounded growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Details */}
      {analytics?.categoryBreakdown && Object.keys(analytics.categoryBreakdown).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lessons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg per Lesson
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(analytics.categoryBreakdown).map(([category, data]) => (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.lessons}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.timeSpent}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.lessons > 0 ? Math.round(data.timeSpent / data.lessons) : 0}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
