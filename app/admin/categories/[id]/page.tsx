import React from 'react';
import EditCategoryForm from '@/components/admin/categories/editCategoryForm';
import { getCategoryById } from '@/actions/categories';
import { fetchParentCategories } from '@/actions/categories';

const CategoryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const category = await getCategoryById(id);
  const parentCategories = await fetchParentCategories();

  return (
    
    <EditCategoryForm data={category} parentCategories={parentCategories.data}/>  
)
}

export default CategoryPage