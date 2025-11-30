import React from 'react';
import EditStatusForm from '@/components/admin/status/editStatusForm';
import {getStatusById} from '@/actions/status';

const StatusPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const status = await getStatusById(id);

  return (
    
    <EditStatusForm data={status}/>  
)
}

export default StatusPage