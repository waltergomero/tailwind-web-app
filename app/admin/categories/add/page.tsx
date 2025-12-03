import React from 'react';
import AddCategoryForm from '@/components/admin/categories/addCategoryForm';
import { fetchParentCategories } from '@/actions/categories';

const CategoryPage = async () => {
  const parentCategories = await fetchParentCategories();
  return (
    <AddCategoryForm parentCategories={parentCategories.data} />
  )
}

export default CategoryPage