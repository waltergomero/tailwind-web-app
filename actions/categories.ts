'use server';

import { addCategoryFormSchema, updateCategoryFormSchema} from "@/schemas/schemaValidation";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import prisma  from '@/lib/prisma';
import { ZodError } from "zod";
import { ICategory } from "@/interfaces/interface";



/**
 * Get all categories from the database
 * @returns Promise containing array of category data
 */
export async function fetchAllCategories(): Promise<{ data: ICategory[] }> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { category_name: 'asc' }
      ],
      select: {
        id: true,
        category_name: true,
        description: true,
        isactive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const data: ICategory[] = categories.map((category: typeof categories[0]) => ({
      id: category.id,
      category_name: category.category_name,
      description: category.description ?? '',
      isactive: category.isactive ?? false,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt?.toISOString() ?? '',
    }));

 
    return { data };
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return { data: [] };
  }
}

/**
 * get category by id from the database
 */
export async function getCategoryById(id: string): Promise<ICategory | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      return null;
    }
    return {
      id: category.id,
      category_name: category.category_name,
      description: category.description ?? '',
      isactive: category.isactive ?? false,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt?.toISOString() ?? '',
    };
  } catch (error) {
    console.error("Error fetching category by id:", error);
    return null;
  }
}

/**
 * add a new category to the database
 */
export async function addCategory(data: FormData) {
  try {
    const category_name = data.get("category_name") as string
    const description = data.get("description") as string;
    //const isactive = data.get("isactive") === "on" ? true : false;  

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = addCategoryFormSchema.parse({ category_name, description });

    //check for duplicate status_name
    const existingCategory = await prisma.category.findFirst({
      where: { category_name: validatedData.category_name, }  
        });
    if (existingCategory) {
      return {
        success: false,
        message: 'A category with this name already exists.',
        errors: { category_name: 'Category name must be unique.' }
      };
    }
    
    const newCategory = await prisma.category.create({
      data: {
        category_name: validatedData.category_name,
        description: validatedData.description
      },
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: newCategory
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
 * update a category in the database
 */
export async function updateCategory(data: FormData) {
  try {
    const category_name = data.get("category_name") as string;
    const id = data.get("id") as string;
    const description = data.get("description") as string;
    const isactive = data.get("isactive") === "on" ? true : false;  

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = addCategoryFormSchema.parse({ category_name, description });

    //check for duplicate category_name
    const existingCategory = await prisma.category.findFirst({
      where: { category_name: validatedData.category_name }  
        });
    if (existingCategory && existingCategory.id !== id) {
      return {
        success: false,
        message: 'A category with this name already exists.',
        errors: { category_name: 'Category name must be unique.' }
      };
    }
    
    const updateCategory = await prisma.category.update({
    where: { id },
      data: {
        category_name: validatedData.category_name,
        description,
        isactive
      },
    });

    
    return {
      success: true,
      message: 'Category updated successfully',
      data: updateCategory
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
 * delete category from the database
 */
export async function deleteCategory(id: string) {
  try {
    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return {
        success: false,
        message: 'Category not found'
      };
    }

    // Delete the category
    await prisma.category.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Category deleted successfully'
    };
  } catch (error) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Error deleting status:", error);
    return {
      success: false,
      message: 'Failed to delete category. Please try again.'
    };
  }
}

