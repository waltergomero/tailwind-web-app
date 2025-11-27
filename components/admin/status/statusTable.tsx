'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { StatusData } from '@/actions/status';

type Status = StatusData;

interface StatusTableProps {
  readonly initialData: readonly Status[];
}

type SortField = keyof Status | null;
type SortOrder = 'asc' | 'desc';

export default function StatusTable({ initialData }: Readonly<StatusTableProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = [...initialData].filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.status_name.toLowerCase().includes(searchLower) ||
        item.type_id.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    });

    // Sort data
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          comparison = aValue ? 1 : -1;
        } else {
          comparison = aValue < bValue ? -1 : 1;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [initialData, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpDownIcon className="w-4 h-4" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  // Reset to first page when search or items per page changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Pagination helpers
  const getPageNumbers = () => {
    const pages: Array<{ type: 'page' | 'ellipsis'; value: number | string; id: string }> = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => ({
        type: 'page' as const,
        value: i + 1,
        id: `page-${i + 1}`,
      }));
    }

    pages.push({ type: 'page', value: 1, id: 'page-1' });

    if (currentPage > 3) {
      pages.push({ type: 'ellipsis', value: '...', id: 'ellipsis-start' });
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push({ type: 'page', value: i, id: `page-${i}` });
    }

    if (currentPage < totalPages - 2) {
      pages.push({ type: 'ellipsis', value: '...', id: 'ellipsis-end' });
    }

    if (totalPages > 1) {
      pages.push({ type: 'page', value: totalPages, id: `page-${totalPages}` });
    }

    return pages;
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Header with Search and Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search statuses..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="items-per-page" className="text-sm font-medium text-black dark:text-white">
            Show
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            aria-label="Items per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-black dark:text-white">entries</span>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-black dark:text-white">
        Showing {paginatedData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
        {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
        {filteredAndSortedData.length} entries
        {searchTerm && ` (filtered from ${initialData.length} total entries)`}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th
                className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                onClick={() => handleSort('status_name')}
              >
                <div className="flex items-center gap-2">
                  Status Name
                  {renderSortIcon('status_name')}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                onClick={() => handleSort('type_id')}
              >
                <div className="flex items-center gap-2">
                  Type ID
                  {renderSortIcon('type_id')}
                </div>
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Description
              </th>
              <th
                className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                onClick={() => handleSort('isactive')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {renderSortIcon('isactive')}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-2">
                  Created
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-black dark:text-white">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((status) => (
                <tr key={status._id} className="border-b border-[#eee] dark:border-strokedark">
                  <td className="px-4 py-5 text-black dark:text-white">
                    {status.status_name}
                  </td>
                  <td className="px-4 py-5 text-black dark:text-white">
                    {status.type_id}
                  </td>
                  <td className="px-4 py-5 text-black dark:text-white">
                    <span className="line-clamp-2" title={status.description}>
                      {status.description}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        status.isactive
                          ? 'bg-success text-success'
                          : 'bg-danger text-danger'
                      }`}
                    >
                      {status.isactive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-black dark:text-white">
                    {new Date(status.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-primary hover:text-primary/80"
                        aria-label="Edit status"
                      >
                        Edit
                      </button>
                      <button
                        className="text-danger hover:text-danger/80"
                        aria-label="Delete status"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-black dark:text-white">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded border border-stroke px-3 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border border-stroke px-3 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {getPageNumbers().map((item) =>
                item.type === 'page' ? (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.value as number)}
                    className={`rounded px-3 py-2 text-sm font-medium ${
                      currentPage === item.value
                        ? 'bg-primary text-white'
                        : 'border border-stroke text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4'
                    }`}
                  >
                    {item.value}
                  </button>
                ) : (
                  <span key={item.id} className="px-2 py-2 text-black dark:text-white">
                    {item.value}
                  </span>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded border border-stroke px-3 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded border border-stroke px-3 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
