import { useState } from 'react';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import Input from '../common/Input';
import Button from '../common/Button';
import GoogleLoginButton from './GoogleLoginButton';

/**
 * LoginForm component with email/password fields and Google OAuth.
 *
 * Props:
 *  - onSubmit: async (email, password) => void
 *  - loading: boolean
 *  - error: string
 */
const LoginForm = ({ onSubmit, loading = false, error = '' }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = 'Please enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData.email, formData.password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        error={fieldErrors.email}
        icon={<HiMail size={20} />}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
        icon={<HiLockClosed size={20} />}
        required
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-slide-down">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" fullWidth loading={loading}>
        Sign In
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-dark-950 text-dark-400">or continue with</span>
        </div>
      </div>

      <GoogleLoginButton />
    </form>
  );
};

export default LoginForm;
