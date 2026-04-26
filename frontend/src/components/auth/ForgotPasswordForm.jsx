import { useState } from 'react';
import { HiMail } from 'react-icons/hi';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * ForgotPasswordForm component.
 *
 * Props:
 *  - onSubmit: async (email) => void
 *  - loading: boolean
 *  - error: string
 *  - success: string
 */
const ForgotPasswordForm = ({ onSubmit, loading = false, error = '', success = '' }) => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setFieldError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError('Please enter a valid email');
      return;
    }
    setFieldError('');
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-dark-300 text-sm leading-relaxed">
        Enter the email address associated with your account and we&apos;ll send you
        a link to reset your password.
      </p>

      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setFieldError('');
        }}
        error={fieldError}
        icon={<HiMail size={20} />}
        required
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-slide-down">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-eco-500/10 border border-eco-500/30 animate-slide-down">
          <p className="text-sm text-eco-400">{success}</p>
        </div>
      )}

      <Button type="submit" fullWidth loading={loading}>
        Send Reset Link
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
