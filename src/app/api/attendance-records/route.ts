import { NextRequest, NextResponse } from 'next/server';

import { getActiveUser } from '@/api';
import {
  getAllAttendanceRecords,
  getAllEmployeesAttendanceRecords,
} from '@/features/attendance/records/api/attendance-records.api';
import { PaginationParams } from '@/features/attendance/records/model/interfaces';

export async function GET(request: NextRequest) {
  try {
    const { user, isAdmin } = await getActiveUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const paginationParams: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
      sortBy: searchParams.get('sortBy') || undefined,
      sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || undefined,
      filters: {},
    };

    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_') && value) {
        const filterKey = key.replace('filter_', '');
        paginationParams.filters![filterKey] = value;
      }
    }

    let records;

    if (isAdmin) {
      records = await getAllEmployeesAttendanceRecords(paginationParams);
    } else {
      records = await getAllAttendanceRecords({ employee_id: user.user_metadata.employee_id }, paginationParams);
    }

    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
