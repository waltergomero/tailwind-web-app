'use server';

import { signInSchema, signUpSchema } from "@/schemas/schemaValidation";
import { ZodError } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import User from "@/models/users";
import bcryptjs from "bcryptjs";



// Constants
const BCRYPT_SALT_ROUNDS = 12;


function handleValidationError(error: ZodError) {
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

function handleSignInError(error: unknown) {
  if (error instanceof ZodError) {
    return handleValidationError(error);
  }

  if (error instanceof AuthError && error.type === 'CredentialsSignin') {
    return {
      success: false,
      message: 'Invalid email or password. Please try again.'
    };
  }
  
  console.error("Unexpected error:", error);
  return { 
    success: false, 
    message: 'An unexpected error occurred. Please try again.' 
  };
}


/**
 * Sign in user with email and password
 */
export async function signInWithCredentials(
  prevState: { success?: boolean; message?: string; errors?: Record<string, string> } | null,
  formData: FormData
) {
  try {
    // Extract and validate form data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    signInSchema.parse({ email, password });

    // Let NextAuth handle the authentication via the credentials provider
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: 'Sign in successful.'
    };
    
  } catch (error) {
    // Re-throw redirect errors - these are expected from Next.js
    if (isRedirectError(error)) {
      throw error;
    }

    return handleSignInError(error);
  }
}

/**
 * Sign up user with first name, last name, email, and password
 */
export async function signUp(
  prevState: { success?: boolean; message?: string; errors?: Record<string, string> } | null,
  formData: FormData
) {
  try {
    // Extract and validate form data
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    signUpSchema.parse({ first_name, last_name, email, password });
    // Here you would typically call your backend API to create the user
    // For demonstration, we'll assume the user is created successfully

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
      provider: 'credentials' // Track that user signed up with credentials
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