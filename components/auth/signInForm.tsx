"use client";
import Checkbox from "@/components/common/form/input/Checkbox";
import Input from "@/components/common/form/input/InputField";
import Label from "@/components/common/form/Label";
import Button from "@/components/ui/button/Button";
import { TbArrowLeft, TbEye, TbEyeOff} from 'react-icons/tb';
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import SocialButtons from "./socialButtons";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/schemas/schemaValidation";
import { ZodError } from "zod";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth error on mount
  useEffect(() => {
    const error = searchParams.get('error');
    console.log("OAuth error param:", error);
    if (error === 'OAuthAccountNotLinked') {
      toast.error('This email is already registered with credentials. Please sign in using your email and password instead.');
    } else if (error === 'AccessDenied') {
      toast.error('This email is already registered with credentials. Please sign in using your email and password instead.');
    } else if (error) {
      toast.error('Authentication failed. Please try again.');
    }
  }, [searchParams]);


  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Reset field errors
    setFieldErrors({});
    
    try {
      // Extract form data
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // Validate with Zod
      signInSchema.parse({ email, password });

      // Sign in with NextAuth (client-side)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log("Sign in result:", result);
      
      if (result?.error) {
        // Handle sign-in errors
        if (result.error === 'CredentialsSignin') {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(result.error);
        }
      } else if (result?.ok) {
        // On successful sign-in, redirect
        toast.success('Sign in successful!');
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      // Handle validation errors
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        for (const issue of err.issues) {
          const field = issue.path[0] as string;
          if (field && !errors[field]) {
            errors[field] = issue.message;
          }
        }
        setFieldErrors(errors);
        toast.error('Validation failed. Please check your input.');
      } else {
        console.error("Sign in error:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
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
          Back to home page
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
            <SocialButtons />
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
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input name="email" id="email" placeholder="info@gmail.com" type="email"/>
                  {fieldErrors.email && <p className="text-error-500 text-sm mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <Label>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
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
