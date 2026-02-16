/**
 * Static dropdown options for the study planner forms.
 * These are used by CreatePlanPage and other form components.
 */

// Level options for dropdowns
export const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// Time preference options
export const timePreferences = [
  { value: 'morning', label: 'Morning (6 AM – 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM – 5 PM)' },
  { value: 'evening', label: 'Evening (5 PM – 9 PM)' },
  { value: 'night', label: 'Night (9 PM – 12 AM)' },
];

// Break preference options (values match backend enum)
export const breakPreferences = [
  { value: 'pomodoro', label: 'Pomodoro (25 min work / 5 min break)' },
  { value: 'long-blocks', label: 'Extended (50 min work / 10 min break)' },
  { value: 'flexible', label: 'Flexible (self-paced breaks)' },
];
