'use server';

import { signUpSchema, updateUserFormSchema, addUserFormSchema} from "@/schemas/schemaValidation";
import { email, ZodError } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import User from "@/models/users";
import bcryptjs from "bcryptjs";
import connectDB from "@/config/database";
import { convertToPlainObject } from "@/lib/utils";


// Constants
const DEFAULT_PAGE_LIMIT = 10;
const BCRYPT_SALT_ROUNDS = 12;

interface UserData {
  _id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  isadmin: boolean;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResult {
  data: UserData[];
  totalPages: number;
}

interface GetUsersParams {
  limit?: number;
  page: number;
  query?: string;
}

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

interface ValidationResult {
  success: false;
  errors: Record<string, string[]>;
}

/**
 * get all users from the database
 */
export async function fetchAllUsers({ 
  limit = DEFAULT_PAGE_LIMIT, 
  page, 
  query 
}: GetUsersParams): Promise<UsersResult> {
  try {
    await connectDB();
    const queryFilter = query && query !== 'all'
      ? {
          $or: [
            { last_name: { $regex: query, $options: 'i' } },
            { first_name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ],
        }
      : {};

    const [users, dataCount] = await Promise.all([
      User.find(queryFilter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('_id first_name last_name name email isadmin isactive createdAt updatedAt')
        .lean(),
      User.countDocuments(queryFilter),
    ]);

    const data = users.map(user => ({
      ...(convertToPlainObject(user) as object),
      _id: user._id.toString(),
    })) as UserData[];

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    await connectDB();
    const user = await User.findOne({
      _id: userId,
    }).lean();

    if (!user) {
      throw new Error('User not found');
    }
    
    // Convert to plain object for client components
    const plainUser = {
      ...(convertToPlainObject(user) as object),
      _id: user._id.toString(),
    };
    
    return plainUser;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Delete a user by ID
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    await User.findByIdAndDelete(userId);
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user' };
  }
}


/**
 * Add user
 */
export async function addUser(
  prevState: { success?: boolean; message?: string; errors?: Record<string, string> } | null,
  formData: FormData
) {
  try {
    console.log('FormData received in addUser:', formData);
    // Extract and validate form data
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const isadmin = Boolean(formData.get('isadmin')) || false;


    addUserFormSchema.parse({ first_name, last_name, email, password, isadmin });
    // Here you would typically call your backend API to create the user
    // For demonstration, we'll assume the user is created successfully

    //check if user already exists logic would go here in a real app
    await connectDB();
    
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return {
        success: false,
        message: `User with this email ${email} already exists. Please sign in instead.`
      };
    }

    // hash password and save user to database logic would go here in a real app
    const hashedPassword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = new User({
      first_name,
      last_name,
      name: `${first_name} ${last_name}`,
      email,
      password: hashedPassword,
      isadmin: isadmin ?? false,
    });
    await newUser.save();

    return {
      success: true,
      message: 'Sign up successful. You can now sign in.'
    };
  } catch (error) {
    // Re-throw redirect errors - these are expected from Next.js
    if (isRedirectError(error)) {
      throw error;
    }
    // Handle validation errors
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) {
        const field = issue.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return { 
        success: false, 
        message: 'Validation failed. Required fields are missing or invalid.',
        errors: fieldErrors
      };
    }
    // Handle all other errors
    console.error("Unexpected error:", error);
    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.' 
    };
  }
}

/**
 * Add user
 */
export async function updateUser(
    prevState: { success?: boolean; message?: string; errors?: Record<string, string> } | null,
    formData: FormData)
{  try {
    // Extract and validate form data
    console.log('FormData received in updateUser:', formData);
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userId = formData.get('userId') as string;
    //if isadmin and isactive are present, get their boolean values
    const isadmin = Boolean(formData.get('isadmin'));
    const isactive = Boolean(formData.get('isactive'));
    
    updateUserFormSchema.parse({ first_name, last_name, email, password, isadmin, isactive });

    await connectDB();

    const existingUser = await User.findOne({ email });
    console.log('Existing user with email check:', existingUser._id, userId);
    if (existingUser._id.toString() !== userId) {
      return {
        success: false,
        message: `User with this email ${email} already exists. Please sign in instead.`
      };
    }

   let newPssword = '';
    // Hash new password if provided
    if (password?.trim()) {
      newPssword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);
    }

    // Update user
    await User.findByIdAndUpdate(
      userId,
      {
        first_name,
        last_name,
        name: `${first_name} ${last_name}`,
        email,
        isadmin: isadmin ?? false,
        isactive: isactive ?? true,
        ...(newPssword && { password: newPssword }),
      },
    );
    return {
      success: true,
      message: 'Sign up successful. You can now sign in.'
    };
  } catch (error) {
    // Re-throw redirect errors - these are expected from Next.js
    if (isRedirectError(error)) {
        throw error;
    }
    // Handle validation errors
    if (error instanceof ZodError) {    
        const fieldErrors: Record<string, string> = {};
        for (const issue of error.issues) {
            const field = issue.path[0] as string;
            if (field && !fieldErrors[field]) {
                fieldErrors[field] = issue.message;
            }
        }
        return { 
            success: false, 
            message: 'Validation failed. Required fields are missing or invalid.',
            errors: fieldErrors
        };
    }   
    // Handle all other errors
    console.error("Unexpected error:", error);
    return { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
    };
 }
}