"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/common/form/input/InputField";
import Form from "@/components/common/form/Form";
import Label from "@/components/common/form/Label";
import { addUser } from "@/actions/users";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { ZodErrors } from "@/components/common/form/zod-errors";
import { TbArrowLeft, TbEye, TbEyeOff, TbBrandGoogle, TbBrandX } from 'react-icons/tb';

 type FieldErrors = Record<string, string>;


export default function AddUserForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});


  const handleSave = async (event: React.FormEvent<HTMLFormElement>): Promise<{ success: boolean }> => {
    try {
      const formData = new FormData(event.currentTarget);
      const result = await addUser(formData);
      console.log('Form submission result:', result);
      
      if ('success' in result && result.success) {
        toast.success(result.message || 'User created successfully');
        router.push('/admin/users');
        return { success: true };
      } else {
        const errorMessage = 'message' in result ? result.message : 'Failed to create user';
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
            Add New Status
          </h4>
          <Form onSubmit={handleSave}>
           <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name:</Label>
                    <Input type="text" name="first_name" className="w-full"  />
                   {<ZodErrors error={[fieldErrors.first_name]} />}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name:</Label>
                    <Input type="text" name="last_name" className="w-full"  />
                   {<ZodErrors error={[fieldErrors.last_name]} />}
                  </div>
              </div>
              <div className="pt-2">
                <Label>Email:</Label>
                <Input type="email" name="email" className="w-full"  />
               {<ZodErrors error={[fieldErrors.email]} />}
              </div>
             <div className="relative">
                                 <Input
                                   name="password"
                                   id="password"
                                   type={showPassword ? "text" : "password"}
                                   placeholder="Enter your password"
                                 />
                                 <button
                                   type="button"
                                   onClick={() => setShowPassword(!showPassword)}
                                   className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                   aria-label={showPassword ? "Hide password" : "Show password"}
                                 >
                                   {showPassword ? (
                                     <TbEye className="fill-gray-500 dark:fill-gray-400 w-5 h-5" />
                                   ) : (
                                     <TbEyeOff className="fill-gray-500 dark:fill-gray-400 w-5 h-5" />
                                   )}
                                 </button>
                               </div>
              <div className="pt-2 flex items-center gap-2">
                <input type="checkbox" name="isadmin" className="h-4 w-4" />
                <Label className="mb-0">Is Admin?</Label>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => router.push('/admin/users')}>
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
