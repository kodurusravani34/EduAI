/**
 * ProgressBar – reusable progress indicator.
 * @param {number} value – current value (0–100)
 * @param {string} color – tailwind color class suffix (e.g. 'indigo', 'green')
 * @param {boolean} showLabel – whether to display percentage text
 * @param {string} size – 'sm' | 'md' | 'lg'
 */
export default function ProgressBar({
  value = 0,
  color = 'indigo',
  showLabel = true,
  size = 'md',
}) {
  const clamped = Math.min(100, Math.max(0, value));

  const heightMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorMap = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className="text-xs font-semibold text-gray-800">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heightMap[size]}`}>
        <div
          className={`${colorMap[color] || colorMap.indigo} ${heightMap[size]} rounded-full transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
