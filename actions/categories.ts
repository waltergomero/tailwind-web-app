'use server';

import { addCategoryFormSchema, updateCategoryFormSchema} from "@/schemas/schemaValidation";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import prisma  from '@/lib/prisma';
import { ZodError } from "zod";
import { ICategory, IParentCategory} from "@/interfaces/interface";



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
        parent_category_id: true,
        parent_category_name: true,
        description: true,
        isactive: true,
      },
    });

    const data: ICategory[] = categories.map((category: typeof categories[0]) => ({
      id: category.id,
      category_name: category.category_name,
      parent_category_id: category.parent_category_id ?? '',
      parent_category_name: category.parent_category_name ?? '',
      description: category.description ?? '',
      isactive: category.isactive ?? false,
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
      parent_category_id: category.parent_category_id ?? '',
      parent_category_name: category.parent_category_name ?? '',
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
 * get parent categories from the database with full hierarchical path
 */
export async function fetchParentCategories(): Promise<{ data: IParentCategory[] }> {
  try {
    // Get categories that have child categories OR have no parent (top-level categories)
    const parentCategories = await prisma.$queryRaw<
      { parent_category_id: string; parent_category_name: string; }[]
    >`SELECT DISTINCT c1.parent_category_id, c1.parent_category_name
      FROM "Category" c1
      WHERE c1.parent_category_id IS NOT NULL
      UNION
      SELECT DISTINCT id as parent_category_id, category_name AS parent_category_name
      FROM "Category" c2
      ORDER BY parent_category_name ASC
      ;`;

    // Build hierarchical path for each parent category
    const parentCategoriesWithPath = await Promise.all(
      parentCategories.map(async (parentCategory: { parent_category_id: string; parent_category_name: string; }) => {
        const fullPath = await getCategoryPath(parentCategory.parent_category_id);
        return {
          parent_category_id: parentCategory.parent_category_id,
          parent_category_name: fullPath || parentCategory.parent_category_name
        };
      })
    );

    // Remove duplicates based on parent_category_id
    const uniqueCategories = parentCategoriesWithPath.filter(
      (category: IParentCategory, index: number, self: IParentCategory[]) =>
        index === self.findIndex((c: IParentCategory) => c.parent_category_id === category.parent_category_id)
    );
 
    return { data: uniqueCategories };
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    return { data: [] };
  }
}

/**
 * Build hierarchical category path (e.g., "Countries >> Peru >> Lima")
 * @param categoryId - The ID of the category to build the path for
 * @returns Promise containing the full hierarchical path string
 */
export async function getCategoryPath(categoryId: string): Promise<string> {
  try {
    const path: string[] = [];
    let currentId: string | null = categoryId;

    // Traverse up the parent chain
    while (currentId) {
      const category: { category_name: string; parent_category_id: string | null } | null = await prisma.category.findUnique({
        where: { id: currentId },
        select: {
          category_name: true,
          parent_category_id: true,
        },
      });

      if (!category) break;

      path.unshift(category.category_name); // Add to beginning of array
      currentId = category.parent_category_id;
    }

    return path.join(' >> ');
  } catch (error) {
    console.error("Error building category path:", error);
    return '';
  }
}


/**
 * add a new category to the database
 */
export async function addCategory(data: FormData) {
  console.log('addCategory called with data:', data);
  try {
    const category_name = data.get("category_name") as string
    const description = data.get("description") as string;
    const parent_category_id = data.get("parent_category_id") as string || null;
    const parent_category_name = data.get("parent_category_name") as string || null;

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = addCategoryFormSchema.parse({ category_name, description, parent_category_id, parent_category_name });

    //check for duplicate category_name under the same parent
    const existingCategory = await prisma.category.findFirst({
      where: { category_name: validatedData.category_name, parent_category_id: validatedData.parent_category_id }  
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
        parent_category_id: validatedData.parent_category_id,
        parent_category_name: validatedData.parent_category_name,
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
    const parent_category_id = data.get("parent_category_id") as string;
    const isactive = data.get("isactive") === "on" ? true : false;  

    // Validate all fields - this will throw ZodError if validation fails
    const validatedData = addCategoryFormSchema.parse({ category_name, description, parent_category_id });

    //check for duplicate category_name
    const existingCategory = await prisma.category.findFirst({
      where: { category_name: validatedData.category_name }  
        });

    if (existingCategory && existingCategory.id !== id && existingCategory.parent_category_id === parent_category_id) {
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
        parent_category_id: validatedData.parent_category_id,
        description: validatedData.description,
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

