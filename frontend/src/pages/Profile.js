import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { UserIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    learningPreferences: [],
    skillLevel: 'beginner',
    dailyGoal: 30,
    notifications: {
      email: true,
      push: true,
      studyReminders: true,
    },
    theme: 'light',
  });

  const learningPreferenceOptions = [
    { value: 'visual', label: 'Visual Learning' },
    { value: 'auditory', label: 'Auditory Learning' },
    { value: 'kinesthetic', label: 'Hands-on Learning' },
    { value: 'reading', label: 'Reading/Writing' },
  ];

  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'auto', label: 'Auto (System)' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.profile?.firstName || '',
        lastName: data.profile?.lastName || '',
        bio: data.profile?.bio || '',
        learningPreferences: data.profile?.learningPreferences || [],
        skillLevel: data.profile?.skillLevel || 'beginner',
        dailyGoal: data.preferences?.dailyGoal || 30,
        notifications: {
          email: data.preferences?.notifications?.email ?? true,
          push: data.preferences?.notifications?.push ?? true,
          studyReminders: data.preferences?.notifications?.studyReminders ?? true,
        },
        theme: data.preferences?.theme || 'light',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        'profile.firstName': formData.firstName,
        'profile.lastName': formData.lastName,
        'profile.bio': formData.bio,
        'profile.learningPreferences': formData.learningPreferences,
        'profile.skillLevel': formData.skillLevel,
        'preferences.dailyGoal': formData.dailyGoal,
        'preferences.notifications': formData.notifications,
        'preferences.theme': formData.theme,
      };

      await userService.updateProfile(updateData);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (preference) => {
    setFormData({
      ...formData,
      learningPreferences: formData.learningPreferences.includes(preference)
        ? formData.learningPreferences.filter(p => p !== preference)
        : [...formData.learningPreferences, preference]
    });
  };

  const handleNotificationChange = (type) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [type]: !formData.notifications[type]
      }
    });
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and learning preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="card">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
            <p className="text-gray-600">{user?.email}</p>
            
            {profile?.stats && (
              <div className="mt-6 space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.stats.totalLessonsCompleted}</div>
                  <div className="text-sm text-gray-600">Lessons Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.floor(profile.stats.totalTimeSpent / 60)}h</div>
                  <div className="text-sm text-gray-600">Time Spent Learning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{profile.stats.currentStreak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself and your learning goals..."
                />
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
              
              <div className="mb-4">
                <label className="label">Learning Style (select all that apply)</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {learningPreferenceOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.learningPreferences.includes(option.value)}
                        onChange={() => handlePreferenceChange(option.value)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Skill Level</label>
                <select
                  className="input-field"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
                >
                  {skillLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Daily Learning Goal (minutes)</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  className="input-field"
                  value={formData.dailyGoal}
                  onChange={(e) => setFormData({...formData, dailyGoal: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                {Object.entries(formData.notifications).map(([type, enabled]) => (
                  <label key={type} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {type === 'studyReminders' ? 'Study Reminders' : 
                         type.charAt(0).toUpperCase() + type.slice(1)} Notifications
                      </span>
                      <p className="text-xs text-gray-500">
                        {type === 'email' && 'Receive updates and insights via email'}
                        {type === 'push' && 'Get push notifications in the browser'}
                        {type === 'studyReminders' && 'Daily reminders to keep up with your goals'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={enabled}
                      onChange={() => handleNotificationChange(type)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
              <div>
                <label className="label">Theme</label>
                <select
                  className="input-field"
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                >
                  {themeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
