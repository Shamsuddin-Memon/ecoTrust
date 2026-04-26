import { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

/**
 * Reusable Input component with EcoTrust styling.
 *
 * Props:
 *  - label: string — field label
 *  - type: string — input type (text, email, password, etc.)
 *  - placeholder: string
 *  - value, onChange, name, id
 *  - error: string — error message (turns border red)
 *  - icon: ReactNode — optional left icon
 *  - required: boolean
 *  - disabled: boolean
 */
const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  id,
  error,
  icon,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-dark-200 mb-2"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark-400">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          id={id || name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full bg-dark-900/50 border text-white
            placeholder-dark-400 rounded-xl py-3
            ${icon ? 'pl-11 pr-4' : 'px-4'}
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-dark-700 focus:border-eco-500 focus:ring-eco-500'}
            focus:outline-none focus:ring-1
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-dark-400 hover:text-white transition-colors"
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 animate-slide-down">{error}</p>
      )}
    </div>
  );
};

export default Input;
