import React from 'react';

import { getActiveUser } from '@/api';
import { DataTable } from '@/features/attendance/records/components/data-table';

export default async function Page() {
  const { user, isAdmin } = await getActiveUser();

  return (
    <div className="flex flex-col gap-4 px-4">
      <DataTable user={user} isAdmin={isAdmin} />
    </div>
  );
}
