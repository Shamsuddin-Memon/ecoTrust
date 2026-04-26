/**
 * Loading Spinner component with EcoTrust branding.
 * Displays a full-screen or inline animated spinner.
 *
 * Props:
 *  - fullScreen: boolean — center on full viewport (default: false)
 *  - size: 'sm' | 'md' | 'lg' (default: 'md')
 *  - message: string — optional loading message
 */
const LoadingSpinner = ({
  fullScreen = false,
  size = 'md',
  message = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-eco-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-eco-500 animate-spin"></div>
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-forest-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
      {message && (
        <p className="text-dark-300 text-sm font-medium animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
