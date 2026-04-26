import { useState } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * ResetPasswordForm component.
 *
 * Props:
 *  - onSubmit: async (password) => void
 *  - loading: boolean
 *  - error: string
 */
const ResetPasswordForm = ({ onSubmit, loading = false, error = '' }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6)
      errors.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(formData.password))
      errors.password = 'Password must contain at least one number';
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData.password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-dark-300 text-sm leading-relaxed">
        Enter your new password below. Make sure it&apos;s at least 6 characters long
        and contains a number.
      </p>

      <Input
        label="New Password"
        type="password"
        name="password"
        placeholder="Min. 6 characters with a number"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
        icon={<HiLockClosed size={20} />}
        required
      />

      <Input
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        placeholder="Re-enter your new password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={fieldErrors.confirmPassword}
        icon={<HiLockClosed size={20} />}
        required
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-slide-down">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" fullWidth loading={loading}>
        Reset Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
