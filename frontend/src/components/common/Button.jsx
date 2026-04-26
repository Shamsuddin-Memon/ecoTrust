/**
 * Reusable Button component with EcoTrust styling variants.
 *
 * Props:
 *  - variant: 'primary' | 'ghost' | 'danger' (default: 'primary')
 *  - size: 'sm' | 'md' | 'lg' (default: 'md')
 *  - loading: boolean — shows spinner and disables button
 *  - fullWidth: boolean — stretches to 100% width
 *  - children, onClick, type, disabled, className
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold
    rounded-xl transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-950
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantStyles = {
    primary: `
      bg-gradient-eco text-white shadow-eco
      hover:shadow-eco-lg hover:-translate-y-0.5
      focus:ring-eco-400
    `,
    ghost: `
      bg-transparent text-eco-400 border border-eco-400/30
      hover:border-eco-400 hover:bg-eco-400/10
      focus:ring-eco-400
    `,
    danger: `
      bg-red-500/10 text-red-400 border border-red-400/30
      hover:bg-red-500/20 hover:border-red-400
      focus:ring-red-400
    `,
  };

  const sizeStyles = {
    sm: 'text-sm py-2 px-4 gap-1.5',
    md: 'text-base py-3 px-6 gap-2',
    lg: 'text-lg py-4 px-8 gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
