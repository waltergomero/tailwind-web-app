'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { updateUser } from '@/actions/users';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  isadmin: boolean;
  isactive: boolean;
}

interface UserDetailsFormProps {
  user: User;
  onClose?: () => void;
}

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}

// Reusable Input Field Component
interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  type,
  label,
  defaultValue,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
}) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...(error && {
        'aria-invalid': 'true' as const,
        'aria-describedby': `${id}-error`,
      })}
    />
    {error && (
      <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

// Password Input with Visibility Toggle
interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleVisibility();
    }
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={isVisible ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...(error && {
          'aria-invalid': 'true' as const,
          'aria-describedby': `${id}-error`,
        })}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        onKeyDown={handleKeyDown}
        className="absolute right-3 top-[2.15rem] h-6 w-6 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {isVisible ? <EyeIcon /> : <EyeSlashIcon />}
      </button>
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

// Checkbox Field Component
interface CheckboxFieldProps {
  id: string;
  name: string;
  label: string;
  defaultChecked: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  name,
  label,
  defaultChecked,
}) => (
  <div className="flex items-center gap-2 pt-4">
    <input
      type="checkbox"
      id={id}
      name={name}
      defaultChecked={defaultChecked}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
    />
    <label htmlFor={id} className="text-sm font-medium cursor-pointer">
      {label}
    </label>
  </div>
);

const UserDetailsForm = ({ user, onClose }: UserDetailsFormProps) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('userId', user._id);
      
      const result = await updateUser(null, formData);
      
      if ('success' in result && result.success) {
        toast.success(result.message || 'User updated successfully');
        onClose?.();
        router.push('/admin/users');
      } else {
        const errorMessage = 'message' in result ? result.message : 'Failed to update user';
        setFieldErrors(result.errors || {});
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  if (!user) {
    return (
      <section className="container mx-auto pt-12">
        <div className="max-w-4xl mx-auto p-6 border border-gray-200 rounded-md shadow-sm">
          <p className="text-red-500">User not found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto pt-12">
      <div className="max-w-4xl mx-auto p-6 border border-gray-200 rounded-md shadow-sm">
        <h2 className="text-2xl font-bold mb-6">User Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <input type="hidden" name="userid" value={user._id} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="first_name"
              name="first_name"
              type="text"
              label="First Name"
              defaultValue={user.first_name}
              required
              error={fieldErrors.first_name}
            />

            <InputField
              id="last_name"
              name="last_name"
              type="text"
              label="Last Name"
              defaultValue={user.last_name}
              required
              error={fieldErrors.last_name}
            />

            <InputField
              id="email"
              name="email"
              type="email"
              label="Email"
              defaultValue={user.email}
              required
              error={fieldErrors.email}
            />

            <PasswordField
              id="password"
              name="password"
              label="Password (leave blank to keep current)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              error={fieldErrors.password}
            />

            <CheckboxField
              id="isadmin"
              name="isadmin"
              label="Admin User"
              defaultChecked={user.isadmin}
            />

            <CheckboxField
              id="isactive"
              name="isactive"
              label="Active User"
              defaultChecked={user.isactive}
            />
          </div>

          <div className="pt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default UserDetailsForm;