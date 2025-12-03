import { z } from 'zod';
import { is } from 'zod/locales';

// Schema for signing users in
//validate email in correct format as well
export const signInSchema = z.object({
  email: z.string().nonempty('Email address is required').email('Invalid email address'),
  password: z.string().nonempty('Password is required')          
              .min(6, 'Password must be at least 6 characters'),
});


export const signUpSchema = z.object({
  first_name: z.string().nonempty('First name is required'),
  last_name: z.string().nonempty('Last name is required'),
  email: z.string().nonempty('Email address is required').email('Invalid email address'),
  password: z.string().nonempty('Password is required')          
              .min(6, 'Password must be at least 6 characters'),
});

export const addUserFormSchema = z.object({
  first_name: z.string().nonempty('First name is required'),
  last_name: z.string().nonempty('Last name is required'),
  email: z.string().nonempty('Email address is required').email('Invalid email address'),
  password: z.string().nonempty('Password is required')          
              .min(6, 'Password must be at least 6 characters'),
  isadmin: z.boolean(),
  isactive: z.boolean().optional(),
});

export const updateUserFormSchema = z.object({
  first_name: z.string().nonempty('First name is required'),
  last_name: z.string().nonempty('Last name is required'),
  email: z.string().nonempty('Email address is required').email('Invalid email address'),
  isadmin: z.boolean(),
  isactive: z.boolean(),
});


export const addStatusFormSchema = z.object({
  status_name: z.string().nonempty('Status name is required'),
  typeid: z.number({ message: 'Type is required' }),
  description: z.string().optional(),
  isactive: z.boolean().optional(),
});

export const updateStatusFormSchema = z.object({
  status_name: z.string().nonempty('Status name is required'),
  typeid: z.number({ message: 'Type is required' }),
  description: z.string().optional(),
  isactive: z.boolean(),
});

export const addCategoryFormSchema = z.object({
  category_name: z.string().nonempty('Category name is required'),
  parent_category_id: z.string().nullable(),
  parent_category_name: z.string().nullable(),
  description: z.string().optional(),
  isactive: z.boolean().optional(),
});

export const updateCategoryFormSchema = z.object({
  category_name: z.string().nonempty('Category name is required'),
  parent_category_id: z.string().nullable(),
  parent_category_name: z.string().nullable(),
  description: z.string().optional(),
  isactive: z.boolean(),
});
