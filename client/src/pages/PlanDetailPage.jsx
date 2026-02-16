import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plansAPI, tasksAPI } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Tag,
} from 'lucide-react';

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [todayTasks, setTodayTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await plansAPI.getById(id);
        setPlan(res.data);

        try {
          const taskRes = await tasksAPI.getByDate(id, todayStr);
          setTodayTasks(taskRes.data || taskRes);
        } catch { }
      } catch (err) {
        setError(err.message || 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, todayStr]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    setDeleting(true);
    try {
      await plansAPI.delete(id);
      navigate('/plans');
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
      setDeleting(false);
    }
  };

  const toggleTask = async (subTaskId) => {
    if (!todayTasks?._id) return;

    const tasks = todayTasks.tasks || [];
    const target = tasks.find((t) => t._id === subTaskId);
    if (!target) return;

    // Save snapshot for rollback before optimistic update
    const previousTasks = { ...todayTasks, tasks: [...tasks] };

    setTodayTasks({
      ...todayTasks,
      tasks: tasks.map((t) =>
        t._id === subTaskId ? { ...t, completed: !t.completed } : t
      ),
    });

    try {
      const res = await tasksAPI.update(todayTasks._id, {
        taskUpdates: [{ _id: subTaskId, completed: !target.completed }],
      });

      // Update the plan progress in the UI
      if (res.data?.planProgress !== undefined) {
        setPlan((prev) => ({ ...prev, progress: res.data.planProgress }));
      }
    } catch {
      setTodayTasks(previousTasks);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#4A6FA5] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#4A6FA5] hover:text-[#3F5F92]"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const deadline = plan.deadline
    ? new Date(plan.deadline).toLocaleDateString()
    : '—';

  const schedule = plan.generatedSchedule;
  const todayTasksList = todayTasks?.tasks || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-[#4A6FA5] hover:text-[#3F5F92] font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Plans
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {plan.goal}
            </h1>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {plan.currentLevel} · {plan.status}
            </p>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
          >
            {deleting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Meta icon={Calendar} label="Deadline" value={deadline} />
          <Meta icon={Clock} label="Daily Hours" value={`${plan.dailyHours || 1}h/day`} />
          <Meta icon={Target} label="Progress" value={`${plan.progress || 0}%`} />
          <Meta icon={BookOpen} label="Topics" value={plan.topics?.length || 0} />
        </div>

        <div className="mt-6">
          <ProgressBar
            value={plan.progress || 0}
            color={plan.progress >= 75 ? 'green' : plan.progress >= 40 ? 'amber' : 'primary'}
          />
        </div>

        {/* Topics */}
        {plan.topics?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {plan.topics.map((t) => (
              <span
                key={t}
                className="text-xs bg-[#F3F6FC] text-[#4A6FA5] px-2.5 py-1 rounded-md"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Today's Tasks */}
      {todayTasksList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Tasks
          </h2>

          <div className="divide-y divide-gray-100">
            {todayTasksList.map((task) => (
              <div
                key={task._id}
                className={`flex items-center gap-4 py-3 ${task.completed ? 'opacity-60' : ''}`}
              >
                <button onClick={() => toggleTask(task._id)}>
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 hover:text-[#7A96C2]" />
                  )}
                </button>

                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                </div>

                {task.type && (
                  <span className="text-xs bg-[#F3F6FC] text-[#4A6FA5] px-2 py-0.5 rounded-md capitalize">
                    {task.type}
                  </span>
                )}

                <span className="text-xs text-gray-400">
                  {task.duration || 30} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Schedule / Plan Overview */}
      {schedule && (
        <div className="space-y-6">
          {/* Overview & Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#4A6FA5]" />
                Plan Overview
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {schedule.overview}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Study Tips
              </h2>
              <ul className="space-y-2">
                {(schedule.tips || []).map((tip, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-[#4A6FA5] font-bold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Schedule Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4A6FA5]" />
              Detailed Timeline
            </h2>

            <div className="space-y-8">
              {(schedule.schedule || []).map((day, dayIdx) => (
                <div key={dayIdx} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-8 last:pb-0">
                  {/* Day Indicator */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#4A6FA5] border-4 border-white shadow-sm" />

                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      Day {day.dayNumber}: {day.date}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{day.dailySummary}</p>
                  </div>

                  <div className="grid gap-3">
                    {(day.tasks || []).map((task, taskIdx) => (
                      <div key={taskIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-semibold text-gray-800">{task.title}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EEF3FB] text-[#4A6FA5] px-2 py-0.5 rounded">
                            {task.duration} min
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                        {task.topic && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                            <Tag className="w-3 h-3" />
                            {task.topic}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          {schedule.milestones && schedule.milestones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Key Milestones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedule.milestones.map((ms, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-green-800">Day {ms.day}</p>
                      <p className="text-xs text-green-700">{ms.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/** Meta item */
function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
