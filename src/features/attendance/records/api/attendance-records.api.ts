import {
  AttendanceRecord,
  AttendanceRecordWithUserDetails,
  PaginatedResponse,
  PaginationParams,
} from '@/features/attendance/records/model/interfaces';
import { createClient } from '@/lib/supabase/server';

export async function getAttendanceRecord({
  employee_id,
  work_date,
}: Pick<AttendanceRecord, 'employee_id' | 'work_date'>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('attendance_records')
    .select()
    .eq('employee_id', employee_id)
    .eq('work_date', work_date)
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  return data;
}

export async function getAllAttendanceRecords(
  { employee_id }: Pick<AttendanceRecord, 'employee_id'>,
  paginationParams?: PaginationParams,
): Promise<PaginatedResponse<AttendanceRecord> | AttendanceRecord[]> {
  const supabase = await createClient();

  if (!employee_id) {
    return [];
  }

  // If no pagination params, return all records (backwards compatibility)
  if (!paginationParams) {
    const { data, error } = await supabase.from('attendance_records').select().eq('employee_id', employee_id);

    if (error) {
      console.error(error);
    }

    return (data as AttendanceRecord[]) || [];
  }

  const { page, pageSize, sortBy = 'work_date', sortDirection = 'desc', filters = {} } = paginationParams;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('attendance_records').select('*', { count: 'exact' }).eq('employee_id', employee_id);

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (key === 'work_date') {
        query = query.gte('work_date', value);
      } else if (key === 'work_mode') {
        query = query.eq('work_mode', value as 'home' | 'office');
      } else {
        query = query.ilike(key, `%${value}%`);
      }
    }
  });

  query = query.order(sortBy, { ascending: sortDirection === 'asc' }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
  }

  if (!data) {
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  return {
    data: data as AttendanceRecord[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAllEmployeesAttendanceRecords(
  paginationParams?: PaginationParams,
): Promise<PaginatedResponse<AttendanceRecordWithUserDetails> | AttendanceRecordWithUserDetails[]> {
  const supabase = await createClient();

  // If no pagination params, return all records
  if (!paginationParams) {
    const { data, error } = await supabase.from('attendance_with_user').select();

    if (error) {
      console.error(error);
    }

    return (data as AttendanceRecordWithUserDetails[]) || [];
  }

  const { page, pageSize, sortBy = 'work_date', sortDirection = 'desc', filters = {} } = paginationParams;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('attendance_with_user').select('*', { count: 'exact' });

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (key === 'work_date') {
        query = query.gte('work_date', value);
      } else if (key === 'work_mode') {
        query = query.eq('work_mode', value as 'home' | 'office');
      } else {
        query = query.ilike(key, `%${value}%`);
      }
    }
  });

  query = query.order(sortBy, { ascending: sortDirection === 'asc' }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
  }

  if (!data) {
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  return {
    data: data as AttendanceRecordWithUserDetails[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
