'use server';

import { addStatusFormSchema, updateStatusFormSchema} from "@/schemas/schemaValidation";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Status from "@/models/status";
import prisma  from '@/lib/prisma';
import { convertToPlainObject } from "@/lib/utils";
import { ZodError } from "zod";

export interface StatusData {
  id: string;
  status_name: string;
  typeid: number;
  description: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all statuses from the database
 * @returns Promise containing array of status data
 */
export async function fetchAllStatuses(): Promise<{ data: StatusData[] }> {
  try {
    const statuses = await prisma.status.findMany({
      orderBy: [
        { typeid: 'asc' },
        { status_name: 'asc' }
      ],
      select: {
        id: true,
        status_name: true,
        typeid: true,
        isactive: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const data: StatusData[] = statuses.map(status => ({
      id: status.id,
      status_name: status.status_name,
      typeid: status.typeid,
      description: status.description ?? '',
      isactive: status.isactive ?? false,
      createdAt: status.createdAt.toISOString(),
      updatedAt: status.updatedAt?.toISOString() ?? '',
    }));

 
    return { data };
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return { data: [] };
  }
}

/**
 * get status by id from the database
 */
export async function getStatusById(id: string): Promise<StatusData | null> {
  try {
    const status = await prisma.status.findUnique({
      where: { id },
    });
    if (!status) {
      return null;
    }
    return {
      id: status.id,
      status_name: status.status_name,
      typeid: status.typeid,
      description: status.description ?? '',
      isactive: status.isactive ?? false,
      createdAt: status.createdAt.toISOString(),
      updatedAt: status.updatedAt?.toISOString() ?? '',
    };
  } catch (error) {
    console.error("Error fetching status by id:", error);
    return null;
  }
}

/**
 * add a new status to the database
 */
export async function addStatus(data: FormData) {
  try {
    const status_name = data.get("status_name") as string;
    const typeidValue = data.get("typeid") as string;
    
    // Convert to number only if not empty, otherwise let Zod validation handle it
    const typeid = typeidValue && typeidValue !== "" ? Number(typeidValue) : undefined;

    const description = data.get("description") as string;
    //const isactive = data.get("isactive") === "on" ? true : false;  

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = addStatusFormSchema.parse({ status_name, typeid });

    //check for duplicate status_name
    const existingStatus = await prisma.status.findFirst({
      where: { status_name: validatedData.status_name,
              typeid: validatedData.typeid }  
        });
    if (existingStatus) {
      return {
        success: false,
        message: 'A status with this name already exists.',
        errors: { status_name: 'Status name must be unique.' }
      };
    }
    
    const newStatus = await prisma.status.create({
      data: {
        status_name: validatedData.status_name,
        typeid: validatedData.typeid,
        description
      },
    });

    return {
      success: true,
      message: 'Status created successfully',
      data: newStatus
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
 * add a new status to the database
 */
export async function updateStatus(data: FormData) {
  try {
    console.log("Form Data received in addStatus:", data);

    const status_name = data.get("status_name") as string;
    const typeidValue = data.get("typeid") as string;
    const id = data.get("id") as string;
    // Convert to number only if not empty, otherwise let Zod validation handle it
    const typeid = typeidValue && typeidValue !== "" ? Number(typeidValue) : undefined;

    const description = data.get("description") as string;
    const isactive = data.get("isactive") === "on" ? true : false;  

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = addStatusFormSchema.parse({ status_name, typeid });

    //check for duplicate status_name
    const existingStatus = await prisma.status.findFirst({
      where: { status_name: validatedData.status_name,
              typeid: validatedData.typeid }  
        });
    if (existingStatus && existingStatus.id !== id) {
      return {
        success: false,
        message: 'A status with this name already exists.',
        errors: { status_name: 'Status name must be unique.' }
      };
    }
    
    const newStatus = await prisma.status.update({
    where: { id },
      data: {
        status_name: validatedData.status_name,
        typeid: validatedData.typeid,
        description,
        isactive
      },
    });

    
    return {
      success: true,
      message: 'Status updated successfully',
      data: newStatus
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
export async function deleteStatus(id: string) {
  try {
    // Check if the status exists
    const existingStatus = await prisma.status.findUnique({
      where: { id }
    });

    if (!existingStatus) {
      return {
        success: false,
        message: 'Status not found'
      };
    }

    // Delete the status
    await prisma.status.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Status deleted successfully'
    };
  } catch (error) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Error deleting status:", error);
    return {
      success: false,
      message: 'Failed to delete status. Please try again.'
    };
  }
}

