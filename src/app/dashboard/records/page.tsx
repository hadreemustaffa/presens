import React from 'react';

import { getActiveUser } from '@/api';
import { DataTable } from '@/features/attendance/records/components/data-table';

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
