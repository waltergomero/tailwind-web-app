import React from 'react'
import StatusTable from '@/components/admin/status/statusTable';
import { fetchAllStatuses } from '@/actions/status';


const StatusPage = async () => {
  const result = await fetchAllStatuses();
  
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold text-black dark:text-white">
        Status Management
      </h1>
      <StatusTable initialData={result.data} />
    </div>
  )
}

export default StatusPage