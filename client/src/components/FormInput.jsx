/**
 * FormInput – reusable form field component with label, validation error display,
 * and support for text / email / password / select / textarea types.
 */
export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  options = [],       // for select type
  rows = 3,           // for textarea type
  className = '',
}) {
  const baseClasses =
    'w-full px-3 py-2.5 text-sm bg-white border rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const errorClasses = error
    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300';

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${baseClasses} ${errorClasses} ${className}`}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${baseClasses} ${errorClasses} ${className}`}
        />
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${baseClasses} ${errorClasses} ${className}`}
      />
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
