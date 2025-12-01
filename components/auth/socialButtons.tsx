"use client"

import React from 'react';
import { TbBrandGoogle, TbBrandX } from 'react-icons/tb';
import { signIn  } from "next-auth/react";

const SocialButtons = () => {
  const handleSocialSignIn = async (provider: string) => {
    try {
      await signIn(provider, { 
        callbackUrl: "/",
        redirect: true
      });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
            <button 
              onClick={() => handleSocialSignIn("google")}
              className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              <TbBrandGoogle className="w-5 h-5 fill-current" />
              Sign in with Google
            </button>
            <button 
              onClick={() => handleSocialSignIn("twitter")}
              className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              <TbBrandX className="w-5 h-5 fill-current" />
              Sign in with X
            </button>
        </div>
  )
}

export default SocialButtons