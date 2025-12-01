'use server';

import {  updateUserFormSchema, addUserFormSchema, } from "@/schemas/schemaValidation";
import { ZodError } from "zod";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import bcryptjs from "bcryptjs";
import prisma  from '@/lib/prisma';
import { IUser } from "@/interfaces/interface"; 


/**
 * Get all users from the database
 */
export async function fetchAllUsers(): Promise<{ data: IUser[] }> {
  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { last_name: 'asc' },
        { first_name: 'asc' }
      ],
      select: {
        id: true,
        first_name: true,
        last_name: true,
        name: true,
        email: true,
        isadmin: true,
        isactive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const data: IUser[] = users.map((user: typeof users[0]): IUser => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      name: user.name,
      email: user.email,
      isadmin: user.isadmin,
      isactive: user.isactive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return { data };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * get user by id from the database
 */
export async function getUserById(id: string): Promise<IUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email ?? '',
      name: user.name ?? '',
      isadmin: user.isadmin ?? false,
      isactive: user.isactive ?? false,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() ?? '',
    };
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

/**
 * add a new user to the database
 */
export async function addUser(data: FormData) {
  console.log("Form Data received in addUser:", data);
  try {
    const first_name = data.get("first_name") as string;
    const last_name = data.get("last_name") as string;
    const email = data.get("email") as string;
    const isadmin = data.get("isadmin") === "on" ? true : false;
    const password = data.get("password") as string;

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = addUserFormSchema.parse({ first_name, last_name, email, password, isadmin });
    //check for duplicate email
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.email }
        });
    if (existingUser) {
      return {
        success: false,
        message: `A user with this email ${validatedData.email} already exists.`,
        errors: { email: 'Email must be unique.' }
      };
    }
    
    const newUser = await prisma.user.create({
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        isadmin: isadmin,
        password: await bcryptjs.hash(validatedData.password, 12)
      },
    });

    return {
      success: true,
      message: 'User created successfully',
      data: newUser
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
 * add a new user to the database
 */
export async function updateUser(data: FormData) {
  console.log("Form Data received in updateUser:", data);
  try {
    const first_name = data.get("first_name") as string;
    const last_name = data.get("last_name") as string;
    const email = data.get("email") as string;
    const id = data.get("id") as string;
    const password = data.get("password") as string;
    const isadmin = data.get("isadmin") === "on";
    const isactive = data.get("isactive") === "on";

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = updateUserFormSchema.parse({ first_name, last_name, email, isadmin, isactive});

    // Validate password separately if provided
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters',
          errors: { password: 'Password must be at least 6 characters' }
        };
      }
    }

    //check for duplicate status_name
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.email }  
        });
    if (existingUser && existingUser.id !== id) {
      return {
        success: false,
        message: `A user with this email ${validatedData.email} already exists.`,
        errors: { email: 'Email must be unique.' }
      };
    }
    // Prepare update data
    const updateData: any = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      name: `${validatedData.first_name} ${validatedData.last_name}`,
      email: validatedData.email,
      isadmin: isadmin,
      isactive: isactive
    };

    // Only include password if it's provided and not empty
    if (password && password.trim().length > 0) {
      updateData.password = await bcryptjs.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUser
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
 * delete status from the database
 */
export async function deleteUser(id: string) {
  try {
    // Check if the status exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Delete the user
    await prisma.user.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Error deleting user:", error);
    return {
      success: false,
      message: 'Failed to delete user. Please try again.'
    };
  }
}

