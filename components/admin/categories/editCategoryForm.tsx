"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/common/form/input/InputField";
import Form from "@/components/common/form/Form";
import Label from "@/components/common/form/Label";
import { updateCategory } from "@/actions/categories";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { ZodErrors } from "@/components/common/form/zod-errors";

 type FieldErrors = Record<string, string>;


export default function EditCategoryForm({  data }: { data?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});


  const handleSave = async (event: React.FormEvent<HTMLFormElement>): Promise<{ success: boolean }> => {
    try {
      const formData = new FormData(event.currentTarget);
      const result = await updateCategory(formData);
      console.log('Form submission result:', result);
      
      if ('success' in result && result.success) {
        toast.success(result.message || 'Category updated successfully');
        router.push('/admin/categories');
        return { success: true };
      } else {
        const errorMessage = 'message' in result ? result.message : 'Failed to update category';
        setFieldErrors(result.errors || {});
        toast.error(errorMessage);
        return { success: false };
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-1/2 mx-auto p-5 border border-gray-200 rounded-lg dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Edit Category Information
          </h4>
          <Form onSubmit={handleSave}>
           <div className="pt2">
            <input type="hidden" name="id" value={data?.id} />
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Category Name:</Label>
                    <Input type="text" name="category_name" className="w-full" defaultValue={data?.category_name} />
                   {<ZodErrors error={[fieldErrors.category_name]} />}
                  </div>
              </div>
              <div className="pt-2">
                <Label>Description:</Label>
                <textarea name="description" rows={2} className="w-full border border-gray-300 rounded-md p-2" defaultValue={data?.description}   />
              </div>
              <div className="pt-2">
                <Label>Is Active:</Label>
                <input type="checkbox" name="isactive" defaultChecked={data?.isactive} />
              </div>
              <div>
                {/* Additional fields can be added here */}
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => router.push('/admin/categories')}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>     
          </Form>
        </div>
    </div>
    </div>
  );
}
