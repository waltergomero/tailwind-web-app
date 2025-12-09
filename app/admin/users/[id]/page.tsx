import React from 'react'
import UserDetailsForm from '@/components/admin/users/editUserDetails';
import {  getUserById } from '@/actions/users';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const UserDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/signin');
  }
  
  // Check if user has permission to edit this profile
  // Only allow if user is admin OR editing their own profile
  const isAdmin = session.user.isadmin === true;
  const isOwnProfile = session.user.id === id;
  
  if (!isAdmin && !isOwnProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 max-w-md">
          <svg 
            className="mx-auto h-12 w-12 text-red-500 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">
            You don't have permission to edit this user's profile.
          </p>
          <p className="text-sm text-red-500 dark:text-red-400">
            Only administrators or the account owner can edit this profile.
          </p>
        </div>
      </div>
    );
  }
  
  const user = await getUserById(id);
  console.log('Fetched user data:', user);
  return (
    <UserDetailsForm data={user} />
  )
}

export default UserDetailsPage