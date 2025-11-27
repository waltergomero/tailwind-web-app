'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { addUser } from '@/actions/users';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

type FieldErrors = Record<string, string>;

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  id, 
  name, 
  type = 'text', 
  error, 
  value, 
  onChange 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

interface PasswordFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  error?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  visible,
  onToggleVisibility,
  error,
}) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <input
      type={visible ? 'text' : 'password'}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="button"
      onClick={onToggleVisibility}
      className="cursor-pointer absolute right-3 mt-5 h-[25px] w-[25px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"
    >
      {visible ? <EyeIcon /> : <EyeSlashIcon />}
    </button>
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);


const UserAddForm: React.FC = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleCancel = () => {
    router.push('/admin/users');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const formData = new FormData(form);
      const result = await addUser(null, formData);
      
      if ('success' in result && result.success) {
        toast.success(result.message || 'User created successfully');
        router.push('/admin/users');
      } else {
        const errorMessage = 'message' in result ? result.message : 'Failed to create user';
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
  
  return (
    <section className="container mx-auto pt-12">
      <div className="max-w-4xl mx-auto p-6 border border-gray-200 rounded-md shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Add New User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              id="first_name"
              name="first_name"
              error={fieldErrors.first_name}
            />

            <FormField
              label="Last Name"
              id="last_name"
              name="last_name"
              error={fieldErrors.last_name}
            />

            <FormField
              label="Email"
              id="email"
              name="email"
              type="email"
              error={fieldErrors.email}
            />

            <PasswordField
              label="Password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              visible={passwordVisible}
              onToggleVisibility={() => setPasswordVisible(!passwordVisible)}
              error={fieldErrors.password}
            />
          </div>

          <div className="flex items-center pt-4">
            <input
              type="checkbox"
              id="isadmin"
              name="isadmin"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isadmin" className="ml-2 text-sm font-medium">
              Is Admin?
            </label>
          </div>

          <div className="pt-4 flex gap-3 justify-center">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white py-1.5 px-6 text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-1.5 px-6 text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default UserAddForm