import React from 'react';
import EditCategoryForm from '@/components/admin/categories/editCategoryForm';
import { getCategoryById } from '@/actions/categories';

const CategoryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const category = await getCategoryById(id);

  return (
    
    <EditCategoryForm data={category}/>  
)
}

export default CategoryPage