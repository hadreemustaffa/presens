'use server';

import dayjs from 'dayjs';
import { revalidatePath } from 'next/cache';

import { getActiveUser } from '@/api/dashboard';
import { createClient } from '@/lib/supabase/server';

export const clockInHome = async () => {
  const supabase = await createClient();
  const { user } = await getActiveUser();

  const { error } = await supabase.from('attendance_records').insert({
    employee_id: user.user_metadata.employee_id,
    clock_in: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    work_mode: 'home',
    work_date: dayjs().format('YYYY-MM-DD'),
    is_on_leave: false,
  });

  if (error) {
    console.log(error);

    return {
      error: 'Failed to clock in. Please try again.',
    };
  }

  revalidatePath('/dashboard', 'layout');
};

export const clockInOffice = async () => {
  const supabase = await createClient();

  const { error } = await supabase.from('attendance_records').insert({
    clock_in: dayjs().format('HH:mm:ss'),
    work_mode: 'office',
    work_date: dayjs().format('YYYY-MM-DD'),
    is_on_leave: false,
  });

  if (error) {
    console.log(error);

    return {
      error: 'Failed to clock in. Please try again.',
    };
  }

  revalidatePath('/dashboard', 'layout');
};
