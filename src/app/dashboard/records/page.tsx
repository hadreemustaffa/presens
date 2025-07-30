import React from 'react';

import { DataTable } from '@/features/attendance/records/components/data-table';
import { getActiveUser } from '@/features/users/api/users.api';

export const metadata = {
  title: 'Records',
  description: 'View and manage attendance records.',
};

export default async function Page() {
  const { user, isAdmin } = await getActiveUser();

  return (
    <div className="flex flex-col gap-4 px-4">
      <DataTable user={user} isAdmin={isAdmin} />
    </div>
  );
}
