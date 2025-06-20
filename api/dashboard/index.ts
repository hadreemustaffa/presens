import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/types/interfaces';

export async function getActiveUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/');
  }

  const isAdmin = user.user_metadata.user_role === 'admin';

  return {
    user,
    isAdmin,
  };
}

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

export async function getAllAttendanceRecords({ employee_id }: Pick<AttendanceRecord, 'employee_id'>) {
  const supabase = await createClient();

  if (!employee_id) {
    return [];
  }

  const { data, error } = await supabase.from('attendance_records').select().eq('employee_id', employee_id);

  if (error) {
    console.error(error);
  }

  if (!data) {
    return [];
  }

  return data as AttendanceRecord[];
}

export async function getAllEmployeesAttendanceRecords() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('attendance_with_user').select();

  if (error) {
    console.error(error);
  }

  if (!data) {
    return [];
  }

  return data as AttendanceRecordWithUserDetails[];
}
