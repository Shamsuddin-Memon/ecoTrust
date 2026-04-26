import { useState, useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamation, HiX } from 'react-icons/hi';

/**
 * Toast notification component.
 *
 * Props:
 *  - message: string — toast message
 *  - type: 'success' | 'error' | 'info' | 'warning' (default: 'info')
 *  - duration: number — auto-dismiss in ms (default: 4000, 0 = no auto-dismiss)
 *  - onClose: function — called when toast is dismissed
 *  - show: boolean — controls visibility
 */
const Toast = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  show = true,
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const typeConfig = {
    success: {
      bg: 'bg-eco-500/10 border-eco-500/30',
      text: 'text-eco-400',
      icon: <HiCheckCircle size={22} />,
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-400',
      icon: <HiXCircle size={22} />,
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-400',
      icon: <HiInformationCircle size={22} />,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-400',
      icon: <HiExclamation size={22} />,
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-down">
      <div
        className={`
          flex items-center gap-3 px-5 py-4 rounded-xl border
          backdrop-blur-xl shadow-lg min-w-[320px] max-w-md
          ${config.bg}
        `}
      >
        <span className={config.text}>{config.icon}</span>
        <p className={`flex-1 text-sm font-medium ${config.text}`}>{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className={`${config.text} hover:opacity-70 transition-opacity`}
        >
          <HiX size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
