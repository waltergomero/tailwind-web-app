import React from 'react'
import UserTable from '@/components/admin/users/userTable';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/solid';
import { fetchAllUsers } from '@/actions/users';


const UserPage = async () => {
  const result = await fetchAllUsers();
  
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="mb-2">
        <div className="flex items-center justify-between px-4 py-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              User Management
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and organize user accounts
            </p>
          </div>
          <Link
            href="/admin/users/add"
            className="inline-flex items-center gap-2 px-4 py-1 bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Add User
          </Link>
        </div>
        <hr className="border-t border-gray-200 dark:border-white/5" />
      <div className='p-4'>
            <UserTable data={result.data} />
      </div>
      </div>
    </div>
  )
}

export default UserPage