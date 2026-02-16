import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { timePreferences, breakPreferences } from '../services/mockData';
import {
  Mail,
  Calendar,
  Save,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updatePreferences } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [prefForm, setPrefForm] = useState({
    dailyGoalHours: user?.preferences?.dailyGoalHours || 2,
    preferredStudyTime: user?.preferences?.preferredStudyTime || 'morning',
    breakPreference: user?.preferences?.breakPreference || 'pomodoro',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPrefForm({
      ...prefForm,
      [name]: name === 'dailyGoalHours' ? Number(value) : value,
    });
    setError('');
    setSuccess('');
  };

  const handlePrefSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updatePreferences(prefForm);
      setSuccess('Preferences saved successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : '—';

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account information and study preferences.
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#EEF3FB] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-[#4A6FA5]">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.name || 'User'}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <Detail icon={Mail} label="Email" value={user?.email} />
          <Detail icon={Calendar} label="Joined" value={joinedDate} />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Study Preferences
            </h2>
          </div>

          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setSuccess('');
                setError('');
              }}
              className="text-sm text-[#4A6FA5] hover:text-[#3F5F92] font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!editing ? (
          <div className="space-y-4">
            <Pref label="Daily Study Goal" value={`${user?.preferences?.dailyGoalHours || 2} hours`} />
            <Pref label="Preferred Study Time" value={user?.preferences?.preferredStudyTime || 'Morning'} />
            <Pref label="Break Preference" value={user?.preferences?.breakPreference || 'Pomodoro'} />
          </div>
        ) : (
          <form onSubmit={handlePrefSave} className="space-y-4">

            <Input
              label="Daily Study Goal (hours)"
              type="number"
              name="dailyGoalHours"
              value={prefForm.dailyGoalHours}
              onChange={handlePrefChange}
            />

            <Select
              label="Preferred Study Time"
              name="preferredStudyTime"
              value={prefForm.preferredStudyTime}
              onChange={handlePrefChange}
              options={timePreferences}
            />

            <Select
              label="Break Preference"
              name="breakPreference"
              value={prefForm.breakPreference}
              onChange={handlePrefChange}
              options={breakPreferences}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#4A6FA5] text-white text-sm font-semibold rounded-xl hover:bg-[#3F5F92] flex items-center gap-2"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save Preferences'}
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>

          </form>
        )}
      </div>

    </div>
  );
}

/* ---------- Small Components ---------- */

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="w-4 h-4 text-gray-400" />
      <span className="text-gray-500 w-24">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

function Pref({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 capitalize">
        {value}
      </span>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4A6FA5] focus:border-[#4A6FA5] outline-none"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4A6FA5] focus:border-[#4A6FA5] outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
