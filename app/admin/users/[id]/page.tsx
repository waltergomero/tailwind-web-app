import React from 'react'
import UserDetailsForm from '@/components/admin/users/editUserDetails';
import {  getUserById } from '@/actions/users';

const UserDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getUserById(id);
  
  return (
    <UserDetailsForm data={user} />
  )
}

export default UserDetailsPage