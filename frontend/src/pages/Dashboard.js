import React from 'react';
import { useDashboard } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="card hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

const RecentLessonsCard = ({ lessons }) => (
  <div className="card">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lessons</h3>
    {lessons && lessons.length > 0 ? (
      <div className="space-y-3">
        {lessons.slice(0, 5).map((lesson, index) => (
          <div key={lesson._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{lesson.title}</h4>
              <p className="text-xs text-gray-500">
                {lesson.goalId?.title || 'No goal'} • {lesson.type || 'lesson'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                lesson.progress?.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : lesson.progress?.status === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {lesson.progress?.status || 'not_started'}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No lessons yet. Start learning!</p>
      </div>
    )}
  </div>
);

const GoalsCard = ({ goals }) => (
  <div className="card">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Goals</h3>
    {goals && goals.length > 0 ? (
      <div className="space-y-4">
        {goals.slice(0, 3).map((goal, index) => (
          <div key={goal._id || index} className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-sm font-medium text-gray-900">{goal.title}</h4>
            <p className="text-xs text-gray-500 mb-2">{goal.category}</p>
            <div className="flex items-center justify-between">
              <div className="progress-bar flex-1 mr-3">
                <div 
                  className="progress-fill" 
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">
                {goal.progress || 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No goals set. Create your first goal!</p>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboard, loading, error } = useDashboard();

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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Chart data
  const progressData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [
          dashboard?.completedLessons || 0,
          (dashboard?.totalLessons || 0) - (dashboard?.completedLessons || 0),
          dashboard?.goals || 0,
        ],
        backgroundColor: ['#22c55e', '#f59e0b', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const timeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Study Time (minutes)',
        data: [30, 45, 25, 60, 40, 35, 50], // Mock data - replace with actual data
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
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
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username || 'Learner'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your learning progress overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Goals"
          value={dashboard?.goals || 0}
          icon={AcademicCapIcon}
          color="bg-blue-500"
          subtitle={`${dashboard?.completedGoals || 0} completed`}
        />
        <StatCard
          title="Lessons Completed"
          value={dashboard?.completedLessons || 0}
          icon={BookOpenIcon}
          color="bg-green-500"
          subtitle={`of ${dashboard?.totalLessons || 0} total`}
        />
        <StatCard
          title="Study Time"
          value={`${Math.floor((dashboard?.totalTimeSpent || 0) / 60)}h ${(dashboard?.totalTimeSpent || 0) % 60}m`}
          icon={ClockIcon}
          color="bg-purple-500"
          subtitle={`${dashboard?.timeThisWeek || 0}m this week`}
        />
        <StatCard
          title="Streak"
          value={`${dashboard?.currentStreak || 0} days`}
          icon={FireIcon}
          color="bg-orange-500"
          subtitle="Keep it up!"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Study Time</h3>
          <div className="chart-container">
            <Line data={timeData} options={chartOptions} />
          </div>
        </div>

        {/* Progress Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
          <div className="chart-container">
            <Doughnut data={progressData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLessonsCard lessons={dashboard?.recentLessons} />
        <GoalsCard goals={dashboard?.goals} />
      </div>
    </div>
  );
};

export default Dashboard;
