import { useState, useEffect } from 'react';
import { plansAPI, tasksAPI } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { CheckCircle2, Circle, Clock, ListChecks, Loader2, AlertCircle } from 'lucide-react';

export default function DailyPlannerPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [dailyTask, setDailyTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await plansAPI.getAll({ status: 'active' });
        const list = res.data || [];
        setPlans(list);
        if (list.length > 0) setSelectedPlanId(list[0]._id);
      } catch (err) {
        setError(err.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (!selectedPlanId) return;

    const fetchTasks = async () => {
      setTasksLoading(true);
      setError('');
      try {
        const res = await tasksAPI.getByDate(selectedPlanId, todayStr);
        const data = res.data || res;
        setDailyTask(data);
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err.message || 'Failed to load tasks');
        setTasks([]);
        setDailyTask(null);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, [selectedPlanId, todayStr]);

  const toggleTask = async (subTaskId) => {
    if (!dailyTask?._id) return;

    const targetTask = tasks.find((t) => t._id === subTaskId);
    if (!targetTask) return;

    const updatedTasks = tasks.map((t) =>
      t._id === subTaskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);

    try {
      await tasksAPI.update(dailyTask._id, {
        taskUpdates: [{ _id: subTaskId, completed: !targetTask.completed }],
      });
    } catch {
      setTasks(tasks);
      setError('Failed to update task');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const totalMinutes = tasks.reduce((sum, t) => sum + (t.duration || 30), 0);
  const completedMinutes = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (t.duration || 30), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#4A6FA5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Planner</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Plan selector */}
      {plans.length > 1 && (
        <div className="mb-6">
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4A6FA5] focus:border-[#4A6FA5] outline-none"
          >
            {plans.map((p) => (
              <option key={p._id} value={p._id}>{p.goal}</option>
            ))}
          </select>
        </div>
      )}

      {plans.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">No active plans. Create one first.</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {plans.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <ListChecks className="w-5 h-5 text-[#4A6FA5] mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">
                {completedCount}/{tasks.length}
              </p>
              <p className="text-xs text-gray-500">Tasks Done</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">
                {completedMinutes}/{totalMinutes} min
              </p>
              <p className="text-xs text-gray-500">Time Studied</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center col-span-2 sm:col-span-1">
              <ProgressBar value={progress} color={progress >= 75 ? 'green' : 'primary'} />
            </div>
          </div>

          {/* Tasks */}
          {tasksLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#4A6FA5] animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-500">No tasks scheduled for today.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    task.completed ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Checkbox */}
                  <button onClick={() => toggleTask(task._id)}>
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 hover:text-[#7A96C2] transition-colors" />
                    )}
                  </button>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    {task.topic && (
                      <p className="text-xs text-gray-400 mt-0.5">{task.topic}</p>
                    )}
                  </div>

                  {/* Type badge */}
                  {task.type && task.type !== 'study' && (
                    <span className="text-xs bg-[#F3F6FC] text-[#4A6FA5] px-2 py-0.5 rounded-md capitalize">
                      {task.type}
                    </span>
                  )}

                  {/* Duration */}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {task.duration || 30} min
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
