import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { levelOptions, timePreferences, breakPreferences } from '../services/mockData';
import { plansAPI } from '../services/api';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';

export default function CreatePlanPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    goal: '',
    deadline: '',
    dailyHours: '',
    level: '',
    topics: [],
    weakAreas: [],
    preferredTime: '',
    breakPreference: '',
  });

  const [topicInput, setTopicInput] = useState('');
  const [weakAreaInput, setWeakAreaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const addTopic = () => {
    const val = topicInput.trim();
    if (val && !form.topics.includes(val)) {
      setForm({ ...form, topics: [...form.topics, val] });
      setTopicInput('');
      setErrors({ ...errors, topics: '' });
    }
  };

  const removeTopic = (topic) => {
    setForm({ ...form, topics: form.topics.filter((t) => t !== topic) });
  };

  const addWeakArea = () => {
    const val = weakAreaInput.trim();
    if (val && !form.weakAreas.includes(val)) {
      setForm({ ...form, weakAreas: [...form.weakAreas, val] });
      setWeakAreaInput('');
    }
  };

  const removeWeakArea = (area) => {
    setForm({ ...form, weakAreas: form.weakAreas.filter((a) => a !== area) });
  };

  const validate = () => {
    const errs = {};
    if (!form.goal.trim()) errs.goal = 'Goal / Subject is required.';
    if (!form.deadline) errs.deadline = 'Deadline is required.';
    if (!form.dailyHours || Number(form.dailyHours) <= 0) errs.dailyHours = 'Enter valid daily hours.';
    if (!form.level) errs.level = 'Select your current level.';
    if (form.topics.length === 0) errs.topics = 'Add at least one topic.';
    if (!form.preferredTime) errs.preferredTime = 'Select preferred study time.';
    if (!form.breakPreference) errs.breakPreference = 'Select break preference.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      await plansAPI.create({
        goal: form.goal,
        deadline: form.deadline,
        dailyHours: Number(form.dailyHours),
        currentLevel: form.level,
        topics: form.topics,
        weakAreas: form.weakAreas,
        preferredStudyTime: form.preferredTime,
        breakPreference: form.breakPreference,
      });

      setSubmitted(true);
      setTimeout(() => navigate('/plans'), 2000);
    } catch (error) {
      setServerError(error.message || 'Failed to generate study plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Created!</h2>
        <p className="text-gray-500">Your AI-generated study plan is ready. Redirecting to My Plans…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Study Plan</h1>
        <p className="text-gray-500 mt-1">Fill in the details and let AI generate your personalized schedule.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">

        <FormInput
          label="Goal / Exam / Subject"
          name="goal"
          value={form.goal}
          onChange={handleChange}
          placeholder="e.g. Master React for frontend interviews"
          error={errors.goal}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput
            label="Deadline"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            error={errors.deadline}
            required
          />
          <FormInput
            label="Daily Study Hours"
            name="dailyHours"
            type="number"
            value={form.dailyHours}
            onChange={handleChange}
            placeholder="e.g. 3"
            error={errors.dailyHours}
            required
          />
        </div>

        <FormInput
          label="Current Level"
          name="level"
          type="select"
          value={form.level}
          onChange={handleChange}
          options={levelOptions}
          placeholder="Select your level"
          error={errors.level}
          required
        />

        {/* Topics */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Topics <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              placeholder="Type a topic and press Enter"
              className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6FA5] focus:border-[#4A6FA5]"
            />

            <button
              type="button"
              onClick={addTopic}
              className="px-4 py-2 bg-[#4A6FA5] text-white text-sm font-medium rounded-lg hover:bg-[#3F5F92] transition-colors"
            >
              Add
            </button>
          </div>

          {errors.topics && <p className="text-xs text-red-500 mt-1">{errors.topics}</p>}

          <div className="flex flex-wrap gap-2 mt-2">
            {form.topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#F3F6FC] text-[#4A6FA5] text-sm rounded-full"
              >
                {topic}
                <button type="button" onClick={() => removeTopic(topic)} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Weak Areas</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={weakAreaInput}
              onChange={(e) => setWeakAreaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWeakArea())}
              placeholder="Type a weak area and press Enter"
              className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6FA5] focus:border-[#4A6FA5]"
            />

            <button
              type="button"
              onClick={addWeakArea}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {form.weakAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full"
              >
                {area}
                <button type="button" onClick={() => removeWeakArea(area)} className="hover:text-red-800">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Study Time */}
        <FormInput
          label="Preferred Study Time"
          name="preferredTime"
          type="select"
          value={form.preferredTime}
          onChange={handleChange}
          options={timePreferences}
          placeholder="Select study time"
          error={errors.preferredTime}
          required
        />

        {/* Break Preference */}
        <FormInput
          label="Break Preference"
          name="breakPreference"
          type="select"
          value={form.breakPreference}
          onChange={handleChange}
          options={breakPreferences}
          placeholder="Select break style"
          error={errors.breakPreference}
          required
        />

        {/* Error */}
        {serverError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3 bg-[#4A6FA5] text-white font-semibold rounded-xl hover:bg-[#3F5F92] transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Plan…
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Study Plan
            </>
          )}
        </button>

      </form>
    </div>
  );
}
