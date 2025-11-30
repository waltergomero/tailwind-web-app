'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { deleteUser } from '@/actions/users';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserTableProps {
  data: User[];
  onDelete?: (id: string, name: string) => void;
}
const UserTable = ({ data, onDelete }: UserTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((status) => 
      status.first_name.toLowerCase().includes(lowerSearch) ||
      status.last_name.toLowerCase().includes(lowerSearch) ||
      status.email?.toLowerCase().includes(lowerSearch)
    );
  }, [data, searchTerm]);

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedUser({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      const result = await deleteUser(selectedUser.id);
      
      if (result.success) {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        // Refresh the page to show updated data
        router.refresh();
      } else {
        alert(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
        {/* Search Bar */}
        <div className="mb-2 flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name='search_input'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by status name, description, or type..."
              className="block w-1/2 pl-10 pr-10 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              aria-label="Search status"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>

    </div>
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-50 dark:border-white/5 bg-gray-700 dark:bg-white/10">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-200 text-start text-theme-xs dark:text-gray-200">
                  ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-200 text-start text-theme-xs dark:text-gray-200">
                  First Name
                </TableCell>
                <TableCell isHeader  className="px-5 py-3 font-semibold text-gray-200 text-start text-theme-xs dark:text-gray-200">
                  Last Name
                </TableCell>
                <TableCell  isHeader  className="px-5 py-3 font-semibold text-gray-200 text-start text-theme-xs dark:text-gray-200">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-200 text-start text-theme-xs dark:text-gray-200">
                  Is Active?
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-center text-gray-200 text-theme-xs dark:text-gray-200">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredData.length === 0 ? (
                <TableRow>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                  </td>
                </TableRow>
              ) : (
                filteredData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    ...{user.id.slice(-6)}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.first_name}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.last_name}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-gray-500 text-theme-sm dark:text-gray-400">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isactive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                        {user.isactive ? 'Yes' : 'No'}
                      </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex items-center justify-center gap-4">
                        <Link 
                          href={`/admin/users/${user.id}`}
                          title="Edit user"
                          aria-label={`Edit ${user.first_name}`}
                        >
                          <PencilIcon className="w-5 h-5 text-gray-500" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(user.id, user.first_name + ", " + user.last_name)}
                          title="Delete user"
                          aria-label={`Delete ${user.last_name}`}
                        >
                          <TrashIcon className="w-5 h-5 text-red-400" />
                        </button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    <Modal isOpen={isDeleteModalOpen} onClose={handleDeleteCancel} className="max-w-md mx-4">
      <div className="p-6">
        <div className="flex items-center justify-center w-24 h-24 mx-auto bg-red-200 dark:bg-red-900/30 rounded-full mb-4">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
          Delete User
        </h3>
        
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedUser?.name}</span>? 
          This action cannot be undone.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleDeleteCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
    </>
  )
}

export default UserTable