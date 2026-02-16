import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CalendarCheck,
  BarChart3,
  Flame,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { plansAPI, tasksAPI, analyticsAPI } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [plansRes, analyticsRes] = await Promise.all([
        plansAPI.getAll({ status: 'active', limit: 5 }),
        analyticsAPI.get(),
      ]);

      const fetchedPlans = plansRes.data || [];
      setPlans(fetchedPlans);
      setAnalytics(analyticsRes.data || {});

      const today = new Date().toISOString().split('T')[0];
      const taskPromises = fetchedPlans.slice(0, 3).map((plan) =>
        tasksAPI.getByDate(plan._id, today).catch(() => ({ data: { tasks: [] } }))
      );
      const taskResults = await Promise.all(taskPromises);

      const allTasks = taskResults.flatMap((res) =>
        (res.data?.tasks || []).map((t) => ({
          ...t,
          planGoal: fetchedPlans.find((p) => p._id === res.data?.planId)?.goal || '',
        }))
      );

      setTodayTasks(allTasks);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#4A6FA5] animate-spin" />
        <span className="ml-3 text-gray-500">Loading dashboard…</span>
      </div>
    );
  }

  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const todayProgress =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const upcomingTasks = todayTasks.filter((t) => !t.completed).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back,{' '}
          <span className="text-[#4A6FA5]">
            {user?.name || 'Student'}
          </span>{' '}
          👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s an overview of your study progress today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          icon={CalendarCheck}
          label="Today's Tasks"
          value={`${completedToday}/${totalToday}`}
          color="primary"
        />
        <SummaryCard
          icon={BookOpen}
          label="Active Plans"
          value={analytics?.activePlans || 0}
          color="blue"
        />
        <SummaryCard
          icon={Flame}
          label="Day Streak"
          value={analytics?.currentStreak || 0}
          color="amber"
        />
        <SummaryCard
          icon={BarChart3}
          label="Overall Completion"
          value={`${analytics?.completionRate || 0}%`}
          color="green"
        />
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tasks Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Today&apos;s Tasks
            </h2>

            <Link
              to="/daily"
              className="text-sm text-[#4A6FA5] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mb-5">
            <ProgressBar value={todayProgress} color="primary" />
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No pending tasks for today.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <li
                  key={task._id || index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-[#4A6FA5]" />
                  <span className="text-sm text-gray-700 flex-1">
                    {task.title}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {task.duration || 30} min
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active Plans */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Plans
            </h2>

            <Link
              to="/plans"
              className="text-sm text-[#4A6FA5] hover:underline flex items-center gap-1"
            >
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ul className="space-y-4">
            {plans.length === 0 ? (
              <li className="text-sm text-gray-400 text-center py-4">
                No active plans yet.
              </li>
            ) : (
              plans.map((plan) => (
                <li key={plan._id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {plan.goal}
                    </span>
                    <span className="text-xs text-gray-500">
                      {plan.progress || 0}%
                    </span>
                  </div>

                  <ProgressBar
                    value={plan.progress || 0}
                    showLabel={false}
                    size="sm"
                    color={plan.progress >= 60 ? 'green' : 'primary'}
                  />
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}

/** Summary stat card */
function SummaryCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    primary: 'bg-[#EEF3FB] text-[#4A6FA5]',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorMap[color]}`}
        >
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
