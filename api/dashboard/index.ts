import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { AttendanceRecord } from '@/types/interfaces';

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

  if (employee_id && work_date) {
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
}
