'use server';

import { signInSchema, signUpSchema } from "@/schemas/schemaValidation";
import { ZodError } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";



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

  // Log the full error structure for debugging
  console.log("Full error object:", error);
  console.log("Error type:", error instanceof AuthError ? 'AuthError' : typeof error);
  if (error instanceof Error) {
    console.log("Error message:", error.message);
    console.log("Error cause:", (error as any).cause);
  }

  // Try to extract provider mismatch message from any error type
  let providerMessage = null;
  
  if (error instanceof Error) {
    // Check error.cause.err.message
    const causeErr = (error as any).cause?.err;
    if (causeErr?.message && causeErr.message.includes('registered with')) {
      providerMessage = causeErr.message;
    }
    
    // Check error.message directly
    if (!providerMessage && error.message?.includes('registered with')) {
      providerMessage = error.message;
    }
    
    // Check if the error message contains the pattern [auth][cause]: Error:
    if (!providerMessage && error.message) {
      const match = error.message.match(/Error:\s*(.+registered with.+)/i);
      if (match) {
        providerMessage = match[1];
      }
    }
  }
  
  // If we found a provider mismatch message, return it
  if (providerMessage) {
    console.log("Extracted provider message:", providerMessage);
    return {
      success: false,
      message: providerMessage
    };
  }

  // Handle standard AuthError with CredentialsSignin
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

    // Check if user already exists
    const userAlreadyExists = await prisma.user.findFirst({
      where: { email }
    });
    
    if (userAlreadyExists) {
      return {
        success: false,
        message: `User with this email ${email} already exists. Please sign in instead.`
      };
    }

    // Hash password and create user
    const hashedPassword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

    await prisma.user.create({
      data: {
        first_name,
        last_name,
        name: `${first_name} ${last_name}`,
        email,
        password: hashedPassword,
        provider: 'credentials' // Track that user signed up with credentials
      }
    });

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