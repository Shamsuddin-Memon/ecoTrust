import { useState } from 'react';
import { HiUser, HiMail, HiLockClosed } from 'react-icons/hi';
import Input from '../common/Input';
import Button from '../common/Button';
import GoogleLoginButton from './GoogleLoginButton';
import theme from '../../theme/themeConfig';

/**
 * RegisterForm component with role selection.
 *
 * Props:
 *  - onSubmit: async (name, email, password, role) => void
 *  - loading: boolean
 *  - error: string
 */
const RegisterForm = ({ onSubmit, loading = false, error = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const ALLOWED_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'szabist-isb.pk'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    // Name: only English letters and spaces, min 3 chars
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name must only contain English letters (no numbers or special characters)';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    // Email: must be valid format and from allowed domain
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      const domain = formData.email.split('@')[1]?.toLowerCase();
      if (!ALLOWED_DOMAINS.includes(domain)) {
        errors.email = 'Only Gmail, Hotmail, Yahoo, or SZABIST email addresses are allowed';
      }
    }

    // Password: min 3 chars, must contain a number
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    } else if (!/\d/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData.name, formData.email, formData.password, 'donor');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Full Name"
        type="text"
        name="name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={handleChange}
        error={fieldErrors.name}
        icon={<HiUser size={20} />}
        required
      />

      <div className="space-y-1">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          icon={<HiMail size={20} />}
          required
        />
        <p className="text-xs text-dark-500 pl-1">Accepted: Gmail, Hotmail, Yahoo, or SZABIST email</p>
      </div>

      <div className="space-y-1">
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
        <p className="text-xs text-dark-500 pl-1">Min. 3 characters, must include a number</p>
      </div>

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="Re-enter your password"
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
        Create Account
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

export default RegisterForm;
