"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TbArrowLeft, TbEye, TbEyeOff, TbBrandGoogle, TbBrandX } from 'react-icons/tb';
import Link from "next/link";
import React, { useState } from "react";
import { signUp } from "@/actions/authActions";
import { toast } from "react-toastify";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();


  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const result = await signUp(null, formData);
      if (result?.success) {
        // On successful signup, redirect to signin page
        toast.success("Account created successfully! Please sign in.");
        router.push('/signin');
      } else if (result && !result.success) {
        // Set field-specific errors if available
        if ('errors' in result && result.errors) {
          setFieldErrors(result.errors);
        }
        toast.error(result.message);
      }
    } catch (err) {
      // Re-throw redirect errors - these are expected from NextAuth on successful login
      if (isRedirectError(err)) {
        throw err;
      }
      console.error("Sign in error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };


  return (
    <div className="flex flex-col flex-1 w-full border bg-white rounded-lg shadow-sm dark:bg-gray-800 sm:px-6 sm:py-2 sm:shadow-md md:px-10 lg:mx-0">
      <div className="w-full max-w-lg sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <TbArrowLeft />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto">
        <div>
          <div className="mb-5 sm:mb-4 justify-center text-center">
            <h2 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-sm">
              Sign In
            </h2>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <TbBrandGoogle className="w-5 h-5 fill-current" />
                Sign in with Google
              </button>
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <TbBrandX className="w-5 h-5 fill-current" />
                Sign in with X
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input name="first_name" id="first_name" placeholder="John" type="text"/>
                    {fieldErrors.first_name && <p className="text-error-500 text-sm mt-1">{fieldErrors.first_name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="last_name">
                      Last Name <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input name="last_name" id="last_name" placeholder="Doe" type="text"/>
                    {fieldErrors.last_name && <p className="text-error-500 text-sm mt-1">{fieldErrors.last_name}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input name="email" id="email" placeholder="info@gmail.com" type="email"/>
                  {fieldErrors.email && <p className="text-error-500 text-sm mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="password">
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
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
                        <TbEye className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <TbEyeOff className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-error-500 text-sm mt-1">{fieldErrors.password}</p>}
                </div>
                <div>
                  <Button type="submit" className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
